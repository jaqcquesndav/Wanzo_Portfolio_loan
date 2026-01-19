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
   */
  getAllPortfolios: async (filters?: {
    status?: 'active' | 'inactive' | 'pending' | 'archived';
    riskProfile?: 'conservative' | 'moderate' | 'aggressive';
    minAmount?: number;
    sector?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.riskProfile) params.append('riskProfile', filters.riskProfile);
    if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
    if (filters?.sector) params.append('sector', filters.sector);

    return await apiClient.get<TraditionalPortfolio[]>(`/portfolios/traditional?${params.toString()}`);
  },

  /**
   * Récupère un portefeuille traditionnel par son ID
   */
  getPortfolioById: async (id: string) => {
    return await apiClient.get<TraditionalPortfolio>(`/portfolios/traditional/${id}`);
  },

  /**
   * Crée un nouveau portefeuille traditionnel
   */
  createPortfolio: async (portfolio: Omit<TraditionalPortfolio, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('📡 API: POST /portfolios/traditional', portfolio);
    const response = await apiClient.post<TraditionalPortfolio>('/portfolios/traditional', portfolio);
    console.log('✅ API: Portefeuille créé avec succès', response);
    return response;
  },

  /**
   * Met à jour un portefeuille traditionnel
   */
  updatePortfolio: async (id: string, updates: Partial<TraditionalPortfolio>) => {
    return await apiClient.put<TraditionalPortfolio>(`/portfolios/traditional/${id}`, updates);
  },

  /**
   * Change le statut d'un portefeuille traditionnel
   */
  changeStatus: async (id: string, status: 'active' | 'inactive' | 'pending' | 'archived') => {
    return await apiClient.post<TraditionalPortfolio>(`/portfolios/traditional/${id}/status`, { status });
  },

  /**
   * Supprime un portefeuille traditionnel
   */
  deletePortfolio: async (id: string) => {
    return await apiClient.delete(`/portfolios/traditional/${id}`);
  },

  /**
   * Récupère les performances d'un portefeuille traditionnel
   */
  getPortfolioPerformance: async (id: string, period: 'monthly' | 'quarterly' | 'yearly') => {
    return await apiClient.get(`/portfolios/traditional/${id}/performance?period=${period}`);
  },

  /**
   * Récupère l'historique des activités d'un portefeuille traditionnel
   */
  getActivityHistory: async (id: string, page = 1, limit = 10) => {
    return await apiClient.get(`/portfolios/traditional/${id}/activities?page=${page}&limit=${limit}`);
  }
};
