// src/utils/openPaymentOrder.ts
import { DisbursementBase, AdditionalData } from '../types/payment-orders';
import { createPaymentOrderFromDisbursement } from '../types/payment-orders';
import type { PaymentOrderData } from '../components/payment/PaymentOrderModal';
import { mockCompanies } from '../data/mockCompanies';
import type { Company } from '../types/company';

/**
 * Type d'action qui déclenche un ordre de paiement
 */
export type PaymentTriggerAction = 
  | 'validate_funding'  // Validation de financement (portefeuille traditionnel)
  | 'payment_schedule'; // Échéancier de paiement

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
  companyId?: string; // ID de l'entreprise pour récupérer toutes ses données
  product?: string;
  additionalInfo?: AdditionalData; // Informations supplémentaires
}

/**
 * Récupère les informations complètes d'une entreprise pour le paiement
 * @param companyName Nom de l'entreprise
 * @param companyId ID de l'entreprise (optionnel, mais recommandé pour plus de précision)
 * @returns Les informations de paiement complètes ou null
 */
function getCompanyPaymentInfo(companyName: string, companyId?: string): {
  accountNumber: string;
  bankName: string;
  swiftCode?: string;
  accountName: string;
  address?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  rccm?: string;
} | null {
  // Chercher l'entreprise dans mockCompanies (priorité à l'ID si fourni)
  const company = companyId 
    ? mockCompanies.find(c => c.id === companyId)
    : mockCompanies.find(c => c.name === companyName);
  
  if (!company) {
    console.warn(`[openPaymentOrder] Entreprise "${companyName}" non trouvée`);
    return null;
  }
  
  // 1. Vérifier si l'entreprise a des informations de paiement explicites
  if (company.payment_info) {
    const preferredMethod = company.payment_info.preferredMethod || 'bank';
    
    if (preferredMethod === 'bank' && company.payment_info.bankAccounts && company.payment_info.bankAccounts.length > 0) {
      // Utiliser le compte bancaire principal ou le premier disponible
      const primaryAccount = company.payment_info.bankAccounts.find(acc => acc.isPrimary) || company.payment_info.bankAccounts[0];
      return {
        accountNumber: primaryAccount.accountNumber,
        bankName: primaryAccount.bankName,
        swiftCode: primaryAccount.swiftCode,
        accountName: primaryAccount.accountName,
        address: company.contact_info?.address,
        email: company.contact_info?.email,
        phone: company.contact_info?.phone,
        taxId: company.legal_info?.taxId,
        rccm: company.legal_info?.rccm
      };
    }
    
    if (preferredMethod === 'mobile_money' && company.payment_info.mobileMoneyAccounts && company.payment_info.mobileMoneyAccounts.length > 0) {
      // Utiliser le compte mobile money principal ou le premier disponible
      const primaryAccount = company.payment_info.mobileMoneyAccounts.find(acc => acc.isPrimary) || company.payment_info.mobileMoneyAccounts[0];
      return {
        accountNumber: primaryAccount.phoneNumber,
        bankName: primaryAccount.provider,
        accountName: primaryAccount.accountName,
        address: company.contact_info?.address,
        email: company.contact_info?.email,
        phone: primaryAccount.phoneNumber,
        taxId: company.legal_info?.taxId,
        rccm: company.legal_info?.rccm
      };
    }
  }
  
  // 2. Sinon, vérifier les données de trésorerie pour extraire un compte bancaire
  if (company.financial_metrics?.treasury_data?.accounts) {
    const bankAccounts = company.financial_metrics.treasury_data.accounts.filter(acc => acc.type === 'bank');
    
    if (bankAccounts.length > 0) {
      // Prendre le premier compte bancaire disponible
      const firstBankAccount = bankAccounts[0];
      if (firstBankAccount.accountNumber && firstBankAccount.bankName) {
        console.log(`[openPaymentOrder] Utilisation des données de trésorerie pour ${companyName}`);
        return {
          accountNumber: firstBankAccount.accountNumber,
          bankName: firstBankAccount.bankName,
          accountName: company.name,
          address: company.contact_info?.address,
          email: company.contact_info?.email,
          phone: company.contact_info?.phone,
          taxId: company.legal_info?.taxId,
          rccm: company.legal_info?.rccm
        };
      }
    }
  }
  
  console.warn(`[openPaymentOrder] Aucune information de paiement trouvée pour "${companyName}"`);
  return null;
}

/**
 * Fonction pour ouvrir un ordre de paiement à partir de différentes actions utilisateur
 * @param context Le contexte de l'action qui déclenche l'ordre de paiement
 * @param showPaymentOrderModal La fonction du contexte qui affiche le modal de paiement
 */
export const openPaymentOrder = (
  context: PaymentTriggerContext,
  showPaymentOrderModal: (data: PaymentOrderData, portfolioType: 'traditional') => void
) => {
  // Nous ne supportons maintenant que le type de portefeuille traditionnel
  const portfolioType = 'traditional' as const;
  
  // Toutes les actions sont maintenant traitées comme des actions de portefeuille traditionnel
  switch(context.action) {
    case 'validate_funding':
    case 'payment_schedule':
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
    case 'validate_funding':
      additionalData.fundingType = 'octroi_crédit';
      break;
    case 'payment_schedule':
      additionalData.fundingType = 'octroi_crédit';
      break;
  }
  
  // Créer l'ordre de paiement avec les données du payment order
  const paymentOrder = createPaymentOrderFromDisbursement(disbursement, additionalData);
  
  // Récupérer automatiquement les informations de paiement de l'entreprise
  const paymentInfo = getCompanyPaymentInfo(disbursement.company, context.companyId);
  
  if (paymentInfo) {
    console.log(`[openPaymentOrder] ✅ Informations de paiement chargées pour "${disbursement.company}":`, {
      accountNumber: paymentInfo.accountNumber,
      bankName: paymentInfo.bankName,
      accountName: paymentInfo.accountName,
      address: paymentInfo.address,
      email: paymentInfo.email,
      phone: paymentInfo.phone
    });
  } else {
    console.log(`[openPaymentOrder] ⚠️ Aucune information de paiement trouvée pour "${disbursement.company}"`);
  }
  
  // Convertir en PaymentOrderData pour le modal
  const paymentOrderData: PaymentOrderData = {
    id: paymentOrder.id,
    orderNumber: `ORD-${Date.now()}`,
    date: new Date().toISOString(),
    amount: disbursement.amount,
    currency: 'XOF',
    beneficiary: paymentInfo ? {
      name: paymentInfo.accountName,
      accountNumber: paymentInfo.accountNumber,
      bankName: paymentInfo.bankName,
      swiftCode: paymentInfo.swiftCode || "",
      address: paymentInfo.address
    } : {
      name: disbursement.company,
      accountNumber: "À spécifier",
      bankName: "À spécifier",
      swiftCode: "",
      address: undefined
    },
    reference: paymentOrder.reference,
    description: context.action === 'validate_funding' ? 
        `Validation de financement: ${disbursement.product || ''}` : 
      context.action === 'payment_schedule' ?
        `Échéancier de paiement: ${disbursement.product || ''}` :
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
