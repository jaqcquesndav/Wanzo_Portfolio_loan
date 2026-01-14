// src/services/streaming/chatStreamService.ts
/**
 * Service de gestion du streaming des réponses IA via Socket.IO
 * 
 * Ce service permet de recevoir les réponses de l'IA ADHA en temps réel,
 * chunk par chunk, pour une meilleure expérience utilisateur.
 * 
 * @see API DOCUMENTATION/chat/README.md - Section "Streaming des Réponses IA"
 */

import { io, Socket } from 'socket.io-client';
import type { 
  PortfolioStreamChunkEvent, 
  StreamingState, 
  StreamingConfig
} from '../../types/chat';
import { getAccessToken } from '../api/authHeaders';

/**
 * Configuration WebSocket selon l'environnement
 * @see API DOCUMENTATION/chat/README.md - Section "URLs de Connexion WebSocket"
 * 
 * ✅ WORKFLOW CORRECT (selon la documentation et accounting):
 * 1. WebSocket.connect('ws://localhost:8000', {path: '/portfolio/chat'})
 * 2. emit('subscribe_conversation', { conversationId }) + délai 200ms
 * 3. POST /chat/stream
 * 
 * | Environnement     | URL Base              | Path WebSocket     |
 * |-------------------|----------------------|-------------------|
 * | Production        | wss://api.wanzo.com  | /portfolio/chat   |
 * | Développement     | ws://localhost:8000  | /portfolio/chat   |
 */
const getWebSocketConfig = () => {
  // Variable d'environnement dédiée au WebSocket (prioritaire)
  const wsUrl = import.meta.env.VITE_WS_URL;
  
  if (wsUrl) {
    // Déterminer le path selon l'URL
    const isDirectConnection = wsUrl.includes(':3005');
    return {
      url: wsUrl,
      path: isDirectConnection ? '/socket.io' : '/portfolio/chat'
    };
  }
  
  // Par défaut: via API Gateway avec path de service (comme accounting)
  // Le proxy API Gateway route /portfolio/chat vers le service portfolio
  return {
    url: 'http://localhost:8000',
    path: '/portfolio/chat'
  };
};

// Configuration par défaut
const DEFAULT_CONFIG: StreamingConfig = {
  websocketUrl: getWebSocketConfig().url,
  websocketPath: getWebSocketConfig().path,
  timeout: 120000, // 120s selon la doc
  autoRetry: true,
  maxRetries: 3
};

// Événements Socket.IO selon la documentation
const SOCKET_EVENTS = {
  // Client → Serveur
  SUBSCRIBE_CONVERSATION: 'subscribe_conversation',
  UNSUBSCRIBE_CONVERSATION: 'unsubscribe_conversation',
  // Serveur → Client
  STREAM_CHUNK: 'adha.stream.chunk',
  STREAM_END: 'adha.stream.end',
  STREAM_ERROR: 'adha.stream.error',
  STREAM_TOOL: 'adha.stream.tool'
} as const;

// Types pour les callbacks
type ChunkCallback = (chunk: PortfolioStreamChunkEvent) => void;
type ErrorCallback = (error: Error) => void;
type CompleteCallback = (content: string, suggestedActions?: Array<string | { type: string; payload: unknown }>) => void;
type ConnectionCallback = (connected: boolean) => void;

/**
 * Classe de gestion du streaming des réponses IA via Socket.IO
 */
export class ChatStreamService {
  private socket: Socket | null = null;
  private config: StreamingConfig;
  private currentInstitutionId: string | null = null;
  private reconnectAttempts = 0;
  
  // État du streaming
  private streamingState: StreamingState = {
    messageId: null,
    accumulatedContent: '',
    lastChunkId: -1,
    isActive: false
  };
  
  // Callbacks par messageId (clé = messageId de la réponse HTTP)
  private onChunkCallbacks: Map<string, ChunkCallback> = new Map();
  private onErrorCallbacks: Map<string, ErrorCallback> = new Map();
  private onCompleteCallbacks: Map<string, CompleteCallback> = new Map();
  private onConnectionChangeCallbacks: Set<ConnectionCallback> = new Set();
  
  // Conversations souscrites
  private subscribedConversations: Set<string> = new Set();
  
  // Timeout pour les messages
  private messageTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
  
  // ✅ NOUVEAU: Accumulation du contenu par requestMessageId (comme accounting)
  // Clé = requestMessageId des chunks, Valeur = { content accumulé, nombre de chunks }
  private pendingMessages: Map<string, { content: string; chunkCount: number }> = new Map();
  
  // ✅ NOUVEAU: Mapping messageId (réponse HTTP) → requestMessageId (chunks WebSocket)
  // Dans notre cas, messageId = requestMessageId selon les tests, mais on garde le mapping pour sécurité
  private messageIdMapping: Map<string, string> = new Map();

  constructor(config?: Partial<StreamingConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Retourne l'ID de l'institution actuellement connectée
   */
  get institutionId(): string | null {
    return this.currentInstitutionId;
  }

  /**
   * Se connecte au serveur Socket.IO pour le streaming
   */
  async connect(institutionId: string): Promise<void> {
    console.log('[ChatStreamService] 🔌 connect() appelé avec institutionId:', institutionId);
    console.log('[ChatStreamService] État actuel:', {
      hasSocket: !!this.socket,
      socketConnected: this.socket?.connected,
      socketId: this.socket?.id
    });
    
    if (this.socket?.connected) {
      console.log('[ChatStreamService] ✅ Déjà connecté, socket.id:', this.socket.id);
      return;
    }

    this.currentInstitutionId = institutionId;
    
    // Récupérer le token JWT
    const token = this.getAuthToken();

    return new Promise((resolve, reject) => {
      try {
        // Toujours utiliser l'API Gateway (port 8000) avec path /portfolio/chat
        // L'API Gateway réécrit le path vers /socket.io du service portfolio
        // Note: Le namespace "/" (racine) est utilisé via l'API Gateway
        // Le namespace "/chat" dans la réponse POST est informatif uniquement
        const wsConfig = getWebSocketConfig();
        const wsUrl = this.config.websocketUrl || wsConfig.url;
        const wsPath = this.config.websocketPath || wsConfig.path;
        
        console.log('[ChatStreamService] 🔌 Connexion WebSocket via API Gateway:', {
          url: wsUrl,
          path: wsPath,
          namespace: '/ (default)',
          institutionId,
          hasToken: !!this.getAuthToken()
        });
        
        this.socket = io(wsUrl, {
          path: wsPath,
          transports: ['websocket', 'polling'],  // Fallback polling si WebSocket échoue
          // Authentification via l'objet auth (méthode sécurisée Socket.IO)
          auth: {
            token: `Bearer ${token}`
          },
          // Query params pour l'institutionId (pas le token pour des raisons de sécurité)
          query: {
            institutionId
          },
          // Headers supplémentaires si le backend les supporte
          extraHeaders: {
            'Authorization': `Bearer ${token}`
          },
          reconnection: this.config.autoRetry,
          reconnectionAttempts: this.config.maxRetries,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 30000,
          timeout: 10000,
          forceNew: false  // Réutiliser connexion existante si possible (comme accounting)
        });

        console.log('[ChatStreamService] 📡 Socket créé, en attente de connexion...');

        this.socket.on('connect', () => {
          console.log('[ChatStreamService] ✅ Socket.IO CONNECTÉ!', {
            socketId: this.socket?.id,
            connected: this.socket?.connected
          });
          this.reconnectAttempts = 0;
          this.notifyConnectionChange(true);
          
          // Re-souscrire aux conversations en cours
          this.resubscribeToConversations();
          
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('[ChatStreamService] ❌ Socket.IO DÉCONNECTÉ:', {
            reason,
            socketId: this.socket?.id
          });
          this.notifyConnectionChange(false);
        });

        this.socket.on('connect_error', (error) => {
          console.error('[ChatStreamService] ❌ ERREUR de connexion Socket.IO:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
          this.notifyConnectionChange(false);
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        });

        // Écouter les événements de streaming
        this.setupStreamListeners();

        // Timeout de connexion
        setTimeout(() => {
          if (!this.socket?.connected) {
            reject(new Error('Timeout de connexion Socket.IO'));
          }
        }, 10000);

      } catch (error) {
        console.error('[ChatStreamService] Erreur de connexion:', error);
        reject(error);
      }
    });
  }

  /**
   * Configure les listeners pour les événements de streaming
   */
  private setupStreamListeners(): void {
    if (!this.socket) return;

    console.log('[ChatStreamService] 🎧 Configuration des listeners pour les événements de streaming');

    // Chunk de contenu
    this.socket.on(SOCKET_EVENTS.STREAM_CHUNK, (chunk: PortfolioStreamChunkEvent) => {
      console.log('[ChatStreamService] 📦 CHUNK REÇU:', {
        requestMessageId: chunk.requestMessageId,
        type: chunk.type,
        chunkId: chunk.chunkId,
        contentPreview: chunk.content?.substring(0, 30)
      });
      this.handleChunk(chunk);
    });

    // Fin du streaming
    this.socket.on(SOCKET_EVENTS.STREAM_END, (chunk: PortfolioStreamChunkEvent) => {
      console.log('[ChatStreamService] 🏁 STREAM_END REÇU:', chunk.requestMessageId);
      this.handleEnd(chunk);
    });

    // Erreur de streaming
    this.socket.on(SOCKET_EVENTS.STREAM_ERROR, (chunk: PortfolioStreamChunkEvent) => {
      console.log('[ChatStreamService] ❌ STREAM_ERROR REÇU:', chunk);
      this.handleError(chunk);
    });

    // Événements d'outil (tool_call, tool_result)
    this.socket.on(SOCKET_EVENTS.STREAM_TOOL, (chunk: PortfolioStreamChunkEvent) => {
      console.log('[ChatStreamService] 🔧 STREAM_TOOL REÇU:', chunk);
      this.handleToolEvent(chunk);
    });
    
    // Écouter la confirmation d'abonnement du serveur (comme accounting)
    this.socket.on(SOCKET_EVENTS.SUBSCRIBE_CONVERSATION, (response: { success: boolean; conversationId: string; error?: string }) => {
      if (response.success) {
        console.log('[ChatStreamService] ✅ Serveur confirme abonnement:', response.conversationId);
        this.subscribedConversations.add(response.conversationId);
      } else {
        console.error('[ChatStreamService] ❌ Échec abonnement côté serveur:', response.error);
      }
    });
    
    // Écouter les exceptions du serveur
    this.socket.on('exception', (error: unknown) => {
      console.error('[ChatStreamService] 🚨 EXCEPTION du serveur:', error);
      console.error('[ChatStreamService] 🚨 Détails:', JSON.stringify(error, null, 2));
    });
    
    // Écouter TOUS les événements pour debug
    this.socket.onAny((eventName, ...args) => {
      console.log('[ChatStreamService] 📡 Event reçu:', eventName, args);
      // Log détaillé pour les exceptions
      if (eventName === 'exception') {
        console.error('[ChatStreamService] 🚨 Exception payload:', JSON.stringify(args, null, 2));
      }
    });
  }

  /**
   * S'abonne aux mises à jour d'une conversation
   * @see API DOCUMENTATION/chat/README.md - ÉTAPE 2: S'abonner AVANT d'envoyer le message HTTP
   */
  subscribeToConversation(conversationId: string): void {
    // ✅ Si déjà abonné, skip pour éviter l'erreur serveur
    if (this.subscribedConversations.has(conversationId)) {
      console.log('[ChatStreamService] ✅ Déjà abonné (sync), skip:', conversationId);
      return;
    }

    if (!this.socket?.connected) {
      console.error('[ChatStreamService] ❌ Socket non connecté, impossible de souscrire à:', conversationId);
      console.error('[ChatStreamService] ℹ️ État socket:', {
        exists: !!this.socket,
        connected: this.socket?.connected,
        id: this.socket?.id
      });
      return;
    }

    // ✅ Ajouter au Set AVANT l'émission pour éviter les race conditions
    this.subscribedConversations.add(conversationId);

    // Log détaillé pour debug du problème "0 clients subscribed"
    const roomName = `conversation:${conversationId}`;
    console.log('[ChatStreamService] 📡 ÉTAPE 2: Émission subscribe_conversation:', { 
      conversationId,
      roomName,  // La room que le serveur doit utiliser
      socketId: this.socket.id,
      socketConnected: this.socket.connected,
      transportType: this.socket.io?.engine?.transport?.name
    });
    
    // Émettre avec callback pour avoir la confirmation du serveur
    this.socket.emit(SOCKET_EVENTS.SUBSCRIBE_CONVERSATION, { conversationId }, (ack: unknown) => {
      console.log('[ChatStreamService] 📬 ACK reçu pour subscribe_conversation:', ack);
    });
    
    console.log('[ChatStreamService] ✅ Abonnement émis pour room:', roomName);
  }

  /**
   * S'abonne aux mises à jour d'une conversation avec confirmation (acknowledgement)
   * @see API DOCUMENTATION/chat/README.md - ÉTAPE 2: S'abonner AVANT d'envoyer le message HTTP
   * @returns Promise qui se résout quand l'abonnement est confirmé ou après timeout
   */
  async subscribeToConversationAsync(conversationId: string, timeoutMs = 5000): Promise<void> {
    console.log('[ChatStreamService] 📡 subscribeToConversationAsync - Début:', {
      conversationId,
      timeoutMs,
      socketConnected: this.socket?.connected,
      socketId: this.socket?.id,
      alreadySubscribed: this.subscribedConversations.has(conversationId)
    });

    // ✅ Si déjà abonné à cette conversation, ne pas réabonner
    // Cela évite l'erreur "Internal server error" côté backend
    if (this.subscribedConversations.has(conversationId)) {
      console.log('[ChatStreamService] ✅ Déjà abonné à la conversation, skip:', conversationId);
      return Promise.resolve();
    }

    if (!this.socket?.connected) {
      console.error('[ChatStreamService] ❌ Socket non connecté pour abonnement async');
      throw new Error('Socket non connecté');
    }

    // ✅ Ajouter au Set IMMÉDIATEMENT pour éviter les doubles abonnements
    // même si le serveur met du temps à répondre
    this.subscribedConversations.add(conversationId);
    console.log('[ChatStreamService] 📝 Ajouté au Set local AVANT émission:', conversationId);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        // En cas de timeout, on considère quand même l'abonnement comme envoyé
        // car le backend peut ne pas supporter les acknowledgements
        console.warn('[ChatStreamService] ⚠️ Timeout acknowledgement - abonnement envoyé sans confirmation:', conversationId);
        resolve(); // On résout quand même car l'emit a été fait et le Set est déjà mis à jour
      }, timeoutMs);

      console.log('[ChatStreamService] 📤 Émission subscribe_conversation avec callback:', { conversationId });
      
      this.socket!.emit(SOCKET_EVENTS.SUBSCRIBE_CONVERSATION, { conversationId }, (response: unknown) => {
        clearTimeout(timeout);
        console.log('[ChatStreamService] 📥 Réponse du serveur pour abonnement:', response);
        
        // Le callback peut retourner un objet avec success ou simplement être appelé
        if (response && typeof response === 'object' && 'success' in response) {
          if ((response as { success: boolean }).success) {
            console.log('[ChatStreamService] ✅ Abonnement confirmé par le serveur:', conversationId);
            resolve();
          } else {
            const error = (response as { error?: string }).error || 'Raison inconnue';
            console.error('[ChatStreamService] ❌ Échec abonnement:', error);
            // ⚠️ Ne PAS retirer du Set - le serveur peut avoir quand même rejoint la room
            // this.subscribedConversations.delete(conversationId);
            reject(new Error(`Échec abonnement: ${error}`));
          }
        } else {
          // Pas de réponse structurée, considérer comme succès
          console.log('[ChatStreamService] ✅ Abonnement envoyé (pas de réponse structurée):', conversationId);
          resolve();
        }
      });
    });
  }

  /**
   * Se désabonne d'une conversation
   */
  unsubscribeFromConversation(conversationId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit(SOCKET_EVENTS.UNSUBSCRIBE_CONVERSATION, { conversationId });
    this.subscribedConversations.delete(conversationId);
    console.log('[ChatStreamService] Désabonné de la conversation:', conversationId);
  }

  /**
   * Re-souscrit aux conversations après une reconnexion
   */
  private resubscribeToConversations(): void {
    this.subscribedConversations.forEach(conversationId => {
      this.socket?.emit(SOCKET_EVENTS.SUBSCRIBE_CONVERSATION, { conversationId });
    });
  }

  /**
   * Prépare le streaming pour un message
   * Note: L'envoi du message se fait via l'API REST (/chat/stream)
   * @deprecated Utiliser prepareStreamingWithoutSubscribe + subscribeToConversation manuellement
   */
  prepareStreaming(messageId: string, conversationId: string): void {
    // Réinitialiser l'état de streaming
    this.streamingState = {
      messageId,
      accumulatedContent: '',
      lastChunkId: -1,
      isActive: true
    };

    // S'assurer qu'on est souscrit à la conversation
    this.subscribeToConversation(conversationId);

    // Configurer le timeout
    this.setupMessageTimeout(messageId);
  }

  /**
   * Prépare le streaming pour un message SANS s'abonner à la conversation
   * Utiliser cette méthode quand l'abonnement a déjà été fait manuellement
   * @see API DOCUMENTATION/chat/README.md - Workflow correct: subscribe AVANT POST
   */
  prepareStreamingWithoutSubscribe(messageId: string, conversationId: string): void {
    // Réinitialiser l'état de streaming
    this.streamingState = {
      messageId,
      accumulatedContent: '',
      lastChunkId: -1,
      isActive: true
    };

    // Ajouter à la liste des conversations souscrites (pour la reconnexion)
    this.subscribedConversations.add(conversationId);

    // Configurer le timeout
    this.setupMessageTimeout(messageId);
    
    console.log('[ChatStreamService] ✅ Streaming préparé (sans re-subscribe):', {
      messageId,
      conversationId
    });
  }

  /**
   * S'abonne aux chunks pour un message spécifique
   */
  onChunk(messageId: string, callback: ChunkCallback): () => void {
    this.onChunkCallbacks.set(messageId, callback);
    return () => this.onChunkCallbacks.delete(messageId);
  }

  /**
   * S'abonne aux erreurs pour un message spécifique
   */
  onError(messageId: string, callback: ErrorCallback): () => void {
    this.onErrorCallbacks.set(messageId, callback);
    return () => this.onErrorCallbacks.delete(messageId);
  }

  /**
   * S'abonne à la complétion pour un message spécifique
   */
  onComplete(messageId: string, callback: CompleteCallback): () => void {
    this.onCompleteCallbacks.set(messageId, callback);
    return () => this.onCompleteCallbacks.delete(messageId);
  }

  /**
   * S'abonne aux changements de connexion
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.onConnectionChangeCallbacks.add(callback);
    return () => this.onConnectionChangeCallbacks.delete(callback);
  }

  /**
   * Vérifie si on est déjà abonné à une conversation
   */
  isSubscribedToConversation(conversationId: string): boolean {
    return this.subscribedConversations.has(conversationId);
  }

  /**
   * Retourne la liste des conversations auxquelles on est abonné (debug)
   */
  getSubscribedConversations(): string[] {
    return Array.from(this.subscribedConversations);
  }

  /**
   * Retourne l'état actuel du streaming
   */
  getStreamingState(): StreamingState {
    return { ...this.streamingState };
  }

  /**
   * Vérifie si le service est connecté
   */
  isConnected(): boolean {
    const connected = this.socket?.connected ?? false;
    console.log('[ChatStreamService] isConnected() appelé:', {
      hasSocket: !!this.socket,
      socketConnected: this.socket?.connected,
      socketId: this.socket?.id,
      result: connected
    });
    return connected;
  }

  /**
   * Ferme la connexion Socket.IO
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.streamingState = {
      messageId: null,
      accumulatedContent: '',
      lastChunkId: -1,
      isActive: false
    };

    this.subscribedConversations.clear();
    
    // ✅ NOUVEAU: Nettoyer pendingMessages et messageIdMapping
    this.pendingMessages.clear();
    this.messageIdMapping.clear();

    // Nettoyer tous les timeouts
    this.messageTimeouts.forEach(timeout => clearTimeout(timeout));
    this.messageTimeouts.clear();
  }

  /**
   * Traite un chunk de contenu
   * ✅ AMÉLIORÉ: Accumulation du contenu comme accounting
   */
  private handleChunk(chunk: PortfolioStreamChunkEvent): void {
    const { requestMessageId, content, chunkId, conversationId } = chunk;
    
    // Annuler le timeout si on reçoit des données
    this.clearMessageTimeout(requestMessageId);

    // ✅ NOUVEAU: Accumuler le contenu (comme accounting)
    const pending = this.pendingMessages.get(requestMessageId) || { content: '', chunkCount: 0 };
    pending.content += content;
    pending.chunkCount++;
    this.pendingMessages.set(requestMessageId, pending);

    console.log(`[ChatStreamService] 📨 CHUNK ${chunkId} pour conversation ${conversationId}:`, {
      requestMessageId,
      contentLength: content?.length || 0,
      accumulatedLength: pending.content.length,
      chunkCount: pending.chunkCount
    });

    // Mettre à jour l'état si c'est pour le message en cours
    if (requestMessageId === this.streamingState.messageId) {
      // Vérifier l'ordre des chunks
      if (chunkId > this.streamingState.lastChunkId) {
        this.streamingState.lastChunkId = chunkId;
        this.streamingState.accumulatedContent = pending.content;
      }
    }

    // ✅ IMPORTANT: Créer un chunk avec le contenu ACCUMULÉ pour le callback
    const chunkWithAccumulatedContent: PortfolioStreamChunkEvent = {
      ...chunk,
      content: pending.content // Contenu accumulé, pas juste ce chunk
    };

    // Notifier le callback avec le contenu accumulé
    // ✅ AMÉLIORÉ: Essayer plusieurs clés pour trouver le callback
    let callback = this.onChunkCallbacks.get(requestMessageId);
    
    // Si pas trouvé par requestMessageId, essayer avec le messageId du streamingState
    if (!callback && this.streamingState.messageId) {
      callback = this.onChunkCallbacks.get(this.streamingState.messageId);
      if (callback) {
        console.log('[ChatStreamService] ✅ Callback trouvé via streamingState.messageId:', this.streamingState.messageId);
      }
    }
    
    // Si toujours pas trouvé, chercher le premier callback disponible (fallback)
    if (!callback && this.onChunkCallbacks.size > 0) {
      const firstKey = Array.from(this.onChunkCallbacks.keys())[0];
      callback = this.onChunkCallbacks.get(firstKey);
      if (callback) {
        console.log('[ChatStreamService] ⚠️ Callback trouvé via fallback (première clé):', firstKey);
        // Ajouter un mapping pour les prochains chunks
        this.messageIdMapping.set(requestMessageId, firstKey);
      }
    }
    
    if (callback) {
      callback(chunkWithAccumulatedContent);
    } else {
      console.warn('[ChatStreamService] ⚠️ Pas de callback pour requestMessageId:', requestMessageId, 
        'Callbacks disponibles:', Array.from(this.onChunkCallbacks.keys()));
    }

    // Réinitialiser le timeout
    this.setupMessageTimeout(requestMessageId);
  }

  /**
   * Traite la fin du streaming
   * ✅ AMÉLIORÉ: Utiliser le contenu accumulé comme accounting
   */
  private handleEnd(chunk: PortfolioStreamChunkEvent): void {
    const { requestMessageId, conversationId, processingDetails } = chunk;
    
    this.clearMessageTimeout(requestMessageId);

    if (requestMessageId === this.streamingState.messageId) {
      this.streamingState.isActive = false;
    }

    // ✅ NOUVEAU: Récupérer le contenu accumulé (comme accounting)
    const pending = this.pendingMessages.get(requestMessageId);
    const finalContent = chunk.content || pending?.content || this.streamingState.accumulatedContent;
    
    console.log(`[ChatStreamService] ✅ STREAM END pour conversation ${conversationId}:`, {
      requestMessageId,
      totalChunks: processingDetails?.totalChunks || pending?.chunkCount,
      contentLength: finalContent.length,
      fromPayload: !!chunk.content,
      fromPending: !!pending?.content
    });

    // Nettoyer le pending
    this.pendingMessages.delete(requestMessageId);

    // Notifier le callback de complétion
    // ✅ AMÉLIORÉ: Essayer plusieurs clés pour trouver le callback
    let callback = this.onCompleteCallbacks.get(requestMessageId);
    
    // Essayer via le mapping si existe
    if (!callback) {
      const mappedId = this.messageIdMapping.get(requestMessageId);
      if (mappedId) {
        callback = this.onCompleteCallbacks.get(mappedId);
        if (callback) {
          console.log('[ChatStreamService] ✅ Callback onComplete trouvé via mapping:', mappedId);
        }
      }
    }
    
    // Essayer via streamingState.messageId
    if (!callback && this.streamingState.messageId) {
      callback = this.onCompleteCallbacks.get(this.streamingState.messageId);
      if (callback) {
        console.log('[ChatStreamService] ✅ Callback onComplete trouvé via streamingState.messageId:', this.streamingState.messageId);
      }
    }
    
    // Fallback: premier callback disponible
    if (!callback && this.onCompleteCallbacks.size > 0) {
      const firstKey = Array.from(this.onCompleteCallbacks.keys())[0];
      callback = this.onCompleteCallbacks.get(firstKey);
      if (callback) {
        console.log('[ChatStreamService] ⚠️ Callback onComplete trouvé via fallback:', firstKey);
      }
    }
    
    if (callback) {
      callback(finalContent, chunk.suggestedActions);
    } else {
      console.warn('[ChatStreamService] ⚠️ Pas de callback onComplete pour requestMessageId:', requestMessageId,
        'Callbacks disponibles:', Array.from(this.onCompleteCallbacks.keys()));
    }

    // Nettoyer les callbacks pour ce message (utiliser le mapping si nécessaire)
    this.cleanupMessageCallbacks(requestMessageId);
    const mappedId = this.messageIdMapping.get(requestMessageId);
    if (mappedId) {
      this.cleanupMessageCallbacks(mappedId);
    }
    this.messageIdMapping.delete(requestMessageId);

    console.log('[ChatStreamService] ✅ Streaming terminé:', {
      messageId: chunk.requestMessageId,
      totalChunks: chunk.totalChunks,
      contentLength: finalContent.length,
      suggestedActions: chunk.suggestedActions
    });
  }

  /**
   * Traite une erreur de streaming
   */
  private handleError(chunk: PortfolioStreamChunkEvent): void {
    const { requestMessageId } = chunk;
    
    this.clearMessageTimeout(requestMessageId);

    if (requestMessageId === this.streamingState.messageId) {
      this.streamingState.isActive = false;
      this.streamingState.error = chunk.content;
    }

    const error = new Error(chunk.content || 'Erreur de streaming');
    
    // Notifier le callback d'erreur
    // ✅ AMÉLIORÉ: Essayer plusieurs clés pour trouver le callback
    let callback = this.onErrorCallbacks.get(requestMessageId);
    
    // Essayer via le mapping si existe
    if (!callback) {
      const mappedId = this.messageIdMapping.get(requestMessageId);
      if (mappedId) {
        callback = this.onErrorCallbacks.get(mappedId);
      }
    }
    
    // Essayer via streamingState.messageId
    if (!callback && this.streamingState.messageId) {
      callback = this.onErrorCallbacks.get(this.streamingState.messageId);
    }
    
    // Fallback: premier callback disponible
    if (!callback && this.onErrorCallbacks.size > 0) {
      const firstKey = Array.from(this.onErrorCallbacks.keys())[0];
      callback = this.onErrorCallbacks.get(firstKey);
    }
    
    if (callback) {
      callback(error);
    }

    // Nettoyer les callbacks pour ce message
    this.cleanupMessageCallbacks(requestMessageId);
    const mappedId = this.messageIdMapping.get(requestMessageId);
    if (mappedId) {
      this.cleanupMessageCallbacks(mappedId);
    }
    this.messageIdMapping.delete(requestMessageId);

    console.error('[ChatStreamService] ❌ Erreur de streaming:', chunk.content);
  }

  /**
   * Traite les événements d'outil (tool_call, tool_result)
   */
  private handleToolEvent(chunk: PortfolioStreamChunkEvent): void {
    // Les événements d'outil sont traités comme des chunks normaux
    // mais peuvent être utilisés pour afficher un indicateur de traitement
    const callback = this.onChunkCallbacks.get(chunk.requestMessageId);
    if (callback) {
      callback(chunk);
    }

    // Réinitialiser le timeout
    this.clearMessageTimeout(chunk.requestMessageId);
    this.setupMessageTimeout(chunk.requestMessageId);
  }

  /**
   * Configure le timeout pour un message
   */
  private setupMessageTimeout(messageId: string): void {
    this.clearMessageTimeout(messageId);

    const timeout = setTimeout(() => {
      console.error('[ChatStreamService] ⏱️ Timeout pour le message:', messageId);
      
      const error = new Error('Timeout: pas de réponse du serveur');
      const callback = this.onErrorCallbacks.get(messageId);
      if (callback) {
        callback(error);
      }

      if (this.streamingState.messageId === messageId) {
        this.streamingState.isActive = false;
      }
      
      this.cleanupMessageCallbacks(messageId);

    }, this.config.timeout);

    this.messageTimeouts.set(messageId, timeout);
  }

  /**
   * Annule le timeout pour un message
   */
  private clearMessageTimeout(messageId: string): void {
    const timeout = this.messageTimeouts.get(messageId);
    if (timeout) {
      clearTimeout(timeout);
      this.messageTimeouts.delete(messageId);
    }
  }

  /**
   * Nettoie les callbacks pour un message terminé
   */
  private cleanupMessageCallbacks(messageId: string): void {
    this.onChunkCallbacks.delete(messageId);
    this.onErrorCallbacks.delete(messageId);
    this.onCompleteCallbacks.delete(messageId);
    this.clearMessageTimeout(messageId);
  }

  /**
   * Notifie les abonnés des changements de connexion
   */
  private notifyConnectionChange(connected: boolean): void {
    this.onConnectionChangeCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('[ChatStreamService] Erreur dans le callback de connexion:', error);
      }
    });
  }

  /**
   * Récupère le token d'authentification Auth0
   */
  private getAuthToken(): string {
    // Utiliser le module centralisé d'authentification
    return getAccessToken() || '';
  }
}

// Instance singleton du service
let streamServiceInstance: ChatStreamService | null = null;

/**
 * Retourne l'instance singleton du service de streaming
 */
export function getChatStreamService(config?: Partial<StreamingConfig>): ChatStreamService {
  if (!streamServiceInstance) {
    streamServiceInstance = new ChatStreamService(config);
  }
  return streamServiceInstance;
}

/**
 * Réinitialise l'instance singleton (utile pour les tests)
 */
export function resetChatStreamService(): void {
  if (streamServiceInstance) {
    streamServiceInstance.disconnect();
    streamServiceInstance = null;
  }
}
