import React from 'react';
import { Grid, List } from 'lucide-react';
import { Button } from '../ui/Button';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex space-x-2">
      <Button
        variant={view === 'grid' ? 'primary' : 'outline'}
        onClick={() => onViewChange('grid')}
        icon={<Grid className="h-4 w-4" />}
        aria-label="Vue en grille"
      />
      <Button
        variant={view === 'list' ? 'primary' : 'outline'}
        onClick={() => onViewChange('list')}
        icon={<List className="h-4 w-4" />}
        aria-label="Vue en liste"
      />
    </div>
  );
}