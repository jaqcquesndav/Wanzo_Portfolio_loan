/**
 * Performance Provider - Contexte global pour la performance
 * Gère la qualité réseau, les animations, et le chargement adaptatif
 */

import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { networkQualityService, type NetworkInfo } from '../services/performance/networkQualityService';
import { 
  PerformanceContext, 
  type PerformanceSettings, 
  type PerformanceContextType,
  type NetworkQuality,
} from './performanceContextTypes';

// Re-export types for convenience
export type { PerformanceSettings, PerformanceContextType, NetworkQuality };
export { PerformanceContext };

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(
    networkQualityService.getNetworkInfo()
  );
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [showConnectionWarning, setShowConnectionWarning] = useState(false);

  // Écouter les changements de réseau
  useEffect(() => {
    const unsubscribe = networkQualityService.subscribe((info) => {
      setNetworkInfo(info);
      
      // Afficher un warning si la connexion devient mauvaise
      if (info.quality === 'poor' || !info.online) {
        setShowConnectionWarning(true);
        // Auto-hide après 5 secondes
        setTimeout(() => setShowConnectionWarning(false), 5000);
      }
    });

    return unsubscribe;
  }, []);

  // Détecter les préférences système de reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Détecter les préférences de contraste
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Calculer les settings basés sur le réseau et les préférences
  const settings = useMemo<PerformanceSettings>(() => {
    const strategy = networkQualityService.getLoadingStrategy();
    
    return {
      enableAnimations: strategy.enableAnimations && !reducedMotion,
      enableTransitions: strategy.enableAnimations && !reducedMotion,
      preloadImages: strategy.preloadImages,
      reducedMotion,
      highContrast,
      batchSize: strategy.batchSize,
      timeout: strategy.timeout,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkInfo, reducedMotion, highContrast]);

  // Appliquer les classes CSS globales basées sur les settings
  useEffect(() => {
    const root = document.documentElement;
    
    if (!settings.enableAnimations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [settings]);

  const getLoadingDelay = useCallback((priority: 'critical' | 'high' | 'medium' | 'low'): number => {
    const quality = networkInfo.quality as NetworkQuality;
    const delays: Record<NetworkQuality, Record<string, number>> = {
      excellent: { critical: 0, high: 50, medium: 100, low: 200 },
      good: { critical: 0, high: 100, medium: 200, low: 400 },
      fair: { critical: 0, high: 150, medium: 350, low: 700 },
      poor: { critical: 0, high: 200, medium: 500, low: 1000 },
      offline: { critical: 0, high: 0, medium: 0, low: 0 },
    };
    
    return delays[quality][priority];
  }, [networkInfo.quality]);

  const shouldPreload = useCallback((): boolean => {
    return settings.preloadImages && networkInfo.online;
  }, [settings.preloadImages, networkInfo.online]);

  const value = useMemo<PerformanceContextType>(() => ({
    networkInfo,
    networkQuality: networkInfo.quality,
    isOnline: networkInfo.online,
    settings,
    setReducedMotion,
    setHighContrast,
    getLoadingDelay,
    shouldPreload,
    showConnectionWarning,
  }), [
    networkInfo,
    settings,
    getLoadingDelay,
    shouldPreload,
    showConnectionWarning,
  ]);

  return (
    <PerformanceContext.Provider value={value}>
      {children}
      
      {/* Connection Warning Banner */}
      {showConnectionWarning && (
        <ConnectionWarningBanner 
          quality={networkInfo.quality}
          isOnline={networkInfo.online}
          onDismiss={() => setShowConnectionWarning(false)}
        />
      )}
    </PerformanceContext.Provider>
  );
}

/**
 * Composant de warning de connexion
 */
function ConnectionWarningBanner({ 
  quality, 
  isOnline, 
  onDismiss 
}: { 
  quality: NetworkQuality;
  isOnline: boolean;
  onDismiss: () => void;
}) {
  const getMessage = () => {
    if (!isOnline) {
      return {
        icon: '📴',
        title: 'Hors ligne',
        message: 'Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.',
        color: 'bg-red-500',
      };
    }
    if (quality === 'poor') {
      return {
        icon: '📶',
        title: 'Connexion lente',
        message: 'Votre connexion est lente. Le chargement peut prendre plus de temps.',
        color: 'bg-yellow-500',
      };
    }
    return null;
  };

  const info = getMessage();
  if (!info) return null;

  return (
    <div className={`
      fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96
      ${info.color} text-white
      rounded-lg shadow-lg p-4
      flex items-start gap-3
      animate-slideUp z-50
    `}>
      <span className="text-2xl">{info.icon}</span>
      <div className="flex-1">
        <h4 className="font-semibold">{info.title}</h4>
        <p className="text-sm opacity-90">{info.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-white/80 hover:text-white transition-colors"
        aria-label="Fermer"
      >
        ✕
      </button>
    </div>
  );
}
