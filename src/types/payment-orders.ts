// src/types/payment-orders.ts

/**
 * Types de sortie de fonds selon le type de portefeuille
 */

// Type de sortie pour le portefeuille traditionnel (crédits)
export type TraditionalFundingType = 
  'octroi_crédit' | 
  'complément_crédit' | 
  'restructuration' | 
  'autres';

// Type de sortie pour le portefeuille d'investissement
export type InvestmentDisbursementType = 
  'prise_participation' |  // Achat initial
  'complément_participation' | // Augmentation de la participation
  'valeur_mobilière' | // Achat sur le marché
  'acquisition_entreprise' | // Acquisition complète
  'autres';

// Type de sortie pour le portefeuille de leasing
export type LeasingDisbursementType = 
  'achat_équipement' | 
  'transport' | 
  'installation' |
  'maintenance' |
  'autres';

// Interface commune pour toutes les sorties de fonds
export interface PaymentOrderBase {
  id: string;
  portfolioType: 'traditional' | 'investment' | 'leasing';
  amount: number;
  date: Date;
  company: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  reference: string;
  description?: string;
  contractReference?: string; // Référence du contrat associé (utilisé dans traditional et leasing)
}

// Ordre de paiement pour le portefeuille traditionnel
export interface TraditionalPaymentOrder extends PaymentOrderBase {
  portfolioType: 'traditional';
  fundingType: TraditionalFundingType;
  product: string;
  requestId?: string;
  contractReference: string; // Référence obligatoire du contrat pour les virements et remboursements
}

// Ordre de paiement pour le portefeuille d'investissement
export interface InvestmentPaymentOrder extends PaymentOrderBase {
  portfolioType: 'investment';
  investmentType: InvestmentDisbursementType;
  securityType?: string;
  securityId?: string;
  quantity?: number;
  unitPrice?: number;
}

// Ordre de paiement pour le portefeuille de leasing
export interface LeasingPaymentOrder extends PaymentOrderBase {
  portfolioType: 'leasing';
  leasingType: LeasingDisbursementType;
  equipmentId?: string;
  equipmentName?: string;
  equipmentCategory?: string;
  supplier?: string;
  contractId: string; // Identifiant du contrat, obligatoire pour tracer les incidents, maintenances, etc.
  contractReference: string; // Référence du contrat, obligatoire pour l'identification
}

// Type union pour tous les ordres de paiement
export type PaymentOrder = 
  | TraditionalPaymentOrder 
  | InvestmentPaymentOrder 
  | LeasingPaymentOrder;

// Interface de base pour les déboursements
export interface DisbursementBase {
  id: string;
  amount: number;
  company: string;
  product?: string;
  requestId?: string;
  reference?: string; // Référence optionnelle (peut être utilisée comme référence de contrat)
}

// Interface pour les données additionnelles
export interface AdditionalData {
  // Données pour les portefeuilles traditionnels
  fundingType?: TraditionalFundingType;
  
  // Données pour les portefeuilles d'investissement
  investmentType?: InvestmentDisbursementType;
  securityType?: string;
  securityId?: string;
  quantity?: number;
  unitPrice?: number;
  
  // Données pour les portefeuilles de leasing
  leasingType?: LeasingDisbursementType;
  equipmentId?: string;
  equipmentName?: string;
  equipmentCategory?: string;
  supplier?: string;
  contractId?: string;
  
  // Données communes
  contractReference?: string; // Référence du contrat associé
}

// Helper pour créer un ordre de paiement en fonction du type de portefeuille
export const createPaymentOrderFromDisbursement = (
  disbursement: DisbursementBase, 
  portfolioType: 'traditional' | 'investment' | 'leasing',
  additionalData?: AdditionalData
): PaymentOrder => {
  // Base commune
  const base: PaymentOrderBase = {
    id: `po-${Date.now()}`,
    portfolioType,
    amount: disbursement.amount,
    date: new Date(),
    company: disbursement.company,
    status: 'pending',
    reference: disbursement.id,
    description: ''
  };
  
  // Adapter selon le type de portefeuille
  switch(portfolioType) {
    case 'investment':
      return {
        ...base,
        portfolioType: 'investment',
        investmentType: additionalData?.investmentType || 'valeur_mobilière',
        securityType: additionalData?.securityType,
        securityId: additionalData?.securityId,
        quantity: additionalData?.quantity,
        unitPrice: additionalData?.unitPrice
      };
      
    case 'leasing':
      return {
        ...base,
        portfolioType: 'leasing',
        leasingType: additionalData?.leasingType || 'achat_équipement',
        equipmentId: additionalData?.equipmentId,
        equipmentName: additionalData?.equipmentName || disbursement.product,
        equipmentCategory: additionalData?.equipmentCategory,
        supplier: additionalData?.supplier || disbursement.company,
        contractId: additionalData?.contractId || `CONT-ID-${Date.now()}`,
        contractReference: additionalData?.contractReference || disbursement.reference || `LEAS-${Date.now()}`
      };
      
    default: // traditional
      return {
        ...base,
        portfolioType: 'traditional',
        fundingType: additionalData?.fundingType || 'octroi_crédit',
        product: disbursement.product || 'Produit non spécifié',
        requestId: disbursement.requestId,
        contractReference: additionalData?.contractReference || disbursement.reference || `CONT-${Date.now()}`
      };
  }
};
