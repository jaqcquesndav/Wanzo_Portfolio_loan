interface AssetMetrics {
  total: number;
  change: number;
  distribution: {
    credit: number;
    microfinance: number;
    leasing: number;
    venture: number;
    treasury: number;
  };
}

interface PerformanceMetrics {
  global: number;
  change: number;
  monthly: Array<{
    month: string;
    value: number;
    benchmark: number;
  }>;
}

interface RiskMetrics {
  level: string;
  sharpeRatio: number;
  volatility: number;
  var95: number;
}

interface ClientMetrics {
  active: number;
  change: number;
  newThisMonth: number;
  churnRate: number;
}

export interface DashboardMetrics {
  assets: AssetMetrics;
  performance: PerformanceMetrics;
  risk: RiskMetrics;
  clients: ClientMetrics;
}