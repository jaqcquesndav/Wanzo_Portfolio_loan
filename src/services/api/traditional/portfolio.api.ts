// src/services/api/traditional/portfolio.api.ts
import { apiClient } from '../base.api';
import type { TraditionalPortfolio } from '../../../types/traditional-portfolio';
import type { FinancialProduct } from '../../../types/financial-product';

/**
 * API pour les portefeuilles traditionnels
 */
export const traditionalPortfolioApi = {
  /**
   * Récupère tous les portefeuilles traditionnels
   */
  getAllPortfolios: (filters?: {
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

    return apiClient.get<TraditionalPortfolio[]>(`/portfolios/traditional?${params.toString()}`);
  },

  /**
   * Récupère un portefeuille traditionnel par son ID
   */
  getPortfolioById: (id: string) => {
    return apiClient.get<TraditionalPortfolio>(`/portfolios/traditional/${id}`);
  },

  /**
   * Crée un nouveau portefeuille traditionnel
   */
  createPortfolio: (portfolio: Omit<TraditionalPortfolio, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<TraditionalPortfolio>('/portfolios/traditional', portfolio);
  },

  /**
   * Met à jour un portefeuille traditionnel
   */
  updatePortfolio: (id: string, updates: Partial<TraditionalPortfolio>) => {
    return apiClient.put<TraditionalPortfolio>(`/portfolios/traditional/${id}`, updates);
  },

  /**
   * Change le statut d'un portefeuille traditionnel
   */
  updatePortfolioStatus: (id: string, status: 'active' | 'inactive' | 'pending' | 'archived') => {
    return apiClient.put<TraditionalPortfolio>(`/portfolios/traditional/${id}/status`, { status });
  },

  /**
   * Récupère tous les produits financiers d'un portefeuille traditionnel
   */
  getPortfolioProducts: (portfolioId: string) => {
    return apiClient.get<FinancialProduct[]>(`/portfolios/traditional/${portfolioId}/products`);
  },

  /**
   * Ajoute un produit financier à un portefeuille traditionnel
   */
  addPortfolioProduct: (portfolioId: string, product: Omit<FinancialProduct, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<FinancialProduct>(`/portfolios/traditional/${portfolioId}/products`, product);
  },

  /**
   * Met à jour un produit financier d'un portefeuille traditionnel
   */
  updatePortfolioProduct: (portfolioId: string, productId: string, updates: Partial<FinancialProduct>) => {
    return apiClient.put<FinancialProduct>(`/portfolios/traditional/${portfolioId}/products/${productId}`, updates);
  },

  /**
   * Supprime un produit financier d'un portefeuille traditionnel
   */
  deletePortfolioProduct: (portfolioId: string, productId: string) => {
    return apiClient.delete(`/portfolios/traditional/${portfolioId}/products/${productId}`);
  },

  /**
   * Récupère les métriques détaillées pour un portefeuille traditionnel
   */
  getPortfolioMetrics: (portfolioId: string) => {
    return apiClient.get<{
      performance: {
        current: number;
        monthly: number;
        quarterly: number;
        yearly: number;
        historical: Array<{ date: string; value: number }>;
      };
      risk: {
        riskScore: number;
        volatility: number;
        sharpeRatio: number;
        maxDrawdown: number;
      };
      portfolio: {
        totalValue: number;
        numberOfProducts: number;
        sectorDistribution: Array<{ sector: string; percentage: number }>;
        topProducts: Array<{ id: string; name: string; value: number }>;
      };
      ageingBalance: {
        total: number;
        echeance_0_30: number;
        echeance_31_60: number;
        echeance_61_90: number;
        echeance_91_plus: number;
      };
      ratios: {
        taux_impayes: number;
        taux_couverture: number;
        taux_recouvrement: number;
      };
    }>(`/portfolios/traditional/${portfolioId}/metrics`);
  },
};
