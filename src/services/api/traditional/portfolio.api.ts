// src/services/api/traditional/portfolio.api.ts
// Mode production: API backend uniquement, pas de fallback

import { apiClient } from '../base.api';
import type { TraditionalPortfolio } from '../../../types/traditional-portfolio';

/**
 * API pour les portefeuilles traditionnels
 * Mode production: toutes les opérations passent par le backend
 */
export const traditionalPortfolioApi = {
  /**
   * Récupère tous les portefeuilles traditionnels
   * GET /portfolios/traditional
   */
  getAllPortfolios: async (filters?: {
    status?: string;
    riskProfile?: 'conservative' | 'moderate' | 'aggressive';
    minAmount?: number;
    sector?: string;
    manager?: string;
    institutionId?: string;
    client?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.riskProfile) params.append('riskProfile', filters.riskProfile);
    if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
    if (filters?.sector) params.append('sector', filters.sector);
    if (filters?.manager) params.append('manager', filters.manager);
    if (filters?.institutionId) params.append('institutionId', filters.institutionId);
    if (filters?.client) params.append('client', filters.client);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return await apiClient.get<TraditionalPortfolio[]>(`/portfolios/traditional?${params.toString()}`);
  },

  /**
   * Récupère un portefeuille traditionnel par son ID
   * GET /portfolios/traditional/:id
   */
  getPortfolioById: async (id: string) => {
    return await apiClient.get<TraditionalPortfolio>(`/portfolios/traditional/${id}`);
  },

  /**
   * Récupère les métriques/KPI d'un portefeuille
   * GET /portfolios/traditional/:id/metrics
   */
  getMetrics: async (id: string) => {
    return await apiClient.get(`/portfolios/traditional/${id}/metrics`);
  },

  /**
   * Récupère les produits d'un portefeuille
   * GET /portfolios/traditional/:id/products
   */
  getProducts: async (id: string) => {
    return await apiClient.get(`/portfolios/traditional/${id}/products`);
  },

  /**
   * Crée un nouveau portefeuille traditionnel
   * POST /portfolios/traditional
   */
  createPortfolio: async (portfolio: Omit<TraditionalPortfolio, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('📡 API: POST /portfolios/traditional', portfolio);
    const response = await apiClient.post<TraditionalPortfolio>('/portfolios/traditional', portfolio);
    console.log('✅ API: Portefeuille créé avec succès', response);
    return response;
  },

  /**
   * Met à jour un portefeuille traditionnel
   * PUT /portfolios/traditional/:id
   * Tous les champs UpdatePortfolioDto sont optionnels
   */
  updatePortfolio: async (id: string, updates: Partial<TraditionalPortfolio>) => {
    return await apiClient.put<TraditionalPortfolio>(`/portfolios/traditional/${id}`, updates);
  },

  /**
   * Supprime un portefeuille traditionnel
   * DELETE /portfolios/traditional/:id (admin only)
   */
  deletePortfolio: async (id: string) => {
    return await apiClient.delete(`/portfolios/traditional/${id}`);
  },

  // ─── Workflow endpoints ────────────────────────────────────────────────────

  /**
   * Active un portefeuille (DRAFT/PENDING → ACTIVE)
   * POST /portfolios/traditional/:id/activate
   */
  activatePortfolio: async (id: string) => {
    return await apiClient.post<TraditionalPortfolio>(`/portfolios/traditional/${id}/activate`, {});
  },

  /**
   * Suspend un portefeuille (ACTIVE → SUSPENDED)
   * POST /portfolios/traditional/:id/suspend
   */
  suspendPortfolio: async (id: string, payload: { reason: string; expected_resume_date?: string }) => {
    return await apiClient.post<TraditionalPortfolio>(`/portfolios/traditional/${id}/suspend`, payload);
  },

  /**
   * Clôture un portefeuille
   * POST /portfolios/traditional/:id/close (admin only)
   */
  closePortfolio: async (id: string, payload?: { closureReason?: string; closureNotes?: string }) => {
    return await apiClient.post<TraditionalPortfolio>(`/portfolios/traditional/${id}/close`, payload ?? {});
  },

  /**
   * Met un portefeuille en vente
   * POST /portfolios/traditional/:id/list-for-sale
   */
  listForSale: async (id: string, payload: { asking_price: number; description?: string }) => {
    return await apiClient.post<TraditionalPortfolio>(`/portfolios/traditional/${id}/list-for-sale`, payload);
  },

  /**
   * Archive un portefeuille
   * POST /portfolios/traditional/:id/archive (admin only)
   */
  archivePortfolio: async (id: string) => {
    return await apiClient.post<TraditionalPortfolio>(`/portfolios/traditional/${id}/archive`, {});
  },

  /**
   * Change le statut d'un portefeuille via l'endpoint générique
   * POST /portfolios/traditional/:id/status
   */
  changeStatus: async (id: string, status: 'active' | 'inactive' | 'pending' | 'archived') => {
    return await apiClient.post<TraditionalPortfolio>(`/portfolios/traditional/${id}/status`, { status });
  },

  /**
   * Récupère l'historique des activités d'un portefeuille traditionnel
   */
  getActivityHistory: async (id: string, page = 1, limit = 10) => {
    return await apiClient.get(`/portfolios/traditional/${id}/activities?page=${page}&limit=${limit}`);
  }
};
