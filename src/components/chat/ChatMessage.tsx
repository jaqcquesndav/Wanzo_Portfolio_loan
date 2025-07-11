import type { Message, Contact } from '../../types/chat';

interface ChatMessageProps {
  message: Message;
  contacts: Contact[];
}

export function ChatMessage({ message, contacts }: ChatMessageProps) {
  const contact = contacts.find(c => c.id === message.sender);
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[80%] rounded-lg p-3
        ${isUser ? 'bg-[#197ca8] text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'}
      `}>
        {!isUser && (
          <div className="flex items-center space-x-2 mb-1">
            <span>{contact?.avatar}</span>
            <span className="text-sm font-medium">{contact?.name}</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span className="text-xs opacity-75 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
}