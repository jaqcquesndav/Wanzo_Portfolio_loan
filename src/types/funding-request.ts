// src/types/funding-request.ts
export interface FundingRequest {
  id: string;
  portfolio_id: string;
  client_id: string;
  company_name: string;
  product_type: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'disbursed';
  status_date: string;
  created_at: string;
  updated_at: string;
  maturity?: string;
  due_date?: string;
  project_file?: string;
  attachments?: Array<{id: string, name: string, url: string}>;
  product_details?: {
    type: string;
    rate: number;
    term: string;
  };
  approval_notes?: string;
  rejection_reason?: string;
  cancellation_reason?: string;
  // Fields for disbursement tracking
  disbursement_date?: string;
  disbursement_amount?: number;
  disbursement_method?: string;
  disbursement_reference?: string;
}
