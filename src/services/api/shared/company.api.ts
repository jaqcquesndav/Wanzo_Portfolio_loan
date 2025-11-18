// src/services/api/shared/company.api.ts
import { apiClient } from '../base.api';
import type { Company, CompanySize, CompanyStatus, FinancialRating } from '../../../types/company';

/**
 * Filtres de prospection conformes à ProspectionFiltersDto
 */
export interface ProspectionFilters {
  sector?: string;                    // Filtre par secteur d'activité
  size?: CompanySize;                 // Taille: small, medium, large
  status?: CompanyStatus;             // Statut: active, pending, contacted, qualified, rejected
  minCreditScore?: number;            // Score minimum (0-100)
  maxCreditScore?: number;            // Score maximum (0-100)
  financialRating?: FinancialRating;  // Rating financier (AAA-E)
  searchTerm?: string;                // Recherche par nom ou secteur
  page?: number;                      // Numéro de page (défaut: 1)
  limit?: number;                     // Éléments par page (défaut: 20, max: 100)
}

/**
 * Paramètres de recherche géographique
 */
export interface NearbySearchParams extends ProspectionFilters {
  latitude: number;                   // Latitude (-90 à 90)
  longitude: number;                  // Longitude (-180 à 180)
  radiusKm?: number;                  // Rayon en km (défaut: 50, max: 1000)
}

/**
 * Statistiques de prospection
 */
export interface ProspectionStats {
  totalProspects: number;
  bySector: Record<string, number>;
  bySize: Record<string, number>;
  byFinancialRating: Record<string, number>;
  averageCreditScore: number;
  dataFreshness: {
    withFreshAccountingData: number;
    withFreshCustomerData: number;
  };
  lastCalculated: string;
}

/**
 * Réponse paginée
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * API pour les opérations liées aux entreprises
 */
export const companyApi = {
  /**
   * Récupère toutes les entreprises avec filtres de prospection
   */
  getAllCompanies: (filters?: ProspectionFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.sector) params.append('sector', filters.sector);
      if (filters.size) params.append('size', filters.size);
      if (filters.status) params.append('status', filters.status);
      if (filters.minCreditScore !== undefined) params.append('minCreditScore', filters.minCreditScore.toString());
      if (filters.maxCreditScore !== undefined) params.append('maxCreditScore', filters.maxCreditScore.toString());
      if (filters.financialRating) params.append('financialRating', filters.financialRating);
      if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }
    
    const queryString = params.toString();
    const url = queryString ? `/companies?${queryString}` : '/companies';
    
    return apiClient.get<PaginatedResponse<Company>>(url);
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

  /**
   * Recherche de prospects par proximité géographique (Haversine)
   */
  getNearbyCompanies: (params: NearbySearchParams) => {
    const searchParams = new URLSearchParams();
    
    searchParams.append('latitude', params.latitude.toString());
    searchParams.append('longitude', params.longitude.toString());
    if (params.radiusKm) searchParams.append('radiusKm', params.radiusKm.toString());
    
    // Ajouter les filtres optionnels
    if (params.sector) searchParams.append('sector', params.sector);
    if (params.size) searchParams.append('size', params.size);
    if (params.status) searchParams.append('status', params.status);
    if (params.minCreditScore !== undefined) searchParams.append('minCreditScore', params.minCreditScore.toString());
    if (params.maxCreditScore !== undefined) searchParams.append('maxCreditScore', params.maxCreditScore.toString());
    if (params.financialRating) searchParams.append('financialRating', params.financialRating);
    
    return apiClient.get<Array<Company & { distance: number }>>(`/companies/nearby?${searchParams.toString()}`);
  },

  /**
   * Récupère les statistiques de prospection
   */
  getCompanyStats: () => {
    return apiClient.get<ProspectionStats>('/companies/stats');
  },

  /**
   * Synchronisation manuelle depuis accounting-service
   * Requiert permissions: admin ou portfolio_manager
   */
  syncCompany: (id: string) => {
    return apiClient.post<{
      message: string;
      prospect: {
        id: string;
        name: string;
        lastSyncFromAccounting: string;
      };
    }>(`/companies/${id}/sync`, {});
  },

  /**
   * Synchronisation complète (accounting + customer services)
   * Requiert permissions: admin ou portfolio_manager
   */
  syncCompanyComplete: (id: string) => {
    return apiClient.post<{
      id: string;
      name: string;
      profileCompleteness: number;
      lastSyncFromAccounting: string;
      lastSyncFromCustomer: string;
      syncStatus: {
        accounting: string;
        customer: string;
      };
    }>(`/companies/${id}/sync-complete`, {});
  },
};
