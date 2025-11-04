// src/types/payment-schedule.ts

/**
 * Interface pour un échéancier de paiement
 */
export interface PaymentSchedule {
  id: string;
  contract_id: string;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  payment_date?: string;
  remaining_balance: number;
  late_fees?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Interface pour les détails d'un échéancier complet
 */
export interface PaymentScheduleDetails {
  contract_id: string;
  contract_number: string;
  client_name: string;
  total_amount: number;
  total_installments: number;
  frequency: 'monthly' | 'quarterly' | 'weekly' | 'biweekly';
  start_date: string;
  end_date: string;
  interest_rate: number;
  schedule: PaymentSchedule[];
  summary: {
    total_paid: number;
    remaining_amount: number;
    next_payment_date: string;
    overdue_count: number;
    overdue_amount: number;
  };
}