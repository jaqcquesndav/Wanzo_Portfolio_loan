// src/data/mockCentraleRisque.ts
import { mockCompanies } from './companies/index';
import type { CompanyData } from './companies/index';

// Types pour la centrale de risque
export interface CreditRiskEntry {
  id: string;
  companyId: string;
  companyName: string;
  sector: string;
  institution: string;
  encours: number;
  statut: 'Actif' | 'En défaut' | 'Clôturé';
  coteCredit: string; // Note sur 100
  incidents: number;
  creditScore: number;
  debtRatio: number;
  lastUpdated: string;
  guaranteeId?: string; // Référence à la garantie utilisée
  createdBy?: string; // Nom de l'utilisateur qui a créé l'entrée (pour traçabilité)
}

export interface LeasingRiskEntry {
  id: string;
  companyId: string;
  companyName: string;
  sector: string;
  institution: string;
  equipmentType: string;
  valeurFinancement: number;
  statut: 'Actif' | 'En défaut' | 'Clôturé';
  coteCredit: string; // Note sur 100
  incidents: number;
  lastUpdated: string;
  createdBy?: string; // Nom de l'utilisateur qui a créé l'entrée (pour traçabilité)
}

export interface InvestmentRiskEntry {
  id: string;
  companyId: string;
  companyName: string;
  sector: string;
  institution: string;
  investmentType: 'Action' | 'Obligation';
  montantInvesti: number;
  valorisation: number;
  statut: 'Performant' | 'En difficulté' | 'Clôturé';
  coteCredit: string; // Note sur 100
  rendementActuel: number;
  lastUpdated: string;
  createdBy?: string; // Nom de l'utilisateur qui a créé l'entrée (pour traçabilité)
}

// Fonction pour générer des données de risque de crédit
export function generateCreditRiskData(companies: CompanyData[]): CreditRiskEntry[] {
  return companies.map(company => {
    // Récupérer les métriques financières si disponibles
    const financialMetrics = company.financial_metrics as Record<string, unknown> || {};
    
    return {
      id: `cr-${company.id}`,
      companyId: company.id,
      companyName: company.name,
      sector: company.sector,
      institution: ['Banque Commerciale', 'COOPEC Financement', 'Microfinance Plus'][Math.floor(Math.random() * 3)],
      encours: Math.floor(Math.random() * 500000000),
      statut: Math.random() > 0.8 ? 'En défaut' : 'Actif',
      coteCredit: (financialMetrics.financial_rating as 'A' | 'B' | 'C' | 'D') || ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      incidents: Math.floor(Math.random() * 3),
      creditScore: (financialMetrics.credit_score as number) || Math.floor(Math.random() * 100),
      debtRatio: (financialMetrics.debt_ratio as number) || Math.random() * 0.7,
      lastUpdated: new Date().toISOString()
    };
  });
}

// Fonction pour générer des données de risque de leasing
export function generateLeasingRiskData(companies: CompanyData[]): LeasingRiskEntry[] {
  return companies.map(company => {
    // Récupérer les métriques financières si disponibles
    const financialMetrics = company.financial_metrics as Record<string, unknown> || {};
    
    return {
      id: `lr-${company.id}`,
      companyId: company.id,
      companyName: company.name,
      sector: company.sector,
      institution: ['Leasing Pro', 'Equipment Finance', 'Asset Finance Group'][Math.floor(Math.random() * 3)],
      equipmentType: ['Véhicules', 'Machines industrielles', 'Équipement informatique', 'Équipement médical'][Math.floor(Math.random() * 4)],
      valeurFinancement: Math.floor(Math.random() * 300000000),
      statut: Math.random() > 0.85 ? 'En défaut' : 'Actif',
      coteCredit: (financialMetrics.financial_rating as 'A' | 'B' | 'C' | 'D') || ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      incidents: Math.floor(Math.random() * 3),
      lastUpdated: new Date().toISOString()
    };
  });
}

// Fonction pour générer des données de risque d'investissement
export function generateInvestmentRiskData(companies: CompanyData[]): InvestmentRiskEntry[] {
  return companies.map(company => {
    // Récupérer les métriques financières si disponibles
    const financialMetrics = company.financial_metrics as Record<string, unknown> || {};
    
    return {
      id: `ir-${company.id}`,
      companyId: company.id,
      companyName: company.name,
      sector: company.sector,
      institution: ['Fonds d\'Investissement Capital', 'Private Equity Group', 'Venture Fund'][Math.floor(Math.random() * 3)],
      investmentType: Math.random() > 0.5 ? 'Action' : 'Obligation',
      montantInvesti: Math.floor(Math.random() * 200000000),
      valorisation: Math.floor(Math.random() * 400000000),
      statut: Math.random() > 0.9 ? 'En difficulté' : 'Performant',
      coteCredit: (financialMetrics.financial_rating as 'A' | 'B' | 'C' | 'D') || ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      rendementActuel: Math.random() * 0.3,
      lastUpdated: new Date().toISOString()
    };
  });
}

// Exporter les données mockées
export const mockCreditRiskData = generateCreditRiskData(mockCompanies);
export const mockLeasingRiskData = generateLeasingRiskData(mockCompanies);
export const mockInvestmentRiskData = generateInvestmentRiskData(mockCompanies);
