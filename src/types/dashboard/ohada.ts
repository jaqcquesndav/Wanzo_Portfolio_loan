// src/types/dashboard/ohada.ts
/**
 * Types pour les métriques OHADA/BCEAO
 * Conformité aux standards du financement PME
 */

/**
 * Interface pour les métriques OHADA d'un portefeuille
 */
export interface OHADAMetrics {
  id: string;
  name: string;
  sector: string;
  
  // Métriques financières de base
  totalAmount: number;
  activeContracts: number;
  avgLoanSize: number;
  
  // Ratios OHADA critiques
  nplRatio: number; // NPL ratio (%)
  provisionRate: number; // Taux de provisionnement (%)
  collectionEfficiency: number; // Efficacité de recouvrement (%)
  
  // Balance âgée conforme OHADA
  balanceAGE: BalanceAGE;
  
  // Ratios de performance
  roa: number; // Return on Assets (%)
  portfolioYield: number; // Rendement du portefeuille (%)
  riskLevel: 'Faible' | 'Moyen' | 'Élevé';
  growthRate: number; // Taux de croissance (%)
  
  // Données temporelles
  monthlyPerformance: number[];
  lastActivity: string;
  
  // Conformité réglementaire
  regulatoryCompliance?: RegulatoryCompliance;
}

/**
 * Structure de balance âgée selon les normes OHADA
 */
export interface BalanceAGE {
  current: number; // 0-30 jours (%)
  days30: number; // 31-60 jours (%)
  days60: number; // 61-90 jours (%)
  days90Plus: number; // 90+ jours (%)
}

/**
 * Conformité réglementaire OHADA/BCEAO
 */
export interface RegulatoryCompliance {
  bceaoCompliant: boolean; // Conformité BCEAO (NPL < 5%)
  ohadaProvisionCompliant: boolean; // Conformité OHADA provisions
  riskRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
}

/**
 * Interface pour la sélection de portefeuille
 */
export interface PortfolioSelection {
  mode: 'global' | 'individual';
  selectedPortfolioId?: string;
  label: string;
}

/**
 * Interface pour un portefeuille traditionnel
 */
export interface TraditionalPortfolio {
  id: string;
  name: string;
  type: 'traditional';
  target_sectors?: string[];
  metrics?: {
    total_credits: number;
    nb_credits: number;
    avg_credit: number;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Interface pour les filtres de période
 */
export interface PeriodFilter {
  type: 'custom' | 'month' | 'quarter' | 'semester' | 'year';
  startDate?: string;
  endDate?: string;
  label: string;
}
