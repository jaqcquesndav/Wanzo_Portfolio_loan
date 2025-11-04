// src/components/ui/SmartEmptyState.tsx
import { LucideIcon } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { useConnectivity } from '../../hooks/useConnectivity';
import { useNotification } from '../../contexts/useNotification';
import { 
  Database, 
  UserPlus, 
  WifiOff, 
  AlertTriangle, 
  RefreshCw,
  FileText,
  CreditCard,
  Users
} from 'lucide-react';

export type EmptyStateType = 
  | 'new_user' 
  | 'no_data' 
  | 'offline' 
  | 'error' 
  | 'loading' 
  | 'no_portfolios'
  | 'no_contracts'
  | 'no_requests'
  | 'no_users';

interface SmartEmptyStateProps {
  type: EmptyStateType;
  error?: Error | null;
  onRetry?: () => void;
  onCreate?: () => void;
  customConfig?: {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    actionLabel?: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SmartEmptyState({
  type,
  error,
  onRetry,
  onCreate,
  customConfig,
  className = '',
  size = 'md'
}: SmartEmptyStateProps) {
  const { isOnline } = useConnectivity();
  const { showNotification } = useNotification();

  // Configurations par défaut pour chaque type
  const configs = {
    new_user: {
      icon: UserPlus,
      title: 'Bienvenue dans votre espace !',
      description: 'Commencez par créer votre premier portefeuille ou importer vos données existantes.',
      actionLabel: 'Créer mon premier portefeuille',
      action: onCreate
    },
    no_data: {
      icon: Database,
      title: 'Aucune donnée disponible',
      description: 'Les données apparaîtront ici une fois que vous aurez effectué vos premières opérations.',
      actionLabel: 'Actualiser',
      action: onRetry
    },
    offline: {
      icon: WifiOff,
      title: 'Mode hors ligne',
      description: 'Vous êtes actuellement hors ligne. Certaines données peuvent ne pas être à jour.',
      actionLabel: 'Utiliser les données locales',
      action: () => {
        showNotification('Utilisation des données locales', 'info');
        onRetry?.();
      }
    },
    error: {
      icon: AlertTriangle,
      title: 'Erreur de chargement',
      description: 'Une erreur est survenue lors du chargement des données. Veuillez réessayer.',
      actionLabel: 'Réessayer',
      action: onRetry
    },
    loading: {
      icon: RefreshCw,
      title: 'Chargement en cours...',
      description: 'Veuillez patienter pendant le chargement des données.',
      actionLabel: undefined,
      action: undefined
    },
    no_portfolios: {
      icon: CreditCard,
      title: 'Aucun portefeuille',
      description: 'Vous n\'avez pas encore créé de portefeuille. Créez votre premier portefeuille pour commencer.',
      actionLabel: 'Créer un portefeuille',
      action: onCreate
    },
    no_contracts: {
      icon: FileText,
      title: 'Aucun contrat',
      description: 'Aucun contrat n\'a été créé pour ce portefeuille. Les contrats apparaîtront ici.',
      actionLabel: 'Créer un contrat',
      action: onCreate
    },
    no_requests: {
      icon: FileText,
      title: 'Aucune demande',
      description: 'Aucune demande de crédit n\'a été soumise. Les nouvelles demandes apparaîtront ici.',
      actionLabel: 'Nouvelle demande',
      action: onCreate
    },
    no_users: {
      icon: Users,
      title: 'Aucun utilisateur',
      description: 'Aucun utilisateur n\'a été ajouté au système. Invitez des utilisateurs pour commencer.',
      actionLabel: 'Inviter un utilisateur',
      action: onCreate
    }
  };

  // Déterminer le type d'état à afficher
  let finalType = type;
  
  // Si offline, toujours montrer l'état offline
  if (!isOnline && type !== 'loading') {
    finalType = 'offline';
  }
  
  // Si erreur, montrer l'état d'erreur
  if (error && type !== 'loading') {
    finalType = 'error';
  }

  const config = configs[finalType];
  const mergedConfig = { ...config, ...customConfig };

  // Pour l'état d'erreur, utiliser ErrorState
  if (finalType === 'error' && error) {
    return (
      <ErrorState
        error={error}
        onRetry={onRetry}
        size={size}
        className={className}
      />
    );
  }

  // Pour l'état loading, pas d'action
  const action = finalType === 'loading' ? undefined : (
    mergedConfig.action && mergedConfig.actionLabel ? {
      label: mergedConfig.actionLabel,
      onClick: mergedConfig.action,
      variant: finalType === 'new_user' || finalType.startsWith('no_') ? 'primary' as const : 'secondary' as const
    } : undefined
  );

  return (
    <EmptyState
      icon={mergedConfig.icon}
      title={mergedConfig.title}
      description={mergedConfig.description}
      action={action}
      size={size}
      className={className}
    />
  );
}