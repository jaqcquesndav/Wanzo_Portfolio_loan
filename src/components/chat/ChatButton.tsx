import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * Bouton de chat flottant qui ouvre la fenêtre de chat
 */
export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // À implémenter: ouvrir une fenêtre de chat réelle
    console.log('Chat toggled:', isOpen ? 'closed' : 'opened');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleChat}
      icon={<MessageSquare className="h-5 w-5" />}
      aria-label="Chat avec l'assistant"
      className="!px-2 sm:!px-3"
    />
  );
}
