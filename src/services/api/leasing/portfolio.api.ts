// src/services/api/leasing/portfolio.api.ts
import { apiClient } from '../base.api';
import type { LeasingPortfolio } from '../../../types/leasing';

/**
 * API pour les portefeuilles de leasing
 */
export const leasingPortfolioApi = {
  /**
   * Récupère tous les portefeuilles de leasing
   */
  getAllPortfolios: (filters?: {
    status?: 'active' | 'inactive' | 'pending' | 'archived';
    sector?: string;
    minAmount?: number;
    maxAmount?: number;
    companyId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.sector) params.append('sector', filters.sector);
    if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
    if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
    if (filters?.companyId) params.append('companyId', filters.companyId);

    return apiClient.get<LeasingPortfolio[]>(`/portfolios/leasing?${params.toString()}`);
  },

  /**
   * Récupère un portefeuille de leasing par son ID
   */
  getPortfolioById: (id: string) => {
    return apiClient.get<LeasingPortfolio>(`/portfolios/leasing/${id}`);
  },

  /**
   * Crée un nouveau portefeuille de leasing
   */
  createPortfolio: (portfolio: Omit<LeasingPortfolio, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<LeasingPortfolio>('/portfolios/leasing', portfolio);
  },

  /**
   * Met à jour un portefeuille de leasing
   */
  updatePortfolio: (id: string, updates: Partial<LeasingPortfolio>) => {
    return apiClient.put<LeasingPortfolio>(`/portfolios/leasing/${id}`, updates);
  },

  /**
   * Change le statut d'un portefeuille de leasing
   */
  updatePortfolioStatus: (id: string, status: 'active' | 'inactive' | 'pending' | 'archived') => {
    return apiClient.put<LeasingPortfolio>(`/portfolios/leasing/${id}/status`, { status });
  },

  /**
   * Récupère les métriques détaillées pour un portefeuille de leasing
   */
  getPortfolioMetrics: (portfolioId: string) => {
    return apiClient.get<{
      portfolio: {
        totalValue: number;
        numberOfLeases: number;
        averageLeaseAmount: number;
        sectorDistribution: Array<{ sector: string; percentage: number }>;
        statusDistribution: Array<{ status: string; percentage: number }>;
        topContracts: Array<{ id: string; companyName: string; amount: number }>;
      };
      performance: {
        currentYield: number;
        projectedYield: number;
        monthlyIncome: number;
        historical: Array<{ date: string; income: number }>;
      };
      leases: {
        active: number;
        expired: number;
        terminating: number;
        defaulted: number;
      };
      risk: {
        defaultRate: number;
        delayedPaymentRate: number;
        averageDelay: number;
        riskScore: number;
      };
    }>(`/portfolios/leasing/${portfolioId}/metrics`);
  },

  /**
   * Récupère les rapports pour un portefeuille de leasing
   */
  getPortfolioReports: (portfolioId: string) => {
    return apiClient.get<Array<{
      id: string;
      portfolioId: string;
      name: string;
      type: 'monthly' | 'quarterly' | 'annual' | 'audit';
      period: string;
      fileUrl: string;
      created_at: string;
    }>>(`/portfolios/leasing/${portfolioId}/reports`);
  },

  /**
   * Récupère les équipements agrégés par type pour un portefeuille
   */
  getEquipmentSummary: (portfolioId: string) => {
    return apiClient.get<Array<{
      type: string;
      count: number;
      totalValue: number;
      averageAge: number;
      condition: {
        excellent: number;
        good: number;
        fair: number;
        poor: number;
      };
    }>>(`/portfolios/leasing/${portfolioId}/equipment-summary`);
  },
};
