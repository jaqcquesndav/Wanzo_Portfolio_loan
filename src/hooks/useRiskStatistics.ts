// src/hooks/useRiskStatistics.ts
// Hook pour les statistiques de risque OHADA/BCC
// Conforme à la documentation: API DOCUMENTATION/centrale-risque/risk-statistics.md

import { useState, useEffect, useCallback } from 'react';
import { 
  riskStatisticsApi, 
  type PortfolioRiskStats, 
  type ContractDaysOverdue,
  type ContractClassificationUpdate,
  type RegulatoryThresholds,
  type ActiveRiskAlert,
  getRiskClassFromDaysOverdue,
  getProvisionRate
} from '../services/api/shared/risk-statistics.api';
import type { Severity } from '../types/centrale-risque';
import type { AlertType } from '../types/centrale-risque';

/**
 * Hook pour récupérer les statistiques de risque du portefeuille
 * GET /risk-statistics/portfolio
 * 
 * Inclut PAR30, PAR90, ratio NPL et provisions requises
 */
export function usePortfolioRiskStats(institutionId?: string) {
  const [stats, setStats] = useState<PortfolioRiskStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await riskStatisticsApi.getPortfolioStats(institutionId);
      setStats(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques de risque');
      console.error('Erreur portfolio risk stats:', err);
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

/**
 * Hook pour récupérer les jours de retard d'un contrat
 * GET /risk-statistics/contract/:contractId/days-overdue
 */
export function useContractDaysOverdue(contractId: string | null) {
  const [data, setData] = useState<ContractDaysOverdue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!contractId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await riskStatisticsApi.getContractDaysOverdue(contractId);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du calcul des jours de retard');
      console.error('Erreur contract days overdue:', err);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook pour mettre à jour la classification de risque d'un contrat
 * POST /risk-statistics/contract/:contractId/update-classification
 */
export function useUpdateContractClassification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateClassification = useCallback(async (
    contractId: string, 
    daysOverdue?: number
  ): Promise<ContractClassificationUpdate | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await riskStatisticsApi.updateContractClassification(contractId, daysOverdue);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la classification');
      console.error('Erreur update classification:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateClassification, loading, error };
}

/**
 * Hook pour mettre à jour toutes les classifications (opération batch)
 * POST /risk-statistics/update-all-classifications
 * 
 * ATTENTION: Opération lourde - utiliser avec précaution
 */
export function useUpdateAllClassifications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ message: string; triggeredAt: string } | null>(null);

  const updateAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await riskStatisticsApi.updateAllClassifications();
      setResult(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour globale');
      console.error('Erreur update all classifications:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateAll, loading, error, result };
}

/**
 * Hook pour récupérer les seuils réglementaires OHADA/BCC
 * GET /risk-statistics/regulatory-thresholds
 */
export function useRegulatoryThresholds() {
  const [thresholds, setThresholds] = useState<RegulatoryThresholds | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThresholds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await riskStatisticsApi.getRegulatoryThresholds();
      setThresholds(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des seuils réglementaires');
      console.error('Erreur regulatory thresholds:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThresholds();
  }, [fetchThresholds]);

  return { thresholds, loading, error, refetch: fetchThresholds };
}

/**
 * Hook pour récupérer les alertes de risque actives
 * GET /risk-statistics/alerts/active
 */
export function useActiveRiskAlerts(filters?: {
  companyId?: string;
  severity?: Severity;
  type?: AlertType;
}) {
  const [alerts, setAlerts] = useState<ActiveRiskAlert[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await riskStatisticsApi.getActiveAlerts(filters);
      setAlerts(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des alertes');
      console.error('Erreur active alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, total, loading, error, refetch: fetchAlerts };
}

/**
 * Hook combiné pour la page de statistiques de risque
 * Fournit toutes les données nécessaires à la vue principale
 */
export function useRiskStatisticsPage(institutionId?: string) {
  const { 
    stats, 
    loading: statsLoading, 
    error: statsError, 
    refetch: refetchStats 
  } = usePortfolioRiskStats(institutionId);
  
  const { 
    thresholds, 
    loading: thresholdsLoading, 
    error: thresholdsError,
    refetch: refetchThresholds
  } = useRegulatoryThresholds();
  
  const { 
    alerts, 
    total: alertsTotal,
    loading: alertsLoading, 
    error: alertsError,
    refetch: refetchAlerts
  } = useActiveRiskAlerts();

  const loading = statsLoading || thresholdsLoading || alertsLoading;
  const error = statsError || thresholdsError || alertsError;

  const refetchAll = useCallback(() => {
    refetchStats();
    refetchThresholds();
    refetchAlerts();
  }, [refetchStats, refetchThresholds, refetchAlerts]);

  return {
    // Statistiques du portefeuille
    stats,
    // Seuils réglementaires
    thresholds,
    // Alertes actives
    alerts,
    alertsTotal,
    // États
    loading,
    error,
    // Actions
    refetch: refetchAll,
    // Utilitaires
    getRiskClassFromDaysOverdue,
    getProvisionRate
  };
}

// Export des utilitaires
export { getRiskClassFromDaysOverdue, getProvisionRate };
