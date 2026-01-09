import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, Conversation, AIModel, StreamingState, PortfolioStreamChunkEvent } from '../types/chat';
import { AI_MODELS } from '../types/chat';
import { chatApi } from '../services/api/chat.api';
import { getChatStreamService, ChatStreamService } from '../services/streaming';

// Définition du type Task
export interface Task {
  id: string;
  name: string;
  description: string;
  icon?: JSX.Element;
  context: string[];
}

// Mise à jour des types pour inclure le portefeuille et la tâche
interface ChatStore {
  // État UI
  isFloating: boolean;
  isOpen: boolean;
  isTyping: boolean;
  isRecording: boolean;
  isApiMode: boolean; // Indique si on utilise l'API ou les mocks
  
  // État du streaming
  streamingState: StreamingState;
  isStreamingEnabled: boolean;
  isWebSocketConnected: boolean;
  
  // Conversations et messages
  conversations: Conversation[];
  activeConversationId: string | null;
  selectedModel: AIModel;
  
  // Contexte de travail
  currentPortfolioType: 'traditional' | 'leasing' | 'investment';
  selectedTask: Task | null;
  currentPortfolioId: string | null;
  currentInstitutionId: string | null;
  
  // Actions UI
  setFloating: (floating: boolean) => void;
  setOpen: (open: boolean) => void;
  setTyping: (typing: boolean) => void;
  setRecording: (recording: boolean) => void;
  setSelectedModel: (model: AIModel) => void;
  setApiMode: (enabled: boolean) => void;
  
  // Actions streaming
  setStreamingEnabled: (enabled: boolean) => void;
  connectWebSocket: (institutionId: string) => Promise<void>;
  disconnectWebSocket: () => void;
  updateStreamingContent: (messageId: string, content: string, isComplete?: boolean) => void;
  
  // Actions contexte
  setPortfolioType: (type: 'traditional' | 'leasing' | 'investment') => void;
  setSelectedTask: (task: Task) => void;
  setCurrentPortfolioId: (id: string | null) => void;
  setCurrentInstitutionId: (id: string | null) => void;
  
  // Actions conversations
  createNewConversation: () => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;
  fetchConversations: () => Promise<void>;
  
  
  // Actions messages
  addMessage: (content: string, type: 'user' | 'bot', attachment?: Message['attachment'], mode?: 'chat' | 'analyse') => void;
  addStreamingMessage: (messageId: string) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  toggleLike: (messageId: string) => void;
  toggleDislike: (messageId: string) => void;
  
  // Simulation réponse bot
  simulateBotResponse: () => Promise<void>;
}

// Référence au service de streaming
let streamService: ChatStreamService | null = null;

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // État initial
      isFloating: true,
      isOpen: false,
      isTyping: false,
      isRecording: false,
      isApiMode: false, // Par défaut, on utilise les mocks pour les tests
      selectedModel: AI_MODELS[0],
      currentPortfolioType: 'traditional',
      currentPortfolioId: null,
      currentInstitutionId: null,
      
      // État streaming
      streamingState: {
        messageId: null,
        accumulatedContent: '',
        lastChunkId: -1,
        isActive: false
      },
      isStreamingEnabled: true, // Streaming activé par défaut
      isWebSocketConnected: false,
      
      selectedTask: {
        id: 'general',
        name: 'Assistant général',
        description: 'Aide générale sur tous les sujets',
        context: ['general']
      },
      conversations: [{
        id: '1',
        title: 'Nouvelle conversation',
        timestamp: new Date().toISOString(),
        messages: [{
          id: '1',
          sender: 'bot',
          content: "Bonjour ! Je suis Adha, votre assistant. Comment puis-je vous aider aujourd'hui ?",
          timestamp: new Date().toISOString(),
          likes: 0,
          dislikes: 0
        }],
        isActive: true,
        model: AI_MODELS[0],
        context: []
      }],
      activeConversationId: '1',

      // Actions UI
      setFloating: (floating) => set({ isFloating: floating }),
      setOpen: (open) => set({ isOpen: open }),
      setTyping: (typing) => set({ isTyping: typing }),
      setRecording: (recording) => set({ isRecording: recording }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setApiMode: (enabled) => set({ isApiMode: enabled }),
      
      // Actions streaming
      setStreamingEnabled: (enabled) => set({ isStreamingEnabled: enabled }),
      
      connectWebSocket: async (institutionId: string) => {
        try {
          streamService = getChatStreamService();
          
          // S'abonner aux changements de connexion
          streamService.onConnectionChange((connected) => {
            set({ isWebSocketConnected: connected });
          });
          
          await streamService.connect(institutionId);
          set({ currentInstitutionId: institutionId, isWebSocketConnected: true });
          console.log('[ChatStore] WebSocket connecté pour institution:', institutionId);
        } catch (error) {
          console.error('[ChatStore] Erreur de connexion WebSocket:', error);
          set({ isWebSocketConnected: false });
        }
      },
      
      disconnectWebSocket: () => {
        if (streamService) {
          streamService.disconnect();
          streamService = null;
        }
        set({ isWebSocketConnected: false });
      },
      
      updateStreamingContent: (messageId: string, content: string, isComplete = false) => {
        set(state => ({
          conversations: state.conversations.map(conv => 
            conv.id === state.activeConversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === messageId 
                      ? { 
                          ...msg, 
                          content, 
                          isStreaming: !isComplete,
                          pending: false
                        } 
                      : msg
                  )
                }
              : conv
          ),
          streamingState: isComplete 
            ? { messageId: null, accumulatedContent: '', lastChunkId: -1, isActive: false }
            : { ...state.streamingState, accumulatedContent: content }
        }));
      },
      
      // Actions contexte
      setPortfolioType: (type) => set({ currentPortfolioType: type }),
      setSelectedTask: (task) => set({ selectedTask: task }),
      setCurrentPortfolioId: (id) => set({ currentPortfolioId: id }),
      setCurrentInstitutionId: (id) => set({ currentInstitutionId: id }),

      // Actions conversations
      createNewConversation: async () => {
        const store = get();
        set({ isTyping: true });
        
        try {
          let newConversation: Conversation;
          
          if (store.isApiMode) {
            // Créer une conversation via l'API
            newConversation = await chatApi.createConversation('Nouvelle conversation');
          } else {
            // Version mock
            newConversation = {
              id: Date.now().toString(),
              title: 'Nouvelle conversation',
              timestamp: new Date().toISOString(),
              messages: [{
                id: '1',
                sender: 'bot',
                content: "Bonjour ! Je suis Adha, votre assistant. Comment puis-je vous aider aujourd'hui ?",
                timestamp: new Date().toISOString(),
                likes: 0,
                dislikes: 0
              }],
              isActive: true,
              model: store.selectedModel,
              context: []
            };
          }

          set(state => ({
            conversations: [...state.conversations, newConversation],
            activeConversationId: newConversation.id
          }));
        } catch (error) {
          console.error('Erreur lors de la création d\'une nouvelle conversation:', error);
        } finally {
          set({ isTyping: false });
        }
      },

      deleteConversation: async (id) => {
        const store = get();
        
        try {
          if (store.isApiMode) {
            // Supprimer via l'API
            const result = await chatApi.deleteConversation(id);
            if (!result.success) {
              console.error('Échec de la suppression de la conversation via l\'API');
              return;
            }
          }
          
          // Mise à jour du state local
          set(state => {
            const newConversations = state.conversations.filter(c => c.id !== id);
            const newActiveId = state.activeConversationId === id 
              ? newConversations[0]?.id || null 
              : state.activeConversationId;
            
            return {
              conversations: newConversations,
              activeConversationId: newActiveId
            };
          });
        } catch (error) {
          console.error(`Erreur lors de la suppression de la conversation ${id}:`, error);
        }
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },
      
      fetchConversations: async () => {
        const store = get();
        
        if (!store.isApiMode) {
          // En mode mock, on ne fait rien
          return;
        }
        
        set({ isTyping: true });
        
        try {
          const conversations = await chatApi.getConversations();
          
          if (conversations.length > 0) {
            set({ 
              conversations, 
              activeConversationId: conversations[0].id 
            });
          }
        } catch (error) {
          console.error('Erreur lors du chargement des conversations:', error);
        } finally {
          set({ isTyping: false });
        }
      },

      // Actions messages
      addMessage: async (content, type, attachment, mode = 'chat') => {
        // Validation : garantir que le contenu est une string
        if (typeof content !== 'string') {
          content = String(content);
        }
        // Correction : si le contenu est un React element (object), le convertir en string
        if (typeof content === 'object' && content !== null) {
          if (Object.prototype.hasOwnProperty.call(content, 'props') && Object.prototype.hasOwnProperty.call(content, 'type')) {
            content = '[Objet React]';
          } else {
            content = JSON.stringify(content);
          }
        }
        
        const store = get();
        const activeConversation = store.conversations.find(
          c => c.id === store.activeConversationId
        );

        if (!activeConversation) return;

        // Construire le contexte avec le mode sélectionné
        const modeInfo = mode === 'analyse' ? '[MODE ANALYSE]' : '[MODE CHAT]';
        const context = activeConversation.messages
          .slice(-5) // Prendre les 5 derniers messages
          .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .concat(`${modeInfo} User: ${content}`);

        let newMessage: Message;
        
        // Mode API avec streaming activé
        if (store.isApiMode && store.isStreamingEnabled && store.isWebSocketConnected && type === 'user' && streamService) {
          // Ajouter un message "pending" en attendant la réponse de l'API
          const pendingMessage: Message = {
            id: `pending-${Date.now()}`,
            sender: type,
            content,
            timestamp: new Date().toISOString(),
            likes: 0,
            dislikes: 0,
            attachment,
            pending: true
          };
          
          // Mise à jour du state avec le message en attente
          set(state => ({
            conversations: state.conversations.map(conv => 
              conv.id === state.activeConversationId
                ? {
                    ...conv,
                    messages: [...conv.messages, pendingMessage],
                    context
                  }
                : conv
            )
          }));
          
          try {
            // Envoyer le message via WebSocket avec streaming
            const messageId = streamService.sendMessage(
              activeConversation.id,
              content,
              {
                portfolioId: store.currentPortfolioId || undefined,
                portfolioType: store.currentPortfolioType,
                institutionId: store.currentInstitutionId || undefined
              }
            );
            
            // Remplacer le message en attente par le message réel
            set(state => ({
              conversations: state.conversations.map(conv => 
                conv.id === state.activeConversationId
                  ? {
                      ...conv,
                      messages: conv.messages.map(msg => 
                        msg.id === pendingMessage.id 
                          ? { ...msg, id: messageId, pending: false } 
                          : msg
                      )
                    }
                  : conv
              )
            }));
            
            // Ajouter un message bot en attente de streaming
            get().addStreamingMessage(messageId);
            
            // S'abonner aux événements de streaming
            let accumulatedContent = '';
            
            streamService.onChunk(messageId, (chunk: PortfolioStreamChunkEvent) => {
              if (chunk.type === 'chunk') {
                accumulatedContent += chunk.content;
                get().updateStreamingContent(`bot-${messageId}`, accumulatedContent, false);
              }
              // Garder l'indicateur de typing actif pendant le streaming
              set({ isTyping: true });
            });
            
            streamService.onComplete(messageId, (finalContent: string, suggestedActions?: string[]) => {
              get().updateStreamingContent(`bot-${messageId}`, finalContent, true);
              
              // Mettre à jour avec les actions suggérées si présentes
              if (suggestedActions && suggestedActions.length > 0) {
                set(state => ({
                  conversations: state.conversations.map(conv => 
                    conv.id === state.activeConversationId
                      ? {
                          ...conv,
                          messages: conv.messages.map(msg =>
                            msg.id === `bot-${messageId}` 
                              ? { ...msg, suggestedActions } 
                              : msg
                          )
                        }
                      : conv
                  )
                }));
              }
              
              set({ isTyping: false });
            });
            
            streamService.onError(messageId, (error: Error) => {
              console.error('[ChatStore] Erreur de streaming:', error);
              
              // Marquer le message comme erreur
              set(state => ({
                conversations: state.conversations.map(conv => 
                  conv.id === state.activeConversationId
                    ? {
                        ...conv,
                        messages: conv.messages.map(msg =>
                          msg.id === `bot-${messageId}` 
                            ? { 
                                ...msg, 
                                content: 'Erreur lors de la réception de la réponse. Veuillez réessayer.',
                                error: true,
                                isStreaming: false
                              } 
                            : msg
                        )
                      }
                    : conv
                ),
                isTyping: false
              }));
            });
            
            set({ isTyping: true });
            
          } catch (error) {
            console.error('Erreur lors de l\'envoi du message avec streaming:', error);
            
            // Marquer le message comme ayant échoué
            set(state => ({
              conversations: state.conversations.map(conv => 
                conv.id === state.activeConversationId
                  ? {
                      ...conv,
                      messages: conv.messages.map(msg => 
                        msg.id === pendingMessage.id ? { ...msg, pending: false, error: true } : msg
                      )
                    }
                  : conv
              )
            }));
            
            return;
          }
        } else if (store.isApiMode && type === 'user') {
          // Ajouter un message "pending" en attendant la réponse de l'API
          const pendingMessage: Message = {
            id: `pending-${Date.now()}`,
            sender: type,
            content,
            timestamp: new Date().toISOString(),
            likes: 0,
            dislikes: 0,
            attachment,
            pending: true
          };
          
          // Mise à jour du state avec le message en attente
          set(state => ({
            conversations: state.conversations.map(conv => 
              conv.id === state.activeConversationId
                ? {
                    ...conv,
                    messages: [...conv.messages, pendingMessage],
                    context
                  }
                : conv
            )
          }));
          
          try {
            // Envoyer le message via l'API
            const sentMessage = await chatApi.sendMessage(
              activeConversation.id,
              content,
              attachment,
              mode
            );
            
            // Remplacer le message en attente par le message réel
            newMessage = {
              ...sentMessage,
              pending: false
            };
            
            set(state => ({
              conversations: state.conversations.map(conv => 
                conv.id === state.activeConversationId
                  ? {
                      ...conv,
                      messages: conv.messages.map(msg => 
                        msg.id === pendingMessage.id ? newMessage : msg
                      )
                    }
                  : conv
              )
            }));
          } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            
            // Marquer le message comme ayant échoué
            set(state => ({
              conversations: state.conversations.map(conv => 
                conv.id === state.activeConversationId
                  ? {
                      ...conv,
                      messages: conv.messages.map(msg => 
                        msg.id === pendingMessage.id ? { ...msg, pending: false, error: true } : msg
                      )
                    }
                  : conv
              )
            }));
            
            return;
          }
        } else {
          // Version mock ou message bot local
          newMessage = {
            id: Date.now().toString(),
            sender: type,
            content,
            timestamp: new Date().toISOString(),
            likes: 0,
            dislikes: 0,
            attachment
          };
          
          set(state => ({
            conversations: state.conversations.map(conv => 
              conv.id === state.activeConversationId
                ? {
                    ...conv,
                    messages: [...conv.messages, newMessage],
                    context
                  }
                : conv
            )
          }));
        }

        if (type === 'user') {
          await get().simulateBotResponse();
        }
      },
      
      // Ajouter un message bot en mode streaming
      addStreamingMessage: (requestMessageId: string) => {
        const botMessage: Message = {
          id: `bot-${requestMessageId}`,
          sender: 'bot',
          content: '',
          timestamp: new Date().toISOString(),
          likes: 0,
          dislikes: 0,
          isStreaming: true,
          pending: true
        };
        
        set(state => ({
          conversations: state.conversations.map(conv => 
            conv.id === state.activeConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, botMessage]
                }
              : conv
          ),
          streamingState: {
            messageId: `bot-${requestMessageId}`,
            accumulatedContent: '',
            lastChunkId: -1,
            isActive: true
          }
        }));
      },

      updateMessage: async (messageId, updates) => {
        const store = get();
        
        if (store.isApiMode) {
          try {
            // Mettre à jour via l'API
            await chatApi.updateMessage(messageId, updates);
          } catch (error) {
            console.error(`Erreur lors de la mise à jour du message ${messageId}:`, error);
            // Continuer avec la mise à jour locale même en cas d'erreur API
          }
        }
        
        // Toujours mettre à jour localement
        set(state => ({
          conversations: state.conversations.map(conv => 
            conv.id === state.activeConversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                  )
                }
              : conv
          )
        }));
      },

      toggleLike: async (messageId) => {
        const store = get();
        const activeConversation = store.conversations.find(
          c => c.id === store.activeConversationId
        );
        
        if (!activeConversation) return;
        
        const message = activeConversation.messages.find(m => m.id === messageId);
        if (!message) return;
        
        const newLikes = (message.likes || 0) + 1;
        
        if (store.isApiMode) {
          try {
            await chatApi.updateMessage(messageId, { likes: newLikes });
          } catch (error) {
            console.error(`Erreur lors de la mise à jour des likes pour le message ${messageId}:`, error);
          }
        }
        
        // Toujours mettre à jour localement
        set(state => ({
          conversations: state.conversations.map(conv => 
            conv.id === store.activeConversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === messageId ? { ...msg, likes: newLikes } : msg
                  )
                }
              : conv
          )
        }));
      },

      toggleDislike: async (messageId) => {
        const store = get();
        const activeConversation = store.conversations.find(
          c => c.id === store.activeConversationId
        );
        
        if (!activeConversation) return;
        
        const message = activeConversation.messages.find(m => m.id === messageId);
        if (!message) return;
        
        const newDislikes = (message.dislikes || 0) + 1;
        
        if (store.isApiMode) {
          try {
            await chatApi.updateMessage(messageId, { dislikes: newDislikes });
          } catch (error) {
            console.error(`Erreur lors de la mise à jour des dislikes pour le message ${messageId}:`, error);
          }
        }
        
        // Toujours mettre à jour localement
        set(state => ({
          conversations: state.conversations.map(conv => 
            conv.id === state.activeConversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === messageId ? { ...msg, dislikes: newDislikes } : msg
                  )
                }
              : conv
          )
        }));
      },

      // Simulation réponse bot
      simulateBotResponse: async () => {
        const store = get();
        const conversation = store.conversations.find(
          c => c.id === store.activeConversationId
        );

        if (!conversation) return;

        set({ isTyping: true });
        try {
          // Si en mode API, ne pas simuler de réponse - elle viendra du serveur
          if (store.isApiMode) {
            // Attendre un peu pour simuler le délai de l'API
            await new Promise(resolve => setTimeout(resolve, 500));
            set({ isTyping: false });
            return;
          }
          
          // Mode mock - générer une réponse localement
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Réponse par défaut (mode mock désactivé - API par défaut)
          const response = "Le mode API est requis pour utiliser le chat. Veuillez vérifier votre connexion.";
          
          // Ajouter la réponse
          store.addMessage(response, 'bot');
        } finally {
          set({ isTyping: false });
        }
      }
    }),
    {
      name: 'chat-storage'
    }
  )
);
