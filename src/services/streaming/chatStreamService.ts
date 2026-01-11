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

// Configuration par défaut
const DEFAULT_CONFIG: StreamingConfig = {
  websocketUrl: import.meta.env.VITE_API_URL || 'https://api.wanzo.com',
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
type CompleteCallback = (content: string, suggestedActions?: string[]) => void;
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
  
  // Callbacks par messageId
  private onChunkCallbacks: Map<string, ChunkCallback> = new Map();
  private onErrorCallbacks: Map<string, ErrorCallback> = new Map();
  private onCompleteCallbacks: Map<string, CompleteCallback> = new Map();
  private onConnectionChangeCallbacks: Set<ConnectionCallback> = new Set();
  
  // Conversations souscrites
  private subscribedConversations: Set<string> = new Set();
  
  // Timeout pour les messages
  private messageTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

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
    if (this.socket?.connected) {
      console.log('[ChatStreamService] Déjà connecté');
      return;
    }

    this.currentInstitutionId = institutionId;
    
    // Récupérer le token JWT
    const token = this.getAuthToken();

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.websocketUrl, {
          path: '/socket.io',
          transports: ['websocket'],
          auth: {
            token
          },
          query: {
            token,
            institutionId
          },
          reconnection: this.config.autoRetry,
          reconnectionAttempts: this.config.maxRetries,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 30000,
          timeout: 10000
        });

        this.socket.on('connect', () => {
          console.log('[ChatStreamService] ✅ Socket.IO connecté');
          this.reconnectAttempts = 0;
          this.notifyConnectionChange(true);
          
          // Re-souscrire aux conversations en cours
          this.resubscribeToConversations();
          
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('[ChatStreamService] ❌ Socket.IO déconnecté:', reason);
          this.notifyConnectionChange(false);
        });

        this.socket.on('connect_error', (error) => {
          console.error('[ChatStreamService] Erreur de connexion Socket.IO:', error);
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

    // Chunk de contenu
    this.socket.on(SOCKET_EVENTS.STREAM_CHUNK, (chunk: PortfolioStreamChunkEvent) => {
      this.handleChunk(chunk);
    });

    // Fin du streaming
    this.socket.on(SOCKET_EVENTS.STREAM_END, (chunk: PortfolioStreamChunkEvent) => {
      this.handleEnd(chunk);
    });

    // Erreur de streaming
    this.socket.on(SOCKET_EVENTS.STREAM_ERROR, (chunk: PortfolioStreamChunkEvent) => {
      this.handleError(chunk);
    });

    // Événements d'outil (tool_call, tool_result)
    this.socket.on(SOCKET_EVENTS.STREAM_TOOL, (chunk: PortfolioStreamChunkEvent) => {
      this.handleToolEvent(chunk);
    });
  }

  /**
   * S'abonne aux mises à jour d'une conversation
   */
  subscribeToConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      console.warn('[ChatStreamService] Socket non connecté, impossible de souscrire');
      return;
    }

    this.socket.emit(SOCKET_EVENTS.SUBSCRIBE_CONVERSATION, { conversationId });
    this.subscribedConversations.add(conversationId);
    console.log('[ChatStreamService] Souscrit à la conversation:', conversationId);
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
   * Retourne l'état actuel du streaming
   */
  getStreamingState(): StreamingState {
    return { ...this.streamingState };
  }

  /**
   * Vérifie si le service est connecté
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
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

    // Nettoyer tous les timeouts
    this.messageTimeouts.forEach(timeout => clearTimeout(timeout));
    this.messageTimeouts.clear();
  }

  /**
   * Traite un chunk de contenu
   */
  private handleChunk(chunk: PortfolioStreamChunkEvent): void {
    // Annuler le timeout si on reçoit des données
    this.clearMessageTimeout(chunk.requestMessageId);

    // Mettre à jour l'état si c'est pour le message en cours
    if (chunk.requestMessageId === this.streamingState.messageId) {
      // Vérifier l'ordre des chunks
      if (chunk.chunkId > this.streamingState.lastChunkId) {
        this.streamingState.lastChunkId = chunk.chunkId;
        this.streamingState.accumulatedContent += chunk.content;
      }
    }

    // Notifier le callback
    const callback = this.onChunkCallbacks.get(chunk.requestMessageId);
    if (callback) {
      callback(chunk);
    }

    // Réinitialiser le timeout
    this.setupMessageTimeout(chunk.requestMessageId);
  }

  /**
   * Traite la fin du streaming
   */
  private handleEnd(chunk: PortfolioStreamChunkEvent): void {
    this.clearMessageTimeout(chunk.requestMessageId);

    if (chunk.requestMessageId === this.streamingState.messageId) {
      this.streamingState.isActive = false;
    }

    // Utiliser le contenu complet du message 'end' ou le contenu accumulé
    const finalContent = chunk.content || this.streamingState.accumulatedContent;

    // Notifier le callback de complétion
    const callback = this.onCompleteCallbacks.get(chunk.requestMessageId);
    if (callback) {
      callback(finalContent, chunk.suggestedActions);
    }

    // Nettoyer les callbacks pour ce message
    this.cleanupMessageCallbacks(chunk.requestMessageId);

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
    this.clearMessageTimeout(chunk.requestMessageId);

    if (chunk.requestMessageId === this.streamingState.messageId) {
      this.streamingState.isActive = false;
      this.streamingState.error = chunk.content;
    }

    const error = new Error(chunk.content || 'Erreur de streaming');
    
    // Notifier le callback d'erreur
    const callback = this.onErrorCallbacks.get(chunk.requestMessageId);
    if (callback) {
      callback(error);
    }

    // Nettoyer les callbacks pour ce message
    this.cleanupMessageCallbacks(chunk.requestMessageId);

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
   * Récupère le token d'authentification
   */
  private getAuthToken(): string {
    // Essayer de récupérer le token depuis le localStorage
    const tokenKey = 'auth_token';
    return localStorage.getItem(tokenKey) || '';
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
