import { useState } from 'react';
import { User, Bot, Copy, ThumbsUp, ThumbsDown, Check, Pencil, FileText, Image, Download } from 'lucide-react';
import { MessageContent } from './MessageContent';
import type { Message, Contact } from '../../types/chat';

interface ChatMessageProps {
  message: Message;
  contacts?: Contact[];
  isStreaming?: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
}

export function ChatMessage({ 
  message, 
  contacts = [],
  isStreaming = false,
  onEdit,
  onLike,
  onDislike 
}: ChatMessageProps) {
  const contact = contacts.find(c => c.id === message.sender);
  const isUser = message.sender === 'user';
  const isBot = message.sender === 'bot' || message.sender === 'assistant';
  
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div 
      className="group relative w-full"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => !isEditing && setShowActions(false)}
    >
      <div className="flex items-start space-x-3 py-2.5 px-3 -mx-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        {/* Avatar toujours à gauche - Style Notion */}
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
          ${isUser 
            ? 'bg-primary/10' 
            : 'bg-gradient-to-br from-primary/20 to-primary/10'
          }
        `}>
          {isUser ? (
            <User className="h-4 w-4 text-primary" />
          ) : (
            <Bot className="h-4 w-4 text-primary" />
          )}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {/* Header avec nom et timestamp */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {isUser ? 'Vous' : (contact?.name || 'ADHA')}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {isStreaming && (
              <span className="text-xs text-primary animate-pulse flex items-center">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-1 animate-pulse" />
                En cours...
              </span>
            )}
          </div>

          {/* Contenu du message - Mode édition ou affichage */}
          {isEditing && isUser ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCancelEdit();
                  }
                }}
                autoFocus
                className="
                  w-full min-h-[60px] p-3 
                  bg-white dark:bg-gray-800 
                  border-0 border-l-2 border-primary/30
                  text-sm leading-relaxed text-gray-900 dark:text-gray-100
                  resize-none rounded-r-lg
                  focus:outline-none focus:border-primary
                  placeholder:text-gray-400
                "
              />
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="hidden sm:inline">⌘+Enter sauvegarder</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Esc annuler</span>
                <div className="flex-1" />
                <button 
                  onClick={handleCancelEdit} 
                  className="px-2.5 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
              <MessageContent 
                content={message.content}
                isStreaming={isStreaming && isBot}
                onEdit={isBot && onEdit ? (newContent) => onEdit(message.id, newContent) : undefined}
              />
            </div>
          )}

          {/* Pièce jointe - style amélioré */}
          {message.attachment && (
            <div className="mt-3 inline-flex items-center space-x-3 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                {message.attachment.type?.startsWith('image/') ? (
                  <Image className="h-4 w-4 text-gray-500" />
                ) : (
                  <FileText className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                  {message.attachment.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {message.attachment.type || 'Fichier'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (message.attachment?.content) {
                    const link = document.createElement('a');
                    link.href = message.attachment.content;
                    link.download = message.attachment.name;
                    link.click();
                  }
                }}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Télécharger"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Actions au hover */}
        <div className={`
          flex items-center space-x-0.5 transition-opacity duration-150
          ${showActions && !isStreaming && !isEditing ? 'opacity-100' : 'opacity-0'}
        `}>
          {/* Éditer (utilisateur uniquement) */}
          {isUser && !isEditing && onEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Modifier"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Copier */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title={copied ? 'Copié !' : 'Copier'}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          {/* Like/Dislike (bot uniquement) */}
          {isBot && (
            <>
              <button
                onClick={() => onLike?.(message.id)}
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  (message.likes ?? 0) > 0 ? 'text-green-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Utile"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDislike?.(message.id)}
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  (message.dislikes ?? 0) > 0 ? 'text-red-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Pas utile"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}