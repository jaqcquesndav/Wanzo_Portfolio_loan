// src/hooks/useCompaniesData.ts
// Hook personnalisé pour accéder aux données d'entreprises depuis le localStorage

import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../scripts/initLocalStorage';
import { mockCompanies, companyScenarios as defaultScenarios, getCompanyById as getCompanyByIdOriginal } from '../data/companies/index';
import { CompanyData, CompanyScenarioStatus } from '../data/companies/index';

/**
 * Hook pour accéder à toutes les entreprises disponibles
 */
export function useCompaniesData() {
  const [companies, setCompanies] = useState<typeof mockCompanies>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadCompanies = () => {
      try {
        setLoading(true);
        // Récupérer les données du localStorage
        const storedCompanies = localStorage.getItem(STORAGE_KEYS.COMPANIES);
        
        if (storedCompanies) {
          setCompanies(JSON.parse(storedCompanies));
        } else {
          // Fallback sur les données mockées en cas d'absence dans le localStorage
          setCompanies(mockCompanies);
          console.warn('Données d\'entreprises non trouvées dans le localStorage, utilisation des données mockées');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        // Fallback sur les données mockées en cas d'erreur
        setCompanies(mockCompanies);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  return { companies, loading, error };
}

/**
 * Hook pour accéder aux entreprises par scénario
 */
export function useCompanyScenarios() {
  const [scenarios, setScenarios] = useState<Record<CompanyScenarioStatus, CompanyData[]>>({} as Record<CompanyScenarioStatus, CompanyData[]>);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadScenarios = () => {
      try {
        setLoading(true);
        // Récupérer les scénarios du localStorage
        const storedScenarios = localStorage.getItem(STORAGE_KEYS.COMPANY_SCENARIOS);
        
        if (storedScenarios) {
          setScenarios(JSON.parse(storedScenarios));
        } else {
          // Fallback sur les données mockées en cas d'absence dans le localStorage
          setScenarios(defaultScenarios);
          console.warn('Scénarios d\'entreprises non trouvés dans le localStorage, utilisation des données mockées');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        // Fallback sur les données mockées en cas d'erreur
        setScenarios(defaultScenarios);
      } finally {
        setLoading(false);
      }
    };

    loadScenarios();
  }, []);

  return { scenarios, loading, error };
}

/**
 * Hook pour accéder à une entreprise par son ID
 */
export function useCompanyById(id: string) {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadCompany = () => {
      try {
        setLoading(true);
        // Récupérer l'index des entreprises par ID du localStorage
        const storedCompaniesById = localStorage.getItem(STORAGE_KEYS.COMPANY_BY_ID);
        
        if (storedCompaniesById) {
          const companiesById = JSON.parse(storedCompaniesById);
          setCompany(companiesById[id] || null);
        } else {
          // Fallback sur la fonction getCompanyById en cas d'absence dans le localStorage
          setCompany(getCompanyByIdOriginal(id));
          console.warn('Index d\'entreprises par ID non trouvé dans le localStorage, utilisation de la fonction getCompanyById');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        // Fallback sur la fonction getCompanyById en cas d'erreur
        setCompany(getCompanyByIdOriginal(id));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCompany();
    } else {
      setCompany(null);
      setLoading(false);
    }
  }, [id]);

  return { company, loading, error };
}
