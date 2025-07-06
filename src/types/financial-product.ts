export type ProductType = 'credit' | 'leasing' | 'investment';

export interface FinancialProduct {
  id: string;
  portfolio_id: string;
  name: string;
  type: ProductType;
  characteristics: {
    min_amount: number;
    max_amount: number;
    min_duration: number;
    max_duration: number;
    interest_rate_type: 'fixed' | 'variable';
    min_interest_rate?: number;
    max_interest_rate?: number;
    required_guarantees: string[];
    eligibility_criteria: string[];
  };
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  product_id: string;
  name: string;
  category: string;
  specifications: {
    brand: string;
    model: string;
    year: number;
    technical_specs: Record<string, string>;
  };
  price: number;
  image_url?: string;
  availability: boolean;
  created_at: string;
}