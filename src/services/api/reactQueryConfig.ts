// src/services/api/reactQueryConfig.ts
import { 
  QueryClient, 
  DefaultOptions,
  QueryObserverOptions
} from '@tanstack/react-query';
import { productionErrorHandler, ErrorType } from './productionErrorHandler';

/**
 * ============================================================
 * QUERY KEYS FACTORY - Pattern professionnel pour la gestion des clés de cache
 * ============================================================
 * 
 * Structure hiérarchique pour une invalidation précise:
 * - all: invalide tout le cache d'une ressource
 * - lists: invalide toutes les listes
 * - list(filters): invalide une liste spécifique avec ces filtres
 * - details: invalide tous les détails
 * - detail(id): invalide un élément spécifique
 */
export const queryKeys = {
  // Portfolios (traditionnel)
  portfolios: {
    all: ['portfolios'] as const,
    lists: () => [...queryKeys.portfolios.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.portfolios.lists(), filters] as const,
    details: () => [...queryKeys.portfolios.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.portfolios.details(), id] as const,
    statistics: (id: string | number) => 
      [...queryKeys.portfolios.detail(id), 'statistics'] as const,
    contracts: (id: string | number, filters?: Record<string, unknown>) => 
      [...queryKeys.portfolios.detail(id), 'contracts', filters] as const,
  },

  // Utilisateur courant
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
    permissions: () => [...queryKeys.user.all, 'permissions'] as const,
  },

  // Institution
  institution: {
    all: ['institution'] as const,
    current: () => [...queryKeys.institution.all, 'current'] as const,
    details: (id: string | number) => [...queryKeys.institution.all, 'detail', id] as const,
    settings: () => [...queryKeys.institution.all, 'settings'] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    summary: () => [...queryKeys.dashboard.all, 'summary'] as const,
    statistics: (period?: string) => [...queryKeys.dashboard.all, 'statistics', period] as const,
    charts: (type: string) => [...queryKeys.dashboard.all, 'charts', type] as const,
  },

  // Centrale des Risques
  risk: {
    all: ['risk'] as const,
    overview: () => [...queryKeys.risk.all, 'overview'] as const,
    client: (clientId: string | number) => [...queryKeys.risk.all, 'client', clientId] as const,
    reports: (filters?: Record<string, unknown>) => 
      [...queryKeys.risk.all, 'reports', filters] as const,
  },

  // Comptes
  accounts: {
    all: ['accounts'] as const,
    lists: () => [...queryKeys.accounts.all, 'list'] as const,
    list: (portfolioId: string | number, filters?: Record<string, unknown>) => 
      [...queryKeys.accounts.lists(), portfolioId, filters] as const,
    detail: (id: string | number) => [...queryKeys.accounts.all, 'detail', id] as const,
  },

  // Contrats
  contracts: {
    all: ['contracts'] as const,
    lists: () => [...queryKeys.contracts.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.contracts.lists(), filters] as const,
    detail: (id: string | number) => [...queryKeys.contracts.all, 'detail', id] as const,
    schedule: (id: string | number) => 
      [...queryKeys.contracts.detail(id), 'schedule'] as const,
  },

  // Paiements
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.payments.lists(), filters] as const,
    detail: (id: string | number) => [...queryKeys.payments.all, 'detail', id] as const,
    pending: () => [...queryKeys.payments.all, 'pending'] as const,
  },

  // Prospection/Companies
  companies: {
    all: ['companies'] as const,
    lists: () => [...queryKeys.companies.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.companies.lists(), filters] as const,
    detail: (id: string | number) => [...queryKeys.companies.all, 'detail', id] as const,
    profile: (id: string | number) => [...queryKeys.companies.detail(id), 'profile'] as const,
  },
} as const;

/**
 * Configuration par défaut pour React Query - Optimisée pour éviter les boucles infinies
 * 
 * staleTime: Temps en ms avant qu'une requête ne soit considérée comme obsolète
 * gcTime: Temps en ms pendant lequel les données restent dans le cache
 * retry: Nombre de tentatives en cas d'échec avec backoff exponentiel
 * refetchOnWindowFocus: Refaire la requête quand la fenêtre regagne le focus
 * refetchOnReconnect: Refaire la requête à la reconnexion réseau
 */
const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 30 * 1000, // 30 secondes - évite les refetch trop fréquents
    gcTime: 5 * 60 * 1000, // 5 minutes - garbage collection
    retry: (failureCount, error) => {
      // Ne pas réessayer en cas d'erreur 4xx, sauf 401 (token expiré)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        // Arrêter complètement sur 429 (rate limit)
        if (status === 429) {
          console.warn('[ReactQuery] Rate limit détecté (429), pas de retry');
          return false;
        }
        // Pas de retry sur les erreurs client (sauf 401)
        if (status >= 400 && status < 500 && status !== 401) {
          return false;
        }
      }
      // Maximum 2 tentatives avec backoff exponentiel
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Désactivé pour éviter les refetch intempestifs
    refetchOnReconnect: 'always',
    refetchOnMount: false, // Ne pas refetch si les données sont encore fraiches
    networkMode: 'offlineFirst', // Utiliser le cache d'abord
  },
  mutations: {
    retry: 1,
    retryDelay: 1000,
    networkMode: 'offlineFirst',
  },
};

/**
 * Options spécifiques pour les données de référence
 * Ces données changent rarement et peuvent être mises en cache plus longtemps
 */
export const referenceDataOptions: Partial<QueryObserverOptions> = {
  staleTime: 30 * 60 * 1000, // 30 minutes
  gcTime: 60 * 60 * 1000, // 1 heure
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};

/**
 * Options pour les données utilisateur
 * Ces données sont personnelles et doivent être régulièrement rafraîchies
 */
export const userDataOptions: Partial<QueryObserverOptions> = {
  staleTime: 60 * 1000, // 1 minute
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false, // Éviter les boucles
  refetchOnMount: false,
};

/**
 * Options pour les listes de données (portefeuilles, comptes, etc.)
 */
export const listDataOptions: Partial<QueryObserverOptions> = {
  staleTime: 30 * 1000, // 30 secondes
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};

/**
 * Options pour les données en temps réel
 * Ces données doivent être actualisées fréquemment
 */
export const realtimeDataOptions: Partial<QueryObserverOptions> = {
  staleTime: 30 * 1000, // 30 secondes
  gcTime: 2 * 60 * 1000, // 2 minutes
  refetchInterval: 60 * 1000, // Refetch toutes les 60 secondes
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

/**
 * Instance du client React Query avec la configuration par défaut
 * Inclut la gestion d'erreurs globale avec notifications toast
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    ...defaultQueryOptions,
    queries: {
      ...defaultQueryOptions.queries,
    },
    mutations: {
      ...defaultQueryOptions.mutations,
      // Gestion d'erreurs globale pour les mutations
      onError: (error: unknown) => {
        const parsedError = productionErrorHandler.parseError(error);
        
        // Certaines erreurs sont gérées silencieusement
        if (parsedError.type === ErrorType.AUTHENTICATION) {
          // L'authentification est gérée par apiClient (redirection)
          return;
        }
        
        // Afficher la notification d'erreur
        productionErrorHandler.handleError(error, { 
          showNotification: true,
          duration: 5000 
        });
      },
    },
  },
});

/**
 * ============================================================
 * UTILITAIRES D'INVALIDATION - Fonctions helper pour invalider le cache
 * ============================================================
 */

/**
 * Invalider toutes les données de portefeuilles
 */
export const invalidatePortfolioQueries = () => {
  return queryClient.invalidateQueries({ queryKey: queryKeys.portfolios.all });
};

/**
 * Invalider un portefeuille spécifique
 */
export const invalidatePortfolioDetail = (id: string | number) => {
  return queryClient.invalidateQueries({ queryKey: queryKeys.portfolios.detail(id) });
};

/**
 * Invalider les données utilisateur
 */
export const invalidateUserQueries = () => {
  return queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
};

/**
 * Invalider les données d'institution
 */
export const invalidateInstitutionQueries = () => {
  return queryClient.invalidateQueries({ queryKey: queryKeys.institution.all });
};

/**
 * Invalider tout le cache du dashboard
 */
export const invalidateDashboardQueries = () => {
  return queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
};

/**
 * Précharger des données dans le cache
 */
export const prefetchQuery = async <T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  staleTime = 30 * 1000
) => {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime,
  });
};

/**
 * Mettre à jour manuellement le cache (optimistic updates)
 */
export const setQueryData = <T>(
  queryKey: readonly unknown[],
  updater: T | ((oldData: T | undefined) => T)
) => {
  return queryClient.setQueryData(queryKey, updater);
};

/**
 * Récupérer les données du cache sans déclencher de requête
 */
export const getQueryData = <T>(queryKey: readonly unknown[]): T | undefined => {
  return queryClient.getQueryData(queryKey);
};
