// src/services/api/shared/chat.api.ts
import { apiClient } from '../base.api';

/**
 * API pour la gestion du chat et de ses contextes
 */
export const chatApi = {
  /**
   * Envoie un message au système de chat
   */
  sendMessage: (message: {
    content: string;
    contextId?: string;
    metadata?: {
      portfolioId?: string;
      portfolioType?: 'traditional' | 'investment' | 'leasing';
      companyId?: string;
      entityType?: string;
      entityId?: string;
    };
  }) => {
    return apiClient.post<{
      id: string;
      content: string;
      timestamp: string;
      sender: 'user';
      contextId: string;
      metadata?: Record<string, string>;
      response?: {
        id: string;
        content: string;
        timestamp: string;
        sender: 'assistant';
        attachments?: Array<{
          type: string;
          url: string;
          name: string;
        }>;
      };
    }>('/chat/messages', message);
  },

  /**
   * Récupère l'historique des messages pour un contexte
   */
  getMessageHistory: (contextId: string, params?: {
    limit?: number;
    before?: string;
    after?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.before) queryParams.append('before', params.before);
    if (params?.after) queryParams.append('after', params.after);

    return apiClient.get<{
      messages: Array<{
        id: string;
        content: string;
        timestamp: string;
        sender: 'user' | 'assistant';
        contextId: string;
        metadata?: Record<string, string>;
        attachments?: Array<{
          type: string;
          url: string;
          name: string;
        }>;
      }>;
      hasMore: boolean;
      nextCursor?: string;
    }>(`/chat/contexts/${contextId}/messages?${queryParams.toString()}`);
  },

  /**
   * Crée un nouveau contexte de chat
   */
  createContext: (data?: {
    title?: string;
    metadata?: {
      portfolioId?: string;
      portfolioType?: 'traditional' | 'investment' | 'leasing';
      companyId?: string;
      entityType?: string;
      entityId?: string;
    };
  }) => {
    return apiClient.post<{
      id: string;
      title: string;
      created_at: string;
      updated_at: string;
      metadata?: Record<string, string>;
    }>('/chat/contexts', data);
  },

  /**
   * Récupère un contexte de chat par son ID
   */
  getContextById: (id: string) => {
    return apiClient.get<{
      id: string;
      title: string;
      created_at: string;
      updated_at: string;
      metadata?: Record<string, string>;
      messageCount: number;
      lastMessage?: {
        content: string;
        timestamp: string;
        sender: 'user' | 'assistant';
      };
    }>(`/chat/contexts/${id}`);
  },

  /**
   * Récupère tous les contextes de chat
   */
  getAllContexts: (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    portfolioId?: string;
    companyId?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.portfolioId) queryParams.append('portfolioId', params.portfolioId);
    if (params?.companyId) queryParams.append('companyId', params.companyId);

    return apiClient.get<{
      contexts: Array<{
        id: string;
        title: string;
        created_at: string;
        updated_at: string;
        metadata?: Record<string, string>;
        messageCount: number;
        lastMessage?: {
          content: string;
          timestamp: string;
          sender: 'user' | 'assistant';
        };
      }>;
      total: number;
      limit: number;
      offset: number;
    }>(`/chat/contexts?${queryParams.toString()}`);
  },

  /**
   * Met à jour un contexte de chat
   */
  updateContext: (id: string, updates: {
    title?: string;
    metadata?: Record<string, string>;
  }) => {
    return apiClient.put<{
      id: string;
      title: string;
      updated_at: string;
      metadata?: Record<string, string>;
    }>(`/chat/contexts/${id}`, updates);
  },

  /**
   * Supprime un contexte de chat
   */
  deleteContext: (id: string) => {
    return apiClient.delete(`/chat/contexts/${id}`);
  },

  /**
   * Récupère les suggestions de chat basées sur le contexte actuel
   */
  getChatSuggestions: (contextId?: string, data?: {
    portfolioId?: string;
    portfolioType?: 'traditional' | 'investment' | 'leasing';
    companyId?: string;
    currentScreenPath?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (contextId) queryParams.append('contextId', contextId);
    if (data?.portfolioId) queryParams.append('portfolioId', data.portfolioId);
    if (data?.portfolioType) queryParams.append('portfolioType', data.portfolioType);
    if (data?.companyId) queryParams.append('companyId', data.companyId);
    if (data?.currentScreenPath) queryParams.append('currentScreenPath', data.currentScreenPath);

    return apiClient.get<{
      suggestions: Array<{
        id: string;
        text: string;
        category: string;
        relevance: number;
      }>;
    }>(`/chat/suggestions?${queryParams.toString()}`);
  },

  /**
   * Génère un rapport basé sur les conversations de chat
   */
  generateChatReport: (params: {
    contextId: string;
    title?: string;
    format?: 'pdf' | 'docx' | 'html';
    includeMetadata?: boolean;
  }) => {
    return apiClient.post<{
      id: string;
      title: string;
      format: 'pdf' | 'docx' | 'html';
      url: string;
      generated_at: string;
      size: number;
    }>('/chat/reports', params);
  },

  /**
   * Récupère les réponses prédéfinies pour le chat
   */
  getPredefinedResponses: (category?: string) => {
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);

    return apiClient.get<{
      responses: Array<{
        id: string;
        title: string;
        content: string;
        category: string;
        tags: string[];
      }>;
      categories: string[];
    }>(`/chat/predefined-responses?${queryParams.toString()}`);
  },

  /**
   * Enregistre une évaluation pour une réponse de chat
   */
  rateMessage: (messageId: string, rating: {
    score: 1 | 2 | 3 | 4 | 5;
    feedback?: string;
  }) => {
    return apiClient.post<{
      id: string;
      messageId: string;
      score: number;
      feedback?: string;
      timestamp: string;
    }>(`/chat/messages/${messageId}/rating`, rating);
  },

  /**
   * Ajoute une pièce jointe à un message
   */
  addAttachment: (messageId: string, file: FormData) => {
    return apiClient.upload<{
      id: string;
      messageId: string;
      type: string;
      url: string;
      name: string;
      size: number;
      uploaded_at: string;
    }>(`/chat/messages/${messageId}/attachments`, file);
  }
};
