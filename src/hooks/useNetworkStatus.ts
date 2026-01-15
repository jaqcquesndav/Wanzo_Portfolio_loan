/**
 * Hook simplifié pour la qualité réseau
 * Fournit un accès direct aux informations réseau avec des helpers pratiques
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  networkQualityService, 
  type NetworkInfo, 
  type NetworkQuality 
} from '../services/performance/networkQualityService';

export interface NetworkStatus {
  // États de base
  quality: NetworkQuality;
  isOnline: boolean;
  isOffline: boolean;
  
  // Qualités spécifiques
  isExcellent: boolean;
  isGood: boolean;
  isFair: boolean;
  isPoor: boolean;
  
  // Informations détaillées
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  
  // Recommandations
  shouldReduceData: boolean;
  shouldDisableAnimations: boolean;
  shouldDeferLoading: boolean;
  
  // Helpers
  canLoadImages: boolean;
  canLoadVideos: boolean;
  canStreamAudio: boolean;
  recommendedBatchSize: number;
  recommendedTimeout: number;
}

/**
 * Hook pour accéder à la qualité réseau avec des helpers pratiques
 */
export function useNetworkStatus(): NetworkStatus {
  const [info, setInfo] = useState<NetworkInfo>(networkQualityService.getNetworkInfo());

  useEffect(() => {
    const unsubscribe = networkQualityService.subscribe(setInfo);
    return unsubscribe;
  }, []);

  const strategy = networkQualityService.getLoadingStrategy();

  return {
    // États de base
    quality: info.quality,
    isOnline: info.online,
    isOffline: !info.online,
    
    // Qualités spécifiques
    isExcellent: info.quality === 'excellent',
    isGood: info.quality === 'good',
    isFair: info.quality === 'fair',
    isPoor: info.quality === 'poor',
    
    // Informations détaillées
    effectiveType: info.effectiveType,
    downlink: info.downlink,
    rtt: info.rtt,
    saveData: info.saveData,
    
    // Recommandations
    shouldReduceData: info.quality === 'poor' || info.quality === 'offline' || info.saveData,
    shouldDisableAnimations: info.quality === 'poor' || info.quality === 'offline',
    shouldDeferLoading: info.quality !== 'excellent' && info.quality !== 'good',
    
    // Helpers pour le contenu
    canLoadImages: strategy.preloadImages && info.online,
    canLoadVideos: (info.quality === 'excellent' || info.quality === 'good') && info.online,
    canStreamAudio: info.quality !== 'offline' && info.quality !== 'poor',
    recommendedBatchSize: strategy.batchSize,
    recommendedTimeout: strategy.timeout,
  };
}

/**
 * Hook pour exécuter du code conditionnellement basé sur la qualité réseau
 */
export function useConditionalLoad<T>(
  loadFn: () => Promise<T>,
  options: {
    minQuality?: NetworkQuality;
    fallback?: T;
    enabled?: boolean;
  } = {}
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  canLoad: boolean;
  retry: () => void;
} {
  const { minQuality = 'poor', fallback = null, enabled = true } = options;
  const { quality, isOnline } = useNetworkStatus();
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const qualityOrder: Record<NetworkQuality, number> = {
    excellent: 4,
    good: 3,
    fair: 2,
    poor: 1,
    offline: 0,
  };

  const canLoad = isOnline && qualityOrder[quality] >= qualityOrder[minQuality];

  const load = useCallback(async () => {
    if (!enabled || !canLoad) {
      if (fallback !== null) setData(fallback);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await loadFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      if (fallback !== null) setData(fallback);
    } finally {
      setIsLoading(false);
    }
  }, [loadFn, enabled, canLoad, fallback]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    isLoading,
    error,
    canLoad,
    retry: load,
  };
}

/**
 * Hook pour adapter le chargement à la qualité réseau
 */
export function useAdaptiveLoading() {
  const status = useNetworkStatus();
  
  const getDelay = useCallback((priority: 'critical' | 'high' | 'medium' | 'low'): number => {
    const delays: Record<NetworkQuality, Record<string, number>> = {
      excellent: { critical: 0, high: 50, medium: 100, low: 200 },
      good: { critical: 0, high: 100, medium: 200, low: 400 },
      fair: { critical: 0, high: 200, medium: 400, low: 800 },
      poor: { critical: 0, high: 300, medium: 600, low: 1200 },
      offline: { critical: 0, high: 0, medium: 0, low: 0 },
    };
    return delays[status.quality][priority];
  }, [status.quality]);

  const getImageQuality = useCallback((): 'high' | 'medium' | 'low' | 'none' => {
    if (status.isOffline) return 'none';
    if (status.isPoor || status.saveData) return 'low';
    if (status.isFair) return 'medium';
    return 'high';
  }, [status]);

  const shouldLoadResource = useCallback((
    resourceType: 'image' | 'video' | 'audio' | 'data',
    size: 'small' | 'medium' | 'large' = 'medium'
  ): boolean => {
    if (status.isOffline) return false;
    
    const canLoad: Record<NetworkQuality, Record<string, Record<string, boolean>>> = {
      excellent: {
        image: { small: true, medium: true, large: true },
        video: { small: true, medium: true, large: true },
        audio: { small: true, medium: true, large: true },
        data: { small: true, medium: true, large: true },
      },
      good: {
        image: { small: true, medium: true, large: true },
        video: { small: true, medium: true, large: false },
        audio: { small: true, medium: true, large: true },
        data: { small: true, medium: true, large: true },
      },
      fair: {
        image: { small: true, medium: true, large: false },
        video: { small: true, medium: false, large: false },
        audio: { small: true, medium: true, large: false },
        data: { small: true, medium: true, large: false },
      },
      poor: {
        image: { small: true, medium: false, large: false },
        video: { small: false, medium: false, large: false },
        audio: { small: true, medium: false, large: false },
        data: { small: true, medium: false, large: false },
      },
      offline: {
        image: { small: false, medium: false, large: false },
        video: { small: false, medium: false, large: false },
        audio: { small: false, medium: false, large: false },
        data: { small: false, medium: false, large: false },
      },
    };
    
    return canLoad[status.quality][resourceType][size];
  }, [status.quality, status.isOffline]);

  return {
    ...status,
    getDelay,
    getImageQuality,
    shouldLoadResource,
  };
}
