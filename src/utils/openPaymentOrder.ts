// src/utils/openPaymentOrder.ts
import { DisbursementBase, AdditionalData } from '../types/payment-orders';
import { createPaymentOrderFromDisbursement } from '../types/payment-orders';
import type { PortfolioType } from '../contexts/portfolioTypes';
import type { PaymentOrderData } from '../components/payment/PaymentOrderModal';

/**
 * Type d'action qui déclenche un ordre de paiement
 */
export type PaymentTriggerAction = 
  | 'buy_security'  // Achat de valeurs mobilières (marché)
  | 'validate_funding'  // Validation de financement (portefeuille traditionnel)
  | 'approve_leasing'  // Approbation de demande de leasing
  | 'order_equipment'  // Commander l'équipement pour un contrat de leasing
  | 'equipment_maintenance'  // Maintenance d'équipement
  | 'equipment_incident'  // Incident d'équipement
  | 'payment_schedule';  // Échéancier de paiement

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
  // Déterminer le type de portefeuille en fonction de l'action
  let portfolioType: PortfolioType = 'traditional';
  
  switch(context.action) {
    case 'buy_security':
      portfolioType = 'investment';
      break;
    case 'approve_leasing':
    case 'equipment_maintenance':
    case 'equipment_incident':
      portfolioType = 'leasing';
      break;
    case 'validate_funding':
    default:
      portfolioType = 'traditional';
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
      additionalData.investmentType = 'valeur_mobilière';
      additionalData.securityId = context.itemId;
      if (context.additionalInfo && 'securityType' in context.additionalInfo) {
        const investInfo = context.additionalInfo as InvestmentAdditionalInfo;
        additionalData.securityType = investInfo.securityType;
        additionalData.quantity = investInfo.quantity;
        additionalData.unitPrice = investInfo.unitPrice;
      }
      break;
      
    case 'approve_leasing':
      additionalData.leasingType = 'achat_équipement';
      additionalData.contractId = context.itemId;
      if (context.additionalInfo && 'equipmentId' in context.additionalInfo) {
        const leasingInfo = context.additionalInfo as LeasingAdditionalInfo;
        additionalData.equipmentId = leasingInfo.equipmentId;
        additionalData.equipmentName = leasingInfo.equipmentName;
        additionalData.equipmentCategory = leasingInfo.equipmentCategory;
        additionalData.supplier = leasingInfo.supplier;
      }
      break;
      
    case 'equipment_maintenance':
      additionalData.leasingType = 'maintenance';
      additionalData.contractId = context.additionalInfo && 'contractId' in context.additionalInfo 
        ? (context.additionalInfo as LeasingAdditionalInfo).contractId || context.itemId
        : context.itemId;
      break;
      
    case 'equipment_incident':
      additionalData.leasingType = 'autres';
      additionalData.contractId = context.additionalInfo && 'contractId' in context.additionalInfo 
        ? (context.additionalInfo as LeasingAdditionalInfo).contractId || context.itemId
        : context.itemId;
      break;
      
    case 'validate_funding':
      additionalData.fundingType = 'octroi_crédit';
      break;
  }
  
  // Créer l'ordre de paiement avec les données du payment order
  const paymentOrder = createPaymentOrderFromDisbursement(disbursement, portfolioType, additionalData);
  
  // Convertir en PaymentOrderData pour le modal
  const paymentOrderData: PaymentOrderData = {
    id: paymentOrder.id,
    orderNumber: `ORD-${Date.now()}`,
    portfolioManager: {
      name: "Gestionnaire de portefeuille", // À remplacer par des données réelles
      accountNumber: "123456789",
      portfolioType: portfolioType,
      bankName: "Banque Principale"
    },
    beneficiary: {
      companyName: disbursement.company,
      bank: "À spécifier",
      branch: "",
      accountNumber: "À spécifier",
      swiftCode: ""
    },
    amount: disbursement.amount,
    reference: paymentOrder.reference,
    paymentReason: context.action === 'buy_security' ? 
      `Achat de valeurs mobilières: ${disbursement.product || ''}` : 
      context.action === 'approve_leasing' ?
      `Approbation de leasing: ${disbursement.product || ''}` :
      `Paiement: ${disbursement.product || ''}`,
    createdAt: new Date(),
    status: 'pending'
  };
  
  // Afficher le modal d'ordre de paiement avec les données préparées
  showPaymentOrderModal(paymentOrderData, portfolioType);
};
