/**
 * Hooks pour utiliser le contexte de performance
 */

import { useContext } from 'react';
import { PerformanceContext } from '../contexts/performanceContextTypes';
import type { PerformanceContextType, NetworkQuality } from '../contexts/performanceContextTypes';

/**
 * Hook pour utiliser le contexte de performance
 */
export function usePerformance(): PerformanceContextType {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

/**
 * Hook simplifié pour vérifier si les animations sont activées
 */
export function useAnimationsEnabled(): boolean {
  const { settings } = usePerformance();
  return settings.enableAnimations;
}

/**
 * Hook pour la qualité réseau
 */
export function useNetworkQuality(): NetworkQuality {
  const { networkQuality } = usePerformance();
  return networkQuality;
}

/**
 * Hook pour vérifier si l'utilisateur est en ligne
 */
export function useIsOnline(): boolean {
  const { isOnline } = usePerformance();
  return isOnline;
}

/**
 * Hook pour obtenir la stratégie de chargement
 */
export function useLoadingStrategy() {
  const { settings, getLoadingDelay, shouldPreload } = usePerformance();
  return {
    enableAnimations: settings.enableAnimations,
    batchSize: settings.batchSize,
    timeout: settings.timeout,
    getLoadingDelay,
    shouldPreload,
  };
}
