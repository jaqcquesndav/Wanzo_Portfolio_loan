// src/services/api/shared/institution.api.ts
import { apiClient } from '../base.api';
import type { Institution, InstitutionManager } from '../../../types/institution';

/**
 * API pour les opérations liées aux institutions financières
 */
export const institutionApi = {
  /**
   * Récupère les informations de l'institution actuelle
   */
  getCurrentInstitution: () => {
    return apiClient.get<Institution>('/institution');
  },

  /**
   * Met à jour les informations de l'institution
   */
  updateInstitution: (updates: Partial<Institution>) => {
    return apiClient.put<Institution>('/institution', updates);
  },

  /**
   * Récupère tous les gestionnaires de l'institution
   */
  getInstitutionManagers: () => {
    return apiClient.get<InstitutionManager[]>('/institution/managers');
  },

  /**
   * Ajoute un nouveau gestionnaire à l'institution
   */
  addInstitutionManager: (manager: { 
    user_id: string; 
    role: 'admin' | 'manager';
  }) => {
    return apiClient.post<InstitutionManager>('/institution/managers', manager);
  },

  /**
   * Met à jour un gestionnaire de l'institution
   */
  updateInstitutionManager: (id: string, updates: {
    role?: 'admin' | 'manager';
  }) => {
    return apiClient.put<InstitutionManager>(`/institution/managers/${id}`, updates);
  },

  /**
   * Supprime un gestionnaire de l'institution
   */
  removeInstitutionManager: (id: string) => {
    return apiClient.delete(`/institution/managers/${id}`);
  },

  /**
   * Téléverse un document institutionnel
   */
  uploadInstitutionDocument: (file: File, metadata: { 
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

    return apiClient.upload<{ id: string; url: string }>('/institution/documents', formData);
  },

  /**
   * Récupère tous les documents de l'institution
   */
  getInstitutionDocuments: () => {
    return apiClient.get<Array<{
      id: string;
      name: string;
      type: string;
      url: string;
      size: number;
      uploadDate: string;
      description?: string;
    }>>('/institution/documents');
  },

  /**
   * Valide une institution (pour l'activation initiale)
   */
  validateInstitution: (validationData: {
    license_number: string;
    tax_id: string;
    regulatory_status: string;
    legal_representative: string;
  }) => {
    return apiClient.post<{ status: string; message: string }>('/institution/validate', validationData);
  },
};
