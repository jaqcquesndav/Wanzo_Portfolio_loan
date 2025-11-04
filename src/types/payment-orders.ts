// src/types/payment-orders.ts

/**
 * Types de sortie de fonds pour le portefeuille traditionnel
 */

// Type de sortie pour le portefeuille traditionnel (crédits)
export type TraditionalFundingType = 
  'octroi_crédit' | 
  'complément_crédit' | 
  'restructuration' | 
  'autres';

// Interface commune pour toutes les sorties de fonds
export interface PaymentOrderBase {
  id: string;
  portfolioType: 'traditional';
  amount: number;
  date: Date;
  company: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  reference: string;
  description?: string;
  contractReference?: string; // Référence du contrat associé
}

// Ordre de paiement pour le portefeuille traditionnel
export interface TraditionalPaymentOrder extends PaymentOrderBase {
  portfolioType: 'traditional';
  fundingType: TraditionalFundingType;
  product: string;
  requestId?: string;
  contractReference: string; // Référence obligatoire du contrat pour les virements et remboursements
}

// Type union pour tous les ordres de paiement (seul traditional maintenant)
export type PaymentOrder = TraditionalPaymentOrder;

// Interface de base pour les déboursements
export interface DisbursementBase {
  id: string;
  amount: number;
  company: string;
  product?: string;
  requestId?: string;
  reference?: string; // Référence optionnelle (peut être utilisée comme référence de contrat)
}

// Interface pour les données additionnelles (traditional seulement)
export interface AdditionalData {
  // Données pour les portefeuilles traditionnels
  fundingType?: TraditionalFundingType;
  contractReference?: string; // Référence du contrat associé
}

// Helper pour créer un ordre de paiement traditionnel
export const createPaymentOrderFromDisbursement = (
  disbursement: DisbursementBase, 
  additionalData?: AdditionalData
): PaymentOrder => {
  const base: PaymentOrderBase = {
    id: `po-${Date.now()}`,
    portfolioType: 'traditional',
    amount: disbursement.amount,
    date: new Date(),
    company: disbursement.company,
    status: 'pending',
    reference: disbursement.id,
    description: ''
  };
  
  return {
    ...base,
    portfolioType: 'traditional',
    fundingType: additionalData?.fundingType || 'octroi_crédit',
    product: disbursement.product || 'Produit non spécifié',
    requestId: disbursement.requestId,
    contractReference: additionalData?.contractReference || disbursement.reference || `CONT-${Date.now()}`
  };
};
