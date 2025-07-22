// src/scripts/initCentraleRisque.ts
// Script d'initialisation des données de la centrale de risque dans le localStorage

import { mockCompanies } from '../data/companies';
import type { CompanyData } from '../data/companies';

// Clés de stockage pour la centrale de risque
export const CENTRALE_RISQUE_KEYS = {
  CREDITS: 'wanzo_centrale_risque_credits',
  LEASING: 'wanzo_centrale_risque_leasing',
  INVESTMENTS: 'wanzo_centrale_risque_investments'
};

/**
 * Génère des données de risque de crédit pour chaque entreprise
 * @param companies Liste des entreprises
 * @returns Données de risque de crédit
 */
function generateCreditRiskData(companies: CompanyData[]) {
  return companies.map(company => {
    // Utilise les données financières de l'entreprise pour générer des données de risque
    const financialMetrics = company.financial_metrics as { 
      credit_score?: number; 
      financial_rating?: string;
      debt_ratio?: number;
    } | undefined;

    // Valeurs par défaut si les métriques financières ne sont pas disponibles
    const creditScore = financialMetrics?.credit_score || Math.floor(Math.random() * 100);
    const financialRating = financialMetrics?.financial_rating || ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
    const debtRatio = financialMetrics?.debt_ratio || Math.random() * 0.7;
    
    // Génère des institutions aléatoires qui ont des engagements avec cette entreprise
    const institutions = ['Banque Commerciale', 'COOPEC Financement', 'Microfinance Plus', 'Fonds d\'Investissement'];
    const randomInstitution = institutions[Math.floor(Math.random() * institutions.length)];
    
    return {
      id: `cr-${company.id}`,
      companyId: company.id,
      companyName: company.name,
      sector: company.sector,
      institution: randomInstitution,
      encours: Math.floor(Math.random() * 500000000),
      statut: Math.random() > 0.8 ? 'En défaut' : 'Actif',
      rating: financialRating,
      incidents: Math.floor(Math.random() * 3),
      creditScore: creditScore,
      debtRatio: debtRatio,
      lastUpdated: new Date().toISOString()
    };
  });
}

/**
 * Génère des données de risque de leasing pour chaque entreprise
 * @param companies Liste des entreprises
 * @returns Données de risque de leasing
 */
function generateLeasingRiskData(companies: CompanyData[]) {
  return companies.map(company => {
    const financialMetrics = company.financial_metrics as { 
      credit_score?: number; 
      financial_rating?: string;
    } | undefined;

    const creditScore = financialMetrics?.credit_score || Math.floor(Math.random() * 100);
    const financialRating = financialMetrics?.financial_rating || ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
    
    // Génère des institutions aléatoires qui ont des engagements avec cette entreprise
    const institutions = ['Leasing Pro', 'Equipment Finance', 'Asset Finance Group', 'Machine Leasing'];
    const randomInstitution = institutions[Math.floor(Math.random() * institutions.length)];
    
    return {
      id: `lr-${company.id}`,
      companyId: company.id,
      companyName: company.name,
      sector: company.sector,
      institution: randomInstitution,
      equipment: ['Véhicules', 'Machines industrielles', 'Équipement informatique', 'Équipement médical'][Math.floor(Math.random() * 4)],
      valeurFinancement: Math.floor(Math.random() * 300000000),
      statut: Math.random() > 0.85 ? 'En défaut' : 'Actif',
      rating: financialRating,
      incidents: Math.floor(Math.random() * 3),
      creditScore: creditScore,
      lastUpdated: new Date().toISOString()
    };
  });
}

/**
 * Génère des données de risque d'investissement pour chaque entreprise
 * @param companies Liste des entreprises
 * @returns Données de risque d'investissement
 */
function generateInvestmentRiskData(companies: CompanyData[]) {
  return companies.map(company => {
    const financialMetrics = company.financial_metrics as { 
      financial_rating?: string;
      ebitda?: number;
    } | undefined;

    const financialRating = financialMetrics?.financial_rating || ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
    const ebitda = financialMetrics?.ebitda || Math.floor(Math.random() * 100000000);
    
    // Génère des institutions aléatoires qui ont des engagements avec cette entreprise
    const institutions = ['Fonds d\'Investissement Capital', 'Private Equity Group', 'Venture Fund', 'Angel Investors Network'];
    const randomInstitution = institutions[Math.floor(Math.random() * institutions.length)];
    
    // Type d'investissement (action ou obligation)
    const investmentType = Math.random() > 0.5 ? 'Action' : 'Obligation';
    
    return {
      id: `ir-${company.id}`,
      companyId: company.id,
      companyName: company.name,
      sector: company.sector,
      institution: randomInstitution,
      investmentType: investmentType,
      montantInvesti: Math.floor(Math.random() * 200000000),
      valorisation: Math.floor(Math.random() * 400000000),
      statut: Math.random() > 0.9 ? 'En difficulté' : 'Performant',
      rating: financialRating,
      ebitda: ebitda,
      rendementActuel: Math.random() * 0.3,
      lastUpdated: new Date().toISOString()
    };
  });
}

/**
 * Initialise les données de la centrale de risque dans le localStorage
 */
export function initCentraleRisqueData(): void {
  try {
    // Vérifier si les données existent déjà dans le localStorage
    const existingCreditData = localStorage.getItem(CENTRALE_RISQUE_KEYS.CREDITS);
    const existingLeasingData = localStorage.getItem(CENTRALE_RISQUE_KEYS.LEASING);
    const existingInvestmentData = localStorage.getItem(CENTRALE_RISQUE_KEYS.INVESTMENTS);
    
    // Si les données n'existent pas encore, les initialiser
    if (!existingCreditData) {
      const creditRiskData = generateCreditRiskData(mockCompanies);
      localStorage.setItem(CENTRALE_RISQUE_KEYS.CREDITS, JSON.stringify(creditRiskData));
      console.log('✅ Données de risque crédit initialisées dans le localStorage');
    }
    
    if (!existingLeasingData) {
      const leasingRiskData = generateLeasingRiskData(mockCompanies);
      localStorage.setItem(CENTRALE_RISQUE_KEYS.LEASING, JSON.stringify(leasingRiskData));
      console.log('✅ Données de risque leasing initialisées dans le localStorage');
    }
    
    if (!existingInvestmentData) {
      const investmentRiskData = generateInvestmentRiskData(mockCompanies);
      localStorage.setItem(CENTRALE_RISQUE_KEYS.INVESTMENTS, JSON.stringify(investmentRiskData));
      console.log('✅ Données de risque investissement initialisées dans le localStorage');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des données de la centrale de risque:', error);
  }
}
