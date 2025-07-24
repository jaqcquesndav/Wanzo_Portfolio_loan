// src/services/api/shared/portfolio.api.ts
import { apiClient } from '../base.api';
import type { Portfolio } from '../../../types/portfolio';

/**
 * API pour les opérations communes à tous les types de portefeuilles
 */
export const sharedPortfolioApi = {
  /**
   * Récupère tous les portefeuilles
   */
  getAllPortfolios: () => {
    return apiClient.get<Portfolio[]>('/portfolios');
  },

  /**
   * Récupère les portefeuilles par type
   */
  getPortfoliosByType: (type: 'traditional' | 'investment' | 'leasing') => {
    return apiClient.get<Portfolio[]>(`/portfolios?type=${type}`);
  },

  /**
   * Récupère un portefeuille par son ID
   */
  getPortfolioById: (id: string) => {
    return apiClient.get<Portfolio>(`/portfolios/${id}`);
  },

  /**
   * Supprime un portefeuille
   */
  deletePortfolio: (id: string) => {
    return apiClient.delete(`/portfolios/${id}`);
  },

  /**
   * Récupère les métriques pour un tableau de bord global
   */
  getDashboardMetrics: () => {
    return apiClient.get<{
      totalPortfolios: number;
      totalValue: number;
      portfoliosByType: Record<string, number>;
      recentActivity: Array<{
        id: string;
        type: string;
        description: string;
        date: string;
      }>;
    }>('/portfolios/dashboard-metrics');
  },
  
  /**
   * Récupère les statistiques de performance pour tous les portefeuilles
   */
  getPerformanceStats: () => {
    return apiClient.get<{
      averageReturn: number;
      bestPerforming: {
        id: string;
        name: string;
        return: number;
      };
      worstPerforming: {
        id: string;
        name: string;
        return: number;
      };
      performanceOverTime: Array<{
        period: string;
        value: number;
      }>;
    }>('/portfolios/performance-stats');
  },
};
