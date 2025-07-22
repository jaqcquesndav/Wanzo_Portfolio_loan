// src/scripts/initLocalStorage.ts
// Script d'initialisation des données mockées dans le localStorage

import { mockCompanies } from '../data/companies';
import { companyScenarios } from '../data/companies';

// Clés de stockage
export const STORAGE_KEYS = {
  COMPANIES: 'wanzo_companies',
  COMPANY_SCENARIOS: 'wanzo_company_scenarios',
  COMPANY_BY_ID: 'wanzo_companies_by_id'
};

/**
 * Initialise les données d'entreprises dans le localStorage
 * Cette fonction doit être appelée au démarrage de l'application
 */
export function initCompaniesData(): void {
  try {
    // Vérifier si les données existent déjà dans le localStorage
    const existingCompanies = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    
    if (!existingCompanies) {
      // Stocker toutes les entreprises
      localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(mockCompanies));
      console.log('✅ Données d\'entreprises initialisées dans le localStorage');
    }

    // Stocker les scénarios d'entreprises
    const existingScenarios = localStorage.getItem(STORAGE_KEYS.COMPANY_SCENARIOS);
    
    if (!existingScenarios) {
      localStorage.setItem(STORAGE_KEYS.COMPANY_SCENARIOS, JSON.stringify(companyScenarios));
      console.log('✅ Scénarios d\'entreprises initialisés dans le localStorage');
    }

    // Créer un index par ID pour un accès rapide
    const companiesById = mockCompanies.reduce((acc, company) => {
      acc[company.id] = company;
      return acc;
    }, {} as Record<string, typeof mockCompanies[0]>);

    const existingCompaniesById = localStorage.getItem(STORAGE_KEYS.COMPANY_BY_ID);
    
    if (!existingCompaniesById) {
      localStorage.setItem(STORAGE_KEYS.COMPANY_BY_ID, JSON.stringify(companiesById));
      console.log('✅ Index d\'entreprises par ID initialisé dans le localStorage');
    }

  } catch (error) {
    console.error('Erreur lors de l\'initialisation des données d\'entreprises:', error);
  }
}
