// src/hooks/useInstitutionApi.ts
// Hook pour accéder aux institutions via l'API backend

import { useState, useEffect, useCallback } from 'react';
import { institutionApi } from '../services/api/shared/institution.api';
import type { Institution, InstitutionManager } from '../types/institution';
import { useNotification } from '../contexts/useNotification';
import { useAuth } from '../contexts/useAuth';

/**
 * Hook principal pour la gestion de l'institution courante
 * 
 * IMPORTANT: L'institutionId est obtenu depuis le contexte d'authentification
 * (chargé via /users/me lors du login). Cet ID est nécessaire pour toutes
 * les opérations car le token JWT ne contient pas cette information.
 * 
 * WORKFLOW:
 * 1. AuthContext charge /users/me → institution LITE + institutionId
 * 2. Ce hook fait TOUJOURS un appel à /institutions/${id} pour les données FULL
 * 3. Si besoin de rafraîchir, appeler refetch()
 */
export function useInstitutionApi() {
  const { showNotification } = useNotification();
  
  // Obtenir l'institutionId et le statut du contexte depuis useAuth
  const { institutionId, isContextLoaded } = useAuth();
  
  // État local
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les informations de l'institution courante via l'API
  const loadInstitution = useCallback(async (forceInstitutionId?: string) => {
    const idToUse = forceInstitutionId || institutionId;
    
    if (!idToUse) {
      console.warn('⚠️ useInstitutionApi: institutionId non disponible');
      setError('Institution ID non disponible. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🏢 useInstitutionApi: GET /institutions/' + idToUse);
      const data = await institutionApi.getInstitution(idToUse);
      console.log('✅ useInstitutionApi: Institution chargée:', data);
      setInstitution(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'institution';
      setError(errorMessage);
      console.error('❌ useInstitutionApi: Erreur:', err);
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  // Charger l'institution quand institutionId devient disponible
  useEffect(() => {
    // DEBUG: Alerte pour vérifier que le code s'exécute
    console.log('========== useInstitutionApi MOUNT ==========');
    console.log('🔍 useInstitutionApi useEffect TRIGGER:', {
      isContextLoaded,
      institutionId,
      loading
    });
    
    if (!isContextLoaded) {
      console.log('⏳ useInstitutionApi: Contexte pas encore chargé, attente...');
      return;
    }
    
    if (institutionId) {
      console.log('🏢 useInstitutionApi: institutionId disponible, appel API maintenant!');
      // Appel direct de l'API
      (async () => {
        try {
          setLoading(true);
          setError(null);
          console.log('🌐 FETCH: GET /institutions/' + institutionId);
          const data = await institutionApi.getInstitution(institutionId);
          console.log('✅ FETCH SUCCESS:', data);
          setInstitution(data);
        } catch (err) {
          console.error('❌ FETCH ERROR:', err);
          setError(err instanceof Error ? err.message : 'Erreur');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      console.log('⚠️ useInstitutionApi: Pas d\'institutionId après chargement du contexte');
      setLoading(false);
    }
  }, [isContextLoaded, institutionId]);

  // Mettre à jour l'institution
  const updateInstitution = useCallback(async (updates: Partial<Institution>) => {
    if (!institutionId) {
      const errorMessage = 'Institution ID non disponible';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw new Error(errorMessage);
    }

    try {
      setError(null);
      const updatedInstitution = await institutionApi.updateInstitution(institutionId, updates);
      setInstitution(updatedInstitution);
      showNotification('Institution mise à jour avec succès', 'success');
      return updatedInstitution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'institution';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur mise à jour institution:', err);
      throw err;
    }
  }, [institutionId, showNotification]);

  // Valider l'institution
  const validateInstitution = useCallback(async (validationData: {
    license_number: string;
    tax_id: string;
    regulatory_status: string;
    legal_representative: string;
  }) => {
    if (!institutionId) {
      const errorMessage = 'Institution ID non disponible';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw new Error(errorMessage);
    }

    try {
      setError(null);
      const result = await institutionApi.validateInstitution(institutionId, validationData);
      showNotification('Institution validée avec succès', 'success');
      // Recharger les données de l'institution après validation
      await loadInstitution();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la validation de l\'institution';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur validation institution:', err);
      throw err;
    }
  }, [institutionId, showNotification, loadInstitution]);

  return {
    institution,
    institutionId,
    loading,
    error,
    updateInstitution,
    validateInstitution,
    refetch: () => loadInstitution(institutionId || undefined)
  };
}

/**
 * Hook pour la gestion des gestionnaires de l'institution
 */
export function useInstitutionManagers() {
  const [managers, setManagers] = useState<InstitutionManager[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const { institutionId } = useAuth();

  // Charger les gestionnaires
  const loadManagers = useCallback(async () => {
    if (!institutionId) {
      console.warn('⚠️ Impossible de charger les gestionnaires: institutionId non disponible');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await institutionApi.getInstitutionManagers(institutionId);
      setManagers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des gestionnaires';
      setError(errorMessage);
      console.error('Erreur gestionnaires:', err);
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  // Ajouter un gestionnaire
  const addManager = useCallback(async (manager: { 
    user_id: string; 
    role: 'admin' | 'manager';
  }) => {
    if (!institutionId) {
      throw new Error('Institution ID non disponible');
    }

    try {
      setError(null);
      const newManager = await institutionApi.addInstitutionManager(institutionId, manager);
      setManagers(prev => [...prev, newManager]);
      showNotification('Gestionnaire ajouté avec succès', 'success');
      return newManager;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du gestionnaire';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur ajout gestionnaire:', err);
      throw err;
    }
  }, [institutionId, showNotification]);

  // Mettre à jour un gestionnaire
  const updateManager = useCallback(async (managerId: string, updates: {
    role?: 'admin' | 'manager';
  }) => {
    if (!institutionId) {
      throw new Error('Institution ID non disponible');
    }

    try {
      setError(null);
      const updatedManager = await institutionApi.updateInstitutionManager(institutionId, managerId, updates);
      setManagers(prev => prev.map(m => m.id === managerId ? updatedManager : m));
      showNotification('Gestionnaire mis à jour avec succès', 'success');
      return updatedManager;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du gestionnaire';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur mise à jour gestionnaire:', err);
      throw err;
    }
  }, [institutionId, showNotification]);

  // Supprimer un gestionnaire
  const removeManager = useCallback(async (managerId: string) => {
    if (!institutionId) {
      throw new Error('Institution ID non disponible');
    }

    try {
      setError(null);
      await institutionApi.removeInstitutionManager(institutionId, managerId);
      setManagers(prev => prev.filter(m => m.id !== managerId));
      showNotification('Gestionnaire supprimé avec succès', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du gestionnaire';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur suppression gestionnaire:', err);
      throw err;
    }
  }, [institutionId, showNotification]);

  // Charger les gestionnaires au montage du composant
  useEffect(() => {
    if (institutionId) {
      loadManagers();
    }
  }, [institutionId, loadManagers]);

  return {
    managers,
    loading,
    error,
    addManager,
    updateManager,
    removeManager,
    refetch: loadManagers
  };
}

/**
 * Hook pour la gestion des documents de l'institution
 */
export function useInstitutionDocuments() {
  const [documents, setDocuments] = useState<Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    uploadDate: string;
    description?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const { institutionId } = useAuth();

  // Charger les documents
  const loadDocuments = useCallback(async () => {
    if (!institutionId) {
      console.warn('⚠️ Impossible de charger les documents: institutionId non disponible');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await institutionApi.getInstitutionDocuments(institutionId);
      setDocuments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des documents';
      setError(errorMessage);
      console.error('Erreur documents:', err);
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  // Téléverser un document
  const uploadDocument = useCallback(async (file: File, metadata: { 
    type: 'license' | 'agreement' | 'certificate' | 'other';
    name: string;
    description?: string;
  }) => {
    if (!institutionId) {
      throw new Error('Institution ID non disponible');
    }

    try {
      setError(null);
      const result = await institutionApi.uploadInstitutionDocument(institutionId, file, metadata);
      showNotification('Document téléversé avec succès', 'success');
      // Recharger la liste des documents
      await loadDocuments();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du téléversement du document';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur téléversement document:', err);
      throw err;
    }
  }, [institutionId, showNotification, loadDocuments]);

  // Charger les documents au montage du composant
  useEffect(() => {
    if (institutionId) {
      loadDocuments();
    }
  }, [institutionId, loadDocuments]);

  return {
    documents,
    loading,
    error,
    uploadDocument,
    refetch: loadDocuments
  };
}

/**
 * Hook compatible avec l'ancien useOrganization (localStorage)
 * Fournit une interface de migration progressive
 */
export function useInstitutionApiCompat() {
  const {
    institution,
    loading,
    error,
    updateInstitution
  } = useInstitutionApi();

  return {
    organization: institution, // Alias pour compatibilité
    institution,
    loading,
    error,
    updateOrganization: updateInstitution, // Alias pour compatibilité
    updateInstitution,
    refetch: () => {} // Placeholder pour compatibilité
  };
}
