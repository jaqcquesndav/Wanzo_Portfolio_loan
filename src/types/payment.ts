// src/types/payment.ts
export type PaymentStatus = 'pending' | 'scheduled' | 'processing' | 'received' | 'failed' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'direct_debit' | 'check' | 'cash' | 'card' | 'mobile_money';

/**
 * Interface pour les paiements
 */
export interface Payment {
  id: string;
  contractId: string;
  amount: number;
  scheduledDate: string;
  status: PaymentStatus;
  description?: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
  
  // Informations de réception du paiement
  receivedAmount?: number;
  receivedDate?: string;
  
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
