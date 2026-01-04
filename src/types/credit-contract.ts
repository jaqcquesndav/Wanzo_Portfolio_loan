// src/types/credit-contract.ts
// Types conformes à la documentation API des contrats de crédit

// Statuts du contrat (11 valeurs - conformes à la documentation API)
export type ContractStatus = 
  | 'active'        // Contrat actif en cours
  | 'completed'     // Contrat terminé normalement
  | 'defaulted'     // Contrat en défaut de paiement
  | 'restructured'  // Contrat restructuré
  | 'in_litigation' // En contentieux/litige
  | 'suspended'     // Suspendu temporairement
  | 'written_off'   // Contrat passé en perte
  // Legacy values (compatibilité)
  | 'draft'         // Brouillon (avant activation)
  | 'pending'       // En attente d'activation
  | 'litigation'    // Alias de in_litigation
  | 'canceled';     // Annulé avant activation

// Méthode d'amortissement (8 valeurs - conformes à la documentation API)
export type AmortizationMethod = 
  | 'linear'       // Amortissement linéaire (échéances constantes)
  | 'degressive'   // Amortissement dégressif
  | 'progressive'  // Amortissement progressif
  | 'in_fine'      // Remboursement in fine (capital à l'échéance)
  | 'annuity'      // Annuité constante
  // Legacy values (compatibilité)
  | 'constant'     // Alias de linear
  | 'balloon'      // Alias de in_fine
  | 'bullet'       // Alias de in_fine
  | 'custom';      // Personnalisé

// Classification du risque (5 valeurs - normes OHADA/BCC)
export type RiskClass = 
  | 'standard'     // Créance saine
  | 'watch'        // À surveiller (1-30 jours)
  | 'substandard'  // Sensible (31-90 jours)
  | 'doubtful'     // Douteux (91-180 jours)
  | 'loss';        // Perte (>180 jours)

// Statut des échéances
export type PaymentScheduleStatus = 
  | 'pending'   // En attente
  | 'paid'      // Payé
  | 'partial'   // Partiellement payé
  | 'late'      // En retard
  | 'defaulted';// En défaut

// Garantie associée au contrat
export interface ContractGuarantee {
  id: string;
  type: string;
  description: string;
  value: number;
  currency: string;
  status?: string;
  documents?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
}

// Déblocage associé au contrat
export interface ContractDisbursement {
  id: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
}

// Échéance du calendrier de paiement
export interface PaymentScheduleItem {
  id: string;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  status: PaymentScheduleStatus;
  payment_date?: string;
  payment_amount?: number;
  payment_reference?: string;
  installment_number: number;
  remaining_percentage?: number;
  remaining_amount?: number;
  transaction_reference?: string;
}

// Entrée d'historique de restructuration
export interface RestructuringEntry {
  date: string;
  reason: string;
  previous_terms: string;
  previous_rate: number;
  previous_end_date: string;
}

// Document du contrat
export interface ContractDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  created_at: string;
}

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
  status: ContractStatus;
  amortization_method?: AmortizationMethod;
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
  riskClass?: RiskClass;
  guaranteesTotalValue?: number;
  guaranteeId?: string;
  scheduleId?: string;
  documentUrl?: string;
  
  // Consolidation
  consolidatedFrom?: string[];
  isConsolidated?: boolean;
  consolidatedTo?: string;
  
  duration?: number;
  grace_period?: number;
  
  // Additional properties for UI compatibility
  risk_rating?: number;
  days_past_due?: number;
  guarantee_amount?: number;
  term_months?: number;
  
  // Relations imbriquées
  guarantees?: ContractGuarantee[];
  disbursements?: ContractDisbursement[];
  payment_schedule?: PaymentScheduleItem[];
  restructuring_history?: RestructuringEntry[];
  documents?: ContractDocument[];
  
  // Défaut et litige
  default_date?: string;
  default_reason?: string;
  litigation_date?: string;
  litigation_reason?: string;
  completion_date?: string;
}
