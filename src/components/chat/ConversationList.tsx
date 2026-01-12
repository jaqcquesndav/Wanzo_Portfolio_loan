import { MessageSquare, Trash2, Plus, Clock, ChevronRight } from 'lucide-react';
import type { Conversation } from '../../types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

// Formatage des dates relatives conviviales
const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNew
}: ConversationListProps) {
  // Tri par date décroissante (plus récent en premier)
  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header avec bouton nouvelle conversation - fixé en haut */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Nouvelle conversation</span>
        </button>
      </div>
      
      {/* Liste des conversations - scrollable, prend tout l'espace restant */}
      <div className="flex-1 overflow-y-auto min-h-0 py-2">
        {sortedConversations.length === 0 ? (
          /* État vide élégant */
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Aucune conversation</p>
            <p className="text-xs mt-1 opacity-75">Commencez par poser une question à ADHA</p>
          </div>
        ) : (
          sortedConversations.map(conversation => (
            <div
              key={conversation.id}
              className={`
                group relative mx-2 my-1 px-3 py-3 rounded-xl cursor-pointer transition-all
                ${activeId === conversation.id 
                  ? 'bg-primary/10 border border-primary/20 dark:bg-primary/20' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-transparent'
                }
              `}
              onClick={() => onSelect(conversation.id)}
            >
              <div className="flex items-start space-x-3">
                {/* Icône */}
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${activeId === conversation.id 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                  }
                `}>
                  <MessageSquare className="h-4 w-4" />
                </div>
                
                {/* Contenu */}
                <div className="flex-1 min-w-0 pr-6">
                  <p className={`
                    text-sm font-medium truncate
                    ${activeId === conversation.id 
                      ? 'text-primary' 
                      : 'text-gray-900 dark:text-gray-100'
                    }
                  `}>
                    {conversation.title || 'Nouvelle conversation'}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(conversation.timestamp)}
                    </span>
                    {conversation.messages && conversation.messages.length > 0 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        • {conversation.messages.length} msg
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Indicateur actif */}
                {activeId === conversation.id && (
                  <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
              
              {/* Bouton supprimer (visible au hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conversation.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-all"
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}