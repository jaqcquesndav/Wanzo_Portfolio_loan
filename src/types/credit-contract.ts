// src/types/credit-contract.ts
export interface CreditContract {
  id: string;
  portfolio_id: string;
  client_id: string;
  company_name: string;
  product_type: string;
  contract_number: string;
  amount: number;
  interest_rate: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'defaulted' | 'restructured';
  terms: string;
  created_at: string;
  updated_at: string;
  funding_request_id?: string;
  guarantees?: Array<{
    id: string;
    type: string;
    description: string;
    value: number;
    currency: string;
    documents?: Array<{
      id: string;
      name: string;
      url: string;
    }>;
  }>;
  disbursements?: Array<{
    id: string;
    date: string;
    amount: number;
    method: string;
    reference: string;
  }>;
  payment_schedule?: Array<{
    id: string;
    due_date: string;
    principal_amount: number;
    interest_amount: number;
    total_amount: number;
    status: 'pending' | 'paid' | 'partial' | 'late' | 'defaulted';
    payment_date?: string;
    payment_amount?: number;
    payment_reference?: string;
  }>;
  restructuring_history?: Array<{
    date: string;
    reason: string;
    previous_terms: string;
    previous_rate: number;
    previous_end_date: string;
  }>;
  default_date?: string;
  default_reason?: string;
  completion_date?: string;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    created_at: string;
  }>;
}
