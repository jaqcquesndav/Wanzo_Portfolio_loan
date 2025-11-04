// src/hooks/useApiRequest.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNotification } from '../contexts/useNotification';

interface UseApiRequestOptions {
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetch: number | null;
}

export function useApiRequest<T>(
  apiFunction: () => Promise<T>,
  options: UseApiRequestOptions = {}
) {
  const {
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null
  });

  const { showNotification } = useNotification();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Nettoyer les timeouts et abort controllers
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const executeRequest = useCallback(async (attempt = 0): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Annuler la requête précédente si elle existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Créer un nouveau AbortController
      abortControllerRef.current = new AbortController();

      const data = await apiFunction();
      
      setState({
        data,
        loading: false,
        error: null,
        lastFetch: Date.now()
      });

      onSuccess?.(data);

    } catch (error) {
      const apiError = error instanceof Error ? error : new Error(String(error));
      
      // Vérifier si c'est une erreur 429 (Too Many Requests)
      const is429Error = apiError.message.includes('429') || 
                        apiError.message.toLowerCase().includes('too many requests');

      // Calculer le délai d'attente (exponentiel backoff pour 429)
      const delay = is429Error ? retryDelay * Math.pow(2, attempt) : retryDelay;

      // Retry logic
      if (attempt < retryCount && !abortControllerRef.current?.signal.aborted) {
        if (is429Error && attempt === 0) {
          showNotification(
            `Trop de requêtes. Tentative automatique dans ${delay / 1000}s...`,
            'warning'
          );
        }

        retryTimeoutRef.current = setTimeout(() => {
          executeRequest(attempt + 1);
        }, delay);
        
        return;
      }

      // Échec définitif
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError
      }));

      onError?.(apiError);

      // Afficher une notification d'erreur appropriée
      if (is429Error) {
        showNotification(
          'Trop de requêtes. Veuillez patienter avant de réessayer.',
          'error'
        );
      } else {
        showNotification(
          `Erreur: ${apiError.message}`,
          'error'
        );
      }
    }
  }, [apiFunction, retryCount, retryDelay, onSuccess, onError, showNotification]);

  // Fonction de retry manuelle
  const retry = useCallback(() => {
    executeRequest(0);
  }, [executeRequest]);

  // Fonction pour vérifier si on peut faire une nouvelle requête (éviter les doublons)
  const canRefresh = useCallback((minInterval = 5000) => {
    if (!state.lastFetch) return true;
    return Date.now() - state.lastFetch > minInterval;
  }, [state.lastFetch]);

  // Fonction de refresh avec vérification d'intervalle
  const refresh = useCallback((force = false) => {
    if (force || canRefresh()) {
      executeRequest(0);
    }
  }, [executeRequest, canRefresh]);

  return {
    ...state,
    execute: executeRequest,
    retry,
    refresh,
    canRefresh
  };
}

// Hook spécialisé pour les listes avec pagination
export function useApiList<T>(
  apiFunction: (params?: { page?: number; limit?: number; search?: string }) => Promise<{ data: T[]; total: number }>,
  options: UseApiRequestOptions = {}
) {
  const [params, setParams] = useState({ page: 1, limit: 10, search: '' });
  
  const request = useApiRequest(
    () => apiFunction(params),
    options
  );

  const updateParams = useCallback((newParams: Partial<typeof params>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Auto-refresh quand les paramètres changent
  useEffect(() => {
    if (request.canRefresh(1000)) { // Minimum 1s entre les requêtes
      request.execute();
    }
  }, [params, request]);

  return {
    ...request,
    params,
    updateParams,
    items: request.data?.data || [],
    total: request.data?.total || 0
  };
}
