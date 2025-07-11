import { useState, useEffect } from 'react';
import type { Message } from '../types/chat';

// Store key pour le localStorage
const CHAT_HISTORY_KEY = 'chat_history';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Charger l'historique au démarrage
  useEffect(() => {
    const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
    } else {
      // Message initial si pas d'historique
      const initialMessage: Message = {
        id: '1',
        sender: 'bot',
        content: "Bonjour ! Je suis Adha, votre assistant. Comment puis-je vous aider aujourd'hui ?",
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0
      };
      setMessages([initialMessage]);
    }
  }, []);

  // Sauvegarder l'historique à chaque modification
  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  const addMessage = async (content: string, type: 'user' | 'bot' = 'user', attachment?: Message['attachment']) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: type,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      attachment
    };

    setMessages(prev => [...prev, newMessage]);

    if (type === 'user') {
      await simulateBotResponse();
    }
  };

  const simulateBotResponse = async () => {
    setIsTyping(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await addMessage("Je comprends votre demande. Voici ma réponse...", 'bot');
    } finally {
      setIsTyping(false);
    }
  };

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    ));
  };

  const toggleLike = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, likes: (msg.likes || 0) + 1 } : msg
    ));
  };

  const toggleDislike = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, dislikes: (msg.dislikes || 0) + 1 } : msg
    ));
  };

  return {
    messages,
    isTyping,
    isRecording,
    setIsRecording,
    addMessage,
    updateMessage,
    toggleLike,
    toggleDislike
  };
}