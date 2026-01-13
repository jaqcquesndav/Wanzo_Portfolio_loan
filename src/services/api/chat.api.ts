// src/services/api/chat.api.ts
// Service API Chat ADHA - Aligné avec la documentation API et les types TypeScript

import { apiClient } from './base.api';
import { API_ENDPOINTS } from './endpoints';
import type { 
  Message, 
  Conversation, 
  ChatMetadata,
  ChatSuggestion,
  PredefinedResponse,
  MessageRating,
  ChatReport,
  MessageAttachment,
  StreamingResponse
} from '../../types/chat';
import { AI_MODELS } from '../../types/chat';

/**
 * Paramètres pour l'envoi d'un message
 * @see API DOCUMENTATION/chat/README.md - Payload: { content, contextId, metadata }
 */
interface SendMessageParams {
  content: string;
  contextId?: string;
  metadata?: ChatMetadata;
  attachment?: MessageAttachment;
  // Note: mode n'est PAS supporté par le backend - utiliser metadata.portfolioType si besoin
}

/**
 * Réponse de l'API après envoi d'un message
 */
interface SendMessageResponse {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user';
  contextId: string;
  metadata?: ChatMetadata;
  response?: {
    id: string;
    content: string;
    timestamp: string;
    sender: 'assistant';
    attachments?: MessageAttachment[];
  };
}

/**
 * Paramètres pour récupérer l'historique des messages
 */
interface GetMessagesParams {
  limit?: number;
  before?: string;
  after?: string;
}

/**
 * Réponse de l'historique des messages
 */
interface GetMessagesResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Paramètres pour récupérer les contextes
 */
interface GetContextsParams {
  limit?: number;
  offset?: number;
  search?: string;
  portfolioId?: string;
  companyId?: string;
}

/**
 * Contexte tel que renvoyé par le backend
 */
interface BackendContext {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
  messageCount: number;
  lastMessage: {
    content: string;
    timestamp: string;
    sender: string;
  } | null;
}

/**
 * Réponse de la liste des contextes (format backend)
 */
interface GetContextsResponse {
  contexts: BackendContext[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Paramètres pour les suggestions
 */
interface GetSuggestionsParams {
  contextId?: string;
  portfolioId?: string;
  portfolioType?: 'traditional' | 'investment' | 'leasing';
  companyId?: string;
  currentScreenPath?: string;
}

/**
 * Paramètres pour générer un rapport
 */
interface GenerateReportParams {
  contextId: string;
  title?: string;
  format?: 'pdf' | 'docx' | 'html';
  includeMetadata?: boolean;
}

/**
 * Service API pour le Chat ADHA
 * Implémente tous les endpoints documentés dans API DOCUMENTATION/chat/README.md
 */
class ChatApiService {
  
  // ==================== CONTEXTES ====================
  
  /**
   * Récupère tous les contextes de chat de l'utilisateur
   * Note: Le backend renvoie { data: { contexts: [...], total, limit, offset } }
   */
  async getContexts(params?: GetContextsParams): Promise<GetContextsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.portfolioId) queryParams.append('portfolioId', params.portfolioId);
      if (params?.companyId) queryParams.append('companyId', params.companyId);

      const url = `${API_ENDPOINTS.chat.contexts.getAll}?${queryParams.toString()}`;
      const response = await apiClient.get<GetContextsResponse | { data: GetContextsResponse }>(url);
      
      // Le backend peut renvoyer { data: { contexts: [...] } } ou directement { contexts: [...] }
      // Gérer les deux cas
      if ('data' in response && response.data && 'contexts' in response.data) {
        console.log('[ChatApi] getContexts - Format avec enveloppe data:', response.data);
        return response.data;
      }
      
      // Format direct
      if ('contexts' in response) {
        console.log('[ChatApi] getContexts - Format direct:', response);
        return response as GetContextsResponse;
      }
      
      console.warn('[ChatApi] getContexts - Format inattendu:', response);
      return { contexts: [], total: 0, limit: 10, offset: 0 };
    } catch (error) {
      console.error('Erreur lors de la récupération des contextes:', error);
      return { contexts: [], total: 0, limit: 10, offset: 0 };
    }
  }

  /**
   * Alias pour getContexts - compatibilité avec l'ancien code
   * Transforme les contextes backend en format Conversation frontend
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await this.getContexts();
    
    // Transformer les contextes backend en format Conversation frontend
    return response.contexts.map(ctx => ({
      id: ctx.id,
      title: ctx.title,
      timestamp: ctx.updated_at || ctx.created_at || new Date().toISOString(),
      messages: [], // Les messages seront chargés séparément si nécessaire
      isActive: false,
      model: AI_MODELS[0],
      context: [],
      synced: true,
      lastSyncTime: ctx.updated_at
    }));
  }

  /**
   * Récupère un contexte de chat par son ID
   */
  async getContextById(contextId: string): Promise<Conversation | null> {
    try {
      const response = await apiClient.get<BackendContext | { data: BackendContext }>(API_ENDPOINTS.chat.contexts.getById(contextId));
      
      // Gérer l'enveloppe data si présente
      const ctx = 'data' in response && response.data ? response.data : response as BackendContext;
      
      return {
        id: ctx.id,
        title: ctx.title,
        timestamp: ctx.updated_at || ctx.created_at || new Date().toISOString(),
        messages: [],
        isActive: true,
        model: AI_MODELS[0],
        context: [],
        synced: true
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération du contexte ${contextId}:`, error);
      return null;
    }
  }

  /**
   * Crée un nouveau contexte de chat
   */
  async createContext(data?: { title?: string; metadata?: ChatMetadata }): Promise<Conversation> {
    try {
      const response = await apiClient.post<BackendContext | { data: BackendContext }>(API_ENDPOINTS.chat.contexts.create, {
        title: data?.title || 'Nouvelle conversation',
        metadata: data?.metadata
      });
      
      // Gérer l'enveloppe data si présente
      const ctx = 'data' in response && response.data ? response.data : response as BackendContext;
      
      console.log('[ChatApi] createContext - Réponse backend:', ctx);
      
      return {
        id: ctx.id,
        title: ctx.title,
        timestamp: ctx.updated_at || ctx.created_at || new Date().toISOString(),
        messages: [],
        isActive: true,
        model: AI_MODELS[0],
        context: [],
        synced: true
      };
    } catch (error) {
      console.error('Erreur lors de la création du contexte:', error);
      // Retourner un contexte local vide en cas d'erreur (sans message prédéfini)
      return {
        id: `local-${Date.now()}`,
        title: data?.title || 'Nouvelle conversation',
        timestamp: new Date().toISOString(),
        messages: [],
        isActive: true,
        model: AI_MODELS[0],
        context: [],
        metadata: data?.metadata,
        error: true
      };
    }
  }

  /**
   * Alias pour createContext - compatibilité avec l'ancien code
   */
  async createConversation(title: string = 'Nouvelle conversation', metadata?: ChatMetadata): Promise<Conversation> {
    return this.createContext({ title, metadata });
  }

  /**
   * Met à jour un contexte de chat
   */
  async updateContext(contextId: string, updates: { title?: string; metadata?: ChatMetadata }): Promise<Conversation | null> {
    try {
      return await apiClient.put<Conversation>(API_ENDPOINTS.chat.contexts.update(contextId), updates);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du contexte ${contextId}:`, error);
      return null;
    }
  }

  /**
   * Supprime un contexte de chat
   */
  async deleteContext(contextId: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(API_ENDPOINTS.chat.contexts.delete(contextId));
      return { success: true };
    } catch (error) {
      console.error(`Erreur lors de la suppression du contexte ${contextId}:`, error);
      return { success: false };
    }
  }

  /**
   * Alias pour deleteContext - compatibilité avec l'ancien code
   */
  async deleteConversation(conversationId: string): Promise<{ success: boolean }> {
    return this.deleteContext(conversationId);
  }

  // ==================== MESSAGES ====================

  /**
   * Récupère l'historique des messages pour un contexte
   */
  async getMessages(contextId: string, params?: GetMessagesParams): Promise<GetMessagesResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.before) queryParams.append('before', params.before);
      if (params?.after) queryParams.append('after', params.after);

      const url = `${API_ENDPOINTS.chat.contexts.getMessages(contextId)}?${queryParams.toString()}`;
      return await apiClient.get<GetMessagesResponse>(url);
    } catch (error) {
      console.error(`Erreur lors de la récupération des messages du contexte ${contextId}:`, error);
      return { messages: [], hasMore: false };
    }
  }

  /**
   * Envoie un nouveau message (mode synchrone)
   * Attend la réponse complète de l'IA ADHA
   */
  async sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    try {
      const response = await apiClient.post<SendMessageResponse | { data: SendMessageResponse }>(API_ENDPOINTS.chat.messages.send, {
        content: params.content,
        contextId: params.contextId,
        metadata: params.metadata,
        attachment: params.attachment
      });
      
      console.log('[ChatApi] sendMessage - Réponse brute:', response);
      
      // Gérer l'enveloppe data si présente
      if ('data' in response && response.data && 'id' in response.data) {
        return response.data;
      }
      
      // Format direct
      if ('id' in response) {
        return response as SendMessageResponse;
      }
      
      console.error('[ChatApi] sendMessage - Format de réponse inattendu:', response);
      throw new Error('Format de réponse message inattendu');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      // Retourner un message local avec erreur
      return {
        id: `local-${Date.now()}`,
        content: params.content,
        timestamp: new Date().toISOString(),
        sender: 'user',
        contextId: params.contextId || '',
        metadata: params.metadata
      };
    }
  }

  /**
   * Envoie un message en mode streaming
   * Retourne immédiatement avec les infos WebSocket pour recevoir la réponse chunk par chunk
   * @see API DOCUMENTATION/chat/README.md - Section "Mode Streaming"
   */
  async sendStreamingMessage(params: SendMessageParams): Promise<StreamingResponse> {
    try {
      const response = await apiClient.post<StreamingResponse | { data: StreamingResponse['data']; websocket?: StreamingResponse['websocket'] }>(API_ENDPOINTS.chat.messages.stream, {
        content: params.content,
        contextId: params.contextId,
        metadata: params.metadata
      });
      
      console.log('[ChatApi] sendStreamingMessage - Réponse brute:', response);
      
      // Si la réponse a été déballée par apiClient (juste data), reconstruire le format attendu
      if ('messageId' in response) {
        return {
          success: true,
          data: response as StreamingResponse['data'],
          websocket: {
            namespace: '/',  // Namespace racine selon la doc
            events: {
              subscribe: 'subscribe_conversation',
              chunk: 'adha.stream.chunk',
              end: 'adha.stream.end',
              error: 'adha.stream.error',
              tool: 'adha.stream.tool'
            }
          }
        };
      }
      
      // Format complet StreamingResponse
      if ('success' in response && 'data' in response) {
        return response as StreamingResponse;
      }
      
      // Format avec data mais sans success
      if ('data' in response && response.data && 'messageId' in response.data) {
        return {
          success: true,
          data: response.data,
          websocket: response.websocket || {
            namespace: '/',  // Namespace racine selon la doc
            events: {
              subscribe: 'subscribe_conversation',
              chunk: 'adha.stream.chunk',
              end: 'adha.stream.end',
              error: 'adha.stream.error',
              tool: 'adha.stream.tool'
            }
          }
        };
      }
      
      console.error('[ChatApi] sendStreamingMessage - Format de réponse inattendu:', response);
      throw new Error('Format de réponse streaming inattendu');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message streaming:', error);
      throw error;
    }
  }

  /**
   * Met à jour un message existant (likes, dislikes, contenu)
   */
  async updateMessage(messageId: string, updates: Partial<Message>): Promise<Message | null> {
    try {
      return await apiClient.put<Message>(API_ENDPOINTS.chat.messages.update(messageId), updates);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du message ${messageId}:`, error);
      return null;
    }
  }

  /**
   * Évalue un message (rating)
   */
  async rateMessage(messageId: string, rating: { score: 1 | 2 | 3 | 4 | 5; feedback?: string }): Promise<MessageRating | null> {
    try {
      return await apiClient.post<MessageRating>(API_ENDPOINTS.chat.messages.rate(messageId), rating);
    } catch (error) {
      console.error(`Erreur lors de l'évaluation du message ${messageId}:`, error);
      return null;
    }
  }

  /**
   * Ajoute une pièce jointe à un message
   */
  async addAttachment(messageId: string, file: FormData): Promise<MessageAttachment | null> {
    try {
      return await apiClient.upload<MessageAttachment>(API_ENDPOINTS.chat.messages.addAttachment(messageId), file);
    } catch (error) {
      console.error(`Erreur lors de l'ajout de la pièce jointe au message ${messageId}:`, error);
      return null;
    }
  }

  // ==================== FONCTIONNALITÉS AVANCÉES ====================

  /**
   * Récupère des suggestions de chat basées sur le contexte
   */
  async getSuggestions(params?: GetSuggestionsParams): Promise<ChatSuggestion[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.contextId) queryParams.append('contextId', params.contextId);
      if (params?.portfolioId) queryParams.append('portfolioId', params.portfolioId);
      if (params?.portfolioType) queryParams.append('portfolioType', params.portfolioType);
      if (params?.companyId) queryParams.append('companyId', params.companyId);
      if (params?.currentScreenPath) queryParams.append('currentScreenPath', params.currentScreenPath);

      const url = `${API_ENDPOINTS.chat.suggestions}?${queryParams.toString()}`;
      const response = await apiClient.get<{ suggestions: ChatSuggestion[] }>(url);
      return response.suggestions;
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
      return [];
    }
  }

  /**
   * Génère un rapport basé sur les conversations
   */
  async generateReport(params: GenerateReportParams): Promise<ChatReport | null> {
    try {
      return await apiClient.post<ChatReport>(API_ENDPOINTS.chat.reports, {
        contextId: params.contextId,
        title: params.title,
        format: params.format || 'pdf',
        includeMetadata: params.includeMetadata ?? true
      });
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      return null;
    }
  }

  /**
   * Récupère les réponses prédéfinies
   */
  async getPredefinedResponses(category?: string): Promise<{ responses: PredefinedResponse[]; categories: string[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (category) queryParams.append('category', category);

      const url = `${API_ENDPOINTS.chat.predefinedResponses}?${queryParams.toString()}`;
      return await apiClient.get<{ responses: PredefinedResponse[]; categories: string[] }>(url);
    } catch (error) {
      console.error('Erreur lors de la récupération des réponses prédéfinies:', error);
      return { responses: [], categories: [] };
    }
  }
}

// Exporter une instance unique du service
export const chatApi = new ChatApiService();

// Export par défaut pour la compatibilité
export default chatApi;
