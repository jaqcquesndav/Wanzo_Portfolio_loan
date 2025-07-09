export interface LeasingPayment {
  id: string;
  portfolio_id: string;
  contract_id?: string;
  date: string;
  amount: number;
  type: 'rent' | 'deposit' | 'fee' | 'other';
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
}
