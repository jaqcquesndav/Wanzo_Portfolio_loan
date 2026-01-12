import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, Conversation, AIModel, StreamingState, PortfolioStreamChunkEvent, ChatMetadata } from '../types/chat';
import { AI_MODELS } from '../types/chat';
import { chatApi } from '../services/api/chat.api';
import { getChatStreamService, ChatStreamService } from '../services/streaming';
import { getInstitutionId } from '../stores/appContextStore';

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
  // Note: institutionId n'est plus stocké ici - utiliser getInstitutionId() du store global
  
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
  // Note: setCurrentInstitutionId supprimé - institutionId vient du store global via getInstitutionId()
  
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
      isApiMode: true, // Mode API activé par défaut pour communication backend
      selectedModel: AI_MODELS[0],
      currentPortfolioType: 'traditional',
      currentPortfolioId: null,
      // institutionId n'est plus stocké - utiliser getInstitutionId() au moment de l'utilisation
      
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
      // Conversations initialisées vide - seront chargées depuis l'API ou créées localement au besoin
      conversations: [],
      activeConversationId: null,

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
        console.log('[ChatStore] connectWebSocket - Tentative de connexion pour institution:', institutionId);
        
        if (!institutionId) {
          console.warn('[ChatStore] connectWebSocket - institutionId manquant, connexion annulée');
          return;
        }
        
        try {
          streamService = getChatStreamService();
          console.log('[ChatStore] connectWebSocket - Service de streaming obtenu');
          
          // S'abonner aux changements de connexion
          streamService.onConnectionChange((connected) => {
            console.log('[ChatStore] WebSocket connexion changée:', connected);
            set({ isWebSocketConnected: connected });
          });
          
          await streamService.connect(institutionId);
          set({ isWebSocketConnected: true });
          console.log('[ChatStore] ✅ WebSocket connecté pour institution:', institutionId);
        } catch (error) {
          console.error('[ChatStore] ❌ Erreur de connexion WebSocket:', error);
          set({ isWebSocketConnected: false });
          // Le mode synchrone sera utilisé comme fallback
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
      // setCurrentInstitutionId supprimé - institutionId vient du store global

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
            // Version mock - sans message d'accueil prédéfini
            newConversation = {
              id: Date.now().toString(),
              title: 'Nouvelle conversation',
              timestamp: new Date().toISOString(),
              messages: [],
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
        console.log('[ChatStore] deleteConversation - ID:', id, 'isApiMode:', store.isApiMode);
        
        // Vérifier si l'ID est local (ne pas appeler l'API pour les IDs locaux)
        const isLocalId = id.startsWith('local-') || /^\d+$/.test(id);
        
        try {
          if (store.isApiMode && !isLocalId) {
            // Supprimer via l'API uniquement si l'ID est un UUID du backend
            console.log('[ChatStore] Tentative de suppression via API (ID backend)...');
            const result = await chatApi.deleteConversation(id);
            console.log('[ChatStore] Résultat suppression API:', result);
            
            if (!result.success) {
              console.warn('[ChatStore] Échec de la suppression via l\'API, suppression locale uniquement');
            }
          } else if (isLocalId) {
            console.log('[ChatStore] ID local détecté, suppression locale uniquement (pas d\'appel API)');
          }
          
          // Mise à jour du state local (toujours exécuté)
          set(state => {
            const newConversations = state.conversations.filter(c => c.id !== id);
            const newActiveId = state.activeConversationId === id 
              ? newConversations[0]?.id || null 
              : state.activeConversationId;
            
            console.log('[ChatStore] Suppression locale - Nouvelles conversations:', newConversations.length);
            
            return {
              conversations: newConversations,
              activeConversationId: newActiveId
            };
          });
        } catch (error) {
          console.error(`[ChatStore] Erreur lors de la suppression de la conversation ${id}:`, error);
          
          // Supprimer localement même en cas d'erreur
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
        }
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },
      
      fetchConversations: async () => {
        const store = get();
        
        // L'institutionId est obtenu du store global via getInstitutionId() au moment de l'utilisation
        
        set({ isTyping: true });
        
        try {
          if (store.isApiMode) {
            // Mode API: charger depuis le backend
            const conversations = await chatApi.getConversations();
            
            if (conversations.length > 0) {
              set({ 
                conversations, 
                activeConversationId: conversations[0].id 
              });
            } else {
              // Aucune conversation, créer une nouvelle via l'API
              const newConversation = await chatApi.createConversation('Nouvelle conversation');
              set({ 
                conversations: [newConversation], 
                activeConversationId: newConversation.id 
              });
            }
          } else {
            // Mode mock: créer une conversation locale si aucune n'existe
            if (store.conversations.length === 0) {
              const mockConversation: Conversation = {
                id: '1',
                title: 'Nouvelle conversation',
                timestamp: new Date().toISOString(),
                messages: [],
                isActive: true,
                model: AI_MODELS[0],
                context: []
              };
              set({ 
                conversations: [mockConversation], 
                activeConversationId: '1' 
              });
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement des conversations:', error);
          // En cas d'erreur, créer une conversation locale vide
          if (store.conversations.length === 0) {
            const fallbackConversation: Conversation = {
              id: `local-${Date.now()}`,
              title: 'Nouvelle conversation',
              timestamp: new Date().toISOString(),
              messages: [],
              isActive: true,
              model: AI_MODELS[0],
              context: []
            };
            set({ 
              conversations: [fallbackConversation], 
              activeConversationId: fallbackConversation.id 
            });
          }
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

        // DEBUG: Log l'état actuel
        console.log('[ChatStore] addMessage - État:', {
          isApiMode: store.isApiMode,
          isStreamingEnabled: store.isStreamingEnabled,
          isWebSocketConnected: store.isWebSocketConnected,
          type,
          hasStreamService: !!streamService,
          activeConversationId: store.activeConversationId,
          globalInstitutionId: getInstitutionId() // Toujours lire depuis le store global
        });

        if (!activeConversation) {
          console.warn('[ChatStore] addMessage - Pas de conversation active');
          return;
        }

        // Construire le contexte avec le mode sélectionné
        const modeInfo = mode === 'analyse' ? '[MODE ANALYSE]' : '[MODE CHAT]';
        const context = activeConversation.messages
          .slice(-5) // Prendre les 5 derniers messages
          .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .concat(`${modeInfo} User: ${content}`);

        let newMessage: Message;
        
        // Mode API avec streaming activé
        if (store.isApiMode && store.isStreamingEnabled && store.isWebSocketConnected && type === 'user' && streamService) {
          console.log('[ChatStore] addMessage - Mode: API Streaming');
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
            // Récupérer l'institutionId depuis le contexte global (mis à jour après /me)
            const effectiveInstitutionId = getInstitutionId();
            
            // Construire les métadonnées pour l'API
            const metadata: ChatMetadata = {
              portfolioId: store.currentPortfolioId || undefined,
              portfolioType: store.currentPortfolioType,
              institutionId: effectiveInstitutionId || undefined
            };

            console.log('[ChatStore] sendStreamingMessage - metadata:', metadata);

            // Envoyer le message via l'API REST /chat/stream
            const streamResponse = await chatApi.sendStreamingMessage({
              content,
              contextId: activeConversation.id,
              metadata,
              mode: mode === 'analyse' ? 'analyse' : 'chat'
            });
            
            const messageId = streamResponse.data.messageId;
            
            // Préparer le streaming via Socket.IO
            streamService.prepareStreaming(messageId, streamResponse.data.conversationId);
            
            // Remplacer le message en attente par le message réel
            set(state => ({
              conversations: state.conversations.map(conv => 
                conv.id === state.activeConversationId
                  ? {
                      ...conv,
                      messages: conv.messages.map(msg => 
                        msg.id === pendingMessage.id 
                          ? { ...msg, id: streamResponse.data.userMessageId, pending: false } 
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
            
            streamService.onComplete(messageId, (finalContent: string, suggestedActions?: Array<string | { type: string; payload: unknown }>) => {
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
          console.log('[ChatStore] addMessage - Mode: API Normal (sans streaming)');
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
            const apiResponse = await chatApi.sendMessage({
              content,
              contextId: activeConversation.id,
              attachment,
              mode
            });
            
            console.log('[ChatStore] Réponse API sendMessage:', apiResponse);
            
            // Remplacer le message en attente par le message utilisateur réel
            const userMessage: Message = {
              id: apiResponse.id,
              sender: 'user',
              content: apiResponse.content,
              timestamp: apiResponse.timestamp,
              likes: 0,
              dislikes: 0,
              attachment,
              pending: false
            };
            
            set(state => ({
              conversations: state.conversations.map(conv => 
                conv.id === state.activeConversationId
                  ? {
                      ...conv,
                      messages: conv.messages.map(msg => 
                        msg.id === pendingMessage.id ? userMessage : msg
                      )
                    }
                  : conv
              )
            }));
            
            // Si l'API a retourné une réponse du bot, l'ajouter aussi
            if (apiResponse.response) {
              const botMessage: Message = {
                id: apiResponse.response.id,
                sender: 'bot',
                content: apiResponse.response.content,
                timestamp: apiResponse.response.timestamp,
                likes: 0,
                dislikes: 0,
                pending: false
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
                isTyping: false
              }));
            }
            
            // En mode API, la réponse bot vient du backend, ne pas appeler simulateBotResponse
            return;
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
          console.log('[ChatStore] addMessage - Mode: MOCK/Local (isApiMode:', store.isApiMode, ', type:', type, ')');
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
          
          // Message informatif si le mode API n'est pas activé
          const response = "⚠️ **Mode hors-ligne actif**\n\nPour utiliser ADHA avec toutes ses fonctionnalités, assurez-vous que:\n\n1. Vous êtes connecté à Internet\n2. Le serveur backend est accessible\n3. Votre session est authentifiée\n\n*Essayez de rafraîchir la page si le problème persiste.*";
          
          // Ajouter la réponse
          store.addMessage(response, 'bot');
        } finally {
          set({ isTyping: false });
        }
      }
    }),
    {
      name: 'chat-storage',
      version: 3, // Incrémenté pour supprimer currentInstitutionId
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        
        // Migration v2 -> v3: Supprimer currentInstitutionId (géré par store global)
        if (version < 3) {
          console.log('[ChatStore] Migration v2->v3: Suppression de currentInstitutionId (utilise store global)');
          // Supprimer currentInstitutionId de l'état persisté
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { currentInstitutionId: _removed, ...rest } = state;
          return {
            ...rest,
            isApiMode: true
          };
        }
        
        return state;
      },
      // Toujours forcer isApiMode à true lors de la réhydratation
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ChatStore> | undefined;
        const merged: ChatStore = {
          ...currentState,
          ...persisted,
          // Forcer isApiMode
          isApiMode: true
          // Note: institutionId n'est plus stocké - utiliser getInstitutionId() au moment de l'utilisation
        };
        console.log('[ChatStore] État réhydraté:', { isApiMode: merged.isApiMode, globalInstitutionId: getInstitutionId() });
        return merged;
      }
    }
  )
);
