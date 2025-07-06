import type { FinancialProduct } from './traditional-portfolio';

export interface Portfolio {
  id: string;
  name: string;
  type: 'traditional' | 'investment' | 'leasing';
  status: 'active' | 'inactive';
  target_amount: number;
  target_return: number;
  target_sectors: string[];
  risk_profile: 'conservative' | 'moderate' | 'aggressive';
  products: FinancialProduct[]; // Maintenant obligatoire et non optionnel
  investment_stage?: string;
  metrics: {
    net_value: number;
    average_return: number;
    risk_portfolio: number;
    sharpe_ratio: number;
    volatility: number;
    alpha: number;
    beta: number;
    asset_allocation: Array<{
      type: string;
      percentage: number;
    }>;
    performance_curve?: number[];
    returns?: number[];
    benchmark?: number[];
    // Indicateurs spécifiques crédit (optionnels)
    balance_AGE?: {
      total: number;
      echeance_0_30: number;
      echeance_31_60: number;
      echeance_61_90: number;
      echeance_91_plus: number;
    };
    taux_impayes?: number;
    taux_couverture?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface AssetDistribution {
  credit: number;
  microfinance: number;
  leasing: number;
  venture: number;
  treasury: number;
}

export interface PerformanceData {
  monthly: Array<{
    month: string;
    value: number;
    benchmark: number;
  }>;
  ytd: number;
  benchmarkDiff: number;
}