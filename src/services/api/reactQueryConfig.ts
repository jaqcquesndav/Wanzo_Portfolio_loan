// src/services/api/reactQueryConfig.ts
import { 
  QueryClient, 
  DefaultOptions,
  QueryObserverOptions
} from '@tanstack/react-query';

/**
 * Configuration par défaut pour React Query
 * 
 * staleTime: Temps en ms avant qu'une requête ne soit considérée comme obsolète
 * cacheTime: Temps en ms pendant lequel les données restent dans le cache
 * retry: Nombre de tentatives en cas d'échec
 * refetchOnWindowFocus: Refaire la requête quand la fenêtre regagne le focus
 * refetchOnReconnect: Refaire la requête à la reconnexion réseau
 */
const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (remplace cacheTime)
    retry: (failureCount, error) => {
      // Ne pas réessayer en cas d'erreur 4xx, sauf 401 (token expiré)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status >= 400 && status < 500 && status !== 401) {
          return false;
        }
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true
  }
};

/**
 * Options spécifiques pour les données de référence
 * Ces données changent rarement et peuvent être mises en cache plus longtemps
 */
export const referenceDataOptions: Partial<QueryObserverOptions> = {
  staleTime: 30 * 60 * 1000, // 30 minutes
  gcTime: 60 * 60 * 1000, // 1 heure
  refetchOnWindowFocus: false
};

/**
 * Options pour les données utilisateur
 * Ces données sont personnelles et doivent être régulièrement rafraîchies
 */
export const userDataOptions: Partial<QueryObserverOptions> = {
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true
};

/**
 * Options pour les données en temps réel
 * Ces données doivent être actualisées fréquemment
 */
export const realtimeDataOptions: Partial<QueryObserverOptions> = {
  staleTime: 30 * 1000, // 30 secondes
  gcTime: 2 * 60 * 1000, // 2 minutes
  refetchInterval: 60 * 1000, // Refetch toutes les 60 secondes
  refetchOnWindowFocus: true,
  refetchOnReconnect: true
};

/**
 * Instance du client React Query avec la configuration par défaut
 */
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions
});
