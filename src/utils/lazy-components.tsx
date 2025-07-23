// src/utils/lazy-components.tsx
import { Suspense, lazy } from 'react';
import { AppLoading } from '../components/ui/AppLoading';

/**
 * Fonction qui crée un composant lazy avec un Suspense
 * Ce composant sera chargé uniquement lorsqu'il sera nécessaire
 */
export function createLazyComponent<P extends Record<string, unknown>>(path: string) {
  const LazyComp = lazy(() => import(/* @vite-ignore */ path));
  
  // Crée un composant qui enveloppe le composant lazy avec un Suspense
  const SuspendedComponent = (props: P) => (
    <Suspense fallback={<AppLoading message="Chargement du module..." />}>
      <LazyComp {...props} />
    </Suspense>
  );
  
  return SuspendedComponent;
}
