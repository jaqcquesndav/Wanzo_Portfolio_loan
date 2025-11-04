// src/types/credit-contract.ts
export interface CreditContract {
  id: string;
  portfolioId: string;
  client_id: string;
  company_name: string;
  product_type: string;
  contract_number: string;
  amount: number;
  interest_rate: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'defaulted' | 'restructured' | 'in_litigation' | 'suspended';
  amortization_method?: 'linear' | 'degressive' | 'progressive' | 'balloon';
  terms: string;
  created_at: string;
  updated_at: string;
  funding_request_id?: string;
  
  // Additional properties from the legacy interface
  reference?: string;
  creditRequestId?: string;
  memberId?: string;
  memberName?: string;
  productId?: string;
  productName?: string;
  disbursedAmount?: number;
  remainingAmount?: number;
  startDate?: string;  // Legacy field mapping to start_date
  endDate?: string;    // Legacy field mapping to end_date
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  delinquencyDays?: number;
  riskClass?: 'standard' | 'watch' | 'substandard' | 'doubtful' | 'loss';
  guaranteesTotalValue?: number;
  guaranteeId?: string;
  scheduleId?: string;
  documentUrl?: string;
  consolidatedFrom?: string[];
  isConsolidated?: boolean;
  consolidatedTo?: string;
  duration?: number;
  
  // Additional properties for UI compatibility
  risk_rating?: number;
  days_past_due?: number;
  guarantee_amount?: number;
  term_months?: number;
  grace_period?: number;
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
    installment_number: number; // Numéro de l'échéance
    remaining_percentage?: number; // Pourcentage restant à payer
    remaining_amount?: number; // Montant restant à payer
    transaction_reference?: string; // Référence de la transaction
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
  litigation_date?: string;
  litigation_reason?: string;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    created_at: string;
  }>;
}
