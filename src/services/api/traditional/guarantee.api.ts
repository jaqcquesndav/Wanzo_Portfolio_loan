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
