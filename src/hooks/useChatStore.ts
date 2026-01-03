import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, Conversation, AIModel, ChatMetadata, ChatMode } from '../types/chat';
import { AI_MODELS } from '../types/chat';
import { chatApi } from '../services/api/chat.api';

// Mode API activé par défaut en production
const IS_PRODUCTION = import.meta.env.PROD;
const DEFAULT_API_MODE = IS_PRODUCTION || import.meta.env.VITE_USE_API === 'true';

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
  
  // Conversations et messages
  conversations: Conversation[];
  activeConversationId: string | null;
  selectedModel: AIModel;
  
  // Contexte de travail
  currentPortfolioType: 'traditional' | 'leasing' | 'investment';
  selectedTask: Task | null;
  currentPortfolioId: string | null;
  
  // Actions UI
  setFloating: (floating: boolean) => void;
  setOpen: (open: boolean) => void;
  setTyping: (typing: boolean) => void;
  setRecording: (recording: boolean) => void;
  setSelectedModel: (model: AIModel) => void;
  setApiMode: (enabled: boolean) => void;
  
  // Actions contexte
  setPortfolioType: (type: 'traditional' | 'leasing' | 'investment') => void;
  setSelectedTask: (task: Task) => void;
  setCurrentPortfolioId: (id: string | null) => void;
  
  // Actions conversations
  createNewConversation: () => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;
  fetchConversations: () => Promise<void>;
  
  
  // Actions messages
  addMessage: (content: string, type: 'user' | 'bot', attachment?: Message['attachment'], mode?: ChatMode) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  toggleLike: (messageId: string) => void;
  toggleDislike: (messageId: string) => void;
  
  // Contexte métadonnées
  buildChatMetadata: () => ChatMetadata;
  
  // Simulation réponse bot
  simulateBotResponse: () => Promise<void>;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // État initial
      isFloating: true,
      isOpen: false,
      isTyping: false,
      isRecording: false,
      isApiMode: DEFAULT_API_MODE, // true en production, configurable en dev
      selectedModel: AI_MODELS[0],
      currentPortfolioType: 'traditional',
      currentPortfolioId: null,
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
      
      // Actions contexte
      setPortfolioType: (type) => set({ currentPortfolioType: type }),
      setSelectedTask: (task) => set({ selectedTask: task }),
      setCurrentPortfolioId: (id) => set({ currentPortfolioId: id }),

      // Actions conversations
      createNewConversation: async () => {
        const store = get();
        set({ isTyping: true });
        
        try {
          let newConversation: Conversation;
          
          if (store.isApiMode) {
            // Construire les métadonnées du contexte
            const metadata = store.buildChatMetadata();
            
            // Créer une conversation via l'API avec métadonnées
            newConversation = await chatApi.createConversation('Nouvelle conversation', metadata);
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
              context: [],
              metadata: store.buildChatMetadata()
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

      // Construit les métadonnées pour le contexte de chat
      buildChatMetadata: (): ChatMetadata => {
        const store = get();
        return {
          portfolioId: store.currentPortfolioId || undefined,
          portfolioType: store.currentPortfolioType,
          taskId: store.selectedTask?.id,
          modelId: store.selectedModel.id,
          screenPath: typeof window !== 'undefined' ? window.location.pathname : undefined
        };
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
        
        if (store.isApiMode && type === 'user') {
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
            // Construire les métadonnées du contexte
            const metadata = store.buildChatMetadata();
            
            // Envoyer le message via l'API avec le nouveau format
            const response = await chatApi.sendMessage({
              content,
              contextId: activeConversation.id,
              metadata,
              mode: mode || 'chat',
              attachment: attachment ? {
                id: `attach-${Date.now()}`,
                type: attachment.type === 'document' ? 'document' : 'image',
                name: attachment.name,
                url: attachment.url,
                size: 0,
                uploaded_at: new Date().toISOString()
              } : undefined
            });
            
            // Remplacer le message en attente par le message réel
            newMessage = {
              id: response.id,
              sender: 'user',
              content: response.content,
              timestamp: response.timestamp,
              likes: 0,
              dislikes: 0,
              attachment,
              contextId: response.contextId,
              metadata: response.metadata
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
            
            // Si l'API a renvoyé une réponse de l'assistant, l'ajouter
            if (response.response) {
              const botMessage: Message = {
                id: response.response.id,
                sender: 'bot',
                content: response.response.content,
                timestamp: response.response.timestamp,
                likes: 0,
                dislikes: 0,
                attachments: response.response.attachments
              };
              
              set(state => ({
                conversations: state.conversations.map(conv => 
                  conv.id === state.activeConversationId
                    ? {
                        ...conv,
                        messages: [...conv.messages, botMessage]
                      }
                    : conv
                )
              }));
              
              // Ne pas simuler de réponse bot si l'API en a déjà fourni une
              return;
            }
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

      // Simulation réponse bot (utilisé uniquement en dev sans API)
      simulateBotResponse: async () => {
        const store = get();
        const conversation = store.conversations.find(
          c => c.id === store.activeConversationId
        );

        if (!conversation) return;

        // En mode API, la réponse vient du serveur - pas de simulation nécessaire
        if (store.isApiMode) {
          return;
        }

        // Mode développement sans API - réponse par défaut
        set({ isTyping: true });
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const lastMessage = conversation.messages[conversation.messages.length - 1];
          const defaultResponse = `Je comprends votre question sur "${lastMessage.content.substring(0, 50)}...". En mode développement, connectez-vous à l'API pour obtenir une réponse complète.`;
          
          const botMessage: Message = {
            id: Date.now().toString(),
            sender: 'bot',
            content: defaultResponse,
            timestamp: new Date().toISOString(),
            likes: 0,
            dislikes: 0
          };
          
          set(state => ({
            conversations: state.conversations.map(conv => 
              conv.id === state.activeConversationId
                ? { ...conv, messages: [...conv.messages, botMessage] }
                : conv
            )
          }));
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
