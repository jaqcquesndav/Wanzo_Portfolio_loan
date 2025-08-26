// Types pour les métriques de crédit professionnel
export interface CreditPortfolioQuality {
  nplRatio: number; // Non-Performing Loans ratio (%)
  par30: number; // Portfolio at Risk 30 days (%)
  par60: number; // Portfolio at Risk 60 days (%)
  par90: number; // Portfolio at Risk 90 days (%)
  writeOffRate: number; // Taux de passage en pertes (%)
  recoveryRate: number; // Taux de récupération (%)
  provisionCoverage: number; // Couverture des provisions (%)
}

export interface CreditProfitability {
  yield: number; // Rendement du portefeuille (%)
  netInterestMargin: number; // Marge d'intérêt nette (%)
  roa: number; // Return on Assets (%)
  roe: number; // Return on Equity (%)
  costOfRisk: number; // Coût du risque (%)
}

export interface CreditGrowthMetrics {
  portfolioGrowthRate: number; // Taux de croissance (%)
  disbursementVolume: number; // Volume des décaissements
  outstandingAmount: number; // Encours total
  newLoansCount: number; // Nombre de nouveaux prêts
  averageLoanSize: number; // Taille moyenne des prêts
}

export interface CreditOperations {
  collectionEfficiency: number; // Efficacité de recouvrement (%)
  avgProcessingTime: number; // Temps de traitement moyen (jours)
  approvalRate: number; // Taux d'approbation (%)
  customerAcquisition: number; // Nouveaux clients
  portfolioTurnover: number; // Rotation du portefeuille (%)
}

export interface CreditSegmentAnalysis {
  bySector: Record<string, CreditPortfolioMetrics>;
  byLoanSize: Record<string, CreditPortfolioMetrics>;
  byMaturity: Record<string, CreditPortfolioMetrics>;
  byGeography: Record<string, CreditPortfolioMetrics>;
  byGuaranteeType: Record<string, CreditPortfolioMetrics>;
}

export interface CreditPortfolioMetrics {
  portfolioId: string;
  portfolioName: string;
  managerId: string;
  managerName: string;
  currency: string;
  
  // Métriques principales
  quality: CreditPortfolioQuality;
  profitability: CreditProfitability;
  growth: CreditGrowthMetrics;
  operations: CreditOperations;
  
  // Analyse par segments
  segmentAnalysis: CreditSegmentAnalysis;
  
  // Données temporelles (12 derniers mois)
  monthlyTrends: Array<{
    month: string;
    quality: CreditPortfolioQuality;
    profitability: CreditProfitability;
    growth: CreditGrowthMetrics;
    operations: CreditOperations;
  }>;
  
  // Alertes et seuils
  alerts: Array<{
    type: 'warning' | 'critical';
    metric: string;
    value: number;
    threshold: number;
    message: string;
  }>;
  
  // Métadonnées
  lastUpdated: string;
  dataQualityScore: number; // Score de qualité des données (0-100)
}

// Filtres avancés
export interface CreditDashboardFilters {
  // Période
  dateRange: {
    start: Date;
    end: Date;
  };
  period: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  
  // Sélection de portefeuilles
  portfolioIds: string[];
  
  // Filtres par segments
  sectors: string[];
  loanSizeRanges: string[];
  maturities: string[];
  geographies: string[];
  guaranteeTypes: string[];
  
  // Filtres par statut
  loanStatuses: ('active' | 'overdue' | 'restructured' | 'closed')[];
  
  // Filtres par performance
  performanceThresholds: {
    minYield?: number;
    maxNplRatio?: number;
    minCollectionEfficiency?: number;
  };
  
  // Tags personnalisés
  customTags: Array<{
    key: string;
    value: string;
    color: string;
  }>;
}

// Configuration des seuils d'alerte
export interface CreditAlertThresholds {
  nplRatio: { warning: number; critical: number };
  par30: { warning: number; critical: number };
  yield: { warning: number; critical: number };
  collectionEfficiency: { warning: number; critical: number };
  portfolioGrowth: { warning: number; critical: number };
}

// Benchmarks du marché
export interface CreditMarketBenchmarks {
  sector: string;
  country: string;
  currency: string;
  
  avgNplRatio: number;
  avgYield: number;
  avgCollectionEfficiency: number;
  avgProcessingTime: number;
  avgPortfolioGrowth: number;
  
  centralBankRate: number;
  inflationRate: number;
  riskFreeRate: number;
  
  lastUpdated: string;
}

// Réponse API pour le dashboard
export interface CreditDashboardResponse {
  portfolios: CreditPortfolioMetrics[];
  benchmarks: CreditMarketBenchmarks;
  aggregatedMetrics: CreditPortfolioMetrics;
  filters: CreditDashboardFilters;
  metadata: {
    totalPortfolios: number;
    dataFreshness: string;
    processingTime: number;
  };
}
