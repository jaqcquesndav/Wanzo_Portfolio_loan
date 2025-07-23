
import type { Portfolio } from './portfolio';

export interface FinancialProduct {
  id: string;
  name: string;
  type: 'credit' | 'savings' | 'investment';
  description: string;
  minAmount: number;
  maxAmount: number;
  duration: {
    min: number;
    max: number;
  };
  interestRate: {
    type: 'fixed' | 'variable';
    value?: number;
    min?: number;
    max?: number;
  };
  requirements: string[];
  acceptedGuarantees?: string[]; // Types de garanties acceptées pour ce produit
  isPublic: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface TraditionalPortfolio extends Portfolio {
  description: string;
  manager_id: string;
  institution_id: string;
  // Ajoute ici les champs spécifiques à traditional si besoin
}