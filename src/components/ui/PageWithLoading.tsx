import { ReactNode } from 'react';
import { LoadingScreen } from './LoadingScreen';
import { cn } from '../../utils/cn';

interface PageWithLoadingProps {
  children: ReactNode;
  isLoading: boolean;
  loadingMessage?: string;
  className?: string;
  showOverlay?: boolean;
}

/**
 * Composant wrapper pour les pages avec état de chargement
 */
export function PageWithLoading({
  children,
  isLoading,
  loadingMessage = "Chargement...",
  className = '',
  showOverlay = true
}: PageWithLoadingProps) {
  if (isLoading) {
    return (
      <LoadingScreen 
        message={loadingMessage}
        overlay={showOverlay}
        className={className}
      />
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {children}
    </div>
  );
}

export default PageWithLoading;
