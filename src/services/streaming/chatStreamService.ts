// src/services/streaming/chatStreamService.ts
/**
 * Service de gestion du streaming des réponses IA via WebSocket
 * 
 * Ce service permet de recevoir les réponses de l'IA ADHA en temps réel,
 * chunk par chunk, pour une meilleure expérience utilisateur.
 * 
 * @see API DOCUMENTATION/chat/README.md - Section "Streaming des Réponses IA"
 */

import type { 
  PortfolioStreamChunkEvent, 
  StreamingState, 
  StreamingConfig
} from '../../types/chat';

// Configuration par défaut
const DEFAULT_CONFIG: StreamingConfig = {
  websocketUrl: import.meta.env.VITE_WS_URL || 'wss://api.wanzo.com/ws/portfolio-chat',
  timeout: 45000,
  autoRetry: true,
  maxRetries: 3
};

// Types pour les callbacks
type ChunkCallback = (chunk: PortfolioStreamChunkEvent) => void;
type ErrorCallback = (error: Error) => void;
type CompleteCallback = (content: string, suggestedActions?: string[]) => void;
type ConnectionCallback = (connected: boolean) => void;

/**
 * Classe de gestion du streaming des réponses IA
 */
export class ChatStreamService {
  private socket: WebSocket | null = null;
  private config: StreamingConfig;
  private institutionId: string | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  
  // État du streaming
  private streamingState: StreamingState = {
    messageId: null,
    accumulatedContent: '',
    lastChunkId: -1,
    isActive: false
  };
  
  // Callbacks
  private onChunkCallbacks: Map<string, ChunkCallback> = new Map();
  private onErrorCallbacks: Map<string, ErrorCallback> = new Map();
  private onCompleteCallbacks: Map<string, CompleteCallback> = new Map();
  private onConnectionChangeCallbacks: Set<ConnectionCallback> = new Set();
  
  // Timeout pour les messages
  private messageTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor(config?: Partial<StreamingConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Se connecte au serveur WebSocket pour le streaming
   */
  async connect(institutionId: string): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('[ChatStreamService] Déjà connecté');
      return;
    }

    this.institutionId = institutionId;
    const url = `${this.config.websocketUrl}/${institutionId}`;

    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
          console.log('[ChatStreamService] Connexion WebSocket établie');
          this.reconnectAttempts = 0;
          this.notifyConnectionChange(true);
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.socket.onerror = (error) => {
          console.error('[ChatStreamService] Erreur WebSocket:', error);
          this.notifyConnectionChange(false);
        };

        this.socket.onclose = (event) => {
          console.log('[ChatStreamService] Connexion fermée:', event.code, event.reason);
          this.notifyConnectionChange(false);
          this.handleDisconnect();
        };

        // Timeout de connexion
        setTimeout(() => {
          if (this.socket?.readyState !== WebSocket.OPEN) {
            reject(new Error('Timeout de connexion WebSocket'));
          }
        }, 10000);

      } catch (error) {
        console.error('[ChatStreamService] Erreur de connexion:', error);
        reject(error);
      }
    });
  }

  /**
   * Envoie un message avec streaming activé
   */
  sendMessage(
    contextId: string, 
    content: string, 
    metadata?: {
      portfolioId?: string;
      portfolioType?: 'traditional' | 'investment' | 'leasing';
      institutionId?: string;
    }
  ): string {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket non connecté');
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Réinitialiser l'état de streaming
    this.streamingState = {
      messageId,
      accumulatedContent: '',
      lastChunkId: -1,
      isActive: true
    };

    // Envoyer le message
    const payload = {
      action: 'sendMessage',
      contextId,
      content,
      metadata: {
        ...metadata,
        institutionId: this.institutionId
      },
      streaming: true,
      requestMessageId: messageId
    };

    this.socket.send(JSON.stringify(payload));

    // Configurer le timeout
    this.setupMessageTimeout(messageId);

    return messageId;
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
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Ferme la connexion WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Déconnexion manuelle');
      this.socket = null;
    }

    this.streamingState = {
      messageId: null,
      accumulatedContent: '',
      lastChunkId: -1,
      isActive: false
    };

    // Nettoyer tous les timeouts
    this.messageTimeouts.forEach(timeout => clearTimeout(timeout));
    this.messageTimeouts.clear();
  }

  /**
   * Traite les messages reçus du WebSocket
   */
  private handleMessage(data: string): void {
    try {
      const chunk: PortfolioStreamChunkEvent = JSON.parse(data);
      
      // Vérifier si c'est pour le message en cours
      if (chunk.requestMessageId !== this.streamingState.messageId) {
        console.warn('[ChatStreamService] Chunk reçu pour un autre message:', chunk.requestMessageId);
        return;
      }

      // Annuler le timeout si on reçoit des données
      this.clearMessageTimeout(chunk.requestMessageId);

      switch (chunk.type) {
        case 'chunk':
          this.handleChunk(chunk);
          break;
        case 'end':
          this.handleEnd(chunk);
          break;
        case 'error':
          this.handleError(chunk);
          break;
        case 'tool_call':
        case 'tool_result':
          this.handleToolEvent(chunk);
          break;
        default:
          console.warn('[ChatStreamService] Type de chunk inconnu:', chunk.type);
      }

    } catch (error) {
      console.error('[ChatStreamService] Erreur de parsing du message:', error);
    }
  }

  /**
   * Traite un chunk de contenu
   */
  private handleChunk(chunk: PortfolioStreamChunkEvent): void {
    // Vérifier l'ordre des chunks
    if (chunk.chunkId <= this.streamingState.lastChunkId) {
      console.warn('[ChatStreamService] Chunk reçu dans le désordre:', chunk.chunkId);
      return;
    }

    this.streamingState.lastChunkId = chunk.chunkId;
    this.streamingState.accumulatedContent += chunk.content;

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
    this.streamingState.isActive = false;

    // Utiliser le contenu complet du message 'end' ou le contenu accumulé
    const finalContent = chunk.content || this.streamingState.accumulatedContent;

    // Notifier le callback de complétion
    const callback = this.onCompleteCallbacks.get(chunk.requestMessageId);
    if (callback) {
      callback(finalContent, chunk.suggestedActions);
    }

    // Nettoyer les callbacks pour ce message
    this.cleanupMessageCallbacks(chunk.requestMessageId);

    console.log('[ChatStreamService] Streaming terminé:', {
      totalChunks: chunk.totalChunks,
      contentLength: finalContent.length,
      suggestedActions: chunk.suggestedActions
    });
  }

  /**
   * Traite une erreur de streaming
   */
  private handleError(chunk: PortfolioStreamChunkEvent): void {
    this.streamingState.isActive = false;
    this.streamingState.error = chunk.content;

    const error = new Error(chunk.content || 'Erreur de streaming');
    
    // Notifier le callback d'erreur
    const callback = this.onErrorCallbacks.get(chunk.requestMessageId);
    if (callback) {
      callback(error);
    }

    // Nettoyer les callbacks pour ce message
    this.cleanupMessageCallbacks(chunk.requestMessageId);

    console.error('[ChatStreamService] Erreur de streaming:', chunk.content);
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
    this.setupMessageTimeout(chunk.requestMessageId);
  }

  /**
   * Configure le timeout pour un message
   */
  private setupMessageTimeout(messageId: string): void {
    this.clearMessageTimeout(messageId);

    const timeout = setTimeout(() => {
      console.error('[ChatStreamService] Timeout pour le message:', messageId);
      
      const error = new Error('Timeout: pas de réponse du serveur');
      const callback = this.onErrorCallbacks.get(messageId);
      if (callback) {
        callback(error);
      }

      this.streamingState.isActive = false;
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
   * Gère la déconnexion et la reconnexion automatique
   */
  private handleDisconnect(): void {
    if (!this.config.autoRetry || !this.institutionId) {
      return;
    }

    if (this.reconnectAttempts >= (this.config.maxRetries || 3)) {
      console.error('[ChatStreamService] Nombre max de tentatives de reconnexion atteint');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`[ChatStreamService] Tentative de reconnexion dans ${delay}ms (tentative ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.institutionId!).catch(error => {
        console.error('[ChatStreamService] Échec de la reconnexion:', error);
      });
    }, delay);
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
