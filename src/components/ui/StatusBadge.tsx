// components/ui/StatusBadge.tsx
import { Badge } from './Badge';

type StatusType = 'active' | 'completed' | 'defaulted' | 'restructured' | 'suspended' | 'in_litigation';

interface StatusConfig {
  label: string;
  variant: 'success' | 'secondary' | 'danger' | 'warning';
}

// Configuration des status pour l'affichage
const statusConfig: Record<StatusType, StatusConfig> = {
  'active': { label: 'Actif', variant: 'success' },
  'completed': { label: 'Clôturé', variant: 'secondary' },
  'defaulted': { label: 'En défaut', variant: 'danger' },
  'restructured': { label: 'Restructuré', variant: 'warning' },
  'suspended': { label: 'Suspendu', variant: 'warning' },
  'in_litigation': { label: 'En contentieux', variant: 'danger' }
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' };
  
  return (
    <Badge 
      variant={config.variant}
      className={className}
    >
      {config.label}
    </Badge>
  );
}
