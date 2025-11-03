// src/hooks/useDashboardApi.ts
// Hook pour accéder aux données du dashboard via l'API backend

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../services/api/shared/dashboard.api';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Types pour les données du dashboard basés sur l'API
 */
interface DashboardData {
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
    monthlyPerformance: Array<{ 
      month: string; 
      traditional: number; 
      investment: number; 
      leasing: number; 
    }>;
    riskDistribution: Array<{ riskLevel: string; percentage: number }>;
    sectorExposure: Array<{ sector: string; value: number; percentage: number }>;
  };
}

interface PortfolioPerformance {
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
}

interface PortfolioTrends {
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
}

/**
 * Hook principal pour les données du dashboard
 */
export function useDashboardApi() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await dashboardApi.getDashboardData();
      setData(dashboardData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du dashboard';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  };
}

/**
 * Hook pour les performances d'un portefeuille spécifique
 */
export function usePortfolioPerformance(
  portfolioId: string | null, 
  type: 'traditional' | 'investment' | 'leasing', 
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
) {
  const [data, setData] = useState<PortfolioPerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    if (!portfolioId) return;

    try {
      setLoading(true);
      setError(null);
      const performance = await dashboardApi.getPortfolioPerformance(portfolioId, type, period);
      setData(performance);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des performances';
      setError(errorMessage);
      console.error('Erreur performances:', err);
    } finally {
      setLoading(false);
    }
  }, [portfolioId, type, period]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  return {
    data,
    loading,
    error,
    refetch: fetchPerformance
  };
}

/**
 * Hook pour les tendances de tous les portefeuilles
 */
export function usePortfolioTrends(period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly') {
  const [data, setData] = useState<PortfolioTrends | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const trends = await dashboardApi.getPortfolioTrends(period);
      setData(trends);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des tendances';
      setError(errorMessage);
      console.error('Erreur tendances:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return {
    data,
    loading,
    error,
    refetch: fetchTrends
  };
}

/**
 * Hook pour les opportunités du dashboard
 */
export function useDashboardOpportunities() {
  const [opportunities, setOpportunities] = useState<Array<{
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
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getBusinessOpportunities();
      setOpportunities(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des opportunités';
      setError(errorMessage);
      console.error('Erreur opportunités:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return {
    opportunities,
    loading,
    error,
    refetch: fetchOpportunities
  };
}

/**
 * Hook pour les métriques de risque du dashboard
 */
export function useDashboardRiskMetrics() {
  const [metrics, setMetrics] = useState<Array<{
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
  }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRiskMetrics = useCallback(async (priority?: 'high' | 'medium' | 'low') => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getRiskAlerts(priority);
      setMetrics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des métriques de risque';
      setError(errorMessage);
      console.error('Erreur métriques risque:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiskMetrics();
  }, [fetchRiskMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchRiskMetrics
  };
}

/**
 * Hook combiné pour la page dashboard
 * Fournit toutes les données nécessaires
 */
export function useDashboardComplete() {
  const { 
    data: dashboardData, 
    loading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard
  } = useDashboardApi();

  const { 
    opportunities, 
    loading: opportunitiesLoading, 
    error: opportunitiesError,
    refetch: refetchOpportunities
  } = useDashboardOpportunities();

  const { 
    metrics, 
    loading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics
  } = useDashboardRiskMetrics();

  const loading = dashboardLoading || opportunitiesLoading || metricsLoading;
  const error = dashboardError || opportunitiesError || metricsError;

  const refetchAll = useCallback(() => {
    refetchDashboard();
    refetchOpportunities();
    refetchMetrics();
  }, [refetchDashboard, refetchOpportunities, refetchMetrics]);

  return {
    dashboardData,
    opportunities,
    riskMetrics: metrics,
    loading,
    error,
    refetch: refetchAll
  };
}

/**
 * Hook compatible avec les hooks dashboard existants
 * Pour migration progressive
 */
export function useDashboardMetricsApi() {
  const { data, loading, error, refetch } = useDashboardApi();

  // Extracteur de métriques pour compatibilité
  const extractMetrics = useCallback(() => {
    if (!data) return null;

    return {
      totalPortfolios: data.portfolioSummary.traditional.count + 
                     data.portfolioSummary.investment.count + 
                     data.portfolioSummary.leasing.count,
      totalValue: data.portfolioSummary.traditional.totalValue + 
                 data.portfolioSummary.investment.totalValue + 
                 data.portfolioSummary.leasing.totalValue,
      avgRiskScore: (data.portfolioSummary.traditional.avgRiskScore + 
                    data.portfolioSummary.investment.avgRiskScore + 
                    data.portfolioSummary.leasing.avgRiskScore) / 3,
      recentActivityCount: data.recentActivity.length,
      alertsCount: data.alerts.length,
      criticalAlertsCount: data.alerts.filter(a => a.level === 'critical').length
    };
  }, [data]);

  return {
    metrics: extractMetrics(),
    rawData: data,
    loading,
    error,
    refetch
  };
}