/**
 * Hook pour le préchargement des routes
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { routePrefetchService } from '../services/performance/routePrefetchService';

/**
 * Hook qui démarre le préchargement en arrière-plan après le premier rendu
 */
export function useRoutePrefetch() {
  const location = useLocation();

  useEffect(() => {
    // Démarrer le préchargement après un court délai (laisser la page actuelle se charger)
    const timer = setTimeout(() => {
      routePrefetchService.startBackgroundPreload();
    }, 2000); // Attendre 2 secondes pour que la page actuelle soit stable

    return () => clearTimeout(timer);
  }, []);

  // Précharger la prochaine route probable basée sur la navigation
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Préchargement intelligent basé sur le contexte actuel
    if (currentPath.includes('/traditional') || currentPath.includes('/islamic')) {
      // Précharger les pages liées au portefeuille
      routePrefetchService.preloadImmediate('/prospection');
      routePrefetchService.preloadImmediate('/central-risque');
    }
    
    if (currentPath.includes('/prospection')) {
      // Si on est en prospection, précharger company view
      routePrefetchService.preloadImmediate('/company');
    }
  }, [location.pathname]);
}

/**
 * Retourne une fonction pour précharger une route au survol
 * Usage: const prefetchOnHover = usePrefetchOnHover();
 *        <Link onMouseEnter={() => prefetchOnHover('/path')} />
 */
export function usePrefetchOnHover() {
  const prefetch = useCallback((path: string) => {
    if (!routePrefetchService.isPreloaded(path)) {
      // Utiliser requestIdleCallback pour ne pas bloquer les interactions
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          routePrefetchService.preloadImmediate(path);
        }, { timeout: 200 });
      } else {
        routePrefetchService.preloadImmediate(path);
      }
    }
  }, []);

  return prefetch;
}
