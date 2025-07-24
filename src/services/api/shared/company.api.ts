// src/services/api/shared/company.api.ts
import { apiClient } from '../base.api';
import type { Company } from '../../../types/company';

/**
 * API pour les opérations liées aux entreprises
 */
export const companyApi = {
  /**
   * Récupère toutes les entreprises
   */
  getAllCompanies: () => {
    return apiClient.get<Company[]>('/companies');
  },

  /**
   * Récupère une entreprise par son ID
   */
  getCompanyById: (id: string) => {
    return apiClient.get<Company>(`/companies/${id}`);
  },

  /**
   * Crée une nouvelle entreprise
   */
  createCompany: (company: Partial<Company>) => {
    return apiClient.post<Company>('/companies', company);
  },

  /**
   * Met à jour une entreprise existante
   */
  updateCompany: (id: string, company: Partial<Company>) => {
    return apiClient.put<Company>(`/companies/${id}`, company);
  },

  /**
   * Supprime une entreprise
   */
  deleteCompany: (id: string) => {
    return apiClient.delete(`/companies/${id}`);
  },

  /**
   * Recherche des entreprises par terme de recherche
   */
  searchCompanies: (searchTerm: string) => {
    return apiClient.get<Company[]>(`/companies/search?q=${encodeURIComponent(searchTerm)}`);
  },

  /**
   * Téléverse un document pour une entreprise
   */
  uploadCompanyDocument: (companyId: string, file: File, metadata: { type: string; description?: string }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', metadata.type);
    if (metadata.description) {
      formData.append('description', metadata.description);
    }

    return apiClient.upload<{ id: string; url: string }>(`/companies/${companyId}/documents`, formData);
  },

  /**
   * Récupère tous les documents d'une entreprise
   */
  getCompanyDocuments: (companyId: string) => {
    return apiClient.get<Array<{
      id: string;
      name: string;
      type: string;
      url: string;
      size: number;
      uploadDate: string;
      description?: string;
    }>>(`/companies/${companyId}/documents`);
  },
};
