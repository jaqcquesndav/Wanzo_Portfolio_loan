// src/types/funding-request.ts

// Sous-types pour une meilleure organisation
export interface FinancialData {
  annual_revenue?: number;
  net_profit?: number;
  existing_debts?: number;
  cash_flow?: number;
  assets?: number;
  liabilities?: number;
}

export interface ProposedGuarantee {
  type: string;
  description: string;
  estimated_value: number;
  currency: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  created_at: string;
}

export interface RiskAnalysis {
  credit_score?: number;
  risk_level?: 'low' | 'medium' | 'high';
  debt_service_ratio?: number;
  analysis_date?: string;
  analyst_id?: string;
  analyst_name?: string;
  comments?: string;
  recommended_action?: 'approve' | 'reject';
  recommended_amount?: number;
  recommended_duration?: number;
  recommended_rate?: number;
}

export interface ApprovalDetails {
  approved_by?: string;
  approver_name?: string;
  approval_date?: string;
  approved_amount?: number;
  approved_duration?: number;
  approved_rate?: number;
  conditions?: string;
  comments?: string;
}

export interface RejectionDetails {
  rejected_by?: string;
  rejector_name?: string;
  rejection_date?: string;
  reason?: string;
  comments?: string;
  suggestions?: string;
}

export interface CancellationDetails {
  canceled_by?: string;
  canceler_name?: string;
  cancellation_date?: string;
  reason?: string;
  comments?: string;
}

export interface TimelineEvent {
  date: string;
  status: string;
  comment: string;
  user_id: string;
}


export interface FundingRequest {
  id: string;
  portfolio_id: string;
  request_number?: string; // Ajouté
  client_id: string;
  company_name: string;
  product_type: string;
  amount: number;
  currency?: string; // Ajouté
  purpose?: string; // Ajouté
  duration?: number; // Ajouté
  duration_unit?: 'months' | 'years'; // Ajouté
  proposed_start_date?: string; // Ajouté
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'canceled' | 'disbursed';
  status_date: string;
  assigned_to?: string; // Ajouté
  assigned_to_name?: string; // Ajouté
  created_at: string;
  updated_at: string;
  
  // Données enrichies
  financial_data?: FinancialData;
  proposed_guarantees?: ProposedGuarantee[];
  documents?: DocumentAttachment[]; // Renommé de 'attachments' pour la clarté
  
  // Suivi du processus
  risk_analysis?: RiskAnalysis;
  approval_details?: ApprovalDetails; // Remplace approval_notes
  rejection_details?: RejectionDetails; // Remplace rejection_reason
  cancellation_details?: CancellationDetails; // Remplace cancellation_reason
  timeline?: TimelineEvent[]; // Ajouté
  
  // Lien vers le contrat
  contract_id?: string;

  // Champs de déboursement (existants)
  disbursement_date?: string;
  disbursement_amount?: number;
  disbursement_method?: string;
  disbursement_reference?: string;

  // Champs legacy (à conserver pour la compatibilité)
  maturity?: string;
  due_date?: string;
  project_file?: string;
  product_details?: {
    type: string;
    rate: number;
    term: string;
  };
}
