// src/hooks/useApiCache.ts
import { useState, useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  loading: boolean;
}

interface UseCacheOptions {
  ttl?: number; // Time to live en millisecondes (défaut: 5 minutes)
  enableCache?: boolean;
}

/**
 * Hook pour gérer un cache simple avec TTL
 */
export function useApiCache<T>(
  key: string,
  apiFunction: () => Promise<T>,
  options: UseCacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, enableCache = true } = options;
  
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null
  });

  const isExpired = useCallback((entry: CacheEntry<T>) => {
    return Date.now() - entry.timestamp > ttl;
  }, [ttl]);

  const execute = useCallback(async (force = false) => {
    const cachedEntry = cache.current.get(key);
    
    // Vérifier le cache si activé
    if (enableCache && !force && cachedEntry && !isExpired(cachedEntry)) {
      setState({
        data: cachedEntry.data,
        loading: false,
        error: null
      });
      return cachedEntry.data;
    }

    // Éviter les requêtes multiples simultanées
    if (cachedEntry?.loading) {
      return cachedEntry.data;
    }

    try {
      // Marquer comme en cours de chargement
      cache.current.set(key, {
        data: cachedEntry?.data || null as unknown as T,
        timestamp: Date.now(),
        loading: true
      });

      setState(prev => ({ ...prev, loading: true, error: null }));

      const data = await apiFunction();

      // Mettre à jour le cache
      cache.current.set(key, {
        data,
        timestamp: Date.now(),
        loading: false
      });

      setState({
        data,
        loading: false,
        error: null
      });

      return data;
    } catch (error) {
      const apiError = error instanceof Error ? error : new Error(String(error));
      
      // Nettoyer l'état de chargement du cache
      if (cachedEntry) {
        cache.current.set(key, {
          ...cachedEntry,
          loading: false
        });
      } else {
        cache.current.delete(key);
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError
      }));

      throw apiError;
    }
  }, [key, apiFunction, enableCache, isExpired]);

  const invalidate = useCallback(() => {
    cache.current.delete(key);
  }, [key]);

  const refresh = useCallback(() => {
    return execute(true);
  }, [execute]);

  return {
    ...state,
    execute,
    refresh,
    invalidate,
    isCached: enableCache && cache.current.has(key) && !isExpired(cache.current.get(key)!)
  };
}

/**
 * Hook global pour gérer plusieurs caches
 */
export function useApiCacheManager() {
  const globalCache = useRef<Map<string, CacheEntry<unknown>>>(new Map());

  const clearCache = useCallback((pattern?: string) => {
    if (pattern) {
      // Supprimer les entrées qui correspondent au pattern
      const regex = new RegExp(pattern);
      for (const key of globalCache.current.keys()) {
        if (regex.test(key)) {
          globalCache.current.delete(key);
        }
      }
    } else {
      // Tout vider
      globalCache.current.clear();
    }
  }, []);

  const getCacheStats = useCallback(() => {
    const entries = Array.from(globalCache.current.entries());
    return {
      total: entries.length,
      expired: entries.filter(([, entry]) => 
        Date.now() - entry.timestamp > 5 * 60 * 1000
      ).length,
      loading: entries.filter(([, entry]) => entry.loading).length
    };
  }, []);

  return {
    clearCache,
    getCacheStats
  };
}