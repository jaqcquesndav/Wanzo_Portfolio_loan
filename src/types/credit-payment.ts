// src/types/credit-payment.ts
export interface CreditPayment {
  id: string;
  contract_id: string;
  portfolio_id: string;
  client_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  payment_reference: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_type: 'principal' | 'interest' | 'penalty' | 'mixed';
  payment_details?: {
    principal_amount: number;
    interest_amount: number;
    penalty_amount: number;
  };
  scheduled_payment_id?: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  cancellation_reason?: string;
  cancellation_date?: string;
}
