// Import explicites pour une meilleure maintenabilité
import type { FinancialProduct } from './traditional-portfolio';
import type { BankAccount } from './bankAccount';
// Autres types importés à la demande

export type PortfolioStatus = 'active' | 'inactive' | 'pending' | 'archived';
export type PortfolioType = 'traditional';

/**
 * Interface de base pour tous les types de portefeuilles
 * @description Définit les propriétés communes à tous les portefeuilles
 */
export interface Portfolio {
  id: string;
  name: string;
  type: PortfolioType;
  status: PortfolioStatus;
  target_amount: number;
  target_return: number;
  target_sectors: string[];
  risk_profile: 'conservative' | 'moderate' | 'aggressive';
  products: FinancialProduct[]; // Maintenant obligatoire et non optionnel
  bank_accounts?: BankAccount[];
  manager?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    department?: string;
  };
  management_fees?: {
    setup_fee?: number;
    annual_fee?: number;
    performance_fee?: number;
  };
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