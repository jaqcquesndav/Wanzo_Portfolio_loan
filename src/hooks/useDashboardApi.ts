import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardApi } from '../services/api/shared/dashboard.api';
import { useNotification } from '../contexts/useNotification';
import { useErrorBoundary } from './useErrorBoundary';

/**
 * Types pour les données du dashboard basés sur l'API (traditional seulement)
 */
interface DashboardData {
  portfolioSummary: {
    traditional: {
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
    }>;
    riskDistribution: Array<{ riskLevel: string; percentage: number }>;
    sectorExposure: Array<{ sector: string; value: number; percentage: number }>;
  };
}

interface RiskMetric {
  id: string;
  portfolioId: string;
  portfolioType: 'traditional' | 'investment' | 'leasing';
  portfolioName: string;
  type: 'credit' | 'market' | 'operational' | 'compliance' | 'liquidity';
  level: 'info' | 'warning' | 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: string;
  status: 'new' | 'acknowledged' | 'resolved';
}

/**
 * Hook principal pour les données du dashboard
 */
export function useDashboardApi() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const { addError } = useErrorBoundary();

  // Rate limiting pour le dashboard
  const lastApiCall = useRef<number>(0);
  const rateLimitBackoff = useRef<number>(0);
  const apiCallInProgress = useRef<boolean>(false);

  // Fonction pour vérifier si on peut faire un appel API
  const canCallApi = useCallback(() => {
    if (apiCallInProgress.current) return false;
    
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall.current;
    const minInterval = Math.max(15000, rateLimitBackoff.current); // Minimum 15 secondes pour dashboard
    
    return timeSinceLastCall >= minInterval;
  }, []);

  // Gérer les erreurs de rate limiting
  const handleRateLimitError = useCallback((err: unknown) => {
    rateLimitBackoff.current = Math.min(rateLimitBackoff.current * 2 || 30000, 300000); // Jusqu'à 5 minutes
    
    addError({
      id: `dashboard-rate-limit-${Date.now()}`,
      message: `Dashboard temporairement indisponible (trop de requêtes). Réessai dans ${Math.floor(rateLimitBackoff.current / 1000)}s.`,
      type: 'rate_limit',
      timestamp: Date.now(),
      details: err,
      retryable: true
    });
    
    console.warn('Dashboard rate limited, backoff:', rateLimitBackoff.current, 'ms');
  }, [addError]);

  const fetchDashboardData = useCallback(async () => {
    if (!canCallApi()) {
      console.log('Dashboard API call skipped due to rate limiting');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      apiCallInProgress.current = true;
      lastApiCall.current = Date.now();
      
      const dashboardData = await dashboardApi.getDashboardData();
      setData(dashboardData);
      
      // Reset sur succès
      rateLimitBackoff.current = 0;
      
    } catch (err) {
      if (err instanceof Error && err.message.includes('Too many requests')) {
        handleRateLimitError(err);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du dashboard';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        console.error('Erreur dashboard:', err);
      }
    } finally {
      setLoading(false);
      apiCallInProgress.current = false;
    }
  }, [canCallApi, handleRateLimitError, showNotification]);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Supprimer fetchDashboardData des dépendances pour éviter la boucle

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  };
}

/**
 * Hook pour les métriques de risque du dashboard
 */
export function useDashboardRiskMetrics() {
  const [metrics, setMetrics] = useState<RiskMetric[] | null>(null);
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
