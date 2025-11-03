// src/hooks/useErrorBoundary.ts
import { useContext } from 'react';
import { ErrorBoundaryContext } from '../contexts/ErrorBoundaryContext';

export function useErrorBoundary() {
  const context = useContext(ErrorBoundaryContext);
  if (!context) {
    throw new Error('useErrorBoundary must be used within ErrorBoundaryProvider');
  }
  return context;
}