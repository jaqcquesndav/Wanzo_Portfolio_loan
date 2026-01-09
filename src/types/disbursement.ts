/**
 * Types liés aux virements et déboursements
 */

/**
 * Type d'un virement/déboursement
 */
export interface Disbursement {
  id: string;
  company: string;
  product: string;
  amount: number;
  currency: string; // Code devise ISO 4217 (CDF, USD, XOF, EUR, XAF) - AJOUTÉ pour conformité
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed' | 'canceled'; // Statuts conformes à validation_workflow.md DisbursementStatus enum
  date: string;
  requestId?: string;
  portfolioId: string;
  contractReference: string;  // Référence du contrat associé (obligatoire)
  validatedBy?: string; // ID utilisateur validateur
  validatedAt?: string; // Date de validation ISO 8601
  rejectionReason?: string; // Raison du rejet si status=rejeté
  errorCode?: string; // Code d'erreur si status=échoué ou en_erreur
  errorMessage?: string; // Message d'erreur détaillé
  
  // Informations bancaires de l'ordre de virement
  transactionReference?: string;  // Référence de transaction bancaire
  valueDate?: string;  // Date de valeur
  executionDate?: string;  // Date d'exécution
  
  // Type de compte utilisé pour le déboursement
  accountType: 'bank' | 'mobile_money';
  accountId?: string; // ID du compte (BankAccount ou MobileMoneyAccount)
  
  // Informations du compte débité (compte de l'institution)
  // Pour compte bancaire
  debitAccount?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode: string;
    branchCode?: string;
  };
  
  // Pour Mobile Money (compte source institution)
  mobileMoneySource?: {
    provider: 'orange_money' | 'mpesa' | 'airtel_money' | 'africell_money';
    phoneNumber: string;
    accountName: string;
    transactionId?: string;
  };
  
  // Informations du compte crédité (compte du bénéficiaire)
  beneficiary: {
    accountType: 'bank' | 'mobile_money';
    // Pour compte bancaire
    accountNumber?: string;
    accountName: string;  // Nom du titulaire du compte
    bankName?: string;
    bankCode?: string;
    branchCode?: string;
    swiftCode?: string;
    // Pour Mobile Money
    provider?: 'orange_money' | 'mpesa' | 'airtel_money' | 'africell_money';
    phoneNumber?: string;
    // Infos communes
    companyName: string;
    address?: string;
  };
  
  // Informations de paiement
  paymentMethod: 'bank_transfer' | 'mobile_money' | 'check' | 'cash';
  paymentReference?: string;
  description?: string;  // Description ou motif du paiement
  
  // Informations spécifiques selon le type de portefeuille
  investmentType?: 'prise de participation' | 'complément' | 'dividende' | 'cession';
  leasingEquipmentDetails?: {
    equipmentId?: string;
    equipmentName?: string;
    equipmentCategory?: string;
    supplier?: string;
  };
}
