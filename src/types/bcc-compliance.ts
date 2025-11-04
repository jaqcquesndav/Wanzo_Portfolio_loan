// Types pour la conformité BCC Instruction 004
// Module de gestion de portefeuille conforme (périmètre limité)

import type { TraditionalPortfolio } from './dashboard/ohada';

/**
 * Indicateurs BCC Instruction 004 - Article 2: Qualité du Portefeuille
 */
export interface BCCPortfolioQuality {
  // Existant 
  nplRatio: number; // NPL < 5% (BCEAO)
  
  // À AJOUTER 
  writeOffRatio: number; // Ratio abandon créances < 2%
  par30: number; // Portfolio at Risk 30 jours
  par60: number; // Portfolio at Risk 60 jours
  par90: number; // Portfolio at Risk 90 jours
  recoveryRate: number; // Taux récupération créances
}

/**
 * Indicateurs BCC Instruction 004 - Article 3: Efficacité & Productivité
 * (Limité aux métriques calculables dans le module portfolio)
 */
export interface BCCOperationalEfficiency {
  // Existant 
  collectionEfficiency: number; // Standard 90%
  
  // Calculable dans le module portfolio 
  avgLoanProcessingTime: number; // Temps traitement moyen (jours)
  portfolioTurnover: number; // Rotation du portefeuille (%)
}

/**
 * Indicateurs BCC Instruction 004 - Article 4: Rentabilité
 * (Limité aux métriques calculables dans le module portfolio)
 */
export interface BCCProfitability {
  // Existant 
  roa: number; // > 3%
  portfolioYield: number; // > 15%
  
  // Calculable dans le module portfolio 
  netInterestMargin: number; // Marge d'intérêt nette estimée
  costOfRisk: number; // Coût du risque (provisions/encours)
}

/**
 * Structure conformité BCC limitée au module Portfolio
 */
export interface BCCPortfolioCompliance {
  id: string;
  name: string;
  
  // Métriques BCC calculables dans le module portfolio
  qualityMetrics: BCCPortfolioQuality;
  efficiencyMetrics: BCCOperationalEfficiency;
  profitabilityMetrics: BCCProfitability;
  
  // Évaluation conformité (limitée)
  complianceStatus: {
    qualityCompliant: boolean;
    efficiencyCompliant: boolean;
    profitabilityCompliant: boolean;
    portfolioScore: number; // 0-100 (score partiel)
    lastAssessment: string;
  };
  
  // Alertes portfolio uniquement
  portfolioAlerts: Array<{
    category: 'quality' | 'efficiency' | 'profitability';
    indicator: string;
    currentValue: number;
    requiredValue: number;
    severity: 'warning' | 'critical';
  }>;
}

/**
 * Service de calcul conformité BCC (module portfolio uniquement)
 */
export interface BCCPortfolioComplianceCalculator {
  calculateQualityCompliance(portfolio: TraditionalPortfolio): BCCPortfolioQuality;
  calculateEfficiencyCompliance(portfolio: TraditionalPortfolio): BCCOperationalEfficiency;
  calculateProfitabilityCompliance(portfolio: TraditionalPortfolio): BCCProfitability;
  
  generatePortfolioComplianceReport(portfolio: BCCPortfolioCompliance): {
    summary: string;
    detailedAnalysis: string;
    recommendations: string[];
    nextReviewDate: string;
  };
}

