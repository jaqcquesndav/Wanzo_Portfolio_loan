// src/services/api/shared/institution.api.ts
import { apiClient } from '../base.api';
import type { Institution, InstitutionManager } from '../../../types/institution';

/**
 * API pour les opérations liées aux institutions financières
 * 
 * IMPORTANT: L'institutionId doit être passé explicitement car le token JWT
 * ne contient pas cette information. L'institutionId est obtenu via /users/me
 * lors de l'authentification initiale.
 */
export const institutionApi = {
  /**
   * Récupère les informations d'une institution par son ID
   * @param institutionId - L'ID de l'institution (obtenu via /users/me)
   */
  getInstitution: (institutionId: string) => {
    return apiClient.get<Institution>(`/institutions/${institutionId}`);
  },

  /**
   * Met à jour les informations d'une institution
   * @param institutionId - L'ID de l'institution
   * @param updates - Les champs à mettre à jour
   */
  updateInstitution: (institutionId: string, updates: Partial<Institution>) => {
    return apiClient.put<Institution>(`/institutions/${institutionId}`, updates);
  },

  /**
   * Récupère tous les gestionnaires d'une institution
   * @param institutionId - L'ID de l'institution
   */
  getInstitutionManagers: (institutionId: string) => {
    return apiClient.get<InstitutionManager[]>(`/institutions/${institutionId}/managers`);
  },

  /**
   * Ajoute un nouveau gestionnaire à une institution
   * @param institutionId - L'ID de l'institution
   * @param manager - Les données du gestionnaire
   */
  addInstitutionManager: (institutionId: string, manager: { 
    user_id: string; 
    role: 'admin' | 'manager';
  }) => {
    return apiClient.post<InstitutionManager>(`/institutions/${institutionId}/managers`, manager);
  },

  /**
   * Met à jour un gestionnaire d'une institution
   * @param institutionId - L'ID de l'institution
   * @param managerId - L'ID du gestionnaire
   * @param updates - Les champs à mettre à jour
   */
  updateInstitutionManager: (institutionId: string, managerId: string, updates: {
    role?: 'admin' | 'manager';
  }) => {
    return apiClient.put<InstitutionManager>(`/institutions/${institutionId}/managers/${managerId}`, updates);
  },

  /**
   * Supprime un gestionnaire d'une institution
   * @param institutionId - L'ID de l'institution
   * @param managerId - L'ID du gestionnaire
   */
  removeInstitutionManager: (institutionId: string, managerId: string) => {
    return apiClient.delete(`/institutions/${institutionId}/managers/${managerId}`);
  },

  /**
   * Téléverse un document institutionnel
   * @param institutionId - L'ID de l'institution
   * @param file - Le fichier à téléverser
   * @param metadata - Métadonnées du document
   */
  uploadInstitutionDocument: (institutionId: string, file: File, metadata: { 
    type: 'license' | 'agreement' | 'certificate' | 'other';
    name: string;
    description?: string;
  }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', metadata.type);
    formData.append('name', metadata.name);
    if (metadata.description) {
      formData.append('description', metadata.description);
    }

    return apiClient.upload<{ id: string; url: string }>(`/institutions/${institutionId}/documents`, formData);
  },

  /**
   * Récupère tous les documents d'une institution
   * @param institutionId - L'ID de l'institution
   */
  getInstitutionDocuments: (institutionId: string) => {
    return apiClient.get<Array<{
      id: string;
      name: string;
      type: string;
      url: string;
      size: number;
      uploadDate: string;
      description?: string;
    }>>(`/institutions/${institutionId}/documents`);
  },

  /**
   * Valide une institution (pour l'activation initiale)
   * @param institutionId - L'ID de l'institution
   * @param validationData - Données de validation
   */
  validateInstitution: (institutionId: string, validationData: {
    license_number: string;
    tax_id: string;
    regulatory_status: string;
    legal_representative: string;
  }) => {
    return apiClient.post<{ status: string; message: string }>(`/institutions/${institutionId}/validate`, validationData);
  },
};
