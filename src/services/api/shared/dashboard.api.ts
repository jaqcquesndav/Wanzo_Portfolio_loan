// src/services/api/shared/dashboard.api.ts
import { apiClient } from '../base.api';

/**
 * API pour le dashboard
 */
export const dashboardApi = {
  /**
   * Récupère les données agrégées pour le dashboard
   */
  getDashboardData: () => {
    return apiClient.get<{
      portfolioSummary: {
        traditional: {
          count: number;
          totalValue: number;
          avgRiskScore: number;
        };
        investment: {
          count: number;
          totalValue: number;
          avgRiskScore: number;
        };
        leasing: {
          count: number;
          totalValue: number;
          avgRiskScore: number;
        };
      };
      recentActivity: Array<{
        id: string;
        type: 'portfolio_created' | 'funding_request' | 'payment' | 'risk_alert' | 'contract_signed';
        entityId: string;
        title: string;
        description: string;
        timestamp: string;
      }>;
      alerts: Array<{
        id: string;
        type: 'risk' | 'payment' | 'compliance' | 'opportunity';
        level: 'info' | 'warning' | 'critical';
        title: string;
        description: string;
        timestamp: string;
      }>;
      kpis: {
        totalPortfolios: number;
        activePortfolios: number;
        totalValue: number;
        portfolioGrowth: number;
        pendingRequests: number;
        riskScore: number;
        complianceScore: number;
      };
      charts: {
        portfolioDistribution: Array<{ category: string; value: number }>;
        monthlyPerformance: Array<{ month: string; traditional: number; investment: number; leasing: number }>;
        riskDistribution: Array<{ riskLevel: string; percentage: number }>;
        sectorExposure: Array<{ sector: string; value: number; percentage: number }>;
      };
    }>('/dashboard');
  },

  /**
   * Récupère les données de performance pour un portefeuille spécifique
   */
  getPortfolioPerformance: (portfolioId: string, type: 'traditional' | 'investment' | 'leasing', period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly') => {
    return apiClient.get<{
      id: string;
      name: string;
      type: 'traditional' | 'investment' | 'leasing';
      period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
      data: Array<{ date: string; value: number }>;
      metrics: {
        totalReturn: number;
        annualizedReturn: number;
        volatility: number;
        sharpeRatio: number;
        maxDrawdown: number;
      };
    }>(`/dashboard/portfolio/${portfolioId}/performance?type=${type}&period=${period}`);
  },

  /**
   * Récupère les données de tendance pour tous les portefeuilles
   */
  getPortfolioTrends: (period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly') => {
    return apiClient.get<{
      period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
      trends: {
        traditional: {
          growth: number;
          data: Array<{ date: string; value: number }>;
        };
        investment: {
          growth: number;
          data: Array<{ date: string; value: number }>;
        };
        leasing: {
          growth: number;
          data: Array<{ date: string; value: number }>;
        };
      };
    }>(`/dashboard/trends?period=${period}`);
  },

  /**
   * Récupère les alertes de risque pour le dashboard
   */
  getRiskAlerts: (priority?: 'high' | 'medium' | 'low') => {
    const params = new URLSearchParams();
    if (priority) params.append('priority', priority);

    return apiClient.get<Array<{
      id: string;
      portfolioId: string;
      portfolioType: 'traditional' | 'investment' | 'leasing';
      portfolioName: string;
      type: 'credit' | 'market' | 'operational' | 'compliance' | 'liquidity';
      level: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      description: string;
      timestamp: string;
      status: 'new' | 'acknowledged' | 'resolved';
    }>>(`/dashboard/risk-alerts?${params.toString()}`);
  },

  /**
   * Récupère les opportunités commerciales pour le dashboard
   */
  getBusinessOpportunities: () => {
    return apiClient.get<Array<{
      id: string;
      companyId: string;
      companyName: string;
      type: 'traditional' | 'investment' | 'leasing';
      amount: number;
      probability: number;
      expectedCloseDate: string;
      status: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
      assignedTo: string;
      notes: string;
    }>>('/dashboard/opportunities');
  },

  /**
   * Récupère les KPIs pour un type de portefeuille spécifique
   */
  getPortfolioTypeKPIs: (type: 'traditional' | 'investment' | 'leasing') => {
    return apiClient.get<{
      type: 'traditional' | 'investment' | 'leasing';
      count: number;
      totalValue: number;
      growth: number;
      avgRiskScore: number;
      performance: {
        monthly: number;
        quarterly: number;
        yearly: number;
      };
      topPortfolios: Array<{
        id: string;
        name: string;
        value: number;
        growth: number;
      }>;
      metrics: Record<string, number>;
    }>(`/dashboard/portfolio-type/${type}/kpis`);
  }
};
