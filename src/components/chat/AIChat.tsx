import React, { useState } from 'react';
import { ChatContainer } from './ChatContainer';

interface AIChatProps {
  onClose: () => void;
}

export function AIChat({ onClose }: AIChatProps) {
  const [mode, setMode] = useState<'floating' | 'fullscreen'>('floating');

  const handleModeChange = () => {
    setMode((prev) => (prev === 'floating' ? 'fullscreen' : 'floating'));
  };

  return (
    <ChatContainer
      mode={mode}
      onClose={onClose}
      onModeChange={handleModeChange}
    />
  );
}
