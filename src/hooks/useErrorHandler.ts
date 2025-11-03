// src/hooks/useErrorHandler.ts
import { useCallback } from 'react';
import { useErrorBoundary } from './useErrorBoundary';

interface AppError {
  id: string;
  message: string;
  type: 'network' | 'api' | 'rate_limit' | 'validation' | 'unknown';
  timestamp: number;
  details?: unknown;
  retryable?: boolean;
}

// Hook utilitaire pour créer et ajouter des erreurs
export function useErrorHandler() {
  const { addError } = useErrorBoundary();

  const handleError = useCallback((
    error: Error | string,
    type: AppError['type'] = 'unknown',
    retryable = false
  ) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Déterminer le type automatiquement si possible
    let detectedType = type;
    if (type === 'unknown') {
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('too many requests')) {
        detectedType = 'rate_limit';
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        detectedType = 'network';
      } else if (errorMessage.toLowerCase().includes('validation')) {
        detectedType = 'validation';
      }
    }

    const appError: AppError = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: errorMessage,
      type: detectedType,
      timestamp: Date.now(),
      details: typeof error === 'object' ? error : undefined,
      retryable
    };

    addError(appError);
    return appError;
  }, [addError]);

  return { handleError };
}