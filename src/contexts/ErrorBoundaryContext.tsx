// src/contexts/ErrorBoundaryContext.tsx
import { createContext, useState, useCallback, ReactNode } from 'react';

interface AppError {
  id: string;
  message: string;
  type: 'network' | 'api' | 'rate_limit' | 'validation' | 'unknown';
  timestamp: number;
  details?: unknown;
  retryable?: boolean;
}

interface ErrorBoundaryContextType {
  errors: AppError[];
  addError: (error: AppError) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  hasErrors: boolean;
  getRateLimitErrors: () => AppError[];
  getNetworkErrors: () => AppError[];
}

const ErrorBoundaryContext = createContext<ErrorBoundaryContextType | null>(null);

export { ErrorBoundaryContext };

interface ErrorBoundaryProviderProps {
  children: ReactNode;
  maxErrors?: number;
}

export function ErrorBoundaryProvider({ 
  children, 
  maxErrors = 10 
}: ErrorBoundaryProviderProps) {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = useCallback((error: AppError) => {
    setErrors(prev => {
      // Éviter les doublons
      const exists = prev.some(e => 
        e.message === error.message && 
        e.type === error.type &&
        Date.now() - e.timestamp < 5000 // 5 secondes
      );
      
      if (exists) return prev;

      // Limiter le nombre d'erreurs
      const newErrors = [error, ...prev.slice(0, maxErrors - 1)];
      return newErrors;
    });
  }, [maxErrors]);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getRateLimitErrors = useCallback(() => {
    return errors.filter(error => error.type === 'rate_limit');
  }, [errors]);

  const getNetworkErrors = useCallback(() => {
    return errors.filter(error => error.type === 'network');
  }, [errors]);

  const contextValue: ErrorBoundaryContextType = {
    errors,
    addError,
    removeError,
    clearErrors,
    hasErrors: errors.length > 0,
    getRateLimitErrors,
    getNetworkErrors
  };

  return (
    <ErrorBoundaryContext.Provider value={contextValue}>
      {children}
    </ErrorBoundaryContext.Provider>
  );
}