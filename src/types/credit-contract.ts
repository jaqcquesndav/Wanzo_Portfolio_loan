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

// Méthode d'amortissement (8 valeurs - Terminologie crédit B2B OHADA)
// GUIDE B2B:
// - ANNUITY: Le plus courant en crédit B2B - échéances mensuelles égales
// - LINEAR: Pour les entreprises préférant des intérêts dégressifs
// - BALLOON: Pour les projets avec cashflow final important (immobilier, import)
// - PROGRESSIVE: Pour les entreprises en phase de croissance
// - DEGRESSIVE: Rarement utilisé, pour des situations spécifiques
export type AmortizationMethod = 
  | 'annuity'      // Annuité constante - Échéances totales égales (STANDARD B2B)
  | 'linear'       // Linéaire - Capital constant + intérêts dégressifs
  | 'degressive'   // Dégressif - Échéances décroissantes
  | 'progressive'  // Progressif - Échéances croissantes (cashflows croissants)
  | 'balloon'      // In fine (Bullet) - Capital à l'échéance finale
  // Legacy values (compatibilité)
  | 'constant'     // Alias de linear
  | 'bullet'       // Alias de balloon
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

/**
 * Payload pour créer un contrat depuis une demande approuvée
 * POST /portfolios/traditional/credit-contracts/from-request
 */
export interface CreateContractPayload {
  portfolioId: string;
  creditRequestId: string;
  client_id: string;
  company_name: string;
  product_type: string;
  amount: number;
  interest_rate: number;
  start_date: string;
  end_date: string;
  terms: string;
  amortization_method: AmortizationMethod;
  grace_period?: number;
  contract_number?: string;
}

export interface CreditContract {
  id: string;

  // ─── Champs API snake_case (source de vérité backend) ───────────────────────
  portfolio_id?: string;          // API: portfolio_id
  contract_number: string;
  funding_request_id?: string;    // API: funding_request_id (= creditRequestId)
  client_id: string;              // API: client_id (= memberId)
  company_name: string;
  product_type: string;           // API: product_type (= productId)
  principal_amount?: number;      // API: principal_amount (string coercé → number)
  interest_rate: number;          // API: interest_rate (string coercé → number)
  start_date: string;
  end_date: string;
  status: ContractStatus;
  amortization_type?: AmortizationMethod;   // API returns amortization_type
  amortization_method?: AmortizationMethod; // Used in CREATE payload
  payment_frequency?: string;     // API: payment_frequency (e.g. "monthly")
  terms: string;
  grace_period?: number;
  riskClass?: RiskClass;
  delinquencyDays?: number;
  outstanding_balance?: number;   // API: outstanding_balance
  disbursed_amount?: number;      // API: disbursed_amount
  total_paid_amount?: number;     // API: total_paid_amount
  total_interest_due?: number;    // API: total_interest_due
  suspension_reason?: string;
  suspension_date?: string;
  default_date?: string;
  default_reason?: string;
  litigation_date?: string;
  litigation_reason?: string;
  completion_date?: string;
  documentUrl?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;

  // ─── Alias camelCase (compat frontend hérité) ───────────────────────────────
  portfolioId?: string;   // alias → portfolio_id
  amount?: number;         // alias → principal_amount
  currency?: string;       // devise du contrat (ex: 'CDF', 'USD')
  creditRequestId?: string;
  memberId?: string;
  memberName?: string;
  productId?: string;
  productName?: string;
  disbursedAmount?: number;
  remainingAmount?: number;
  startDate?: string;
  endDate?: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  guaranteesTotalValue?: number;
  guaranteeId?: string;
  scheduleId?: string;
  reference?: string;

  // Consolidation
  consolidatedFrom?: string[];
  isConsolidated?: boolean;
  consolidatedTo?: string;

  duration?: number;

  // Relations imbriquées
  guarantees?: ContractGuarantee[];
  disbursements?: ContractDisbursement[];
  payment_schedules?: PaymentScheduleItem[];  // API returns payment_schedules (plural)
  payment_schedule?: PaymentScheduleItem[];   // legacy singular — alias
  restructuring_history?: RestructuringEntry[];
  documents?: ContractDocument[];
}
