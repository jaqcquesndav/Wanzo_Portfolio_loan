
import type { Portfolio } from './portfolio';

// ─── Enums ──────────────────────────────────────────────────────────────────

/** Types de produits — backend uses snake_case */
export type ProductType =
  | 'business_loan'
  | 'equipment_loan'
  | 'working_capital'
  | 'expansion_loan'
  | 'line_of_credit'
  | 'microcredit';

/** Labels affichables par type */
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  business_loan:   'Prêt professionnel',
  equipment_loan:  'Financement équipements',
  working_capital: 'Fonds de roulement',
  expansion_loan:  'Prêt d\'expansion',
  line_of_credit:  'Ligne de crédit',
  microcredit:     'Microcrédit',
};

export type InterestType = 'fixed' | 'variable';
export type TermUnit     = 'days' | 'months' | 'years';
export type ProductStatus = 'active' | 'inactive';

export type InterestCalculationMethod =
  | 'declining_balance'
  | 'flat'
  | 'annuity';

// ─── Sub-types ────────────────────────────────────────────────────────────

export interface ProductFee {
  type: string;        // 'dossier' | 'assurance' | 'gestion' | …
  amount: number;
  is_percentage: boolean;
}

export interface EligibilityCriterion {
  criterion: string;
  description: string;
}

// ─── Main type — mirrors backend FinancialProduct entity ─────────────────

export interface FinancialProduct {
  id: string;
  portfolio_id: string;
  code?: string | null;
  name: string;
  description?: string;
  type: ProductType;
  status: ProductStatus;
  base_interest_rate: number | string;  // backend returns string "18.50"
  interest_type: InterestType;
  interest_calculation_method?: InterestCalculationMethod | string;
  min_amount: number | string;          // backend returns string "500000.00"
  max_amount: number | string;
  min_term: number;
  max_term: number;
  term_unit: TermUnit;
  required_documents: string[];
  fees: ProductFee[];
  eligibility_criteria: EligibilityCriterion[];
  createdAt?: string;
  updatedAt?: string;
  // Legacy / alias fields kept for backward compat with old UI code
  /** @deprecated use base_interest_rate */
  interestRate?: { type: InterestType; value?: number; min?: number; max?: number };
  /** @deprecated use min_amount / max_amount */
  minAmount?: number;
  /** @deprecated use min_amount / max_amount */
  maxAmount?: number;
  /** @deprecated use required_documents */
  requirements?: string[];
  isPublic?: boolean;
  created_at?: string;
  updated_at?: string;
}

/** DTO for creating / updating a product */
export interface FinancialProductPayload {
  portfolio_id: string;
  type: ProductType;
  name: string;
  description?: string;
  base_interest_rate: number;
  interest_type: InterestType;
  interest_calculation_method?: InterestCalculationMethod | string;
  min_amount: number;
  max_amount: number;
  min_term: number;
  max_term: number;
  term_unit: TermUnit;
  required_documents?: string[];
  fees?: ProductFee[];
  eligibility_criteria?: EligibilityCriterion[];
  status?: ProductStatus;
}

export interface TraditionalPortfolio extends Portfolio {
  description: string;
  manager_id: string;
  institution_id: string;
  products?: FinancialProduct[];
}