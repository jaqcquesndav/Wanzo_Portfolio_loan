import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, Conversation, AIModel } from '../types/chat';
import { AI_MODELS } from '../types/chat';
import { generateResponse } from '../data/mockChatResponses';
import { chatApi } from '../services/api/chat.api';

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
  addMessage: (content: string, type: 'user' | 'bot', attachment?: Message['attachment'], mode?: 'chat' | 'analyse') => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  toggleLike: (messageId: string) => void;
  toggleDislike: (messageId: string) => void;
  
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
      isApiMode: false, // Par défaut, on utilise les mocks pour les tests
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
          
          // Récupérer le dernier message et le contexte
          const lastMessage = conversation.messages[conversation.messages.length - 1];
          
          // Détecter le mode à partir du contexte
          const isAnalyseMode = conversation.context.some(ctx => ctx.includes('[MODE ANALYSE]'));
          
          // Générer une réponse adaptée au mode
          const currentMode = isAnalyseMode ? 'analyse' : 'chat';
          const response = generateResponse(lastMessage.content, currentMode);
          
          // Ajouter la réponse dans le même mode
          store.addMessage(response, 'bot', undefined, currentMode);
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
