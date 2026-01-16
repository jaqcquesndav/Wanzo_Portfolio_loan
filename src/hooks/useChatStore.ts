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
  cancelCurrentStream: () => void; // ✅ NOUVEAU: Annuler le stream en cours
  
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
        console.log('[ChatStore] 🔌 connectWebSocket - Début avec institutionId:', institutionId);
        
        // Validation critique: institutionId DOIT être présent
        if (!institutionId) {
          console.error('[ChatStore] ❌ connectWebSocket - institutionId MANQUANT!');
          console.error('[ChatStore] ℹ️ L\'institutionId doit être obtenu via /users/me avant la connexion WebSocket');
          set({ isWebSocketConnected: false });
          return;
        }
        
        try {
          // Récupérer le singleton du service de streaming
          // IMPORTANT: Toujours utiliser le singleton pour éviter les connexions multiples
          streamService = getChatStreamService();
          console.log('[ChatStore] connectWebSocket - Service de streaming obtenu:', {
            hasService: !!streamService,
            isConnected: streamService?.isConnected(),
            currentInstitutionId: streamService?.institutionId
          });
          
          // Vérifier si déjà connecté avec le même institutionId
          if (streamService.isConnected()) {
            const currentInstId = streamService.institutionId;
            if (currentInstId === institutionId) {
              console.log('[ChatStore] ✅ Déjà connecté avec le bon institutionId');
              set({ isWebSocketConnected: true });
              return;
            } else {
              // Connecté mais avec un autre institutionId - reconnecter
              console.log('[ChatStore] 🔄 Reconnexion nécessaire (institutionId différent):', {
                current: currentInstId,
                new: institutionId
              });
              streamService.disconnect();
            }
          }
          
          // S'abonner aux changements de connexion (une seule fois)
          streamService.onConnectionChange((connected) => {
            console.log('[ChatStore] 📡 WebSocket connexion changée:', connected);
            set({ isWebSocketConnected: connected });
          });
          
          console.log('[ChatStore] connectWebSocket - Appel de connect()...');
          await streamService.connect(institutionId);
          set({ isWebSocketConnected: true });
          console.log('[ChatStore] ✅ WebSocket connecté avec succès pour institution:', institutionId);
        } catch (error) {
          console.error('[ChatStore] ❌ Erreur de connexion WebSocket:', error);
          set({ isWebSocketConnected: false });
          // Le mode synchrone sera utilisé comme fallback automatiquement
          console.log('[ChatStore] ℹ️ Fallback: les messages utiliseront le mode synchrone');
        }
      },
      
      disconnectWebSocket: () => {
        console.log('[ChatStore] 🔌 disconnectWebSocket - Déconnexion...');
        if (streamService) {
          streamService.disconnect();
          streamService = null;
        }
        set({ isWebSocketConnected: false });
      },
      
      updateStreamingContent: (messageId: string, content: string, isComplete = false) => {
        console.log('[ChatStore] 🔄 updateStreamingContent:', { 
          messageId, 
          contentLength: content.length, 
          isComplete,
          activeConversationId: get().activeConversationId
        });
        
        set(state => {
          const updatedConversations = state.conversations.map(conv => 
            conv.id === state.activeConversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg => {
                    if (msg.id === messageId) {
                      console.log('[ChatStore] ✅ Message trouvé et mis à jour:', messageId);
                      return { 
                        ...msg, 
                        content, 
                        isStreaming: !isComplete,
                        pending: false
                      };
                    }
                    return msg;
                  })
                }
              : conv
          );
          
          // Vérifier si le message a été trouvé
          const activeConv = updatedConversations.find(c => c.id === state.activeConversationId);
          const messageFound = activeConv?.messages.some(m => m.id === messageId);
          if (!messageFound) {
            console.warn('[ChatStore] ⚠️ Message non trouvé:', messageId, 'Messages disponibles:', activeConv?.messages.map(m => m.id));
          }
          
          return {
            conversations: updatedConversations,
            streamingState: isComplete 
              ? { messageId: null, accumulatedContent: '', lastChunkId: -1, isActive: false }
              : { ...state.streamingState, accumulatedContent: content }
          };
        });
      },
      
      // ✅ NOUVEAU v2.4.0: Annuler le stream en cours
      cancelCurrentStream: () => {
        const store = get();
        const currentStreamService = store.isWebSocketConnected ? getChatStreamService() : null;
        
        if (!store.streamingState.isActive) {
          console.log('[ChatStore] ⚠️ Pas de stream actif à annuler');
          return;
        }
        
        const messageId = store.streamingState.messageId;
        const conversationId = store.activeConversationId;
        
        console.log('[ChatStore] 🛑 Annulation du stream:', { messageId, conversationId });
        
        // Annuler via le service WebSocket
        if (currentStreamService && conversationId) {
          currentStreamService.cancelStream(conversationId, messageId || undefined, 'User cancelled');
        }
        
        // Mettre à jour le message en cours pour montrer qu'il a été annulé
        if (messageId) {
          set(state => ({
            conversations: state.conversations.map(conv => 
              conv.id === state.activeConversationId
                ? {
                    ...conv,
                    messages: conv.messages.map(msg =>
                      msg.id === messageId 
                        ? { 
                            ...msg, 
                            isStreaming: false,
                            content: msg.content + '\n\n*[Génération interrompue]*'
                          }
                        : msg
                    )
                  }
                : conv
            ),
            streamingState: {
              messageId: null,
              accumulatedContent: '',
              lastChunkId: -1,
              isActive: false,
              cancelled: true
            },
            isTyping: false
          }));
        } else {
          set({ 
            streamingState: { messageId: null, accumulatedContent: '', lastChunkId: -1, isActive: false, cancelled: true },
            isTyping: false 
          });
        }
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

        // Récupérer le service de streaming (singleton)
        // IMPORTANT: Toujours utiliser getChatStreamService() car la variable locale peut être null
        const currentStreamService = store.isWebSocketConnected ? getChatStreamService() : null;
        
        // DEBUG: Log l'état actuel
        console.log('[ChatStore] addMessage - État:', {
          isApiMode: store.isApiMode,
          isStreamingEnabled: store.isStreamingEnabled,
          isWebSocketConnected: store.isWebSocketConnected,
          type,
          hasStreamService: !!currentStreamService,
          streamServiceConnected: currentStreamService?.isConnected(),
          activeConversationId: store.activeConversationId,
          globalInstitutionId: getInstitutionId()
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
        
        // ========================== SÉLECTION DU MODE ==========================
        // Mode API avec streaming activé
        // IMPORTANT: Toutes les conditions doivent être vraies pour utiliser le streaming
        // Sinon, on utilise le mode synchrone (/chat/messages) comme fallback
        
        const streamingConditions = {
          isApiMode: store.isApiMode,
          isStreamingEnabled: store.isStreamingEnabled,
          isWebSocketConnected: store.isWebSocketConnected,
          isUserMessage: type === 'user',
          hasStreamService: !!currentStreamService,
          serviceIsConnected: currentStreamService?.isConnected() === true,
          hasInstitutionId: !!getInstitutionId()
        };
        
        const canUseStreaming = Object.values(streamingConditions).every(v => v === true);
        
        console.log('[ChatStore] 🔍 Mode sélection:', {
          canUseStreaming,
          mode: canUseStreaming ? 'STREAMING (/chat/stream)' : 'SYNCHRONE (/chat/messages)',
          conditions: streamingConditions
        });
        
        if (!canUseStreaming && store.isApiMode && type === 'user') {
          // Log détaillé pour comprendre pourquoi le streaming n'est pas disponible
          const failedConditions = Object.entries(streamingConditions)
            .filter(([, v]) => v !== true)
            .map(([k]) => k);
          console.warn('[ChatStore] ⚠️ Streaming non disponible, fallback synchrone. Conditions manquantes:', failedConditions);
        }
        
        if (canUseStreaming && currentStreamService) {
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
            // Construire les métadonnées pour l'API
            // Note: institutionId n'est PAS accepté dans les metadata selon la doc API
            // Les champs acceptés sont: title, portfolioId, portfolioType, clientId, companyId, entityType, entityId
            const metadata: ChatMetadata = {
              portfolioId: store.currentPortfolioId || undefined,
              portfolioType: store.currentPortfolioType
            };

            console.log('[ChatStore] sendStreamingMessage - metadata:', metadata);

            // ⚠️ WORKFLOW CORRECT selon la documentation:
            // 1. Vérifier que le WebSocket est connecté
            // 2. S'abonner à la conversation AVANT d'envoyer le message HTTP
            // 3. Envoyer le message HTTP
            // 4. Recevoir les chunks via WebSocket
            // @see API DOCUMENTATION/chat/README.md - Section "Workflow Streaming"
            
            const workflowStart = Date.now();
            console.log('[ChatStore] 🚀 ========== DÉBUT WORKFLOW STREAMING ==========');
            console.log('[ChatStore] 📋 ConversationId local:', activeConversation.id);
            
            // ÉTAPE 0: Vérifier la connexion WebSocket
            console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ÉTAPE 0: Vérification WebSocket`);
            if (!currentStreamService.isConnected()) {
              console.error('[ChatStore] ❌ WebSocket non connecté! Les chunks seront perdus.');
              console.error('[ChatStore] ℹ️ État: isWebSocketConnected=', store.isWebSocketConnected);
              throw new Error('WebSocket non connecté. Veuillez réessayer.');
            }
            console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ✅ WebSocket connecté`);
            
            // ÉTAPE 0.5: Vérifier si l'ID est local (timestamp ou local-xxx)
            // Si oui, créer d'abord la conversation côté backend pour obtenir l'ID réel
            const isLocalId = activeConversation.id.startsWith('local-') || /^\d+$/.test(activeConversation.id);
            let backendConversationId = activeConversation.id;
            
            if (isLocalId) {
              console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ⚠️ ID local détecté, création conversation backend...`);
              try {
                const newBackendConversation = await chatApi.createConversation(activeConversation.title || 'Nouvelle conversation');
                backendConversationId = newBackendConversation.id;
                console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ✅ Conversation backend créée:`, backendConversationId);
                
                // Mettre à jour l'ID local avec l'ID du backend dans le store
                set(state => ({
                  conversations: state.conversations.map(conv => 
                    conv.id === activeConversation.id
                      ? { ...conv, id: backendConversationId }
                      : conv
                  ),
                  activeConversationId: backendConversationId
                }));
                console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ✅ Store mis à jour avec ID backend`);
              } catch (createError) {
                console.error(`[ChatStore] [${Date.now() - workflowStart}ms] ❌ Échec création conversation backend:`, createError);
                throw new Error('Impossible de créer la conversation. Veuillez réessayer.');
              }
            }
            
            // ÉTAPE 1: S'abonner à la conversation avec l'ID BACKEND AVANT d'envoyer le message
            // ⚠️ CRITIQUE: Utiliser backendConversationId, PAS activeConversation.id
            console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ÉTAPE 1: Abonnement WebSocket à la conversation backend:`, backendConversationId);
            try {
              await currentStreamService.subscribeToConversationAsync(backendConversationId, 3000);
              console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ✅ Abonnement confirmé pour:`, backendConversationId);
            } catch (subscribeError) {
              console.warn(`[ChatStore] [${Date.now() - workflowStart}ms] ⚠️ Timeout acknowledgement:`, subscribeError);
              // L'abonnement a quand même été envoyé, on continue
              console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ℹ️ Abonnement envoyé (sans confirmation serveur)`);
            }
            
            // ÉTAPE 1.5: Délai pour s'assurer que le serveur a traité l'abonnement
            // ⚠️ CRITIQUE: Comme accounting - attendre 200ms avant POST /chat/stream
            // Sans ce délai, le serveur peut ne pas avoir rejoint la room à temps
            console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ÉTAPE 1.5: Délai 200ms pour confirmation serveur...`);
            await new Promise(resolve => setTimeout(resolve, 200));
            console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ✅ Délai terminé`);

            // ÉTAPE 2: Envoyer le message via l'API REST /chat/stream avec l'ID BACKEND
            console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ÉTAPE 2: POST /chat/stream avec contextId:`, backendConversationId);
            const streamResponse = await chatApi.sendStreamingMessage({
              content,
              contextId: backendConversationId,
              metadata
            });
            console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ✅ Message envoyé, réponse:`, streamResponse.data);
            
            const messageId = streamResponse.data.messageId;
            const conversationId = streamResponse.data.conversationId;
            
            // ÉTAPE 3: Si le backend retourne encore un ID différent (cas rare), s'abonner aussi
            if (conversationId && conversationId !== backendConversationId) {
              console.warn(`[ChatStore] [${Date.now() - workflowStart}ms] ⚠️ Backend a retourné un ID différent! Attendu: ${backendConversationId}, Reçu: ${conversationId}`);
              console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ÉTAPE 3: Abonnement au nouvel ID:`, conversationId);
              await currentStreamService.subscribeToConversationAsync(conversationId, 2000);
              
              // Mettre à jour le store avec ce nouvel ID
              set(state => ({
                conversations: state.conversations.map(conv => 
                  conv.id === backendConversationId
                    ? { ...conv, id: conversationId }
                    : conv
                ),
                activeConversationId: conversationId
              }));
              backendConversationId = conversationId;
            }
            
            // Préparer l'état de streaming (sans ré-abonnement car déjà fait)
            currentStreamService.prepareStreamingWithoutSubscribe(messageId, backendConversationId);
            
            // ✅ IMPORTANT: Récupérer l'ID de conversation FINAL après toutes les mises à jour
            const finalConversationId = get().activeConversationId || backendConversationId;
            console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ✅ ID conversation final pour streaming:`, finalConversationId);
            
            // Remplacer le message en attente par le message réel
            set(state => ({
              conversations: state.conversations.map(conv => 
                conv.id === finalConversationId
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
            
            // ✅ IMPORTANT: Ajouter le message bot DANS LA BONNE CONVERSATION
            // Créer le message bot directement ici au lieu d'utiliser addStreamingMessage
            const botMessageId = `bot-${messageId}`;
            const botMessage: Message = {
              id: botMessageId,
              sender: 'bot',
              content: '',
              timestamp: new Date().toISOString(),
              likes: 0,
              dislikes: 0,
              isStreaming: true,
              pending: false
            };
            
            console.log(`[ChatStore] [${Date.now() - workflowStart}ms] 🤖 Ajout message bot:`, {
              botMessageId,
              conversationId: finalConversationId
            });
            
            set(state => ({
              conversations: state.conversations.map(conv => 
                conv.id === finalConversationId
                  ? {
                      ...conv,
                      messages: [...conv.messages, botMessage]
                    }
                  : conv
              ),
              streamingState: {
                messageId: botMessageId,
                accumulatedContent: '',
                lastChunkId: -1,
                isActive: true
              },
              isTyping: true
            }));
            
            // S'abonner aux événements de streaming
            // ✅ IMPORTANT: Le service accumule maintenant le contenu dans chunk.content
            // Plus besoin d'accumuler ici
            
            // ✅ Garder des références FIXES pour les closures
            const streamingConversationId = finalConversationId;
            const streamingMessageId = messageId;
            const streamingBotMessageId = botMessageId;
            
            console.log('[ChatStore] 📡 Abonnement aux événements de streaming:', {
              messageId: streamingMessageId,
              userMessageId: streamResponse.data.userMessageId,
              conversationId: streamingConversationId,
              botMessageId: streamingBotMessageId
            });
            
            currentStreamService.onChunk(streamingMessageId, (chunk: PortfolioStreamChunkEvent) => {
              console.log('[ChatStore] 📦 Chunk reçu:', { 
                type: chunk.type, 
                contentLength: chunk.content?.length,
                requestMessageId: chunk.requestMessageId,
                expectedMessageId: streamingMessageId,
                match: chunk.requestMessageId === streamingMessageId,
                conversationId: chunk.conversationId,
                chunkId: chunk.chunkId,
                targetBotMessageId: streamingBotMessageId
              });
              
              if (chunk.type === 'chunk' || chunk.content) {
                // ✅ Le contenu est DÉJÀ accumulé par le service (comme accounting)
                // chunk.content contient tout le texte jusqu'à présent
                console.log('[ChatStore] 📝 Mise à jour contenu:', chunk.content?.length || 0, 'caractères');
                
                // ✅ Mettre à jour le message bot avec l'ID FIXE
                set(state => ({
                  conversations: state.conversations.map(conv => {
                    // Vérifier si c'est la bonne conversation
                    if (conv.id === streamingConversationId) {
                      return {
                        ...conv,
                        messages: conv.messages.map(msg =>
                          msg.id === streamingBotMessageId 
                            ? { ...msg, content: chunk.content || '', isStreaming: true, pending: false }
                            : msg
                        )
                      };
                    }
                    return conv;
                  }),
                  isTyping: true
                }));
              }
            });
            
            currentStreamService.onComplete(streamingMessageId, (finalContent: string, suggestedActions?: Array<string | { type: string; payload: unknown }>) => {
              console.log('[ChatStore] ✅ Streaming terminé:', { 
                finalContentLength: finalContent.length,
                botMessageId: streamingBotMessageId,
                conversationId: streamingConversationId
              });
              
              // ✅ Finaliser le message dans la bonne conversation avec l'ID FIXE
              set(state => ({
                conversations: state.conversations.map(conv => {
                  if (conv.id === streamingConversationId) {
                    return {
                      ...conv,
                      messages: conv.messages.map(msg =>
                        msg.id === streamingBotMessageId 
                          ? { 
                              ...msg, 
                              content: finalContent, 
                              isStreaming: false,
                              pending: false,
                              suggestedActions: suggestedActions && suggestedActions.length > 0 ? suggestedActions : msg.suggestedActions
                            }
                          : msg
                      )
                    };
                  }
                  return conv;
                }),
                streamingState: {
                  messageId: null,
                  accumulatedContent: '',
                  lastChunkId: -1,
                  isActive: false
                },
                isTyping: false
              }));
            });
            
            currentStreamService.onError(streamingMessageId, (error: Error) => {
              console.error('[ChatStore] ❌ Erreur de streaming:', error);
              
              // Marquer le message comme erreur dans la bonne conversation avec l'ID FIXE
              set(state => ({
                conversations: state.conversations.map(conv => {
                  if (conv.id === streamingConversationId) {
                    return {
                      ...conv,
                      messages: conv.messages.map(msg =>
                        msg.id === streamingBotMessageId 
                          ? { 
                              ...msg, 
                              content: `Erreur: ${error.message || 'Erreur lors de la réception de la réponse. Veuillez réessayer.'}`,
                              error: true,
                              isStreaming: false,
                              pending: false
                            } 
                          : msg
                      )
                    };
                  }
                  return conv;
                }),
                streamingState: {
                  messageId: null,
                  accumulatedContent: '',
                  lastChunkId: -1,
                  isActive: false
                },
                isTyping: false
              }));
            });
            
            console.log(`[ChatStore] [${Date.now() - workflowStart}ms] ✅ WORKFLOW STREAMING INITIALISÉ`);
            console.log('[ChatStore] 🚀 ========== FIN WORKFLOW STREAMING ==========');
            
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
            // Envoyer le message via l'API (sans mode - non supporté par le backend)
            const apiResponse = await chatApi.sendMessage({
              content,
              contextId: activeConversation.id,
              attachment
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
      // Et réinitialiser isWebSocketConnected car le socket n'existe plus après rechargement
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ChatStore> | undefined;
        const merged: ChatStore = {
          ...currentState,
          ...persisted,
          // Forcer isApiMode
          isApiMode: true,
          // IMPORTANT: Toujours réinitialiser isWebSocketConnected à false
          // car le socket n'existe plus après un rechargement de page
          isWebSocketConnected: false,
          // Note: institutionId n'est plus stocké - utiliser getInstitutionId() au moment de l'utilisation
        };
        console.log('[ChatStore] État réhydraté:', { 
          isApiMode: merged.isApiMode, 
          isWebSocketConnected: merged.isWebSocketConnected,
          globalInstitutionId: getInstitutionId() 
        });
        return merged;
      }
    }
  )
);
