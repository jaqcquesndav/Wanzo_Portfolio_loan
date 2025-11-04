import { WifiOff, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingCount: number;
  className?: string;
}

export function OfflineIndicator({ isOnline, pendingCount, className = '' }: OfflineIndicatorProps) {
  if (isOnline && pendingCount === 0) {
    return null; // Rien à afficher si tout va bien
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!isOnline && (
        <Badge variant="warning" className="flex items-center gap-1">
          <WifiOff className="h-3 w-3" />
          Hors ligne
        </Badge>
      )}
      
      {pendingCount > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {pendingCount} formulaire(s) en attente
        </Badge>
      )}
      
      {isOnline && pendingCount > 0 && (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Synchronisation en cours...
        </Badge>
      )}
    </div>
  );
}