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
  transaction_reference?: string; // Référence de la transaction
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_type: 'principal' | 'interest' | 'penalty' | 'mixed';
  payment_details?: {
    principal_amount: number;
    interest_amount: number;
    penalty_amount: number;
  };
  scheduled_payment_id?: string;
  notes?: string;
  receipt_url?: string; // URL du justificatif de paiement
  supporting_document_url?: string; // URL de la pièce justificative
  has_supporting_document?: boolean; // Indique si une pièce justificative est disponible
  description?: string; // Description du paiement
  created_at: string;
  updated_at: string;
  cancellation_reason?: string;
  cancellation_date?: string;
  
  // Informations du compte source (compte de l'entreprise emprunteuse)
  source_account?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode?: string;
    companyName: string;
  };
  
  // Informations du compte destination (compte de l'institution/portefeuille)
  destination_account?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode?: string;
    portfolioName?: string;
  };
  
  // Nouveaux champs
  due_date?: string; // Date d'échéance prévue
  remaining_amount?: number; // Montant restant à payer
  remaining_percentage?: number; // Pourcentage du montant restant
  slippage?: number; // Glissement en jours (positif = retard, négatif = avance)
  installment_number?: number; // Numéro de l'échéance
  total_installments?: number; // Nombre total d'échéances
}
