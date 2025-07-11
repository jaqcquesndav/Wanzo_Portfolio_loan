import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatContainer } from './ChatContainer';
import { useChatStore } from '../../hooks/useChatStore';

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const navigate = useNavigate();
  const { setFloating, setOpen } = useChatStore();

  const handleModeChange = () => {
    onClose(); // Ferme d'abord la fenêtre flottante
    setFloating(false);
    setOpen(false);
    navigate('/chat');
  };

  return (
    <div className="fixed z-50">
      <ChatContainer 
        mode="floating"
        onClose={onClose}
        onModeChange={handleModeChange}
      />
    </div>
  );
}