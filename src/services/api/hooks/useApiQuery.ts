// src/services/api/hooks/useApiQuery.ts
import { 
  useQuery, 
  useMutation,
  UseMutationOptions,
  UseQueryOptions
} from '@tanstack/react-query';
import { apiClient } from '../base.api';
import { CacheOptions } from '../cache';
import { useConnectivity } from '../../../hooks/useConnectivity';

/**
 * Hook pour les requêtes GET avec React Query et gestion du mode hors ligne
 * 
 * @param endpoint - L'endpoint API
 * @param params - Les paramètres de la requête
 * @param options - Options de React Query
 * @param cacheOptions - Options de cache
 */
export function useApiQuery<TData = unknown, TError = unknown>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: UseQueryOptions<TData, TError>,
  cacheOptions?: CacheOptions
) {
  const { isOnline } = useConnectivity();

  return useQuery<TData, TError>({
    queryKey: [endpoint, params],
    queryFn: async () => {
      // Si en ligne, faire une requête normale
      if (isOnline) {
        return apiClient.get<TData>(endpoint, params);
      } 
      // Si hors ligne, tenter de récupérer depuis le cache
      return apiClient.getCached<TData>(endpoint, params, { 
        ...cacheOptions, 
        forceRefresh: false 
      });
    },
    ...options,
    // Désactiver les requêtes automatiques si hors ligne
    enabled: options?.enabled !== false && (isOnline || !options?.networkMode || options.networkMode === 'offlineFirst')
  });
}

/**
 * Hook pour les mutations POST avec React Query et gestion du mode hors ligne
 * 
 * @param endpoint - L'endpoint API
 * @param options - Options de React Query pour la mutation
 */
export function useApiMutation<TData = unknown, TVariables = unknown, TError = unknown, TContext = unknown>(
  endpoint: string,
  options?: UseMutationOptions<TData, TError, TVariables, TContext>
) {
  const { isOnline, addPendingAction } = useConnectivity();

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: async (variables: TVariables) => {
      // Si en ligne, effectuer la requête
      if (isOnline) {
        return apiClient.post<TData, TVariables>(endpoint, variables);
      }
      
      // Si hors ligne, ajouter à la file d'attente des actions en attente
      const actionId = addPendingAction({
        type: 'post',
        resourceId: endpoint,
        payload: variables as Record<string, unknown>
      });
      
      // Simuler une réponse réussie pour l'interface utilisateur
      // La vraie synchronisation se fera quand la connexion sera rétablie
      console.log(`Action mise en file d'attente pour synchronisation ultérieure: ${actionId}`);
      
      // Retourner une "fausse" réponse pour permettre à l'UI de continuer
      return {
        success: true,
        offlineAction: true,
        id: actionId
      } as unknown as TData;
    },
    ...options
  });
}

/**
 * Hook pour les mutations PUT avec React Query et gestion du mode hors ligne
 * 
 * @param endpoint - L'endpoint API
 * @param options - Options de React Query pour la mutation
 */
export function useApiPutMutation<TData = unknown, TVariables = unknown, TError = unknown, TContext = unknown>(
  endpoint: string,
  options?: UseMutationOptions<TData, TError, TVariables, TContext>
) {
  const { isOnline, addPendingAction } = useConnectivity();

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: async (variables: TVariables) => {
      if (isOnline) {
        return apiClient.put<TData, TVariables>(endpoint, variables);
      }
      
      const actionId = addPendingAction({
        type: 'put',
        resourceId: endpoint,
        payload: variables as Record<string, unknown>
      });
      
      console.log(`Action de mise à jour mise en file d'attente: ${actionId}`);
      
      return {
        success: true,
        offlineAction: true,
        id: actionId
      } as unknown as TData;
    },
    ...options
  });
}

/**
 * Hook pour les mutations DELETE avec React Query et gestion du mode hors ligne
 * 
 * @param endpoint - L'endpoint API
 * @param options - Options de React Query pour la mutation
 */
export function useApiDeleteMutation<TData = unknown, TVariables = string, TError = unknown, TContext = unknown>(
  endpoint: string,
  options?: UseMutationOptions<TData, TError, TVariables, TContext>
) {
  const { isOnline, addPendingAction } = useConnectivity();

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: async (id: TVariables) => {
      const deleteEndpoint = `${endpoint}/${id}`;
      
      if (isOnline) {
        await apiClient.delete(deleteEndpoint);
        return { success: true } as unknown as TData;
      }
      
      const actionId = addPendingAction({
        type: 'delete',
        resourceId: deleteEndpoint,
        payload: { id }
      });
      
      console.log(`Action de suppression mise en file d'attente: ${actionId}`);
      
      return {
        success: true,
        offlineAction: true,
        id: actionId
      } as unknown as TData;
    },
    ...options
  });
}
