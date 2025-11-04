// src/hooks/useChatApi.ts
// Hook pour accéder au chat via l'API backend

import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '../services/api/shared/chat.api';
import type { Message } from '../types/chat';
import { useNotification } from '../contexts/useNotification';

/**
 * Interface pour les messages de chat conformes à l'API
 */
interface ChatMessage {
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
}

/**
 * Hook principal pour la gestion du chat via l'API
 */
export function useChatApi(contextId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentContextId, setCurrentContextId] = useState<string | null>(contextId || null);
  const { showNotification } = useNotification();

  // Charger l'historique des messages
  const loadMessageHistory = useCallback(async (ctxId?: string, params?: {
    limit?: number;
    before?: string;
    after?: string;
  }) => {
    const targetContextId = ctxId || currentContextId;
    if (!targetContextId) return;

    try {
      setLoading(true);
      setError(null);
      const history = await chatApi.getMessageHistory(targetContextId, params);
      setMessages(history.messages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'historique';
      setError(errorMessage);
      console.error('Erreur historique chat:', err);
    } finally {
      setLoading(false);
    }
  }, [currentContextId]);

  // Envoyer un message
  const sendMessage = useCallback(async (content: string, metadata?: {
    portfolioId?: string;
    portfolioType?: 'traditional';
    companyId?: string;
    entityType?: string;
    entityId?: string;
  }) => {
    if (!content.trim()) return;

    try {
      setIsTyping(true);
      setError(null);

      const messageData = {
        content,
        contextId: currentContextId || undefined,
        metadata
      };

      const response = await chatApi.sendMessage(messageData);
      
      // Ajouter le message utilisateur
      const userMessage: ChatMessage = {
        id: response.id,
        content,
        timestamp: response.timestamp,
        sender: 'user',
        contextId: response.contextId,
        metadata: response.metadata
      };

      setMessages(prev => [...prev, userMessage]);

      // Ajouter la réponse de l'assistant si présente
      if (response.response) {
        const assistantMessage: ChatMessage = {
          id: response.response.id,
          content: response.response.content,
          timestamp: response.response.timestamp,
          sender: 'assistant',
          contextId: response.contextId,
          attachments: response.response.attachments
        };

        setMessages(prev => [...prev, assistantMessage]);
      }

      // Mettre à jour le contextId si c'était le premier message
      if (!currentContextId) {
        setCurrentContextId(response.contextId);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur envoi message:', err);
      throw err;
    } finally {
      setIsTyping(false);
    }
  }, [currentContextId, showNotification]);

  // Noter un message
  const rateMessage = useCallback(async (messageId: string, rating: 1 | 2 | 3 | 4 | 5, feedback?: string) => {
    try {
      await chatApi.rateMessage(messageId, { score: rating, feedback });
      showNotification('Évaluation enregistrée', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'évaluation';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur rating:', err);
      throw err;
    }
  }, [showNotification]);

  // Créer un nouveau contexte
  const createNewContext = useCallback(async (data?: {
    title?: string;
    metadata?: {
      portfolioId?: string;
      portfolioType?: 'traditional';
      companyId?: string;
      entityType?: string;
      entityId?: string;
    };
  }) => {
    try {
      const context = await chatApi.createContext(data);
      setCurrentContextId(context.id);
      setMessages([]); // Reset messages for new context
      return context;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du contexte';
      setError(errorMessage);
      console.error('Erreur contexte:', err);
      throw err;
    }
  }, []);

  // Supprimer un contexte
  const deleteContext = useCallback(async (ctxId?: string) => {
    const targetContextId = ctxId || currentContextId;
    if (!targetContextId) return;

    try {
      await chatApi.deleteContext(targetContextId);
      if (targetContextId === currentContextId) {
        setCurrentContextId(null);
        setMessages([]);
      }
      showNotification('Contexte supprimé', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur suppression contexte:', err);
      throw err;
    }
  }, [currentContextId, showNotification]);

  // Charger l'historique au montage du composant
  useEffect(() => {
    if (currentContextId) {
      loadMessageHistory();
    }
  }, [loadMessageHistory, currentContextId]);

  return {
    messages,
    loading,
    error,
    isTyping,
    contextId: currentContextId,
    sendMessage,
    rateMessage,
    createNewContext,
    deleteContext,
    loadMoreMessages: loadMessageHistory,
    clearMessages: () => setMessages([]),
    refetch: () => loadMessageHistory()
  };
}

/**
 * Hook pour les suggestions de chat
 */
export function useChatSuggestions(contextId?: string, filters?: {
  portfolioId?: string;
  portfolioType?: 'traditional';
  companyId?: string;
  currentScreenPath?: string;
}) {
  const [suggestions, setSuggestions] = useState<Array<{
    id: string;
    text: string;
    category: string;
    relevance: number;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatApi.getChatSuggestions(contextId, filters);
      setSuggestions(data.suggestions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des suggestions';
      setError(errorMessage);
      console.error('Erreur suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, [contextId, filters]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  return {
    suggestions,
    loading,
    error,
    refetch: loadSuggestions
  };
}

/**
 * Hook pour les réponses prédéfinies
 */
export function usePredefinedResponses(category?: string) {
  const [responses, setResponses] = useState<Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
  }>>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResponses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatApi.getPredefinedResponses(category);
      setResponses(data.responses);
      setCategories(data.categories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des réponses';
      setError(errorMessage);
      console.error('Erreur réponses prédéfinies:', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadResponses();
  }, [loadResponses]);

  return {
    responses,
    categories,
    loading,
    error,
    refetch: loadResponses
  };
}

/**
 * Hook pour générer des rapports de chat
 */
export function useChatReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const generateReport = useCallback(async (params: {
    contextId: string;
    title?: string;
    format?: 'pdf' | 'docx' | 'html';
    includeMetadata?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const report = await chatApi.generateChatReport(params);
      showNotification('Rapport généré avec succès', 'success');
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération du rapport';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur génération rapport:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  return {
    generateReport,
    loading,
    error
  };
}

/**
 * Hook pour la gestion des contextes de chat
 */
export function useChatContexts() {
  const [contexts, setContexts] = useState<Array<{
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
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const loadContexts = useCallback(async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    portfolioId?: string;
    companyId?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatApi.getAllContexts(params);
      setContexts(data.contexts);
      setTotal(data.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des contextes';
      setError(errorMessage);
      console.error('Erreur contextes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContexts();
  }, [loadContexts]);

  return {
    contexts,
    total,
    loading,
    error,
    loadContexts,
    refetch: loadContexts
  };
}

/**
 * Hook compatible avec l'ancien useChat (localStorage)
 * Fournit une interface de migration progressive
 */
export function useChatApiCompat(initialContextId?: string) {
  const {
    messages,
    loading,
    error,
    isTyping,
    contextId,
    sendMessage,
    createNewContext
  } = useChatApi(initialContextId);

  // Conversion des messages pour compatibilité avec l'ancien format
  const compatMessages: Message[] = messages.map(msg => ({
    id: msg.id,
    sender: msg.sender === 'assistant' ? 'bot' : msg.sender,
    content: msg.content,
    timestamp: msg.timestamp,
    attachments: msg.attachments?.map(att => ({
      type: att.type as 'image' | 'file' | 'link',
      url: att.url,
      name: att.name
    }))
  }));

  // Interface compatible avec l'ancien hook
  const sendCompatMessage = useCallback(async (content: string) => {
    if (!contextId) {
      // Créer un nouveau contexte si nécessaire
      await createNewContext();
    }
    return await sendMessage(content);
  }, [contextId, createNewContext, sendMessage]);

  return {
    messages: compatMessages,
    isTyping,
    isRecording: false, // Feature not implemented in API yet
    loading,
    error,
    sendMessage: sendCompatMessage,
    clearHistory: () => {}, // TODO: Implement if needed
    setIsRecording: () => {}, // Feature not implemented
    toggleRecording: () => {} // Feature not implemented
  };
}
