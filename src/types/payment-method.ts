/**
 * Types centralisés pour les méthodes de paiement
 * Cohérence entre banque et mobile money pour tout le workflow du portefeuille
 */

/**
 * Méthodes de paiement standardisées (OHADA/RDC compatible)
 */
export type PaymentMethod = 
  | 'bank_transfer'    // Virement bancaire
  | 'mobile_money'     // Mobile Money (Orange, M-Pesa, Airtel, etc.)
  | 'check'            // Chèque
  | 'cash'             // Espèces
  | 'card'             // Carte bancaire
  | 'direct_debit';    // Prélèvement automatique

/**
 * Type de compte utilisé dans une transaction
 */
export type TransactionAccountType = 'bank' | 'mobile_money';

/**
 * Fournisseurs Mobile Money supportés en RDC
 */
export type MobileMoneyProviderCode = 
  | 'orange_money' 
  | 'mpesa' 
  | 'airtel_money' 
  | 'africell_money'
  | 'vodacom_mpesa';

/**
 * Interface pour tracer l'origine/destination d'une transaction
 */
export interface TransactionAccount {
  account_type: TransactionAccountType;
  account_id: string;                    // ID du compte (BankAccount.id ou MobileMoneyAccount.id)
  account_number: string;                // Numéro de compte ou numéro de téléphone
  account_name: string;                  // Nom du compte
  
  // Spécifique compte bancaire
  bank_name?: string;
  bank_code?: string;
  swift_code?: string;
  
  // Spécifique Mobile Money
  provider?: MobileMoneyProviderCode;
  phone_number?: string;
  
  // Solde au moment de la transaction (pour audit)
  balance_before?: number;
  balance_after?: number;
}

/**
 * Détails de transaction pour le suivi des soldes
 */
export interface TransactionDetails {
  transaction_id: string;
  transaction_type: 'disbursement' | 'repayment' | 'fee' | 'transfer' | 'adjustment';
  payment_method: PaymentMethod;
  
  // Compte source (débité)
  source_account: TransactionAccount;
  
  // Compte destination (crédité)
  destination_account: TransactionAccount;
  
  amount: number;
  currency: string;
  
  // Références
  external_reference?: string;          // Référence bancaire/Mobile Money
  internal_reference?: string;          // Référence interne système
  
  // Dates
  initiated_at: string;
  executed_at?: string;
  value_date?: string;
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  error_code?: string;
  error_message?: string;
}

/**
 * Résumé des soldes par type de compte pour un portefeuille
 */
export interface PortfolioBalanceSummary {
  portfolio_id: string;
  currency: string;
  
  // Soldes bancaires
  bank_accounts: {
    account_id: string;
    account_name: string;
    account_number: string;
    bank_name: string;
    balance: number;
    is_primary: boolean;
  }[];
  total_bank_balance: number;
  
  // Soldes Mobile Money
  mobile_money_accounts: {
    account_id: string;
    account_name: string;
    phone_number: string;
    provider: MobileMoneyProviderCode;
    balance: number;
    is_primary: boolean;
  }[];
  total_mobile_money_balance: number;
  
  // Total global
  total_balance: number;
  
  // Dernière mise à jour
  last_updated: string;
}

/**
 * Mapping des méthodes de paiement vers labels français
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Virement bancaire',
  mobile_money: 'Mobile Money',
  check: 'Chèque',
  cash: 'Espèces',
  card: 'Carte bancaire',
  direct_debit: 'Prélèvement automatique'
};

/**
 * Mapping des providers Mobile Money vers labels
 */
export const MOBILE_MONEY_PROVIDER_LABELS: Record<MobileMoneyProviderCode, string> = {
  orange_money: 'Orange Money',
  mpesa: 'M-Pesa',
  airtel_money: 'Airtel Money',
  africell_money: 'Africell Money',
  vodacom_mpesa: 'Vodacom M-Pesa'
};

/**
 * Helper pour déterminer le type de compte à partir de la méthode de paiement
 */
export function getAccountTypeFromPaymentMethod(method: PaymentMethod): TransactionAccountType | null {
  switch (method) {
    case 'bank_transfer':
    case 'check':
    case 'direct_debit':
      return 'bank';
    case 'mobile_money':
      return 'mobile_money';
    case 'cash':
    case 'card':
      return null; // Pas de compte associé
    default:
      return null;
  }
}

/**
 * Helper pour valider qu'un compte correspond à la méthode de paiement
 */
export function isPaymentMethodCompatible(
  method: PaymentMethod, 
  accountType: TransactionAccountType
): boolean {
  if (method === 'mobile_money') {
    return accountType === 'mobile_money';
  }
  if (method === 'bank_transfer' || method === 'check' || method === 'direct_debit') {
    return accountType === 'bank';
  }
  // cash et card sont compatibles avec tous les types de compte
  return true;
}
