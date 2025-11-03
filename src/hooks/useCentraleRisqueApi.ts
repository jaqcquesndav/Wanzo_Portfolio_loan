// src/hooks/useCentraleRisqueApi.ts
// Hook pour accéder à la centrale de risque via l'API backend conformément à la documentation

import { useState, useEffect, useCallback } from 'react';
import { centraleRisqueApi } from '../services/api/shared/centrale-risque.api';
import { apiClient } from '../services/api/base.api';
import type { CentralRiskEntry } from '../types/centrale-risque';

// Types basés sur la documentation officielle
interface CreditRiskResponse {
  id: string;
  companyId: string;
  companyName: string;
  sector: string;
  institution: string;
  encours: number;
  statut: 'Actif' | 'En défaut' | 'Clôturé';
  coteCredit: string;
  incidents: number;
  creditScore: number;
  debtRatio: number;
  lastUpdated: string;
}

interface LeasingRiskResponse {
  id: string;
  companyId: string;
  companyName: string;
  sector: string;
  institution: string;
  equipmentType: string;
  valeurFinancement: number;
  statut: 'Actif' | 'En défaut' | 'Clôturé';
  coteCredit: string;
  incidents: number;
  lastUpdated: string;
}

interface InvestmentRiskResponse {
  id: string;
  companyId: string;
  companyName: string;
  sector: string;
  institution: string;
  investmentType: 'Action' | 'Obligation';
  montantInvesti: number;
  valorisation: number;
  statut: 'Performant' | 'En difficulté' | 'Clôturé';
  coteCredit: string;
  rendementActuel: number;
  lastUpdated: string;
}

interface RiskSummaryResponse {
  totalEntries: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  topRiskyCompanies: Array<{
    companyId: string;
    companyName: string;
    riskScore: number;
    riskLevel: string;
  }>;
}

/**
 * Hook pour récupérer les données de risque crédit
 */
export function useCreditRisk(companyId: string | null) {
  const [data, setData] = useState<CreditRiskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<CreditRiskResponse>(`/risk/credit/${companyId}`);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données de crédit');
      console.error('Erreur crédit:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook pour récupérer les données de risque leasing
 */
export function useLeasingRisk(companyId: string | null) {
  const [data, setData] = useState<LeasingRiskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<LeasingRiskResponse>(`/risk/leasing/${companyId}`);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données de leasing');
      console.error('Erreur leasing:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook pour récupérer les données de risque investissement
 */
export function useInvestmentRisk(companyId: string | null) {
  const [data, setData] = useState<InvestmentRiskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<InvestmentRiskResponse>(`/risk/investment/${companyId}`);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données d\'investissement');
      console.error('Erreur investissement:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook pour soumettre une nouvelle entrée de risque
 */
export function useSubmitRiskEntry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitEntry = useCallback(async (type: 'credit' | 'leasing' | 'investment', entry: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post(`/risk/${type}`, entry);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la soumission');
      console.error('Erreur soumission:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submitEntry, loading, error };
}

/**
 * Hook pour récupérer les statistiques de risque via centrale-risque.api
 */
export function useRiskStatistics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await centraleRisqueApi.getRiskStatistics();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      console.error('Erreur statistiques:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook pour récupérer le profil de risque d'une entreprise via centrale-risque.api
 */
export function useCompanyRiskProfile(companyId: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await centraleRisqueApi.getCompanyRiskProfile(companyId);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil de risque');
      console.error('Erreur profil:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook pour récupérer le rapport de synthèse des risques
 */
export function useRiskSummary(filters?: {
  portfolioId?: string;
  fromDate?: string;
  toDate?: string;
  riskLevel?: string;
}) {
  const [data, setData] = useState<RiskSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters?.portfolioId) params.append('portfolioId', filters.portfolioId);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);
      if (filters?.riskLevel) params.append('riskLevel', filters.riskLevel);

      const response = await apiClient.get<RiskSummaryResponse>(`/risk/summary?${params.toString()}`);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du rapport de synthèse');
      console.error('Erreur synthèse:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook combiné pour la page Centrale de Risque
 * Utilise les vrais endpoints documentés
 */
export function useCentraleRisqueComplete() {
  const [allEntries, setAllEntries] = useState<Array<CreditRiskResponse | LeasingRiskResponse | InvestmentRiskResponse>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Utiliser les statistiques et alertes de l'API centrale de risque
  const { data: statistics } = useRiskStatistics();
  const { data: summary } = useRiskSummary();

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pour l'instant, on peut récupérer le rapport de synthèse
      // qui nous donne la liste des entreprises à risque
      // Puis pour chaque entreprise, récupérer ses données spécifiques
      
      // En attendant d'avoir une liste complète d'entreprises,
      // on retourne un tableau vide pour éviter les erreurs
      setAllEntries([]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
      console.error('Erreur données complètes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Pour l'instant, retournons les données en format compatible
  return {
    entries: allEntries,
    statistics,
    alerts: [],
    loading,
    error,
    createEntry: async (entry: any) => {
      // Implémenter la création via POST /risk/:type selon la documentation
      console.log('Creating entry:', entry);
    },
    updateEntry: async (id: string, updates: any) => {
      // Implémenter la mise à jour via PUT /risk/:type/:id selon la documentation
      console.log('Updating entry:', id, updates);
    },
    deleteEntry: async (id: string) => {
      // Si l'API supporte la suppression
      console.log('Deleting entry:', id);
    },
    acknowledgeAlert: async (alertId: string) => {
      // Si l'API supporte l'acquittement d'alertes
      console.log('Acknowledging alert:', alertId);
    },
    refetch: fetchAllData
  };
}