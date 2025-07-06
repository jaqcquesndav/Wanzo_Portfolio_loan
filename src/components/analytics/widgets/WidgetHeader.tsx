import React from 'react';
import { X, Settings } from 'lucide-react';
import { Button } from '../../ui/Button';

interface WidgetHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onRemove: () => void;
  onConfigure: () => void;
}

export function WidgetHeader({ title, onTitleChange, onRemove, onConfigure }: WidgetHeaderProps) {
  return (
    <div className="flex items-center justify-between p-2 border-b dark:border-gray-700">
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="text-sm font-medium bg-transparent border-none focus:outline-none"
      />
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onConfigure}
          icon={<Settings className="h-4 w-4" />}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          icon={<X className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}