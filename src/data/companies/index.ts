// src/data/companies/index.ts
// Ce fichier centralise toutes les données mockées des entreprises
// Avec extensions de fichiers .ts pour compatibilité

import { entrepriseAlpha } from './entreprisealpha.ts';
import { techinnovate } from './techinnovate.ts';
import { agritech } from './agritech.ts';
import { cleanenergy } from './cleanenergy.ts';
import { constructionplus } from './constructionplus.ts';
import { healthsolutions } from './healthsolutions.ts';

// Types de scénarios possibles
export type CompanyScenarioStatus = 
  | 'prospect' 
  | 'funding_requested' 
  | 'funding_in_progress' 
  | 'funded' 
  | 'rejected'
  | 'exited';

// Type commun pour toutes nos entreprises
export type CompanyData = {
  id: string;
  name: string;
  sector: string;
  industry: string;
  legalForm: string;
  status: string;
  // Autres propriétés communes
  [key: string]: unknown; // Pour les propriétés variables
};

// Exporter toutes les entreprises dans un tableau pour faciliter l'utilisation
export const mockCompanies = [
  entrepriseAlpha,
  techinnovate,
  agritech,
  cleanenergy,
  constructionplus,
  healthsolutions
] as CompanyData[];

// Exporter chaque entreprise individuellement
export {
  entrepriseAlpha,
  techinnovate,
  agritech,
  cleanenergy,
  constructionplus,
  healthsolutions
};

// Mapping pour obtenir une entreprise par ID
export const companiesById = mockCompanies.reduce((acc, company) => {
  acc[company.id] = company;
  return acc;
}, {} as Record<string, CompanyData>);

// Obtenir une entreprise par son ID
export const getCompanyById = (id: string): CompanyData | null => {
  return companiesById[id] || null;
};

// Mapping des entreprises par scénario pour faciliter l'utilisation dans différents contextes
export const companyScenarios = {
  prospect: [entrepriseAlpha, techinnovate, healthsolutions],
  funding_requested: [agritech],
  funding_in_progress: [cleanenergy],
  funded: [constructionplus],
  rejected: [],
  exited: []
} as Record<CompanyScenarioStatus, CompanyData[]>;
