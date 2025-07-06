import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Maximize2, Minimize2, Smile } from 'lucide-react';
import { Button } from '../ui/Button';
import { EmojiPicker } from './EmojiPicker';
import { useChatResize } from './hooks/useChatResize';
import { cn } from '../../utils/cn';

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const {
    isFullscreen,
    toggleFullscreen,
    isDragging,
    handleMouseDown,
    windowSize,
    setWindowSize,
    position
  } = useChatResize(chatRef);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessage('');
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div
      ref={chatRef}
      style={{
        width: isFullscreen ? '100%' : windowSize.width,
        height: isFullscreen ? 'calc(100vh - 64px)' : windowSize.height,
        top: isFullscreen ? '64px' : position.y,
        right: isFullscreen ? 0 : position.x
      }}
      className={cn(
        'fixed z-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl',
        isDragging && 'cursor-grabbing'
      )}
    >
      {/* Barre de titre avec poignée de redimensionnement */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between p-4 border-b dark:border-gray-700 cursor-grab"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Assistant FinanceFlow
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFullscreen()}
            icon={isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            aria-label={isFullscreen ? 'Réduire' : 'Agrandir'}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="h-5 w-5" />}
            aria-label="Fermer"
          />
        </div>
      </div>
      
      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 8rem)' }}>
        <div className="bg-primary-light dark:bg-primary-dark rounded-lg p-3">
          <p className="text-sm text-gray-800 dark:text-white">
            Bonjour ! Comment puis-je vous aider avec la gestion de votre portefeuille ?
          </p>
        </div>
      </div>

      {/* Zone de saisie */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Votre message..."
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-primary pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              icon={<Smile className="h-5 w-5 text-gray-400" />}
            />
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2">
                <EmojiPicker onSelect={handleEmojiSelect} />
              </div>
            )}
          </div>
          <Button
            type="submit"
            icon={<Send className="h-5 w-5" />}
            aria-label="Envoyer"
            disabled={!message.trim()}
          />
        </form>
      </div>
    </div>
  );
}