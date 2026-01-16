import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Maximize2, Minimize2, X, Send, Smile, Paperclip, Mic, MicOff, Copy, ThumbsUp, ThumbsDown, Sparkles, AlignJustify, AlertCircle, Loader2, Zap, User, Bot, RefreshCw, MessagesSquare, BarChart3, TrendingUp, FileText, HelpCircle, Square, Volume2 } from 'lucide-react';
import { useChatStore } from '../../hooks/useChatStore';
import { useAdhaWriteMode } from '../../hooks/useAdhaWriteMode';
import { useAudioChat } from '../../hooks/useAudioChat';
import { useAuth } from '../../contexts/useAuth';
import { useInstitutionId } from '../../hooks/useInstitutionId';
import { EmojiPicker } from './EmojiPicker';
import { MessageContent } from './MessageContent';
import { SourceSelector } from './SourceSelector';
import { ConversationList } from './ConversationList';
import { TypingIndicator } from './TypingIndicator';

interface ChatContainerProps {
  mode: 'floating' | 'fullscreen';
  onClose: () => void;
  onModeChange: () => void;
}

export function ChatContainer({ mode, onClose, onModeChange }: ChatContainerProps) {
  // ✅ NOUVEAU: Utiliser le hook robuste pour l'institutionId avec refresh automatique
  const { 
    institutionId: globalInstitutionId, 
    isContextLoaded, 
    isReady: isInstitutionReady,
    isRefreshing: isRefreshingContext,
    retryCount
  } = useInstitutionId({
    autoRefresh: true
  });
  
  const {
    conversations,
    activeConversationId,
    isTyping,
    isRecording,
    isApiMode,
    isStreamingEnabled,
    isWebSocketConnected,
    streamingState,
    setRecording,
    // setApiMode, // Commenté car non utilisé, était inclus dans la demande de suppression
    addMessage,
    updateMessage,
    toggleLike,
    toggleDislike,
    currentPortfolioType,
    currentPortfolioId,
    selectedTask,
    setPortfolioType,
    setSelectedTask,
    setCurrentPortfolioId,
    createNewConversation,
    deleteConversation,
    setActiveConversation,
    fetchConversations,
    connectWebSocket,
    cancelCurrentStream // ✅ NOUVEAU: Annuler le stream
    // Note: disconnectWebSocket retiré - la connexion est maintenue pendant toute la session
  } = useChatStore();
  
  const adhaWriteMode = useAdhaWriteMode();
  const { user } = useAuth();

  // 🎙️ Hook Audio pour le mode vocal
  const {
    isRecording: isVoiceRecording,
    isProcessing: isVoiceProcessing,
    recordingDuration,
    isSupported: isAudioSupported,
    startRecording: startVoiceRecording,
    stopAndTranscribe,
    cancelRecording,
    speakText,
    isSpeaking,
    stopSpeaking
  } = useAudioChat({
    language: 'fr',
    defaultVoice: 'nova',
    onTranscriptionComplete: (text) => {
      // Ajouter le texte transcrit au message
      setNewMessage(prev => prev ? `${prev} ${text}` : text);
    },
    onError: (error) => {
      console.error('[ChatContainer] ❌ Erreur audio:', error);
    }
  });

  // Ref pour tracker si le composant est monté (évite les mises à jour après démontage)
  const isMountedRef = useRef(true);

  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [showSidebar, setShowSidebar] = useState(mode === 'fullscreen');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = React.useMemo(() => activeConversation?.messages || [], [activeConversation]);
  
  // Obtenir le prénom de l'utilisateur
  const getUserFirstName = () => {
    if (user?.givenName) return user.givenName;
    if (user?.name) return user.name.split(' ')[0];
    return 'là';
  };

  // 🧹 Cleanup au démontage du composant
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      console.log('[ChatContainer] 🧹 Démontage du composant');
    };
  }, []);

  // Charger les conversations au démarrage
  useEffect(() => {
    if (!isInitialized && isMountedRef.current) {
      fetchConversations().then(() => {
        if (isMountedRef.current) {
          setIsInitialized(true);
        }
      });
    }
  }, [isInitialized, fetchConversations]);

  // Connexion WebSocket pour le streaming quand l'institution est prête
  // ✅ AMÉLIORÉ: Utilise isInstitutionReady qui gère automatiquement les retries
  useEffect(() => {
    // Ne rien faire si le composant est démonté
    if (!isMountedRef.current) return;
    
    // Log détaillé de l'état pour debug
    console.log('[ChatContainer] 🔍 État WebSocket:', {
      isInstitutionReady,
      globalInstitutionId,
      isContextLoaded,
      isRefreshingContext,
      retryCount,
      isApiMode,
      isStreamingEnabled,
      isWebSocketConnected
    });
    
    // ✅ Attendre que l'institution soit complètement prête (inclut les retries)
    if (!isInstitutionReady) {
      if (isRefreshingContext) {
        console.log(`[ChatContainer] 🔄 Refresh du contexte (tentative ${retryCount})...`);
      } else if (!isContextLoaded) {
        console.log('[ChatContainer] ⏳ Attente du contexte initial (/users/me)...');
      } else {
        console.log('[ChatContainer] ⏳ Attente que isInstitutionReady devienne true...');
      }
      return;
    }
    
    // CRITIQUE: Double vérification - institutionId DOIT être présent
    if (!globalInstitutionId) {
      console.error('[ChatContainer] ❌ isInstitutionReady=true mais institutionId null!');
      return;
    }
    
    if (isApiMode && isStreamingEnabled && !isWebSocketConnected) {
      console.log('[ChatContainer] 🔌 Connexion WebSocket avec institutionId:', globalInstitutionId);
      connectWebSocket(globalInstitutionId);
    } else if (!isApiMode) {
      console.log('[ChatContainer] ℹ️ Mode mock activé, WebSocket non requis');
    } else if (!isStreamingEnabled) {
      console.log('[ChatContainer] ℹ️ Streaming désactivé, WebSocket non requis');
    } else if (isWebSocketConnected) {
      console.log('[ChatContainer] ✅ WebSocket déjà connecté');
    }
    
    // Note: pas de cleanup de déconnexion car le WebSocket est un singleton partagé
  }, [isInstitutionReady, isContextLoaded, isRefreshingContext, retryCount, isApiMode, isStreamingEnabled, globalInstitutionId, isWebSocketConnected, connectWebSocket]);


  // Défiler vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    console.log('[ChatContainer] 📤 handleSend - État streaming:', {
      isWebSocketConnected,
      isStreamingEnabled,
      globalInstitutionId,
      isApiMode
    });
    
    // Vérifier si on a besoin de connecter le WebSocket avant d'envoyer
    if (isApiMode && isStreamingEnabled && !isWebSocketConnected && globalInstitutionId) {
      console.log('[ChatContainer] 🔌 Tentative de connexion WebSocket avant envoi...');
      await connectWebSocket(globalInstitutionId);
    }
    
    // Ajout du mode dans le contexte lors de l'envoi
    await addMessage(newMessage, 'user', undefined, adhaWriteMode.isActive ? 'analyse' : 'chat');
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      await addMessage('Pièce jointe envoyée', 'user', {
        name: file.name,
        type: file.type,
        content
      });
    };
    reader.readAsDataURL(file);
  };

  // Fonction pour basculer l'affichage de la barre latérale
  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  // Effet pour afficher la barre latérale en mode plein écran et la cacher en mode flottant
  useEffect(() => {
    setShowSidebar(mode === 'fullscreen');
  }, [mode]);

  return (
    <div 
      className={`
        bg-white dark:bg-gray-900 flex flex-col
        ${mode === 'floating' 
          ? 'fixed bottom-4 right-4 w-[400px] h-[600px] rounded-lg shadow-xl' 
          : 'fixed inset-0 w-full h-full'}
        ${mode === 'fullscreen' ? 'rounded-none' : 'rounded-lg'}
      `}
      style={
        mode === 'floating'
          ? { maxWidth: '90vw', maxHeight: '90vh' }
          : undefined
      }
    >
      {/* Header global - couvre toute la largeur */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 w-full">
        <div className="flex items-center space-x-3">
          {mode === 'fullscreen' && (
            <button 
              onClick={toggleSidebar} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <AlignJustify className="h-5 w-5 text-gray-500" />
            </button>
          )}
          
          {/* Icône avec indicateur de statut */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isWebSocketConnected ? 'bg-primary/10' : 'bg-orange-500/10'
          }`}>
            <MessageSquare className={`h-5 w-5 ${
              isWebSocketConnected ? 'text-primary' : 'text-orange-500'
            }`} />
          </div>
          
          <div>
            <button
              onClick={() => setShowSourceSelector(true)}
              className="flex items-center space-x-2 hover:text-primary transition-colors"
            >
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {selectedTask?.name || 'ADHA Assistant'}
              </h3>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isTyping ? (
                <span className="text-primary">Analyse en cours...</span>
              ) : isWebSocketConnected ? (
                <span className="text-green-500">● En ligne</span>
              ) : (
                <span className="text-orange-500">● Mode standard</span>
              )}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={onModeChange}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title={mode === 'floating' ? 'Plein écran' : 'Mode flottant'}
          >
            {mode === 'floating' ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Structure principale avec sidebar et contenu */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar - visible uniquement en mode plein écran */}
        {mode === 'fullscreen' && showSidebar && (
          <aside className="w-72 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
            <ConversationList 
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={setActiveConversation}
              onDelete={deleteConversation}
              onNew={createNewConversation}
            />
          </aside>
        )}
        
        {/* Contenu principal - style ChatGPT/Gemini: fond neutre */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-white dark:bg-gray-800">
          {/* Zone des messages - scrollable */}
          <div className={`flex-1 overflow-y-auto chat-scrollbar ${mode === 'fullscreen' ? 'px-0' : ''}`}>
            <div className={`${mode === 'fullscreen' ? 'max-w-3xl mx-auto w-full' : ''} px-4 py-4 space-y-4`}>
              {messages.length === 0 ? (
                /* Écran d'accueil style ChatGPT/Claude/Gemini */
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
                  {/* Logo ADHA animé */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                  
                  {/* Message de bienvenue personnalisé */}
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Bonjour, {getUserFirstName()} 👋
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                    Je suis <span className="font-medium text-primary">ADHA</span>, votre assistant intelligent. 
                    Comment puis-je vous aider aujourd'hui ?
                  </p>
                  
                  {/* Suggestions de prompts - style cartes */}
                  <div className={`grid gap-3 w-full max-w-lg ${mode === 'fullscreen' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <button 
                      onClick={() => setNewMessage("Analyse la performance de mon portefeuille")}
                      className="group flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Analyse de portefeuille</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Performance, tendances et opportunités</p>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setNewMessage("Quels sont les risques majeurs à surveiller ?")}
                      className="group flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Évaluation des risques</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Alertes et points d'attention</p>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setNewMessage("Génère un rapport de synthèse mensuel")}
                      className="group flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Génération de rapports</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Synthèses et documents automatisés</p>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setNewMessage("Quels sont les prospects prioritaires à contacter ?")}
                      className="group flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Prospection client</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Identifier et prioriser les prospects</p>
                      </div>
                    </button>
                  </div>
                  
                  {/* Tip du mode analyse */}
                  {!adhaWriteMode.isActive && (
                    <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Activez le <span className="font-medium text-primary cursor-pointer hover:underline" onClick={() => adhaWriteMode.toggle()}>mode Analyse</span> pour des analyses approfondies</span>
                    </div>
                  )}
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`group relative w-full ${message.sender === 'user' ? 'flex justify-end' : ''}`}
                  >
                    <div className={`
                      flex items-start py-4
                      ${message.sender === 'user' 
                        ? 'flex-row-reverse space-x-reverse space-x-3 max-w-[85%]' 
                        : 'space-x-3 w-full'
                      }
                      ${message.pending ? 'opacity-70' : ''}
                    `}>
                      {/* Avatar - Style ChatGPT/Gemini minimaliste */}
                      <div className={`
                        w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                        ${message.sender === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                        }
                      `}>
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>

                      {/* Contenu */}
                      <div className={`flex-1 min-w-0 ${message.sender === 'user' ? 'text-right' : ''}`}>
                        {/* Header avec nom et timestamp */}
                        <div className={`flex items-center space-x-2 mb-1 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {message.sender === 'user' ? 'Vous' : 'ADHA'}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.isStreaming && (
                            <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                              <Sparkles className="h-3 w-3 animate-sparkle" />
                              <span className="animate-pulse-subtle">Génération...</span>
                            </span>
                          )}
                        </div>

                        {/* Erreur */}
                        {message.error && (
                          <div className="flex items-center text-red-500 dark:text-red-400 mb-2 text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg w-fit">
                            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                            <span>Erreur d'envoi</span>
                            <button 
                              onClick={() => addMessage(message.content, 'user', message.attachment)}
                              className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              title="Réessayer"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        {/* ✅ Indicateur de streaming - style ChatGPT/Gemini épuré */}
                        {message.isStreaming && !message.content && (
                          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 py-2">
                            {/* Animation dots style ChatGPT */}
                            <div className="flex items-center space-x-1">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        )}

                        {/* Contenu du message - style texte simple sans background */}
                        {message.content && (
                          <div className={`text-[15px] text-gray-800 dark:text-gray-200 leading-relaxed ${
                            message.sender === 'user' ? 'text-right' : 'text-left'
                          }`}>
                            <MessageContent 
                              content={message.content}
                              isStreaming={message.isStreaming}
                              onEdit={message.sender === 'bot' && !message.isStreaming ? (newContent) => 
                                updateMessage(message.id, { content: newContent })
                              : undefined}
                            />
                          </div>
                        )}
                        
                        {/* Pièce jointe */}
                        {message.attachment && (
                          <div className={`mt-2 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg inline-flex items-center space-x-2 ${
                            message.sender === 'user' ? 'ml-auto' : ''
                          }`}>
                            <Paperclip className="h-3.5 w-3.5 text-gray-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">{message.attachment.name}</span>
                          </div>
                        )}
                        
                        {/* Actions suggérées */}
                        {message.sender === 'bot' && message.suggestedActions && message.suggestedActions.length > 0 && !message.isStreaming && (
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                              <Zap className="h-3 w-3 mr-1 text-amber-500" />
                              Actions suggérées
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {message.suggestedActions.map((action, index) => {
                                // Gérer les deux formats: string ou {type, payload}
                                const actionText = typeof action === 'string' ? action : action.type;
                                return (
                                  <button
                                    key={index}
                                    onClick={() => addMessage(actionText, 'user')}
                                    className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
                                  >
                                    {actionText}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions au hover (bot uniquement) */}
                      {message.sender === 'bot' && !message.isStreaming && (
                        <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* 🔊 Bouton lecture vocale */}
                          {isAudioSupported && (
                            <button 
                              onClick={() => speakText(message.content)}
                              disabled={isSpeaking}
                              className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                isSpeaking 
                                  ? 'text-primary' 
                                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                              }`}
                              title={isSpeaking ? "Lecture en cours..." : "Écouter la réponse"}
                            >
                              <Volume2 className={`h-3.5 w-3.5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                            </button>
                          )}
                          <button 
                            onClick={() => navigator.clipboard.writeText(message.content)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Copier"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => toggleLike(message.id)}
                            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              (message.likes ?? 0) > 0 ? 'text-green-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                            title="Utile"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => toggleDislike(message.id)}
                            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              (message.dislikes ?? 0) > 0 ? 'text-red-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                            title="Pas utile"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {isTyping && !streamingState.isActive && (
                <TypingIndicator mode="thinking" />
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Sélecteur de mode Chat/Analyse - Design moderne */}
          <div className={`border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0 ${mode === 'fullscreen' ? 'max-w-3xl mx-auto w-full' : ''}`}>
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center space-x-3">
                {/* Badge indicateur du mode actuel */}
                <div className={`
                  flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${adhaWriteMode.isActive 
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' 
                    : 'bg-primary/10 text-primary'
                  }
                `}>
                  {adhaWriteMode.isActive ? (
                    <>
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Mode Analyse</span>
                    </>
                  ) : (
                    <>
                      <MessagesSquare className="w-3.5 h-3.5" />
                      <span>Mode Chat</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Toggle Switch avec labels */}
              <div className="flex items-center space-x-2">
                <span className={`text-xs transition-colors ${
                  !adhaWriteMode.isActive ? 'text-primary font-medium' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  Chat
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={adhaWriteMode.isActive}
                    onChange={() => adhaWriteMode.toggle()}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-orange-500 transition-colors"></div>
                </label>
                <span className={`text-xs transition-colors ${
                  adhaWriteMode.isActive ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  Analyse
                </span>
              </div>
            </div>
            
            {/* Message d'info pour le mode analyse */}
            {adhaWriteMode.isActive && (
              <div className="px-4 pb-2">
                <p className="text-xs text-orange-600/80 dark:text-orange-400/80 flex items-center space-x-1">
                  <span>💡</span>
                  <span>ADHA analysera en profondeur votre portefeuille et générera des insights détaillés</span>
                </p>
              </div>
            )}
          </div>
            
          {/* Zone de saisie moderne */}
          <div className={`p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 ${mode === 'fullscreen' ? 'max-w-3xl mx-auto w-full' : ''}`}>
            <div className="relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={adhaWriteMode.isActive 
                  ? "Décrivez l'analyse que vous souhaitez effectuer..." 
                  : "Posez votre question à ADHA..."
                }
                className="w-full px-4 py-3 pr-16 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 transition-all"
                rows={2}
                disabled={streamingState.isActive}
              />
              
              {/* ✅ Bouton Send/Stop/Audio dynamique - style WhatsApp/Claude */}
              {streamingState.isActive ? (
                // Bouton STOP pendant le streaming
                <button
                  onClick={cancelCurrentStream}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md group"
                  title="Arrêter la génération"
                >
                  <Square className="h-4 w-4 fill-current" />
                  {/* Animation pulse discrète */}
                  <span className="absolute inset-0 rounded-lg bg-red-400 animate-ping opacity-30" />
                </button>
              ) : isVoiceRecording ? (
                // Mode enregistrement actif - Bouton Stop enregistrement
                <button
                  onClick={async () => {
                    try {
                      await stopAndTranscribe();
                    } catch (err) {
                      console.error('Erreur transcription:', err);
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md group"
                  title="Arrêter et transcrire"
                >
                  <Square className="h-4 w-4 fill-current" />
                  <span className="absolute inset-0 rounded-lg bg-red-400 animate-ping opacity-30" />
                </button>
              ) : isVoiceProcessing ? (
                // Mode traitement transcription
                <button
                  disabled
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/20 text-primary"
                  title="Transcription en cours..."
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                </button>
              ) : newMessage.trim() ? (
                // Bouton SEND quand il y a du texte
                <button
                  onClick={handleSend}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md hover:scale-105"
                  title="Envoyer (Entrée)"
                >
                  <Send className="h-4 w-4" />
                </button>
              ) : isAudioSupported ? (
                // Bouton MICRO quand l'input est vide
                <button
                  onClick={startVoiceRecording}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md hover:scale-105"
                  title="Message vocal - Maintenez pour enregistrer"
                >
                  <Mic className="h-4 w-4" />
                </button>
              ) : (
                // Fallback: Bouton SEND désactivé si audio non supporté
                <button
                  disabled
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  title="Tapez un message"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Actions secondaires */}
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center space-x-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Joindre un fichier"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Ajouter un emoji"
                >
                  <Smile className="h-4 w-4" />
                </button>
                
                {/* 🎙️ Indicateur d'enregistrement audio (quand actif) */}
                {isVoiceRecording && (
                  <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg border border-red-200 dark:border-red-800 animate-pulse">
                    {/* Indicateur d'enregistrement animé */}
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </div>
                    
                    {/* Timer */}
                    <span className="text-xs font-mono text-red-600 dark:text-red-400 min-w-[40px]">
                      {Math.floor(recordingDuration / 60).toString().padStart(2, '0')}:
                      {(recordingDuration % 60).toString().padStart(2, '0')}
                    </span>
                    
                    {/* Bouton Annuler */}
                    <button
                      onClick={cancelRecording}
                      className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                      title="Annuler l'enregistrement"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {/* Indicateur de traitement transcription */}
                {isVoiceProcessing && (
                  <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs text-primary font-medium">Transcription...</span>
                  </div>
                )}
                
                {/* Bouton lecture vocale (si un message bot est sélectionné) */}
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="Arrêter la lecture"
                  >
                    <Volume2 className="h-4 w-4 animate-pulse" />
                  </button>
                )}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Entrée pour envoyer • Shift+Entrée nouvelle ligne
              </span>
            </div>
            
            {showEmojiPicker && (
              <div className="absolute bottom-24 right-4 z-10 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
                <EmojiPicker
                  onSelect={(emoji) => {
                    setNewMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      <SourceSelector
        isOpen={showSourceSelector}
        onClose={() => setShowSourceSelector(false)}
        currentPortfolioType={currentPortfolioType as 'traditional'}
        selectedTask={selectedTask}
        selectedPortfolioId={currentPortfolioId}
        onSelect={(task, portfolioType, portfolioId) => {
          if (portfolioType) {
            setPortfolioType(portfolioType);
          }
          if (portfolioId) {
            setCurrentPortfolioId(portfolioId);
          }
          setSelectedTask(task);
        }}
      />
    </div>
  );
}
