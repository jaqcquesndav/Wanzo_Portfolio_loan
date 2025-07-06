import React from 'react';
import { Button } from '../ui/Button';

const EMOJI_CATEGORIES = {
  'Smileys': ['😊', '😂', '🤔', '😅', '😍', '🙂', '😉', '😇'],
  'Gestes': ['👍', '👋', '🤝', '👏', '✌️', '🤞', '👌', '🤙'],
  'Objets': ['💼', '📊', '💰', '📈', '📉', '💳', '🏦', '💵']
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-2 w-64">
      {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
        <div key={category} className="mb-2">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 px-2">
            {category}
          </h4>
          <div className="grid grid-cols-8 gap-1">
            {emojis.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onSelect(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}