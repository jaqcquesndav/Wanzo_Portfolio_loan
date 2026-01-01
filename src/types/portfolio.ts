// Import explicites pour une meilleure maintenabilité
import type { FinancialProduct } from './traditional-portfolio';
import type { BankAccount } from './bankAccount';
import type { MobileMoneyAccount } from './mobileMoneyAccount';
// Autres types importés à la demande

/**
 * Statuts du portefeuille conformes aux pratiques OHADA
 * - draft: Brouillon (en cours de configuration)
 * - active: Actif (opérationnel)
 * - suspended: Suspendu (temporairement gelé)
 * - inactive: Inactif (arrêté mais non clôturé)
 * - closing: En cours de clôture
 * - for_sale: En vente (cession de portefeuille)
 * - sold: Vendu/Cédé
 * - archived: Archivé (clôturé définitivement)
 */
export type PortfolioStatus = 
  | 'draft' 
  | 'active' 
  | 'suspended' 
  | 'inactive' 
  | 'pending'
  | 'closing' 
  | 'for_sale' 
  | 'sold' 
  | 'archived';

export type PortfolioType = 'traditional';

/**
 * Devise supportée (espace OHADA - RDC)
 */
export type PortfolioCurrency = 'CDF' | 'USD' | 'EUR';

/**
 * Type de compte associé au portefeuille
 */
export type AccountType = 'bank' | 'mobile_money';

/**
 * Interface de base pour tous les types de portefeuilles
 * @description Définit les propriétés communes à tous les portefeuilles
 */
export interface Portfolio {
  id: string;
  name: string;
  type: PortfolioType;
  status: PortfolioStatus;
  
  // Devise et montants
  currency: PortfolioCurrency;
  initial_capital: number; // Capital initial du portefeuille
  target_amount?: number; // Objectif de collecte (optionnel)
  
  // Période de validité
  start_date: string; // Date de démarrage
  end_date?: string; // Date de fin (optionnel si portefeuille permanent)
  is_permanent?: boolean; // Portefeuille sans date de fin
  
  // Compte principal associé (obligatoire)
  primary_account_type: AccountType;
  primary_bank_account_id?: string;
  primary_mobile_money_account_id?: string;
  
  // Champs optionnels (configurables via Settings)
  description?: string;
  target_return?: number;
  target_sectors?: string[];
  risk_profile?: 'conservative' | 'moderate' | 'aggressive';
  
  // Relations
  products: FinancialProduct[];
  bank_accounts?: BankAccount[];
  mobile_money_accounts?: MobileMoneyAccount[];
  
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
  };
  
  // Métadonnées
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Cession de portefeuille
  sale_info?: {
    listed_at?: string;
    asking_price?: number;
    sold_at?: string;
    sold_price?: number;
    buyer_institution_id?: string;
  };
}

export interface AssetDistribution {
  credit: number;
  microfinance: number;
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
