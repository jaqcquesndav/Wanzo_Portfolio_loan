// Exported for unified DB typing
export interface PortfolioWithType extends Portfolio {
  // Investment
  assets?: unknown[];
  subscriptions?: import('./securities').SecuritySubscription[];
  valuations?: import('./securities').CompanyValuation[];
  requests?: import('./investment-portfolio').InvestmentRequest[];
  transactions?: import('./investment-portfolio').InvestmentTransaction[];
  reports?: import('./investment-portfolio').PortfolioCompanyReport[];
  exitEvents?: import('./investment-portfolio').ExitEvent[];
  // Leasing
  equipment_catalog?: import('./leasing').Equipment[];
  contracts?: import('./leasing').LeasingContract[];
  incidents?: import('./leasing-asset').Incident[];
  maintenances?: import('./leasing-asset').Maintenance[];
  payments?: import('./leasing-payment').LeasingPayment[];
  // Optionals for compatibility
  [key: string]: unknown;
}
import type { FinancialProduct } from './traditional-portfolio';

export type PortfolioStatus = 'active' | 'inactive' | 'pending' | 'archived';

export interface Portfolio {
  id: string;
  name: string;
  type: 'traditional' | 'investment' | 'leasing';
  status: PortfolioStatus;
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
    // --- Métriques métier crédit/traditionnel ---
    nb_credits?: number;
    total_credits?: number;
    avg_credit?: number;
    nb_clients?: number;
    taux_rotation?: number;
    taux_provision?: number;
    taux_recouvrement?: number;
    // --- Métriques spécifiques leasing ---
    asset_utilization_rate?: number; // en %
    average_residual_value?: number; // valeur résiduelle moyenne (en FCFA)
    default_rate?: number; // taux de défaut de paiement (%)
    avg_contract_duration_months?: number; // durée moyenne des contrats (mois)
    assets_under_management?: number; // nombre d’actifs sous gestion
    contract_renewal_rate?: number; // taux de renouvellement (%)
    total_rent_billed?: number; // montant total des loyers facturés (FCFA)
    collection_rate?: number; // taux de recouvrement (%)
    // --- Métriques spécifiques investissement ---
    nb_requests?: number;
    nb_transactions?: number;
    total_invested?: number;
    total_exited?: number;
    irr?: number;
    multiple?: number;
    avg_ticket?: number;
    nb_companies?: number;
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