import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, Conversation, AIModel } from '../types/chat';
import { AI_MODELS } from '../types/chat';
import { generateResponse } from '../data/mockChatResponses';

interface ChatStore {
  // État UI
  isFloating: boolean;
  isOpen: boolean;
  isTyping: boolean;
  isRecording: boolean;
  
  // Conversations et messages
  conversations: Conversation[];
  activeConversationId: string | null;
  selectedModel: AIModel;
  
  // Actions UI
  setFloating: (floating: boolean) => void;
  setOpen: (open: boolean) => void;
  setTyping: (typing: boolean) => void;
  setRecording: (recording: boolean) => void;
  setSelectedModel: (model: AIModel) => void;
  
  // Actions conversations
  createNewConversation: () => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;
  
  // Actions messages
  addMessage: (content: string, type: 'user' | 'bot', attachment?: Message['attachment']) => void;
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
      selectedModel: AI_MODELS[0],
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

      // Actions conversations
      createNewConversation: () => {
        const store = get();
        const newConversation: Conversation = {
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

        set(state => ({
          conversations: [...state.conversations, newConversation],
          activeConversationId: newConversation.id
        }));
      },

      deleteConversation: (id) => {
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
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      // Actions messages
      addMessage: async (content, type, attachment) => {
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

        // Construire le contexte
        const context = activeConversation.messages
          .slice(-5) // Prendre les 5 derniers messages
          .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .concat(`User: ${content}`);

        const newMessage: Message = {
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

        if (type === 'user') {
          await get().simulateBotResponse();
        }
      },

      updateMessage: (messageId, updates) => {
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

      toggleLike: (messageId) => {
        set(state => ({
          conversations: state.conversations.map(conv => 
            conv.id === state.activeConversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === messageId ? { ...msg, likes: (msg.likes || 0) + 1 } : msg
                  )
                }
              : conv
          )
        }));
      },

      toggleDislike: (messageId) => {
        set(state => ({
          conversations: state.conversations.map(conv => 
            conv.id === state.activeConversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === messageId ? { ...msg, dislikes: (msg.dislikes || 0) + 1 } : msg
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
          await new Promise(resolve => setTimeout(resolve, 2000));
          // Correction ici : passer le contenu du dernier message
          const lastMessage = conversation.messages[conversation.messages.length - 1];
          const response = generateResponse(lastMessage.content);
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