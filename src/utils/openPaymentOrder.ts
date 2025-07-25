// src/utils/openPaymentOrder.ts
import { DisbursementBase, AdditionalData } from '../types/payment-orders';
import { createPaymentOrderFromDisbursement } from '../types/payment-orders';
import type { PortfolioType } from '../contexts/portfolioTypes';
import type { PaymentOrderData } from '../components/payment/PaymentOrderModal';

/**
 * Type d'action qui déclenche un ordre de paiement
 */
export type PaymentTriggerAction = 
  | 'validate_funding'  // Validation de financement (portefeuille traditionnel)
  | 'payment_schedule'  // Échéancier de paiement
  | 'buy_security'      // Gardé pour compatibilité avec le code existant
  | 'approve_leasing'   // Gardé pour compatibilité avec le code existant
  | 'order_equipment'   // Gardé pour compatibilité avec le code existant
  | 'equipment_maintenance' // Gardé pour compatibilité avec le code existant
  | 'equipment_incident';   // Gardé pour compatibilité avec le code existant

// Interface pour les informations supplémentaires d'investissement
export interface InvestmentAdditionalInfo {
  securityType?: string;
  quantity?: number;
  unitPrice?: number;
}

// Interface pour les informations supplémentaires de leasing
export interface LeasingAdditionalInfo {
  equipmentId?: string;
  equipmentName?: string;
  equipmentCategory?: string;
  supplier?: string;
  contractId?: string;
}

/**
 * Interface pour le contexte du déclencheur de paiement
 */
export interface PaymentTriggerContext {
  action: PaymentTriggerAction;
  portfolioId: string;
  portfolioName?: string;
  itemId: string; // ID de l'élément concerné (valeur, demande, contrat)
  reference?: string; // Référence (utilisée comme contractReference si applicable)
  amount: number;
  company: string;
  product?: string;
  additionalInfo?: InvestmentAdditionalInfo | LeasingAdditionalInfo; // Informations supplémentaires spécifiques au contexte
}

/**
 * Fonction pour ouvrir un ordre de paiement à partir de différentes actions utilisateur
 * @param context Le contexte de l'action qui déclenche l'ordre de paiement
 * @param showPaymentOrderModal La fonction du contexte qui affiche le modal de paiement
 */
export const openPaymentOrder = (
  context: PaymentTriggerContext,
  showPaymentOrderModal: (data: PaymentOrderData, portfolioType: PortfolioType) => void
) => {
  // Nous ne supportons maintenant que le type de portefeuille traditionnel
  const portfolioType: PortfolioType = 'traditional';
  
  // Pour la compatibilité avec le code existant, nous conservons la structure du switch
  // mais toutes les actions sont maintenant traitées comme des actions de portefeuille traditionnel
  switch(context.action) {
    case 'buy_security':
    case 'approve_leasing':
    case 'equipment_maintenance':
    case 'equipment_incident':
    case 'validate_funding':
    default:
      // Tout est maintenant traité comme un portefeuille traditionnel
      break;
  }
  
  // Créer l'objet de base pour le déboursement
  const disbursement: DisbursementBase = {
    id: context.itemId,
    amount: context.amount,
    company: context.company,
    product: context.product,
    reference: context.reference
  };
  
  // Préparer les données additionnelles selon le contexte
  const additionalData: AdditionalData = {
    contractReference: context.reference
  };
  
  // Compléter les données additionnelles selon le type d'action
  switch(context.action) {
    case 'buy_security':
      // Converti en type traditionnel pour compatibilité
      additionalData.fundingType = 'octroi_crédit';
      break;
      
    case 'approve_leasing':
      // Converti en type traditionnel pour compatibilité
      additionalData.fundingType = 'octroi_crédit';
      break;
      
    case 'equipment_maintenance':
      // Converti en type traditionnel pour compatibilité
      additionalData.fundingType = 'octroi_crédit';
      break;
      
    case 'equipment_incident':
      // Converti en type traditionnel pour compatibilité
      additionalData.fundingType = 'octroi_crédit';
      break;
      
    case 'validate_funding':
      additionalData.fundingType = 'octroi_crédit';
      break;
  }
  
  // Créer l'ordre de paiement avec les données du payment order
  // Cast portfolioType en 'traditional' pour correspondre au type attendu
  const paymentOrder = createPaymentOrderFromDisbursement(disbursement, 'traditional', additionalData);
  
  // Convertir en PaymentOrderData pour le modal
  const paymentOrderData: PaymentOrderData = {
    id: paymentOrder.id,
    orderNumber: `ORD-${Date.now()}`,
    date: new Date().toISOString(),
    amount: disbursement.amount,
    currency: 'XOF',
    beneficiary: {
      name: disbursement.company,
      accountNumber: "À spécifier",
      bankName: "À spécifier",
      swiftCode: ""
    },
    reference: paymentOrder.reference,
    description: context.action === 'buy_security' ? 
        `Achat de valeurs mobilières: ${disbursement.product || ''}` : 
      context.action === 'approve_leasing' ?
        `Approbation de leasing: ${disbursement.product || ''}` :
        `Paiement: ${disbursement.product || ''}`,
    portfolioId: context.portfolioId,
    portfolioName: context.portfolioName || 'Portefeuille',
    status: 'pending',
    createdBy: 'Utilisateur actuel',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Afficher le modal d'ordre de paiement avec les données préparées
  showPaymentOrderModal(paymentOrderData, portfolioType);
};
