import React from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const professionalEmojis = [
    '👍', '👋', '✅', '❌', '⚠️', '📊', '📈', '📉', '💰', '📝',
    '📅', '⏰', '✉️', '📎', '🔍', '💡', '🎯', '🔔', '⭐', '🤝'
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1">
      {professionalEmojis.map(emoji => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center text-lg"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}