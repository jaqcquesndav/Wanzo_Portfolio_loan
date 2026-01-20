// src/hooks/useInstitutionApi.ts
// Hook pour accéder à l'institution depuis le store global
// Avec protection contre les appels multiples

import { useCallback, useEffect, useState, useRef } from 'react';
import type { Institution, InstitutionProfile } from '../types/institution';
import { useNotification } from '../contexts/useNotification';
import { useAppContextStore } from '../stores/appContextStore';
import { userApi } from '../services/api/shared/user.api';
import { auth0Service } from '../services/api/auth/auth0Service';

// Cache global pour éviter les appels multiples
let globalLoadPromise: Promise<void> | null = null;
let globalLoadTimestamp: number = 0;
const LOAD_CACHE_TTL = 60000; // 60 secondes

/**
 * Hook principal pour la gestion de l'institution courante
 * 
 * Ce hook gère intelligemment le chargement des données d'institution:
 * 1. D'abord, il vérifie si les données sont dans le store Zustand
 * 2. Si non (après rechargement de page), il les charge depuis /users/me
 * 3. Les données sont ensuite disponibles pour l'affichage
 * 
 * Protection contre les appels multiples avec cache global
 */
export function useInstitutionApi() {
  const { showNotification } = useNotification();
  
  // Lire depuis le store Zustand EN PREMIER pour vérifier si données présentes
  const { 
    institution, 
    institutionProfile,
    institutionId, 
    isContextLoaded,
    setContext
  } = useAppContextStore();

  // Initialiser isLoading à true si pas de données
  const [isLoading, setIsLoading] = useState(!institution);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Ref pour éviter les appels multiples dans le même composant
  const hasTriedLoading = useRef(false);

  // DEBUG: Log conditionnel (seulement si pas de données)
  if (!institution && !hasTriedLoading.current) {
    console.log('🔍 useInstitutionApi - pas de données dans le store, chargement nécessaire');
  }

  // Charger les données depuis /users/me si nécessaire
  const loadData = useCallback(async () => {
    // Ne pas charger si pas de token
    const token = auth0Service.getAccessToken();
    if (!token) {
      console.log('⚠️ useInstitutionApi: Pas de token, skip du chargement');
      return;
    }
    
    // Vérifier si un chargement global est déjà en cours ou récent
    if (globalLoadPromise && Date.now() - globalLoadTimestamp < LOAD_CACHE_TTL) {
      console.log('⏳ useInstitutionApi: Chargement déjà en cours, réutilisation...');
      await globalLoadPromise;
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    
    // Créer une nouvelle promesse de chargement global
    globalLoadTimestamp = Date.now();
    globalLoadPromise = (async () => {
      try {
        console.log('🔄 useInstitutionApi: Chargement des données depuis /users/me...');
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
        
        console.log('✅ useInstitutionApi: Données chargées:', {
          userName: userData?.firstName,
          institutionName: institutionData?.name,
          institutionId: institutionData?.id || userData?.institutionId,
          hasProfile: !!profileData
        });
        
        // Mettre à jour le store avec les données
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
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
        setLoadError(errorMessage);
        console.error('❌ useInstitutionApi: Erreur chargement:', err);
        throw err; // Re-throw pour que la promesse globale soit rejetée
      } finally {
        setIsLoading(false);
      }
    })();
    
    try {
      await globalLoadPromise;
    } catch {
      // Erreur déjà gérée dans le bloc ci-dessus
    }
  }, [setContext]);

  // Effet pour charger les données si elles ne sont pas dans le store
  useEffect(() => {
    // Si on a déjà l'institution dans le store, pas besoin de charger
    if (institution) {
      setIsLoading(false);
      return;
    }
    
    // Ne pas charger si déjà essayé dans cette instance
    if (hasTriedLoading.current) {
      return;
    }
    
    // Ne pas charger si pas de token (utilisateur non connecté)
    const token = auth0Service.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    
    // Marquer comme essayé et charger
    hasTriedLoading.current = true;
    loadData();
  }, [institution, loadData]);

  // Fonction de rafraîchissement manuel
  const refetch = useCallback(async () => {
    await loadData();
    if (!loadError) {
      showNotification('Données de l\'institution actualisées', 'success');
    }
  }, [loadData, loadError, showNotification]);

  // NOTE: updateInstitution et validateInstitution nécessiteraient des endpoints backend
  // Pour l'instant, ces fonctions ne sont pas implémentées côté backend
  const updateInstitution = useCallback(async (_updates: Partial<Institution>) => {
    showNotification('La mise à jour de l\'institution n\'est pas encore disponible', 'warning');
    throw new Error('Endpoint non disponible');
  }, [showNotification]);

  const validateInstitution = useCallback(async (_validationData: {
    license_number: string;
    tax_id: string;
    regulatory_status: string;
    legal_representative: string;
  }) => {
    showNotification('La validation de l\'institution n\'est pas encore disponible', 'warning');
    throw new Error('Endpoint non disponible');
  }, [showNotification]);

  return {
    // Données de l'institution depuis le store Zustand
    institution: institution as Institution | null,
    institutionProfile: institutionProfile as InstitutionProfile | null,
    institutionId,
    // États
    loading: isLoading || (!institution && !loadError),
    error: loadError,
    // Actions
    updateInstitution,
    validateInstitution,
    refetch
  };
}