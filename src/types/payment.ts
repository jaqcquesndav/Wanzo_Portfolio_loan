// src/types/payment.ts
export type PaymentStatus = 'pending' | 'scheduled' | 'processing' | 'received' | 'failed' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'direct_debit' | 'check' | 'cash' | 'card' | 'mobile_money';
export type TransactionAccountType = 'bank' | 'mobile_money';

/**
 * Interface pour les paiements
 */
export interface Payment {
  id: string;
  contractId: string;
  portfolioId?: string;
  amount: number;
  currency?: string;
  scheduledDate: string;
  status: PaymentStatus;
  description?: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
  
  // Traçabilité du compte utilisé
  accountType?: TransactionAccountType;
  accountId?: string; // ID du BankAccount ou MobileMoneyAccount
  
  // Détails du compte source (payeur)
  sourceAccount?: {
    accountType: TransactionAccountType;
    accountId?: string;
    accountNumber?: string;
    accountName?: string;
    bankName?: string;          // Pour compte bancaire
    provider?: string;          // Pour Mobile Money
    phoneNumber?: string;       // Pour Mobile Money
  };
  
  // Détails du compte destination (receveur - portefeuille)
  destinationAccount?: {
    accountType: TransactionAccountType;
    accountId: string;
    accountNumber?: string;
    accountName?: string;
    bankName?: string;          // Pour compte bancaire
    provider?: string;          // Pour Mobile Money
    phoneNumber?: string;       // Pour Mobile Money
    balanceBefore?: number;     // Solde avant la transaction
    balanceAfter?: number;      // Solde après la transaction
  };
  
  // Informations de réception du paiement
  receivedAmount?: number;
  receivedDate?: string;
  
  // Références externes
  externalReference?: string;   // Référence bancaire/Mobile Money
  transactionId?: string;       // ID de transaction côté opérateur
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  
  // Informations supplémentaires pour la gestion hors ligne
  _offlineCreated?: boolean;
  _offlineUpdated?: boolean;
  _createdAt?: string;
  _updatedAt?: string;
}

/**
 * Interface pour la création d'un paiement
 */
export type PaymentCreateInput = Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Interface pour la mise à jour d'un paiement
 */
export type PaymentUpdateInput = Partial<Omit<Payment, 'id' | 'contractId' | 'createdAt' | 'updatedAt' | 'createdBy'>>;
