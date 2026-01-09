// src/services/api/traditional/guarantee.api.ts
import { apiClient } from '../base.api';
import { traditionalDataService } from './dataService';
import type { Guarantee } from '../../../types/guarantee';

// Type pour les réponses de l'API
export type ApiResponse<T> = {
  data: {
    success: boolean;
    data: T;
  }
};

// Interfaces pour les formats de réponse API
export interface GuaranteeResponse {
  id: string;
  contract_id: string;
  type: string;
  description: string;
  value: number;
  currency: string;
  coverage_ratio: number;
  status: 'pending_validation' | 'validated' | 'rejected';
  validation_date?: string;
  validator_id?: string;
  validator_name?: string;
  last_valuation_date?: string;
  next_valuation_date?: string;
  location?: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  details?: Record<string, string | number | boolean>;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    created_at: string;
  }>;
  valuation_history?: Array<{
    date: string;
    value: number;
    currency: string;
    method: string;
    appraiser: string;
    report_document_id: string;
    notes?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface GuaranteeTypeResponse {
  id: string;
  name: string;
  description: string;
  valuation_method: string;
  coverage_ratio: number;
  required_documents: Array<{
    type: string;
    name: string;
    required: boolean;
  }>;
  revaluation_frequency: string;
}

export interface GuaranteeStatsResponse {
  total_guarantees_count: number;
  total_guarantees_value: number;
  average_coverage_ratio: number;
  by_type: Array<{
    type: string;
    count: number;
    value: number;
    percentage: number;
  }>;
  by_status: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  pending_revaluations: number;
  overdue_revaluations: number;
}

/**
 * API pour les opérations liées aux garanties
 */
export const guaranteeApi = {
  /**
   * Récupère la liste des garanties d'un contrat
   */
  getContractGuarantees: (portfolioId: string, contractId: string) => {
    try {
      return apiClient.get<{ success: boolean; data: GuaranteeResponse[] }>(
        `/portfolios/traditional/${portfolioId}/contracts/${contractId}/guarantees`
      );
    } catch (error) {
      console.warn('Fallback to localStorage for guarantees', error);
      const guarantees = traditionalDataService.getContractRelatedData<Guarantee>(
        contractId, 
        'GUARANTEES'
      );
      
      return Promise.resolve({
        data: {
          success: true,
          data: guarantees.map(mapLocalGuaranteeToApiResponse)
        }
      });
    }
  },

  /**
   * Récupère les détails d'une garantie spécifique
   */
  getGuaranteeDetails: (portfolioId: string, contractId: string, guaranteeId: string) => {
    try {
      return apiClient.get<{ success: boolean; data: GuaranteeResponse }>(
        `/portfolios/traditional/${portfolioId}/contracts/${contractId}/guarantees/${guaranteeId}`
      );
    } catch (error) {
      console.warn('Fallback to localStorage for guarantee details', error);
      const guarantees = traditionalDataService.getContractRelatedData<Guarantee>(
        contractId,
        'GUARANTEES'
      );
      const guarantee = guarantees.find(g => g.id === guaranteeId);
      
      if (!guarantee) {
        return Promise.reject(new Error('Guarantee not found'));
      }
      
      return Promise.resolve({
        data: {
          success: true,
          data: mapLocalGuaranteeToApiResponse(guarantee)
        }
      });
    }
  },

  /**
   * Crée une nouvelle garantie pour un contrat
   */
  createGuarantee: (
    portfolioId: string, 
    contractId: string, 
    guaranteeData: {
      type: string;
      description: string;
      value: number;
      currency: string;
      location?: {
        address: string;
        city: string;
        country: string;
        coordinates?: {
          latitude: number;
          longitude: number;
        };
      };
      details?: Record<string, string | number | boolean>;
      documents?: Array<{
        name: string;
        type: string;
        content: string;
        contentType: string;
      }>;
    }
  ) => {
    return apiClient.post<{ success: boolean; data: GuaranteeResponse }>(
      `/portfolios/traditional/${portfolioId}/contracts/${contractId}/guarantees`,
      guaranteeData
    );
  },

  /**
   * Met à jour une garantie existante
   */
  updateGuarantee: (
    portfolioId: string, 
    contractId: string, 
    guaranteeId: string,
    updates: Partial<{
      description: string;
      value: number;
      details: Record<string, string | number | boolean>;
    }>
  ) => {
    return apiClient.put<{ success: boolean; data: GuaranteeResponse }>(
      `/portfolios/traditional/${portfolioId}/contracts/${contractId}/guarantees/${guaranteeId}`,
      updates
    );
  },

  /**
   * Valide une garantie
   */
  validateGuarantee: (
    portfolioId: string, 
    contractId: string, 
    guaranteeId: string,
    validationData: {
      validator_notes: string;
      value_adjustment?: number;
    }
  ) => {
    return apiClient.post<{ success: boolean; data: GuaranteeResponse }>(
      `/portfolios/traditional/${portfolioId}/contracts/${contractId}/guarantees/${guaranteeId}/validate`,
      validationData
    );
  },

  /**
   * Rejette une garantie
   */
  rejectGuarantee: (
    portfolioId: string, 
    contractId: string, 
    guaranteeId: string,
    rejectionData: {
      rejection_reason: string;
      rejection_notes: string;
    }
  ) => {
    return apiClient.post<{ success: boolean; data: GuaranteeResponse }>(
      `/portfolios/traditional/${portfolioId}/contracts/${contractId}/guarantees/${guaranteeId}/reject`,
      rejectionData
    );
  },

  /**
   * Réévalue une garantie
   */
  revaluateGuarantee: (
    portfolioId: string, 
    contractId: string, 
    guaranteeId: string,
    revaluationData: {
      new_value: number;
      currency: string;
      valuation_date: string;
      method: string;
      appraiser: string;
      notes?: string;
      document?: {
        name: string;
        type: string;
        content: string;
        contentType: string;
      };
    }
  ) => {
    return apiClient.post<{ success: boolean; data: GuaranteeResponse }>(
      `/portfolios/traditional/${portfolioId}/contracts/${contractId}/guarantees/${guaranteeId}/revaluate`,
      revaluationData
    );
  },

  /**
   * Ajoute un document à une garantie
   */
  addGuaranteeDocument: (
    portfolioId: string, 
    contractId: string, 
    guaranteeId: string,
    documentData: {
      name: string;
      type: string;
      content: string;
      contentType: string;
      description?: string;
    }
  ) => {
    return apiClient.post<{ success: boolean; data: { id: string; name: string; type: string; url: string; created_at: string; } }>(
      `/portfolios/traditional/${portfolioId}/contracts/${contractId}/guarantees/${guaranteeId}/documents`,
      documentData
    );
  },

  /**
   * Récupère la liste des types de garanties disponibles
   */
  getGuaranteeTypes: (portfolioId: string) => {
    try {
      return apiClient.get<{ success: boolean; data: GuaranteeTypeResponse[] }>(
        `/portfolios/traditional/${portfolioId}/guarantee-types`
      );
    } catch (error) {
      console.warn('Fallback to mock data for guarantee types', error);
      return Promise.resolve({
        data: {
          success: true,
          data: [{
            id: '1',
            name: 'Matériel',
            description: 'Garantie sur matériel',
            valuation_method: 'market_value',
            coverage_ratio: 0.7,
            required_documents: [
              { type: 'invoice', name: 'Facture d\'achat', required: true },
              { type: 'valuation', name: 'Rapport d\'évaluation', required: false }
            ],
            revaluation_frequency: 'yearly'
          }]
        }
      });
    }
  },

  /**
   * Récupère les statistiques des garanties pour un portefeuille
   */
  getGuaranteeStats: (portfolioId: string) => {
    try {
      return apiClient.get<{ success: boolean; data: GuaranteeStatsResponse }>(
        `/portfolios/traditional/${portfolioId}/guarantees/stats`
      );
    } catch (error) {
      console.warn('Fallback to mock data for guarantee stats', error);
      return Promise.resolve({
        data: {
          success: true,
          data: {
            total_guarantees_count: 0,
            total_guarantees_value: 0,
            average_coverage_ratio: 0,
            by_type: [],
            by_status: [],
            pending_revaluations: 0,
            overdue_revaluations: 0
          }
        }
      });
    }
  }
};

/**
 * Fonction utilitaire pour mapper une garantie locale au format de réponse API
 */
function mapLocalGuaranteeToApiResponse(guarantee: Guarantee): GuaranteeResponse {
  return {
    id: guarantee.id,
    contract_id: guarantee.contractId || '',
    type: guarantee.type,
    description: guarantee.details?.description || 'Aucune description',
    value: guarantee.value,
    currency: 'XOF', // Valeur par défaut
    coverage_ratio: 100, // Valeur par défaut
    status: 'validated', // Valeur par défaut
    created_at: guarantee.created_at,
    updated_at: guarantee.created_at,
    location: guarantee.details?.location ? {
      address: guarantee.details.location,
      city: 'N/A',
      country: 'CI'
    } : undefined,
    details: {
      ...guarantee.details,
      reference: guarantee.details?.reference || guarantee.contractReference || ''
    },
    documents: guarantee.details?.document_url ? [
      {
        id: `doc-${guarantee.id}`,
        name: 'Document principal',
        type: 'main',
        url: guarantee.details.document_url,
        created_at: guarantee.created_at
      }
    ] : []
  };
}

// ============================================================================
// API CONFORME À LA DOCUMENTATION - /portfolios/traditional/guarantees
// ============================================================================

/**
 * API pour les garanties conforme à la documentation officielle
 * Base URL: /portfolios/traditional/guarantees
 */
export const guaranteeApiV2 = {
  /**
   * Liste des garanties d'un portefeuille
   * GET /portfolios/traditional/guarantees?portfolioId=xxx
   */
  getAllGuarantees: async (portfolioId: string, filters?: {
    contractId?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: Guarantee[]; meta?: { total: number; page: number; limit: number; totalPages: number } }> => {
    try {
      const params = new URLSearchParams();
      params.append('portfolioId', portfolioId);
      if (filters?.contractId) params.append('contractId', filters.contractId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      return await apiClient.get<{ success: boolean; data: Guarantee[]; meta?: { total: number; page: number; limit: number; totalPages: number } }>(
        `/portfolios/traditional/guarantees?${params.toString()}`
      );
    } catch (error) {
      console.warn('Fallback to localStorage for guarantees', error);
      const allGuarantees = traditionalDataService.getAllGuarantees?.() || [];
      let filteredGuarantees = allGuarantees.filter((g: Guarantee) => g.portfolioId === portfolioId);
      
      if (filters?.contractId) {
        filteredGuarantees = filteredGuarantees.filter((g: Guarantee) => g.contractId === filters.contractId);
      }
      if (filters?.type) {
        filteredGuarantees = filteredGuarantees.filter((g: Guarantee) => g.type === filters.type);
      }
      if (filters?.status) {
        filteredGuarantees = filteredGuarantees.filter((g: Guarantee) => g.status === filters.status);
      }

      return { success: true, data: filteredGuarantees };
    }
  },

  /**
   * Détails d'une garantie
   * GET /portfolios/traditional/guarantees/{id}
   */
  getGuaranteeById: async (id: string): Promise<Guarantee> => {
    try {
      return await apiClient.get<Guarantee>(`/portfolios/traditional/guarantees/${id}`);
    } catch (error) {
      console.warn(`Fallback to localStorage for guarantee ${id}`, error);
      const allGuarantees = traditionalDataService.getAllGuarantees?.() || [];
      const guarantee = allGuarantees.find((g: Guarantee) => g.id === id);
      if (!guarantee) {
        throw new Error(`Guarantee with ID ${id} not found`);
      }
      return guarantee;
    }
  },

  /**
   * Créer une garantie
   * POST /portfolios/traditional/guarantees
   */
  createGuarantee: async (guaranteeData: Omit<Guarantee, 'id' | 'created_at'>): Promise<Guarantee> => {
    try {
      return await apiClient.post<Guarantee>('/portfolios/traditional/guarantees', guaranteeData);
    } catch (error) {
      console.warn('Fallback to localStorage for creating guarantee', error);
      const newGuarantee: Guarantee = {
        ...guaranteeData,
        id: `guarantee-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      traditionalDataService.addGuarantee?.(newGuarantee);
      return newGuarantee;
    }
  },

  /**
   * Mettre à jour une garantie
   * PUT /portfolios/traditional/guarantees/{id}
   */
  updateGuarantee: async (id: string, updates: Partial<Guarantee>): Promise<Guarantee> => {
    try {
      return await apiClient.put<Guarantee>(`/portfolios/traditional/guarantees/${id}`, updates);
    } catch (error) {
      console.warn(`Fallback to localStorage for updating guarantee ${id}`, error);
      const allGuarantees = traditionalDataService.getAllGuarantees?.() || [];
      const guaranteeIndex = allGuarantees.findIndex((g: Guarantee) => g.id === id);
      if (guaranteeIndex === -1) {
        throw new Error(`Guarantee with ID ${id} not found`);
      }
      const updatedGuarantee = { ...allGuarantees[guaranteeIndex], ...updates };
      traditionalDataService.updateGuarantee?.(updatedGuarantee);
      return updatedGuarantee;
    }
  },

  /**
   * Libérer une garantie (mainlevée)
   * POST /portfolios/traditional/guarantees/{id}/release
   */
  releaseGuarantee: async (id: string, releaseData: {
    release_date: string;
    reason: string;
  }): Promise<Guarantee> => {
    try {
      return await apiClient.post<Guarantee>(`/portfolios/traditional/guarantees/${id}/release`, releaseData);
    } catch (error) {
      console.warn(`Fallback to localStorage for releasing guarantee ${id}`, error);
      const allGuarantees = traditionalDataService.getAllGuarantees?.() || [];
      const guaranteeIndex = allGuarantees.findIndex((g: Guarantee) => g.id === id);
      if (guaranteeIndex === -1) {
        throw new Error(`Guarantee with ID ${id} not found`);
      }
      const updatedGuarantee: Guarantee = { 
        ...allGuarantees[guaranteeIndex], 
        status: 'libérée'
      };
      traditionalDataService.updateGuarantee?.(updatedGuarantee);
      return updatedGuarantee;
    }
  },

  /**
   * Saisir une garantie
   * POST /portfolios/traditional/guarantees/{id}/seize
   */
  seizeGuarantee: async (id: string, seizureData: {
    seizure_date: string;
    reason: string;
    legal_reference?: string;
  }): Promise<Guarantee> => {
    try {
      return await apiClient.post<Guarantee>(`/portfolios/traditional/guarantees/${id}/seize`, seizureData);
    } catch (error) {
      console.warn(`Fallback to localStorage for seizing guarantee ${id}`, error);
      const allGuarantees = traditionalDataService.getAllGuarantees?.() || [];
      const guaranteeIndex = allGuarantees.findIndex((g: Guarantee) => g.id === id);
      if (guaranteeIndex === -1) {
        throw new Error(`Guarantee with ID ${id} not found`);
      }
      const updatedGuarantee: Guarantee = { 
        ...allGuarantees[guaranteeIndex], 
        status: 'saisie'
      };
      traditionalDataService.updateGuarantee?.(updatedGuarantee);
      return updatedGuarantee;
    }
  },

  /**
   * Supprimer une garantie
   * DELETE /portfolios/traditional/guarantees/{id}
   * Seules les garanties avec statut 'pending' peuvent être supprimées
   */
  deleteGuarantee: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/portfolios/traditional/guarantees/${id}`);
      return true;
    } catch (error) {
      console.warn(`Fallback to localStorage for deleting guarantee ${id}`, error);
      traditionalDataService.deleteGuarantee?.(id);
      return true;
    }
  }
};
