// src/components/ui/GlobalErrorDisplay.tsx
import { X, AlertTriangle, Wifi, Clock, RefreshCw } from 'lucide-react';
import { useErrorBoundary } from '../../hooks/useErrorBoundary';
import { Button } from './Button';

export function GlobalErrorDisplay() {
  const { errors, removeError, clearErrors } = useErrorBoundary();

  if (errors.length === 0) return null;

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'network':
        return Wifi;
      case 'rate_limit':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const getErrorColor = (type: string) => {
    switch (type) {
      case 'rate_limit':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'network':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'validation':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  // Grouper les erreurs par type
  const groupedErrors = errors.reduce((acc, error) => {
    if (!acc[error.type]) {
      acc[error.type] = [];
    }
    acc[error.type].push(error);
    return acc;
  }, {} as Record<string, typeof errors>);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {Object.entries(groupedErrors).map(([type, typeErrors]) => {
        const Icon = getErrorIcon(type);
        const colorClass = getErrorColor(type);
        const latestError = typeErrors[0];
        const count = typeErrors.length;

        return (
          <div
            key={type}
            className={`p-4 rounded-lg border shadow-lg ${colorClass}`}
          >
            <div className="flex items-start">
              <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    {type === 'rate_limit' && 'Limite de requêtes atteinte'}
                    {type === 'network' && 'Problème de connexion'}
                    {type === 'validation' && 'Erreur de validation'}
                    {type === 'api' && 'Erreur de l\'API'}
                    {type === 'unknown' && 'Erreur inattendue'}
                    {count > 1 && ` (${count})`}
                  </h4>
                  
                  <button
                    onClick={() => typeErrors.forEach(error => removeError(error.id))}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <p className="mt-1 text-sm opacity-90">
                  {latestError.message}
                </p>
                
                {latestError.retryable && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // TODO: Implémenter le retry
                        removeError(latestError.id);
                      }}
                      className="text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Réessayer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {errors.length > 1 && (
        <div className="text-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={clearErrors}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Effacer toutes les erreurs
          </Button>
        </div>
      )}
    </div>
  );
}