// src/hooks/useCentraleRisqueApi.ts
// Hook pour accéder à la centrale de risque via l'API backend conformément à la documentation

import { useState, useEffect, useCallback } from 'react';
import { centraleRisqueApi, centraleRisqueApiV2 } from '../services/api/shared/centrale-risque.api';
import { apiClient } from '../services/api/base.api';
import type { 
  RiskEntry, 
  Incident, 
  Alert, 
  CentraleRisqueStats, 
  EntityRiskSummary,
  RiskType,
  RiskEntryStatus,
  IncidentType,
  IncidentStatus,
  Severity
} from '../types/centrale-risque';

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
// ============================================================================
// NOUVEAUX HOOKS CONFORMES À L'API V2 (/centrale-risque/*)
// ============================================================================

/**
 * Hook pour gérer les entrées de risque (Risk Entries)
 * Conforme à l'API: /centrale-risque/risk-entries
 */
export function useRiskEntries(filters?: {
  companyId?: string;
  institutionId?: string;
  riskType?: RiskType;
  status?: RiskEntryStatus;
  minCreditScore?: number;
  maxCreditScore?: number;
}) {
  const [entries, setEntries] = useState<RiskEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });

  const fetchEntries = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await centraleRisqueApiV2.getRiskEntries({
        ...filters,
        page,
        limit
      });
      
      setEntries(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des entrées de risque');
      console.error('Erreur risk entries:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createEntry = useCallback(async (data: Omit<RiskEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const newEntry = await centraleRisqueApiV2.createRiskEntry(data);
      setEntries(prev => [...prev, newEntry]);
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEntry = useCallback(async (id: string, data: Partial<RiskEntry>) => {
    try {
      setLoading(true);
      const updated = await centraleRisqueApiV2.updateRiskEntry(id, data);
      setEntries(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await centraleRisqueApiV2.deleteRiskEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return {
    entries,
    loading,
    error,
    pagination,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch: () => fetchEntries()
  };
}

/**
 * Hook pour gérer les incidents de paiement
 * Conforme à l'API: /centrale-risque/incidents
 */
export function useIncidents(filters?: {
  companyId?: string;
  type?: IncidentType;
  status?: IncidentStatus;
  severity?: Severity;
  dateFrom?: string;
  dateTo?: string;
}) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });

  const fetchIncidents = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await centraleRisqueApiV2.getIncidents({
        ...filters,
        page,
        limit
      });
      
      setIncidents(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des incidents');
      console.error('Erreur incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createIncident = useCallback(async (data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const newIncident = await centraleRisqueApiV2.createIncident(data);
      setIncidents(prev => [...prev, newIncident]);
      return newIncident;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIncident = useCallback(async (id: string, data: Partial<Incident>) => {
    try {
      setLoading(true);
      const updated = await centraleRisqueApiV2.updateIncident(id, data);
      setIncidents(prev => prev.map(i => i.id === id ? updated : i));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIncident = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await centraleRisqueApiV2.deleteIncident(id);
      setIncidents(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    pagination,
    fetchIncidents,
    createIncident,
    updateIncident,
    deleteIncident,
    refetch: () => fetchIncidents()
  };
}

/**
 * Hook pour gérer les alertes de risque
 * Conforme à l'API: /centrale-risque/alerts
 */
export function useAlerts(filters?: {
  companyId?: string;
  type?: string;
  severity?: Severity;
  isAcknowledged?: boolean;
  dateFrom?: string;
  dateTo?: string;
}) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });

  const fetchAlerts = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await centraleRisqueApiV2.getAlerts({
        ...filters,
        page,
        limit
      });
      
      setAlerts(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des alertes');
      console.error('Erreur alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const acknowledgeAlert = useCallback(async (id: string, notes?: string) => {
    try {
      setLoading(true);
      const updated = await centraleRisqueApiV2.acknowledgeAlert(id, notes);
      setAlerts(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'acquittement');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const dismissAlert = useCallback(async (id: string, reason?: string) => {
    try {
      setLoading(true);
      const updated = await centraleRisqueApiV2.dismissAlert(id, reason);
      setAlerts(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rejet');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    pagination,
    fetchAlerts,
    acknowledgeAlert,
    dismissAlert,
    refetch: () => fetchAlerts()
  };
}

/**
 * Hook pour les statistiques de la centrale de risque
 * Conforme à l'API: /centrale-risque/stats
 */
export function useCentraleRisqueStats() {
  const [stats, setStats] = useState<CentraleRisqueStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await centraleRisqueApiV2.getStats();
      setStats(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      console.error('Erreur stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

/**
 * Hook pour le résumé de risque d'une entité (company ou portfolio)
 * Conforme à l'API: /centrale-risque/entity/:entityId/summary
 */
export function useEntityRiskSummary(entityId: string | null, entityType: 'company' | 'portfolio' = 'company') {
  const [summary, setSummary] = useState<EntityRiskSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!entityId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await centraleRisqueApiV2.getEntitySummary(entityId, entityType);
      setSummary(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du résumé');
      console.error('Erreur entity summary:', err);
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}

/**
 * Hook principal combiné pour la page Centrale de Risque V2
 * Utilise les nouveaux endpoints conformes à la documentation
 */
export function useCentraleRisqueV2Page() {
  const { entries, loading: entriesLoading, error: entriesError, createEntry, updateEntry, deleteEntry, refetch: refetchEntries } = useRiskEntries();
  const { incidents, loading: incidentsLoading, error: incidentsError, createIncident, updateIncident, deleteIncident, refetch: refetchIncidents } = useIncidents();
  const { alerts, loading: alertsLoading, error: alertsError, acknowledgeAlert, dismissAlert, refetch: refetchAlerts } = useAlerts();
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useCentraleRisqueStats();

  const loading = entriesLoading || incidentsLoading || alertsLoading || statsLoading;
  const error = entriesError || incidentsError || alertsError || statsError;

  const refetchAll = useCallback(() => {
    refetchEntries();
    refetchIncidents();
    refetchAlerts();
    refetchStats();
  }, [refetchEntries, refetchIncidents, refetchAlerts, refetchStats]);

  return {
    // Données
    entries,
    incidents,
    alerts,
    stats,
    // États
    loading,
    error,
    // Actions sur les entrées de risque
    createEntry,
    updateEntry,
    deleteEntry,
    // Actions sur les incidents
    createIncident,
    updateIncident,
    deleteIncident,
    // Actions sur les alertes
    acknowledgeAlert,
    dismissAlert,
    // Rafraîchissement
    refetch: refetchAll
  };
}