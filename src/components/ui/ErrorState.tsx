// src/components/ui/ErrorState.tsx
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function ErrorState({
  error,
  onRetry,
  className = '',
  size = 'md',
  showDetails = false
}: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const is429Error = errorMessage.toLowerCase().includes('too many requests') || 
                     errorMessage.includes('429');
  const isNetworkError = errorMessage.toLowerCase().includes('network') ||
                        errorMessage.toLowerCase().includes('connexion');

  const sizeClasses = {
    sm: {
      container: 'py-6',
      icon: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-sm'
    },
    md: {
      container: 'py-8',
      icon: 'h-12 w-12',
      title: 'text-xl',
      description: 'text-base'
    },
    lg: {
      container: 'py-12',
      icon: 'h-16 w-16',
      title: 'text-2xl',
      description: 'text-lg'
    }
  };

  const classes = sizeClasses[size];

  const getErrorInfo = () => {
    if (is429Error) {
      return {
        icon: RefreshCw,
        title: 'Trop de requêtes',
        description: 'Veuillez patienter quelques instants avant de réessayer.',
        color: 'text-yellow-500'
      };
    }

    if (isNetworkError) {
      return {
        icon: WifiOff,
        title: 'Problème de connexion',
        description: 'Vérifiez votre connexion internet et réessayez.',
        color: 'text-red-500'
      };
    }

    return {
      icon: AlertTriangle,
      title: 'Une erreur est survenue',
      description: 'Une erreur inattendue s\'est produite.',
      color: 'text-red-500'
    };
  };

  const errorInfo = getErrorInfo();
  const Icon = errorInfo.icon;

  return (
    <div className={`text-center ${classes.container} ${className}`}>
      <Icon className={`${classes.icon} ${errorInfo.color} mx-auto mb-4`} />
      <h3 className={`${classes.title} font-semibold text-gray-900 dark:text-white mb-2`}>
        {errorInfo.title}
      </h3>
      <p className={`${classes.description} text-gray-500 dark:text-gray-400 mb-4`}>
        {errorInfo.description}
      </p>
      
      {showDetails && (
        <details className="mb-4">
          <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-600">
            Détails techniques
          </summary>
          <p className="mt-2 text-xs text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {errorMessage}
          </p>
        </details>
      )}

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="secondary"
          size={size === 'sm' ? 'sm' : 'md'}
          className="inline-flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      )}
    </div>
  );
}