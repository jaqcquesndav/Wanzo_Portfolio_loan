// src/hooks/usePortfoliosApi.ts
// Hook pour accéder aux portefeuilles via l'API backend

import { useState, useEffect, useCallback } from 'react';
import { sharedPortfolioApi } from '../services/api/shared/portfolio.api';
import type { Portfolio } from '../types/portfolio';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Hook principal pour la gestion des portefeuilles via l'API
 */
export function usePortfoliosApi() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Charger tous les portefeuilles
  const loadAllPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sharedPortfolioApi.getAllPortfolios();
      setPortfolios(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des portefeuilles';
      setError(errorMessage);
      console.error('Erreur portefeuilles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les portefeuilles par type
  const loadPortfoliosByType = useCallback(async (type: 'traditional' | 'investment' | 'leasing') => {
    try {
      setLoading(true);
      setError(null);
      const data = await sharedPortfolioApi.getPortfoliosByType(type);
      setPortfolios(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des portefeuilles par type';
      setError(errorMessage);
      console.error('Erreur portefeuilles par type:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Supprimer un portefeuille
  const deletePortfolio = useCallback(async (id: string) => {
    try {
      setError(null);
      await sharedPortfolioApi.deletePortfolio(id);
      setPortfolios(prev => prev.filter(p => p.id !== id));
      showNotification('Portefeuille supprimé avec succès', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du portefeuille';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur suppression portefeuille:', err);
      throw err;
    }
  }, [showNotification]);

  // Charger tous les portefeuilles au montage du composant
  useEffect(() => {
    loadAllPortfolios();
  }, [loadAllPortfolios]);

  return {
    portfolios,
    loading,
    error,
    loadAllPortfolios,
    loadPortfoliosByType,
    deletePortfolio,
    refetch: loadAllPortfolios
  };
}

/**
 * Hook pour récupérer un portefeuille spécifique
 */
export function usePortfolioApi(portfolioId?: string) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = useCallback(async (id?: string) => {
    const targetId = id || portfolioId;
    if (!targetId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await sharedPortfolioApi.getPortfolioById(targetId);
      setPortfolio(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du portefeuille';
      setError(errorMessage);
      console.error('Erreur portefeuille:', err);
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    if (portfolioId) {
      loadPortfolio();
    }
  }, [loadPortfolio, portfolioId]);

  return {
    portfolio,
    loading,
    error,
    refetch: () => loadPortfolio()
  };
}

/**
 * Hook pour les métriques du dashboard des portefeuilles
 */
export function usePortfoliosDashboardMetrics() {
  const [metrics, setMetrics] = useState<{
    totalPortfolios: number;
    totalValue: number;
    portfoliosByType: Record<string, number>;
    recentActivity: Array<{
      id: string;
      type: string;
      description: string;
      date: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sharedPortfolioApi.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des métriques';
      setError(errorMessage);
      console.error('Erreur métriques dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: loadMetrics
  };
}

/**
 * Hook pour les statistiques de performance des portefeuilles
 */
export function usePortfoliosPerformanceStats() {
  const [stats, setStats] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sharedPortfolioApi.getPerformanceStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques de performance';
      setError(errorMessage);
      console.error('Erreur stats performance:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refetch: loadStats
  };
}

/**
 * Hook compatible avec l'ancien usePortfolios (localStorage)
 * Fournit une interface de migration progressive
 */
export function usePortfoliosApiCompat(type?: 'traditional' | 'investment' | 'leasing') {
  const {
    portfolios,
    loading,
    error,
    loadPortfoliosByType,
    loadAllPortfolios,
    deletePortfolio
  } = usePortfoliosApi();

  // Charger les portefeuilles selon le type demandé
  useEffect(() => {
    if (type) {
      loadPortfoliosByType(type);
    } else {
      loadAllPortfolios();
    }
  }, [type, loadPortfoliosByType, loadAllPortfolios]);

  return {
    portfolios,
    loading,
    error,
    deletePortfolio,
    refetch: () => type ? loadPortfoliosByType(type) : loadAllPortfolios()
  };
}