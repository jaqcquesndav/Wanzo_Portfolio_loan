import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Maximize2, Minimize2, X, Send, Smile, Paperclip, Mic, Copy, ThumbsUp, ThumbsDown, Sparkles, AlignJustify, AlertCircle, Repeat } from 'lucide-react';
import { useChatStore } from '../../hooks/useChatStore';
import { useAdhaWriteMode } from '../../hooks/useAdhaWriteMode';
import { EmojiPicker } from './EmojiPicker';
import { MessageContent } from './MessageContent';
import { SourceSelector } from './SourceSelector';
import { ConversationList } from './ConversationList';

interface ChatContainerProps {
  mode: 'floating' | 'fullscreen';
  onClose: () => void;
  onModeChange: () => void;
}

export function ChatContainer({ mode, onClose, onModeChange }: ChatContainerProps) {
  const {
    conversations,
    activeConversationId,
    isTyping,
    isRecording,
    isApiMode,
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
    fetchConversations
  } = useChatStore();
  
  const adhaWriteMode = useAdhaWriteMode();

  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [showSidebar, setShowSidebar] = useState(mode === 'fullscreen');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = React.useMemo(() => activeConversation?.messages || [], [activeConversation]);

  // Charger les conversations au démarrage en mode API
  useEffect(() => {
    if (isApiMode && !isInitialized) {
      fetchConversations().then(() => {
        setIsInitialized(true);
      });
    }
  }, [isApiMode, isInitialized, fetchConversations]);

  // Défiler vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
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
        bg-white flex flex-col
        ${mode === 'floating' 
          ? 'fixed bottom-4 right-4 w-[400px] h-[600px] rounded-lg shadow-xl' 
          : 'fixed inset-0 w-screen h-screen bg-white dark:bg-gray-800'}
        ${mode === 'fullscreen' ? 'rounded-none' : 'rounded-lg'}
      `}
      style={
        mode === 'floating'
          ? { maxWidth: '90vw', maxHeight: '90vh' }
          : undefined
      }
    >
      {/* Structure principale avec sidebar et contenu */}
      <div className="flex flex-1 h-full">
        {/* Sidebar - visible uniquement en mode plein écran */}
        {mode === 'fullscreen' && showSidebar && (
          <div className="flex-shrink-0 h-full border-r border-gray-200 dark:border-gray-700">
            <ConversationList 
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={setActiveConversation}
              onDelete={deleteConversation}
              onNew={createNewConversation}
            />
          </div>
        )}
        
        {/* Contenu principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              {mode === 'fullscreen' && (
                <button onClick={toggleSidebar} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <AlignJustify className="h-5 w-5 text-gray-500" />
                </button>
              )}
              <MessageSquare className="h-5 w-5 text-primary" />
              <button
                onClick={() => setShowSourceSelector(true)}
                className="flex items-center space-x-2 hover:text-primary"
              >
                <h3 className="font-medium">{selectedTask?.name || 'Assistant général'}</h3>
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onModeChange}
                className="text-gray-500 hover:text-gray-700"
              >
                {mode === 'floating' ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Contenu principal - centré en mode plein écran */}
          <div className="flex-1 flex overflow-hidden">
            <div className={`flex-1 flex flex-col ${mode === 'fullscreen' ? 'max-w-3xl mx-auto w-full' : ''}`}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`
                      max-w-[80%] rounded-lg p-3 space-y-2
                      ${message.sender === 'user' 
                        ? 'bg-[#197ca8] text-white' 
                        : 'bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                      }
                      ${message.error ? 'border border-red-500' : ''}
                      ${message.pending ? 'opacity-70' : ''}
                    `}>
                      {message.error && (
                        <div className="flex items-center text-red-500 dark:text-red-400 mb-2 text-xs">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span>Erreur d'envoi</span>
                          <button 
                            onClick={() => addMessage(message.content, 'user', message.attachment)}
                            className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            title="Réessayer"
                          >
                            <Repeat className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      <MessageContent 
                        content={message.content}
                        onEdit={message.sender === 'bot' ? (newContent) => 
                          updateMessage(message.id, { content: newContent })
                        : undefined}
                      />
                      
                      {message.attachment && (
                        <div className="mt-2 p-2 bg-white/10 rounded">
                          <p className="text-sm">{message.attachment.name}</p>
                        </div>
                      )}
                      
                      {message.sender === 'bot' && (
                        <div className="flex items-center justify-end space-x-2 text-xs opacity-75">
                          <button onClick={() => navigator.clipboard.writeText(message.content)}>
                            <Copy className="h-4 w-4" />
                          </button>
                          <button onClick={() => toggleLike(message.id)}>
                            <ThumbsUp className="h-4 w-4" />
                            {(message.likes ?? 0) > 0 && <span>{message.likes}</span>}
                          </button>
                          <button onClick={() => toggleDislike(message.id)}>
                            <ThumbsDown className="h-4 w-4" />
                            {(message.dislikes ?? 0) > 0 && <span>{message.dislikes}</span>}
                          </button>
                        </div>
                      )}
                      <span className="text-xs opacity-75">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="animate-bounce">.</div>
                    <div className="animate-bounce delay-100">.</div>
                    <div className="animate-bounce delay-200">.</div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Sélecteur de mode (normal/écriture) */}
              <div className="relative border-t border-gray-100 py-2 px-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Mode:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Chat</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={adhaWriteMode.isActive}
                        onChange={() => adhaWriteMode.toggle()}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                    <span className="text-xs text-gray-500">Analyse</span>
                  </div>
                </div>
                
                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex flex-col space-y-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Écrivez votre message..."
                      className="w-full pl-4 pr-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary resize-none"
                      rows={2}
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                          title="Joindre un fichier"
                        >
                          <Paperclip className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                          title="Ajouter un emoji"
                        >
                          <Smile className="h-5 w-5" />
                        </button>
                        <button
                          onMouseDown={() => setRecording(true)}
                          onMouseUp={() => setRecording(false)}
                          className={`p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white ${isRecording ? '!bg-red-100 !text-red-500 dark:!bg-red-900 dark:!text-red-400' : ''}`}
                          title="Enregistrer un message vocal"
                        >
                          <Mic className="h-5 w-5" />
                        </button>
                      </div>
                      <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="px-4 py-1.5 rounded-full bg-[#197ca8] hover:bg-[#1e90c3] text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        title="Envoyer le message"
                      >
                        <span>Envoyer</span>
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {showEmojiPicker && (
                    <div className="absolute bottom-24 right-4 z-10 shadow-lg rounded-lg">
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
          </div>
        </div>
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
