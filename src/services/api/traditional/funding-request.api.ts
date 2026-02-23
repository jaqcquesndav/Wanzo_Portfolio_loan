// src/services/api/traditional/funding-request.api.ts
/**
 * API Demandes de Financement — /portfolios/traditional/funding-requests
 *
 * Module 3 du portfolio-institution-service.
 * Gère les demandes de financement (FundingRequest) avec leur cycle de vie complet.
 *
 * Statuts: pending → under_review → approved → disbursed
 *                                 ↘ rejected / canceled
 */
import { apiClient } from '../base.api';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type FundingRequestStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'canceled'
  | 'disbursed';

export type DurationUnit = 'days' | 'weeks' | 'months' | 'years';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface FinancialData {
  annual_revenue?: number;
  net_profit?: number;
  existing_debts?: number;
  cash_flow?: number;
  assets?: number;
  liabilities?: number;
}

export interface FundingGuarantee {
  type: string;
  description: string;
  value: number;
  currency?: string;
}

/**
 * Payload pour POST /portfolios/traditional/funding-requests
 * CreateFundingRequestDto
 */
export interface CreateFundingRequestDto {
  portfolio_id: string;       // REQUIS — UUID
  client_id: string;          // REQUIS — UUID
  company_name: string;       // REQUIS — non vide
  product_type: string;       // REQUIS — non vide
  amount: number;             // REQUIS — Min(1)
  currency?: string;          // OPTIONNEL — défaut "XOF"
  purpose?: string;           // OPTIONNEL
  duration: number;           // REQUIS
  duration_unit?: DurationUnit; // OPTIONNEL — défaut "months"
  proposed_start_date?: string; // OPTIONNEL — ISO 8601
  financial_data?: FinancialData;
  proposed_guarantees?: FundingGuarantee[];
}

/**
 * Payload pour PUT /portfolios/traditional/funding-requests/:id
 * UpdateFundingRequestDto — tous les champs de Create sont optionnels + status + assigned_to
 */
export interface UpdateFundingRequestDto extends Partial<CreateFundingRequestDto> {
  status?: FundingRequestStatus;
  assigned_to?: string; // UUID analyste
}

/**
 * Objet FundingRequest retourné par le backend
 */
export interface FundingRequest {
  id: string;
  portfolio_id: string;
  client_id: string;
  company_name: string;
  product_type: string;
  amount: number;
  currency: string;
  purpose?: string;
  duration: number;
  duration_unit: DurationUnit;
  proposed_start_date?: string;
  status: FundingRequestStatus;
  assigned_to?: string;
  financial_data?: FinancialData;
  proposed_guarantees?: FundingGuarantee[];
  created_at: string;
  updated_at: string;
}

export interface FundingRequestFilters {
  portfolioId?: string;
  status?: FundingRequestStatus;
  clientId?: string;
  productType?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── API ───────────────────────────────────────────────────────────────────────

export const fundingRequestApi = {
  /**
   * Lister les demandes de financement (paginé, filtré)
   * GET /portfolios/traditional/funding-requests
   */
  getAllRequests: async (filters?: FundingRequestFilters): Promise<FundingRequest[]> => {
    const params = new URLSearchParams();
    if (filters?.portfolioId) params.append('portfolioId', filters.portfolioId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.productType) params.append('productType', filters.productType);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    try {
      return await apiClient.get<FundingRequest[]>(
        `/portfolios/traditional/funding-requests?${params.toString()}`,
      );
    } catch (error) {
      console.warn('Erreur lors de la récupération des demandes de financement', error);
      throw error;
    }
  },

  /**
   * Obtenir une demande de financement par son ID
   * GET /portfolios/traditional/funding-requests/:id
   */
  getRequestById: async (id: string): Promise<FundingRequest> => {
    return apiClient.get<FundingRequest>(`/portfolios/traditional/funding-requests/${id}`);
  },

  /**
   * Créer une demande de financement
   * POST /portfolios/traditional/funding-requests
   */
  createRequest: async (dto: CreateFundingRequestDto): Promise<FundingRequest> => {
    return apiClient.post<FundingRequest>('/portfolios/traditional/funding-requests', {
      ...dto,
      currency: dto.currency ?? 'XOF',
      duration_unit: dto.duration_unit ?? 'months',
    });
  },

  /**
   * Mettre à jour une demande de financement
   * PUT /portfolios/traditional/funding-requests/:id
   */
  updateRequest: async (id: string, dto: UpdateFundingRequestDto): Promise<FundingRequest> => {
    return apiClient.put<FundingRequest>(`/portfolios/traditional/funding-requests/${id}`, dto);
  },

  /**
   * Mettre à jour le statut d'une demande de financement
   * PUT /portfolios/traditional/funding-requests/:id/status
   */
  updateStatus: async (id: string, dto: UpdateFundingRequestDto): Promise<FundingRequest> => {
    return apiClient.put<FundingRequest>(
      `/portfolios/traditional/funding-requests/${id}/status`,
      dto,
    );
  },

  /**
   * Supprimer une demande de financement (admin, manager)
   * DELETE /portfolios/traditional/funding-requests/:id
   */
  deleteRequest: async (id: string): Promise<void> => {
    return apiClient.delete(`/portfolios/traditional/funding-requests/${id}`);
  },
};
