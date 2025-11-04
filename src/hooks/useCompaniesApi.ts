// src/hooks/useCompaniesApi.ts
// Hook pour accéder aux données d'entreprises via l'API backend

import { useState, useEffect, useCallback } from 'react';
import { companyApi } from '../services/api/shared/company.api';
import type { Company } from '../types/company';
import { useNotification } from '../contexts/useNotification';

/**
 * Hook pour récupérer toutes les entreprises via l'API
 */
export function useCompaniesApi() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyApi.getAllCompanies();
      setCompanies(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des entreprises';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur chargement entreprises:', err);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

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
      const data = await companyApi.searchCompanies(searchTerm);
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
  const { showNotification } = useNotification();

  // Charger toutes les entreprises
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyApi.getAllCompanies();
      setCompanies(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des entreprises';
      setError(errorMessage);
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer une nouvelle entreprise
  const createCompany = useCallback(async (companyData: Omit<Company, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newCompany = await companyApi.createCompany(companyData);
      setCompanies(prev => [...prev, newCompany]);
      showNotification('Entreprise créée avec succès', 'success');
      return newCompany;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur création:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Mettre à jour une entreprise
  const updateCompany = useCallback(async (id: string, updates: Partial<Company>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCompany = await companyApi.updateCompany(id, updates);
      setCompanies(prev => prev.map(company => 
        company.id === id ? updatedCompany : company
      ));
      showNotification('Entreprise mise à jour avec succès', 'success');
      return updatedCompany;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur mise à jour:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Supprimer une entreprise
  const deleteCompany = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await companyApi.deleteCompany(id);
      setCompanies(prev => prev.filter(company => company.id !== id));
      showNotification('Entreprise supprimée avec succès', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur suppression:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Uploader un document pour une entreprise
  const uploadDocument = useCallback(async (companyId: string, file: File, metadata: { type: string; description?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await companyApi.uploadCompanyDocument(companyId, file, metadata);
      showNotification('Document uploadé avec succès', 'success');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur upload:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Récupérer les documents d'une entreprise
  const getCompanyDocuments = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const documents = await companyApi.getCompanyDocuments(companyId);
      return documents;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des documents';
      setError(errorMessage);
      console.error('Erreur documents:', err);
      throw err;
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
    createCompany,
    updateCompany,
    deleteCompany,
    uploadDocument,
    getCompanyDocuments,
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
 * Hook combiné pour remplacer useCompaniesData (localStorage)
 * Utilise l'API et fournit une interface compatible
 */
export function useCompaniesDataApi() {
  const { companies, loading, error, refetch } = useCompaniesApi();

  // Interface compatible avec l'ancien hook localStorage
  return {
    companies,
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
