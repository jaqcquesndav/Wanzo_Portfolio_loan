// src/hooks/useCompaniesApi.ts
// Hook pour accéder aux données d'entreprises via l'API backend

import { useState, useEffect, useCallback } from 'react';
import { companyApi, type ProspectionFilters, type NearbySearchParams, type PaginatedResponse } from '../services/api/shared/company.api';
import type { Company } from '../types/company';
import { useNotification } from '../contexts/useNotification';

/**
 * Hook pour récupérer toutes les entreprises via l'API avec filtres de prospection
 */
export function useCompaniesApi(filters?: ProspectionFilters) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<Company>['meta'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchCompanies = useCallback(async (customFilters?: ProspectionFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await companyApi.getAllCompanies(customFilters || filters);
      
      // Gérer la double enveloppe: { data: { data: [...], meta: {...} } }
      let companiesArray: Company[] = [];
      let metaData: PaginatedResponse<Company>['meta'] | null = null;
      
      if (response && typeof response === 'object' && 'data' in response) {
        const innerData = (response as { data: unknown }).data;
        if (innerData && typeof innerData === 'object' && 'data' in innerData) {
          // Double enveloppe
          const paginatedData = innerData as { data: Company[]; meta?: PaginatedResponse<Company>['meta'] };
          companiesArray = Array.isArray(paginatedData.data) ? paginatedData.data : [];
          metaData = paginatedData.meta || null;
        } else if (Array.isArray(innerData)) {
          // Simple enveloppe avec data comme tableau
          companiesArray = innerData as Company[];
          metaData = (response as { meta?: PaginatedResponse<Company>['meta'] }).meta || null;
        }
      }
      
      setCompanies(companiesArray);
      setMeta(metaData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des entreprises';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur chargement entreprises:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, showNotification]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return {
    companies,
    meta,
    loading,
    error,
    refetch: fetchCompanies
  };
}

/**
 * Hook pour récupérer une entreprise spécifique par son ID
 */
export function useCompanyById(id: string | null) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await companyApi.getCompanyById(id);
      setCompany(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'entreprise';
      setError(errorMessage);
      console.error('Erreur chargement entreprise:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  return {
    company,
    loading,
    error,
    refetch: fetchCompany
  };
}

/**
 * Hook pour la recherche d'entreprises
 */
export function useCompanySearch() {
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await companyApi.searchCompanies(searchTerm);
      // searchCompanies retourne PaginatedResponse<Company>
      const inner = (response as any)?.data ?? response;
      const data: Company[] = Array.isArray(inner) ? inner : (inner?.data ?? []);
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche';
      setError(errorMessage);
      console.error('Erreur recherche entreprises:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults
  };
}

/**
 * Hook pour la gestion complète des entreprises (CRUD)
 */
export function useCompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger toutes les entreprises
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await companyApi.getAllCompanies();
      
      // Gérer la double enveloppe: { data: { data: [...], meta: {...} } }
      let companiesArray: Company[] = [];
      
      if (response && typeof response === 'object' && 'data' in response) {
        const innerData = (response as { data: unknown }).data;
        if (innerData && typeof innerData === 'object' && 'data' in innerData && Array.isArray((innerData as { data: unknown[] }).data)) {
          companiesArray = (innerData as { data: Company[] }).data;
        } else if (Array.isArray(innerData)) {
          companiesArray = innerData as Company[];
        }
      } else if (Array.isArray(response)) {
        companiesArray = response;
      } else {
        console.warn('Format de réponse inattendu pour getAllCompanies:', response);
      }
      
      setCompanies(companiesArray);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des entreprises';
      setError(errorMessage);
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return {
    companies,
    loading,
    error,
    refetch: fetchCompanies
  };
}

/**
 * Hook pour la gestion des données financières des entreprises
 */
export function useCompanyFinancials(companyId: string | null) {
  const [financials, setFinancials] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancials = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);
      // Note: Endpoint à implémenter côté API si nécessaire
      // const data = await companyApi.getCompanyFinancials(companyId);
      // setFinancials(data);
      
      // Placeholder - endpoint pas encore implémenté
      setFinancials({});
      console.log('Financials endpoint not yet implemented for company:', companyId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données financières';
      setError(errorMessage);
      console.error('Erreur financials:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  return {
    financials,
    loading,
    error,
    refetch: fetchFinancials
  };
}

/**
 * Hook pour la recherche géographique de prospects
 */
export function useNearbyCompanies() {
  const [results, setResults] = useState<Array<Company & { distance: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const searchNearby = useCallback(async (params: NearbySearchParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyApi.getNearbyCompanies(params);
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche géographique';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur recherche nearby:', err);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    searchNearby,
    clearResults
  };
}

/**
 * Hook pour les statistiques de prospection
 */
export function useCompanyStats() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof companyApi.getCompanyStats>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyApi.getCompanyStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques';
      setError(errorMessage);
      console.error('Erreur stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

/**
 * Hook pour la synchronisation manuelle d'un prospect
 */
export function useCompanySync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const syncCompany = useCallback(async (id: string, complete = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = complete 
        ? await companyApi.syncCompanyComplete(id)
        : await companyApi.syncCompany(id);
      
      showNotification('Synchronisation réussie', 'success');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la synchronisation';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur sync:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  return {
    loading,
    error,
    syncCompany
  };
}

/**
 * Hook combiné pour remplacer useCompaniesData (localStorage)
 * Utilise l'API et fournit une interface compatible
 */
export function useCompaniesDataApi() {
  const { companies, meta, loading, error, refetch } = useCompaniesApi();

  // Interface compatible avec l'ancien hook localStorage
  return {
    companies,
    meta,
    loading,
    error,
    refresh: refetch,
    // Méthodes additionnelles pour compatibilité
    getCompanyById: (id: string) => companies.find(c => c.id === id),
    searchCompanies: (term: string) => companies.filter(c => 
      c.name.toLowerCase().includes(term.toLowerCase()) ||
      c.sector?.toLowerCase().includes(term.toLowerCase())
    )
  };
}
