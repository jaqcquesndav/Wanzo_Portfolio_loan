/**
 * Hook de chargement prioritaire
 * Gère le chargement des composants avec priorité (comme YouTube)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { networkQualityService, type NetworkQuality } from '../services/performance/networkQualityService';

export type LoadingPriority = 'critical' | 'high' | 'medium' | 'low' | 'lazy';

interface LoadingTask<T> {
  id: string;
  priority: LoadingPriority;
  load: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface LoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
  progress: number;
}

// Délais par priorité et qualité réseau
const PRIORITY_DELAYS: Record<LoadingPriority, Record<NetworkQuality, number>> = {
  critical: { excellent: 0, good: 0, fair: 0, poor: 0, offline: 0 },
  high: { excellent: 50, good: 100, fair: 150, poor: 200, offline: 0 },
  medium: { excellent: 150, good: 250, fair: 400, poor: 600, offline: 0 },
  low: { excellent: 300, good: 500, fair: 800, poor: 1200, offline: 0 },
  lazy: { excellent: 500, good: 800, fair: 1200, poor: 2000, offline: 0 },
};

/**
 * Hook pour gérer le chargement d'un seul élément avec priorité
 */
export function usePriorityLoading<T>(
  loadFn: () => Promise<T>,
  options: {
    priority?: LoadingPriority;
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    retryCount?: number;
  } = {}
): LoadingState & { data: T | null; retry: () => void } {
  const {
    priority = 'medium',
    enabled = true,
    onSuccess,
    onError,
    retryCount = 2,
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    isLoaded: false,
    error: null,
    progress: 0,
  });
  const [data, setData] = useState<T | null>(null);
  const attemptRef = useRef(0);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    if (!enabled) return;

    const networkQuality = networkQualityService.getQuality();
    
    // Si offline et pas critique, ne pas charger
    if (networkQuality === 'offline' && priority !== 'critical') {
      setState(prev => ({
        ...prev,
        error: new Error('Pas de connexion internet'),
      }));
      return;
    }

    // Délai basé sur la priorité et la qualité réseau
    const delay = PRIORITY_DELAYS[priority][networkQuality];
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    if (!mountedRef.current) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await loadFn();
      
      if (!mountedRef.current) return;

      setData(result);
      setState({
        isLoading: false,
        isLoaded: true,
        error: null,
        progress: 100,
      });
      onSuccess?.(result);
    } catch (error) {
      if (!mountedRef.current) return;

      const err = error instanceof Error ? error : new Error(String(error));
      
      // Retry logic
      if (attemptRef.current < retryCount) {
        attemptRef.current++;
        // Attendre un peu plus longtemps avant de retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attemptRef.current));
        if (mountedRef.current) {
          load();
        }
        return;
      }

      setState({
        isLoading: false,
        isLoaded: false,
        error: err,
        progress: 0,
      });
      onError?.(err);
    }
  }, [loadFn, enabled, priority, onSuccess, onError, retryCount]);

  const retry = useCallback(() => {
    attemptRef.current = 0;
    setState({
      isLoading: false,
      isLoaded: false,
      error: null,
      progress: 0,
    });
    load();
  }, [load]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  return { ...state, data, retry };
}

/**
 * Hook pour gérer le chargement de plusieurs éléments avec priorités
 */
export function useBatchPriorityLoading<T>(
  tasks: LoadingTask<T>[]
): {
  results: Map<string, T | null>;
  states: Map<string, LoadingState>;
  isAllLoaded: boolean;
  isAnyLoading: boolean;
  progress: number;
} {
  const [results, setResults] = useState<Map<string, T | null>>(new Map());
  const [states, setStates] = useState<Map<string, LoadingState>>(new Map());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder: Record<LoadingPriority, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
        lazy: 4,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const networkQuality = networkQualityService.getQuality();

    const loadTask = async (task: LoadingTask<T>, index: number) => {
      const delay = PRIORITY_DELAYS[task.priority][networkQuality];
      
      // Ajouter un délai supplémentaire basé sur l'index
      const totalDelay = delay + (index * 50);
      
      if (totalDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }

      if (!mountedRef.current) return;

      setStates(prev => new Map(prev).set(task.id, {
        isLoading: true,
        isLoaded: false,
        error: null,
        progress: 0,
      }));

      try {
        const result = await task.load();
        
        if (!mountedRef.current) return;

        setResults(prev => new Map(prev).set(task.id, result));
        setStates(prev => new Map(prev).set(task.id, {
          isLoading: false,
          isLoaded: true,
          error: null,
          progress: 100,
        }));
        task.onSuccess?.(result);
      } catch (error) {
        if (!mountedRef.current) return;

        const err = error instanceof Error ? error : new Error(String(error));
        setStates(prev => new Map(prev).set(task.id, {
          isLoading: false,
          isLoaded: false,
          error: err,
          progress: 0,
        }));
        task.onError?.(err);
      }
    };

    // Charger les tâches critiques immédiatement
    const criticalTasks = sortedTasks.filter(t => t.priority === 'critical');
    const otherTasks = sortedTasks.filter(t => t.priority !== 'critical');

    // Charger les tâches critiques en parallèle
    Promise.all(criticalTasks.map((task, i) => loadTask(task, i)));

    // Charger les autres tâches séquentiellement par groupe de priorité
    const currentIndex = criticalTasks.length;
    otherTasks.forEach((task, i) => {
      loadTask(task, currentIndex + i);
    });

    return () => {
      mountedRef.current = false;
    };
  }, [tasks]);

  const isAllLoaded = tasks.length > 0 && 
    tasks.every(task => states.get(task.id)?.isLoaded);
  
  const isAnyLoading = Array.from(states.values()).some(s => s.isLoading);
  
  const progress = tasks.length > 0
    ? (Array.from(states.values()).filter(s => s.isLoaded).length / tasks.length) * 100
    : 0;

  return { results, states, isAllLoaded, isAnyLoading, progress };
}

/**
 * Hook pour observer l'intersection (lazy loading)
 */
export function useIntersectionLoader<T>(
  loadFn: () => Promise<T>,
  options: {
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
  } = {}
): {
  ref: React.RefObject<HTMLDivElement>;
  isVisible: boolean;
  data: T | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { threshold = 0.1, rootMargin = '100px', enabled = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoadedRef.current) {
          setIsVisible(true);
          hasLoadedRef.current = true;
          
          setIsLoading(true);
          loadFn()
            .then(setData)
            .catch(err => setError(err instanceof Error ? err : new Error(String(err))))
            .finally(() => setIsLoading(false));
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [loadFn, threshold, rootMargin, enabled]);

  return { ref: ref as React.RefObject<HTMLDivElement>, isVisible, data, isLoading, error };
}
