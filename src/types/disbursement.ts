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
  status: 'en attente' | 'effectué';
  date: string;
  requestId?: string;
  portfolioId: string;
  contractReference: string;  // Référence du contrat associé (obligatoire)
  
  // Informations bancaires de l'ordre de virement
  transactionReference?: string;  // Référence de transaction bancaire
  valueDate?: string;  // Date de valeur
  executionDate?: string;  // Date d'exécution
  
  // Informations du compte débité (compte de l'institution)
  debitAccount: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode: string;
    branchCode?: string;
  };
  
  // Informations du compte crédité (compte du bénéficiaire)
  beneficiary: {
    accountNumber: string;
    accountName: string;  // Nom du titulaire du compte
    bankName: string;
    bankCode?: string;
    branchCode?: string;
    swiftCode?: string;
    companyName: string;
    address?: string;
  };
  
  // Informations de paiement
  paymentMethod?: 'virement' | 'transfert' | 'chèque' | 'espèces';
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
