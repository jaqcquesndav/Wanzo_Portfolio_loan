// src/utils/withSuspense.tsx
import { Suspense } from 'react';
import { AppLoading } from '../components/ui/AppLoading';

/**
 * HOC pour ajouter Suspense à n'importe quel composant lazy
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withSuspense(Component: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function WithSuspense(props: any) {
    return (
      <Suspense fallback={<AppLoading message="Chargement du module..." />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
