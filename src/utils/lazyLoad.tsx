import React, { ComponentType, Suspense } from 'react';
import { LoadingScreen } from '../components/ui/LoadingScreen';

/**
 * HOC pour le lazy loading des composants React
 * Cette version utilise des types plus précis pour éviter les erreurs TypeScript
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withLazyLoading<C extends ComponentType<any>>(
  LazyComponent: React.LazyExoticComponent<C>
): (props: React.ComponentProps<C>) => JSX.Element {
  return (props: React.ComponentProps<C>) => (
    <Suspense fallback={<LoadingScreen message="Chargement du module..." />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}
