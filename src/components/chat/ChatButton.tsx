import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { ChatWindow } from './ChatWindow';

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        icon={<MessageCircle className="h-5 w-5" />}
        aria-label="Assistant virtuel"
      />
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
}

export default ChatButton;