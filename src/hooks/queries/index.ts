// src/hooks/queries/index.ts
// Export centralisé des hooks React Query

// Configuration et utilitaires (réexportés depuis la config centrale)
export {
  queryKeys,
  queryClient,
  invalidatePortfolioQueries,
  invalidatePortfolioDetail,
  invalidateUserQueries,
  invalidateInstitutionQueries,
  invalidateDashboardQueries,
  prefetchQuery,
  setQueryData,
  getQueryData,
  // Options spécifiques
  referenceDataOptions,
  userDataOptions,
  listDataOptions,
  realtimeDataOptions,
} from '../../services/api/reactQueryConfig';

// Portefeuilles
export {
  useTraditionalPortfoliosQuery,
  usePortfolioQuery,
  useCreatePortfolioMutation,
  useUpdatePortfolioMutation,
  useDeletePortfolioMutation,
  useChangePortfolioStatusMutation,
} from './usePortfolioQueries';

// Utilisateur et Institution
export {
  useCurrentUserQuery,
  useInstitution,
  useCurrentUser,
} from './useUserQueries';