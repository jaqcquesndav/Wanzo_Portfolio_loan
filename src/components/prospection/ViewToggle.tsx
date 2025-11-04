import { List, Map } from 'lucide-react';
import { Button } from '../ui/Button';

interface ViewToggleProps {
  view: 'list' | 'map';
  onViewChange: (view: 'list' | 'map') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex space-x-2">
      <Button
        variant={view === 'list' ? 'primary' : 'outline'}
        onClick={() => onViewChange('list')}
        icon={<List className="h-4 w-4" />}
        aria-label="Vue en liste"
      />
      <Button
        variant={view === 'map' ? 'primary' : 'outline'}
        onClick={() => onViewChange('map')}
        icon={<Map className="h-4 w-4" />}
        aria-label="Vue carte"
      />
    </div>
  );
}