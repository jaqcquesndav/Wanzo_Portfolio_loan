// src/types/credit-payment.ts
// Types conformes à la documentation API des remboursements

// Statuts du paiement (6 valeurs - incluant legacy)
export type PaymentStatus = 
  | 'pending'     // En attente de validation/traitement
  | 'completed'   // Paiement effectué et validé
  | 'failed'      // Paiement échoué
  | 'cancelled'   // Paiement annulé
  // Legacy values
  | 'processing'  // En cours de traitement
  | 'partial';    // Partiellement payé

// Types de paiement (8 valeurs - incluant legacy)
export type PaymentType = 
  | 'principal'    // Remboursement du capital uniquement
  | 'interest'     // Paiement des intérêts uniquement
  | 'penalty'      // Paiement des pénalités uniquement
  | 'mixed'        // Paiement combiné (capital + intérêts + pénalités)
  // Legacy values
  | 'standard'     // Paiement standard
  | 'partial'      // Paiement partiel
  | 'advance'      // Paiement anticipé
  | 'early_payoff';// Remboursement anticipé total

// Méthodes de paiement acceptées (5 valeurs)
export type PaymentMethod = 
  | 'bank_transfer'  // Virement bancaire
  | 'mobile_money'   // Mobile Money (Orange, M-Pesa, etc.)
  | 'cash'           // Espèces
  | 'check'          // Chèque
  | 'other';         // Autre méthode

// Détails de la répartition du paiement
export interface PaymentDetails {
  principal_amount: number;   // Montant du capital
  interest_amount: number;    // Montant des intérêts
  penalty_amount: number;     // Montant des pénalités
}

// Compte source (entreprise emprunteuse) - Bank ou Mobile Money
export interface PaymentAccountSource {
  account_type: 'bank' | 'mobile_money';
  accountNumber: string;
  accountName: string;
  bankName?: string;          // Pour compte bancaire
  bankCode?: string;
  provider?: string;          // Orange Money, M-Pesa, Airtel Money, etc.
  companyName: string;
}

// Compte destination (institution/portefeuille) - Bank ou Mobile Money
export interface PaymentAccountDest {
  account_type: 'bank' | 'mobile_money';
  accountId: string;          // ID du compte dans le portefeuille
  accountNumber: string;
  accountName: string;
  bankName?: string;          // Pour compte bancaire
  bankCode?: string;
  portfolioId?: string;
  portfolioName?: string;
  provider?: string;          // Orange Money, M-Pesa, Airtel Money, etc.
}

export interface CreditPayment {
  id: string;
  contract_id: string;
  portfolio_id: string;
  client_id: string;
  payment_date: string;                      // ISO 8601
  amount: number;
  payment_method: PaymentMethod | string;
  payment_reference: string;
  transaction_reference?: string;            // Référence de la transaction
  status: PaymentStatus;
  payment_type: PaymentType;
  payment_details?: PaymentDetails;
  scheduled_payment_id?: string;
  notes?: string;
  receipt_url?: string;                      // URL du justificatif de paiement
  supporting_document_url?: string;          // URL de la pièce justificative
  has_supporting_document?: boolean;         // Indique si une pièce justificative est disponible
  description?: string;                      // Description du paiement
  created_at: string;
  updated_at: string;
  cancellation_reason?: string;
  cancellation_date?: string;
  
  // Informations du compte source (compte de l'entreprise emprunteuse)
  source_account?: PaymentAccountSource;
  
  // Informations du compte destination (compte de l'institution/portefeuille)
  destination_account?: PaymentAccountDest;
  
  // Nouveaux champs conformes à la documentation
  due_date?: string;                         // Date d'échéance prévue
  remaining_amount?: number;                 // Montant restant à payer
  remaining_percentage?: number;             // Pourcentage du montant restant
  slippage?: number;                         // Glissement en jours (positif = retard, négatif = avance)
  installment_number?: number;               // Numéro de l'échéance
  total_installments?: number;               // Nombre total d'échéances
}
