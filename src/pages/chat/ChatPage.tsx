import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatContainer } from '../../components/chat/ChatContainer';
import { useChatStore } from '../../hooks/useChatStore';

export function ChatPage() {
  const navigate = useNavigate();
  const { setFloating, setOpen } = useChatStore();

  const handleClose = () => {
    setFloating(true);
    setOpen(false);
    navigate(-1);
  };

  const handleModeChange = () => {
    setFloating(true);
    setOpen(true);
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      <ChatContainer
        mode="fullscreen"
        onClose={handleClose}
        onModeChange={handleModeChange}
      />
    </div>
  );
}