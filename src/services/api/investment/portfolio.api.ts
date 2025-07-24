// src/services/api/investment/portfolio.api.ts
import { apiClient } from '../base.api';
import type { InvestmentPortfolio, InvestmentAsset } from '../../../types/investment-portfolio';

/**
 * API pour les portefeuilles d'investissement
 */
export const investmentPortfolioApi = {
  /**
   * Récupère tous les portefeuilles d'investissement
   */
  getAllPortfolios: (filters?: {
    status?: 'active' | 'inactive' | 'pending' | 'archived';
    riskProfile?: 'conservative' | 'moderate' | 'aggressive';
    minAmount?: number;
    sector?: string;
    investmentStage?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.riskProfile) params.append('riskProfile', filters.riskProfile);
    if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
    if (filters?.sector) params.append('sector', filters.sector);
    if (filters?.investmentStage) params.append('investmentStage', filters.investmentStage);

    return apiClient.get<InvestmentPortfolio[]>(`/portfolios/investment?${params.toString()}`);
  },

  /**
   * Récupère un portefeuille d'investissement par son ID
   */
  getPortfolioById: (id: string) => {
    return apiClient.get<InvestmentPortfolio>(`/portfolios/investment/${id}`);
  },

  /**
   * Crée un nouveau portefeuille d'investissement
   */
  createPortfolio: (portfolio: Omit<InvestmentPortfolio, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<InvestmentPortfolio>('/portfolios/investment', portfolio);
  },

  /**
   * Met à jour un portefeuille d'investissement
   */
  updatePortfolio: (id: string, updates: Partial<InvestmentPortfolio>) => {
    return apiClient.put<InvestmentPortfolio>(`/portfolios/investment/${id}`, updates);
  },

  /**
   * Change le statut d'un portefeuille d'investissement
   */
  updatePortfolioStatus: (id: string, status: 'active' | 'inactive' | 'pending' | 'archived') => {
    return apiClient.put<InvestmentPortfolio>(`/portfolios/investment/${id}/status`, { status });
  },

  /**
   * Récupère tous les actifs d'un portefeuille d'investissement
   */
  getPortfolioAssets: (portfolioId: string) => {
    return apiClient.get<InvestmentAsset[]>(`/portfolios/investment/${portfolioId}/assets`);
  },

  /**
   * Ajoute un actif à un portefeuille d'investissement
   */
  addPortfolioAsset: (portfolioId: string, asset: Omit<InvestmentAsset, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<InvestmentAsset>(`/portfolios/investment/${portfolioId}/assets`, asset);
  },

  /**
   * Met à jour un actif d'un portefeuille d'investissement
   */
  updatePortfolioAsset: (portfolioId: string, assetId: string, updates: Partial<InvestmentAsset>) => {
    return apiClient.put<InvestmentAsset>(`/portfolios/investment/${portfolioId}/assets/${assetId}`, updates);
  },

  /**
   * Supprime un actif d'un portefeuille d'investissement
   */
  deletePortfolioAsset: (portfolioId: string, assetId: string) => {
    return apiClient.delete(`/portfolios/investment/${portfolioId}/assets/${assetId}`);
  },

  /**
   * Récupère les métriques détaillées pour un portefeuille d'investissement
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
        numberOfAssets: number;
        sectorDistribution: Array<{ sector: string; percentage: number }>;
        stageDistribution: Array<{ stage: string; percentage: number }>;
        topInvestments: Array<{ id: string; name: string; value: number }>;
      };
      returns: {
        irr: number;
        multiple: number;
        realized: number;
        unrealized: number;
      };
    }>(`/portfolios/investment/${portfolioId}/metrics`);
  },
  
  /**
   * Récupère le marché des titres disponibles pour investissement
   */
  getMarketSecurities: (filters?: {
    sector?: string;
    minPrice?: number;
    maxPrice?: number;
    type?: 'share' | 'bond' | 'other';
  }) => {
    const params = new URLSearchParams();
    if (filters?.sector) params.append('sector', filters.sector);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.type) params.append('type', filters.type);

    return apiClient.get<Array<{
      id: string;
      name: string;
      type: 'share' | 'bond' | 'other';
      price: number;
      currency: string;
      sector: string;
      risk: number;
      description: string;
    }>>(`/market/securities?${params.toString()}`);
  },
};
