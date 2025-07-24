// Métriques de base communes à tous les types
interface BaseAssetMetrics {
  total: number;
  change: number;
}

interface BasePerformanceMetrics {
  global: number;
  change: number;
  monthly: Array<{
    month: string;
    value: number;
    benchmark: number;
  }>;
}

interface BaseRiskMetrics {
  level: string;
  sharpeRatio: number;
}

interface BaseClientMetrics {
  active: number;
  change: number;
  newThisMonth: number;
  churnRate: number;
}

// Indicateur type utilisé dans les dashboards
export type Indicator = {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  tag?: string;
  color?: string;
};

// Extensions spécifiques pour le portefeuille traditionnel
interface TraditionalAssetMetrics extends BaseAssetMetrics {
  distribution: {
    credit: number;
    microfinance: number;
    treasury: number;
  };
  creditUtilization: number;
}

interface TraditionalRiskMetrics extends BaseRiskMetrics {
  delinquencyRate: number;
  provisionRate: number;
  concentrationRisk: number;
}

// Extensions spécifiques pour le portefeuille d'investissement
interface InvestmentAssetMetrics extends BaseAssetMetrics {
  distribution: {
    equities: number;
    bonds: number;
    alternatives: number;
    cash: number;
  };
  liquidity: number;
}

interface InvestmentRiskMetrics extends BaseRiskMetrics {
  volatility: number;
  var95: number;
  beta: number;
  maxDrawdown: number;
}

// Extensions spécifiques pour le portefeuille de leasing
interface LeasingAssetMetrics extends BaseAssetMetrics {
  distribution: {
    vehicles: number;
    machinery: number;
    it: number;
    office: number;
  };
  residualValue: number;
  utilizationRate: number;
}

interface LeasingRiskMetrics extends BaseRiskMetrics {
  maintenanceRisk: number;
  defaultRate: number;
  assetDepreciation: number;
}

// Métriques du dashboard par type de portefeuille
export interface TraditionalDashboardMetrics {
  assets: TraditionalAssetMetrics;
  performance: BasePerformanceMetrics;
  risk: TraditionalRiskMetrics;
  clients: BaseClientMetrics;
  paymentStatus?: {
    onTime: number;
    late30Days: number;
    late60Days: number;
    late90Days: number;
  };
}

export interface InvestmentDashboardMetrics {
  assets: InvestmentAssetMetrics;
  performance: BasePerformanceMetrics;
  risk: InvestmentRiskMetrics;
  clients: BaseClientMetrics;
  benchmarkComparison?: {
    ytd: number;
    oneYear: number;
    threeYears: number;
    fiveYears: number;
  };
}

export interface LeasingDashboardMetrics {
  assets: LeasingAssetMetrics;
  performance: BasePerformanceMetrics;
  risk: LeasingRiskMetrics;
  clients: BaseClientMetrics;
  equipmentStatus?: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

// Type union pour toutes les métriques
export type DashboardMetrics = 
  | TraditionalDashboardMetrics 
  | InvestmentDashboardMetrics 
  | LeasingDashboardMetrics;