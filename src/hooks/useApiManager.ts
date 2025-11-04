/**
 * Hook global pour gérer l'état des appels API et éviter la surcharge
 */

import { useState, useEffect, useCallback } from 'react';
import { apiCoordinator } from '../services/api/apiCoordinator';

interface ApiState {
  isRateLimited: boolean;
  queueLength: number;
  concurrentCalls: number;
  nextAvailableTime: number;
  lastError: string | null;
}

interface UseApiManagerOptions {
  maxRetries?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  cacheTime?: number; // Temps en ms pour considérer une donnée comme fraîche
}

export function useApiManager(options: UseApiManagerOptions = {}) {
  const [apiState, setApiState] = useState<ApiState>({
    isRateLimited: false,
    queueLength: 0,
    concurrentCalls: 0,
    nextAvailableTime: 0,
    lastError: null
  });

  // Mettre à jour l'état toutes les secondes
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = apiCoordinator.getStats();
      setApiState(prev => ({
        ...prev,
        isRateLimited: stats.isRateLimited,
        queueLength: stats.queueLength,
        concurrentCalls: stats.concurrentCalls,
        nextAvailableTime: stats.nextAvailableTime
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Exécute un appel API géré avec cache local
   */
  const callApi = useCallback(async <T>(
    id: string,
    apiCall: () => Promise<T>,
    cacheKey?: string
  ): Promise<T> => {
    try {
      // Vérifier le cache local si une clé est fournie
      if (cacheKey && options.cacheTime) {
        const cached = localStorage.getItem(`api_cache_${cacheKey}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < options.cacheTime) {
            console.log(`📦 Cache hit pour ${cacheKey}`);
            return data;
          }
        }
      }

      const result = await apiCoordinator.scheduleApiCall(
        id,
        apiCall,
        options.priority || 'medium',
        options.maxRetries || 3
      );

      // Mettre en cache si une clé est fournie
      if (cacheKey && options.cacheTime) {
        localStorage.setItem(`api_cache_${cacheKey}`, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      }

      // Effacer l'erreur en cas de succès
      setApiState(prev => ({ ...prev, lastError: null }));

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur API inconnue';
      setApiState(prev => ({ ...prev, lastError: errorMessage }));
      throw error;
    }
  }, [options.priority, options.maxRetries, options.cacheTime]);

  /**
   * Annule tous les appels pour un service donné
   */
  const cancelCalls = useCallback((servicePrefix: string) => {
    apiCoordinator.cancelCallsForService(servicePrefix);
  }, []);

  /**
   * Nettoie le cache pour une clé donnée
   */
  const clearCache = useCallback((cacheKey: string) => {
    localStorage.removeItem(`api_cache_${cacheKey}`);
  }, []);

  /**
   * Nettoie tout le cache API
   */
  const clearAllCache = useCallback(() => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('api_cache_'));
    keys.forEach(key => localStorage.removeItem(key));
  }, []);

  /**
   * Vérifie si des données sont disponibles en cache
   */
  const isCached = useCallback((cacheKey: string): boolean => {
    if (!options.cacheTime) return false;
    
    const cached = localStorage.getItem(`api_cache_${cacheKey}`);
    if (!cached) return false;
    
    try {
      const { timestamp } = JSON.parse(cached);
      return Date.now() - timestamp < options.cacheTime;
    } catch {
      return false;
    }
  }, [options.cacheTime]);

  return {
    // État
    apiState,
    isRateLimited: apiState.isRateLimited,
    queueLength: apiState.queueLength,
    
    // Actions
    callApi,
    cancelCalls,
    clearCache,
    clearAllCache,
    isCached,
    
    // Helpers
    canMakeCall: !apiState.isRateLimited && apiState.concurrentCalls < 2,
    estimatedWaitTime: Math.max(0, apiState.nextAvailableTime - Date.now())
  };
}

/**
 * Hook spécialisé pour les données de dashboard avec cache long
 */
export function useDashboardApiManager() {
  return useApiManager({
    priority: 'medium',
    maxRetries: 2,
    cacheTime: 5 * 60 * 1000 // 5 minutes de cache
  });
}

/**
 * Hook spécialisé pour les données critiques avec priorité haute
 */
export function useCriticalApiManager() {
  return useApiManager({
    priority: 'critical',
    maxRetries: 5,
    cacheTime: 1 * 60 * 1000 // 1 minute de cache
  });
}

/**
 * Hook spécialisé pour les données non-critiques avec cache long
 */
export function useBackgroundApiManager() {
  return useApiManager({
    priority: 'low',
    maxRetries: 1,
    cacheTime: 10 * 60 * 1000 // 10 minutes de cache
  });
}