// Types pour les opérations récentes - Version simplifiée pour Traditional uniquement

export interface Operation {
  id: string;
  type: 'credit' | 'disbursement' | 'repayment' | 'request' | 'contract' | 'guarantee';
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  startDate: string;
  description: string;
  created_at: string;
  updated_at: string;
  portfolioId?: string;
  clientName?: string;
  currency?: string;
}

export interface OperationFilter {
  type?: string;
  status?: string;
  portfolioId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OperationSummary {
  totalOperations: number;
  pendingOperations: number;
  completedOperations: number;
  totalAmount: number;
  averageAmount: number;
}