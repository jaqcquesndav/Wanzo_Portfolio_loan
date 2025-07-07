import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Maximize2, Minimize2, Smile } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Form';
import { EmojiPicker } from './EmojiPicker';
import { useChatResize } from './hooks/useChatResize';
import { cn } from '../../utils/cn';

interface AIChatProps {
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'support';
  timestamp: string;
}

export function AIChat({ onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Bonjour ! Je suis votre assistant Wanzo. Comment puis-je vous aider ?',
      sender: 'assistant',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const {
    isFullscreen,
    toggleFullscreen,
    isDragging,
    handleMouseDown,
    windowSize,
    position
  } = useChatResize(chatRef);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simuler une réponse de l'assistant
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: 'Je comprends votre demande. Je vais vous aider avec cela.',
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputValue(prev => prev + emoji);
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
        'fixed z-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col',
        isDragging && 'cursor-grabbing'
      )}
    >
      {/* Header */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between p-4 border-b dark:border-gray-700 cursor-grab"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Assistant Wanzo
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-lg p-3',
                message.sender === 'user'
                  ? 'bg-primary text-white'
                  : message.sender === 'assistant'
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'bg-yellow-100 dark:bg-yellow-800'
              )}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Écrivez votre message..."
            className="pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              icon={<Smile className="h-5 w-5 text-gray-400" />}
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              disabled={!inputValue.trim()}
              icon={<Send className="h-5 w-5 text-primary" />}
            />
          </div>
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2">
              <EmojiPicker onSelect={handleEmojiSelect} />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}