import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Maximize2, 
  Minimize2, 
  X, 
  Send, 
  Smile, 
  Paperclip, 
  Mic, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  Loader2, 
  Zap, 
  User, 
  Bot, 
  MessagesSquare, 
  BarChart3,
  PanelRightClose,
  PanelRight,
  Columns,
  TrendingUp,
  FileText,
  Calculator,
  HelpCircle
} from 'lucide-react';
import { useChatStore } from '../../hooks/useChatStore';
import { useAdhaWriteMode } from '../../hooks/useAdhaWriteMode';
import { useAuth } from '../../contexts/useAuth';
import { EmojiPicker } from './EmojiPicker';
import { MessageContent } from './MessageContent';
import { SourceSelector } from './SourceSelector';
import { ConversationList } from './ConversationList';
import { TypingIndicator } from './TypingIndicator';
import { usePanelContext } from '../../contexts/PanelContext';

interface ChatPanelProps {
  onClose: () => void;
}

export function ChatPanel({ onClose }: ChatPanelProps) {
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
    addMessage,
    updateMessage,
    toggleLike,
    toggleDislike,
    currentPortfolioType,
    currentPortfolioId,
    currentInstitutionId,
    selectedTask,
    setPortfolioType,
    setSelectedTask,
    setCurrentPortfolioId,
    createNewConversation,
    deleteConversation,
    setActiveConversation,
    fetchConversations,
    connectWebSocket,
    disconnectWebSocket
  } = useChatStore();

  const { secondaryPanel, toggleFullscreen, panelPosition, setPanelPosition } = usePanelContext();
  const isFullscreen = secondaryPanel.isFullscreen;
  
  const adhaWriteMode = useAdhaWriteMode();
  const { user } = useAuth();

  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
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

  // Charger les conversations au démarrage
  useEffect(() => {
    if (!isInitialized) {
      fetchConversations().then(() => {
        setIsInitialized(true);
      });
    }
  }, [isInitialized, fetchConversations]);

  // Connexion WebSocket pour le streaming
  useEffect(() => {
    if (isApiMode && isStreamingEnabled && currentInstitutionId && !isWebSocketConnected) {
      connectWebSocket(currentInstitutionId);
    }
    
    return () => {
      if (isWebSocketConnected) {
        disconnectWebSocket();
      }
    };
  }, [isApiMode, isStreamingEnabled, currentInstitutionId, isWebSocketConnected, connectWebSocket, disconnectWebSocket]);

  // Défiler vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Afficher sidebar en fullscreen
  useEffect(() => {
    setShowSidebar(isFullscreen);
  }, [isFullscreen]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
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

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Structure avec sidebar optionnelle */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Sidebar conversations - visible en fullscreen ou si activée */}
        {showSidebar && (
          <div className="flex-shrink-0 w-64 h-full border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <ConversationList 
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={setActiveConversation}
              onDelete={deleteConversation}
              onNew={createNewConversation}
            />
          </div>
        )}
        
        {/* Contenu principal du chat */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header compact */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
            <div className="flex items-center space-x-2 min-w-0">
              {/* Toggle sidebar */}
              <button 
                onClick={() => setShowSidebar(!showSidebar)} 
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                title={showSidebar ? 'Masquer les conversations' : 'Afficher les conversations'}
              >
                {showSidebar ? (
                  <PanelRightClose className="h-4 w-4 text-gray-500" />
                ) : (
                  <PanelRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
              
              {/* Icône et titre */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isWebSocketConnected ? 'bg-primary/10' : 'bg-orange-500/10'
              }`}>
                <MessageSquare className={`h-4 w-4 ${
                  isWebSocketConnected ? 'text-primary' : 'text-orange-500'
                }`} />
              </div>
              
              <div className="min-w-0">
                <button
                  onClick={() => setShowSourceSelector(true)}
                  className="flex items-center space-x-1 hover:text-primary transition-colors"
                >
                  <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {selectedTask?.name || 'ADHA'}
                  </h3>
                  <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isTyping ? (
                    <span className="text-primary">Analyse...</span>
                  ) : isWebSocketConnected ? (
                    <span className="text-green-500">● En ligne</span>
                  ) : (
                    <span className="text-orange-500">● Standard</span>
                  )}
                </span>
              </div>
            </div>
            
            {/* Actions header */}
            <div className="flex items-center space-x-0.5 flex-shrink-0">
              {/* Position toggle */}
              <button
                onClick={() => setPanelPosition(panelPosition === 'right' ? 'bottom' : 'right')}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title={panelPosition === 'right' ? 'Placer en bas' : 'Placer à droite'}
              >
                <Columns className="h-4 w-4" />
              </button>
              
              {/* Fullscreen toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Zone des messages */}
          <div className="flex-1 overflow-y-auto">
            <div className={`px-3 py-4 space-y-1 ${isFullscreen ? 'max-w-4xl mx-auto' : ''}`}>
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
                  <div className={`grid gap-3 w-full max-w-lg ${isFullscreen ? 'grid-cols-2' : 'grid-cols-1'}`}>
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
                      onClick={() => setNewMessage("Aide-moi à créer une écriture comptable")}
                      className="group flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Calculator className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Écritures comptables</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Générer et valider des écritures</p>
                      </div>
                    </button>
                  </div>
                  
                  {/* Tip du mode écriture */}
                  {!adhaWriteMode.isActive && (
                    <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Activez le <span className="font-medium text-primary cursor-pointer hover:underline" onClick={() => adhaWriteMode.toggle()}>mode Écriture</span> pour générer des écritures comptables</span>
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
                      flex items-start space-x-2 py-2 px-2 rounded-lg 
                      hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                      ${message.sender === 'user' ? 'max-w-[90%] bg-primary/5 dark:bg-primary/10' : '-mx-2'}
                      ${message.error ? 'bg-red-50/50 dark:bg-red-900/10' : ''}
                      ${message.pending ? 'opacity-70' : ''}
                      ${message.isStreaming ? 'bg-primary/5' : ''}
                    `}>
                      {/* Avatar */}
                      <div className={`
                        w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5
                        ${message.sender === 'user' 
                          ? 'bg-primary/10' 
                          : 'bg-gradient-to-br from-primary/20 to-primary/10'
                        }
                      `}>
                        {message.sender === 'user' ? (
                          <User className="h-3 w-3 text-primary" />
                        ) : (
                          <Bot className="h-3 w-3 text-primary" />
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-0.5">
                          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {message.sender === 'user' ? 'Vous' : 'ADHA'}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.isStreaming && (
                            <span className="text-xs text-primary animate-pulse flex items-center">
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            </span>
                          )}
                        </div>

                        {/* Erreur */}
                        {message.error && (
                          <div className="flex items-center text-red-500 dark:text-red-400 mb-1 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            <span>Erreur</span>
                            <button 
                              onClick={() => addMessage(message.content, 'user', message.attachment)}
                              className="ml-2 p-0.5 hover:bg-red-100 rounded"
                              title="Réessayer"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        {/* Streaming indicator */}
                        {message.isStreaming && !message.content && (
                          <div className="flex items-center space-x-1 text-gray-500 py-1">
                            <div className="flex space-x-0.5">
                              <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        )}

                        {/* Contenu du message */}
                        {message.content && (
                          <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                            <MessageContent 
                              content={message.content}
                              onEdit={message.sender === 'bot' && !message.isStreaming ? (newContent) => 
                                updateMessage(message.id, { content: newContent })
                              : undefined}
                            />
                          </div>
                        )}
                        
                        {/* Pièce jointe */}
                        {message.attachment && (
                          <div className="mt-1 p-1.5 bg-gray-100 dark:bg-gray-700 rounded inline-flex items-center space-x-1.5">
                            <Paperclip className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">{message.attachment.name}</span>
                          </div>
                        )}
                        
                        {/* Actions suggérées */}
                        {message.sender === 'bot' && message.suggestedActions && message.suggestedActions.length > 0 && !message.isStreaming && (
                          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 mb-1 flex items-center">
                              <Zap className="h-3 w-3 mr-1 text-amber-500" />
                              Suggestions
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {message.suggestedActions.slice(0, 3).map((action, index) => (
                                <button
                                  key={index}
                                  onClick={() => addMessage(action, 'user')}
                                  className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
                                >
                                  {action.length > 30 ? action.substring(0, 30) + '...' : action}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions hover */}
                      {message.sender === 'bot' && !message.isStreaming && (
                        <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button 
                            onClick={() => navigator.clipboard.writeText(message.content)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
                            title="Copier"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => toggleLike(message.id)}
                            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              (message.likes ?? 0) > 0 ? 'text-green-500' : 'text-gray-400'
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => toggleDislike(message.id)}
                            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              (message.dislikes ?? 0) > 0 ? 'text-red-500' : 'text-gray-400'
                            }`}
                          >
                            <ThumbsDown className="h-3 w-3" />
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

          {/* Mode selector compact */}
          <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 px-3 py-1.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className={`
                flex items-center space-x-1.5 px-2 py-1 rounded-full text-xs font-medium
                ${adhaWriteMode.isActive 
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' 
                  : 'bg-primary/10 text-primary'
                }
              `}>
                {adhaWriteMode.isActive ? (
                  <>
                    <BarChart3 className="w-3 h-3" />
                    <span>Analyse</span>
                  </>
                ) : (
                  <>
                    <MessagesSquare className="w-3 h-3" />
                    <span>Chat</span>
                  </>
                )}
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={adhaWriteMode.isActive}
                  onChange={() => adhaWriteMode.toggle()}
                />
                <div className="w-8 h-4 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500 transition-colors"></div>
              </label>
            </div>
          </div>
            
          {/* Zone de saisie compacte */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
            <div className="relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={adhaWriteMode.isActive 
                  ? "Décrivez l'analyse..." 
                  : "Posez votre question..."
                }
                className="w-full px-3 py-2 pr-10 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
                rows={1}
                style={{ minHeight: '36px', maxHeight: '120px' }}
              />
              
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className={`
                  absolute right-1.5 bottom-1.5 p-1.5 rounded-md transition-all
                  ${newMessage.trim() 
                    ? 'bg-primary text-white hover:bg-primary/90' 
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            
            {/* Actions secondaires */}
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center space-x-0.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
                  title="Joindre"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
                  title="Emoji"
                >
                  <Smile className="h-3.5 w-3.5" />
                </button>
                <button
                  onMouseDown={() => setRecording(true)}
                  onMouseUp={() => setRecording(false)}
                  className={`p-1.5 rounded ${
                    isRecording 
                      ? 'bg-red-100 text-red-500' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
                  }`}
                  title="Vocal"
                >
                  <Mic className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="text-xs text-gray-400">
                ↵ envoyer
              </span>
            </div>
            
            {showEmojiPicker && (
              <div className="absolute bottom-20 right-2 z-10 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700">
                <EmojiPicker
                  onSelect={(emoji) => {
                    setNewMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Source Selector Modal */}
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
