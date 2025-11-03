// src/hooks/useInstitutionApi.ts
// Hook pour accéder aux institutions via l'API backend

import { useState, useEffect, useCallback } from 'react';
import { institutionApi } from '../services/api/shared/institution.api';
import type { Institution, InstitutionManager } from '../types/institution';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Hook principal pour la gestion de l'institution courante
 */
export function useInstitutionApi() {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Charger les informations de l'institution courante
  const loadInstitution = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await institutionApi.getCurrentInstitution();
      setInstitution(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'institution';
      setError(errorMessage);
      console.error('Erreur institution:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour l'institution
  const updateInstitution = useCallback(async (updates: Partial<Institution>) => {
    try {
      setError(null);
      const updatedInstitution = await institutionApi.updateInstitution(updates);
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
  }, [showNotification]);

  // Valider l'institution
  const validateInstitution = useCallback(async (validationData: {
    license_number: string;
    tax_id: string;
    regulatory_status: string;
    legal_representative: string;
  }) => {
    try {
      setError(null);
      const result = await institutionApi.validateInstitution(validationData);
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
  }, [showNotification, loadInstitution]);

  // Charger l'institution au montage du composant
  useEffect(() => {
    loadInstitution();
  }, [loadInstitution]);

  return {
    institution,
    loading,
    error,
    updateInstitution,
    validateInstitution,
    refetch: loadInstitution
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

  // Charger les gestionnaires
  const loadManagers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await institutionApi.getInstitutionManagers();
      setManagers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des gestionnaires';
      setError(errorMessage);
      console.error('Erreur gestionnaires:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Ajouter un gestionnaire
  const addManager = useCallback(async (manager: { 
    user_id: string; 
    role: 'admin' | 'manager';
  }) => {
    try {
      setError(null);
      const newManager = await institutionApi.addInstitutionManager(manager);
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
  }, [showNotification]);

  // Mettre à jour un gestionnaire
  const updateManager = useCallback(async (id: string, updates: {
    role?: 'admin' | 'manager';
  }) => {
    try {
      setError(null);
      const updatedManager = await institutionApi.updateInstitutionManager(id, updates);
      setManagers(prev => prev.map(m => m.id === id ? updatedManager : m));
      showNotification('Gestionnaire mis à jour avec succès', 'success');
      return updatedManager;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du gestionnaire';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur mise à jour gestionnaire:', err);
      throw err;
    }
  }, [showNotification]);

  // Supprimer un gestionnaire
  const removeManager = useCallback(async (id: string) => {
    try {
      setError(null);
      await institutionApi.removeInstitutionManager(id);
      setManagers(prev => prev.filter(m => m.id !== id));
      showNotification('Gestionnaire supprimé avec succès', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du gestionnaire';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur suppression gestionnaire:', err);
      throw err;
    }
  }, [showNotification]);

  // Charger les gestionnaires au montage du composant
  useEffect(() => {
    loadManagers();
  }, [loadManagers]);

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

  // Charger les documents
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await institutionApi.getInstitutionDocuments();
      setDocuments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des documents';
      setError(errorMessage);
      console.error('Erreur documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Téléverser un document
  const uploadDocument = useCallback(async (file: File, metadata: { 
    type: 'license' | 'agreement' | 'certificate' | 'other';
    name: string;
    description?: string;
  }) => {
    try {
      setError(null);
      const result = await institutionApi.uploadInstitutionDocument(file, metadata);
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
  }, [showNotification, loadDocuments]);

  // Charger les documents au montage du composant
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

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