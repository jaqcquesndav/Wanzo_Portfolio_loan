import { MessageSquare, Trash2, Plus } from 'lucide-react';
import type { Conversation } from '../../types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNew
}: ConversationListProps) {
  return (
    <div className="border-r border-gray-200 w-64 flex flex-col">
      <div className="p-4 border-b">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#197ca8] text-white rounded-lg hover:bg-[#1e90c3]"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle conversation</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.map(conversation => (
          <div
            key={conversation.id}
            className={`
              flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer
              ${activeId === conversation.id ? 'bg-gray-50' : ''}
            `}
            onClick={() => onSelect(conversation.id)}
          >
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {conversation.title}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(conversation.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conversation.id);
              }}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}