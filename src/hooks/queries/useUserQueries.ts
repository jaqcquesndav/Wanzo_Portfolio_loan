// src/hooks/queries/useUserQueries.ts
// Hooks React Query pour l'utilisateur et l'institution

import { useQuery } from '@tanstack/react-query';
import { queryKeys, userDataOptions } from '../../services/api/reactQueryConfig';
import { userApi } from '../../services/api/shared/user.api';
import { useAppContextStore } from '../../stores/appContextStore';
import { auth0Service } from '../../services/api/auth/auth0Service';
import type { InstitutionProfile } from '../../types/institution';

/**
 * Hook pour récupérer l'utilisateur courant avec son institution
 * Remplace useInstitutionApi de manière professionnelle
 * 
 * Comportement:
 * - Cache de 60 secondes (données stables)
 * - Mise à jour automatique du store Zustand
 * - Pas de refetch si déjà en cache
 * 
 * @example
 * const { data, isLoading, error } = useCurrentUserQuery();
 * // data = { user, institution, institutionProfile, auth0Id, permissions }
 */
export function useCurrentUserQuery() {
  const { setContext, institution } = useAppContextStore();
  
  return useQuery({
    // Utilise la clé 'current' pour les données utilisateur actuelles
    queryKey: queryKeys.user.current(),
    queryFn: async () => {
      console.log('🔄 [ReactQuery] Chargement des données depuis /users/me...');
      const response = await userApi.getCurrentUserWithInstitution();
      
      // Gérer les deux formats possibles de réponse
      const responseData = (response as { data?: unknown }).data || response;
      const { 
        user: userData, 
        institution: institutionData,
        institutionProfile: profileData,
        auth0Id, 
        permissions 
      } = responseData as {
        user: { id?: string; firstName?: string; institutionId?: string; [key: string]: unknown };
        institution: { id?: string; name?: string; [key: string]: unknown } | null;
        institutionProfile?: InstitutionProfile | null;
        auth0Id: string;
        permissions: string[];
      };
      
      console.log('✅ [ReactQuery] Données utilisateur chargées:', {
        userName: userData?.firstName,
        institutionName: institutionData?.name,
      });
      
      // Mettre à jour le store Zustand (pour compatibilité avec le reste de l'app)
      if (userData) {
        setContext({
          user: userData as Parameters<typeof setContext>[0]['user'],
          institution: institutionData as Parameters<typeof setContext>[0]['institution'],
          institutionProfile: profileData || null,
          institutionId: institutionData?.id || userData?.institutionId,
          auth0Id: auth0Id || '',
          permissions: permissions || []
        });
      }
      
      return {
        user: userData,
        institution: institutionData,
        institutionProfile: profileData,
        auth0Id,
        permissions
      };
    },
    // Options optimisées pour éviter les requêtes en boucle
    ...userDataOptions,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    
    // Ne pas exécuter si pas de token
    enabled: !!auth0Service.getAccessToken(),
    
    // Pas de refetch automatique
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    
    // Si on a déjà les données dans le store, les utiliser comme placeholder
    placeholderData: institution ? {
      user: useAppContextStore.getState().user,
      institution: useAppContextStore.getState().institution,
      institutionProfile: useAppContextStore.getState().institutionProfile,
      auth0Id: useAppContextStore.getState().auth0Id,
      permissions: useAppContextStore.getState().permissions
    } : undefined,
  });
}

/**
 * Hook simplifié pour l'institution courante
 * Utilise le cache de useCurrentUserQuery
 */
export function useInstitution() {
  const { data, isLoading, error } = useCurrentUserQuery();
  
  return {
    institution: data?.institution || null,
    institutionProfile: data?.institutionProfile || null,
    institutionId: data?.institution?.id || null,
    loading: isLoading,
    error: error?.message || null,
  };
}

/**
 * Hook simplifié pour l'utilisateur courant
 */
export function useCurrentUser() {
  const { data, isLoading, error } = useCurrentUserQuery();
  
  return {
    user: data?.user || null,
    permissions: data?.permissions || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
