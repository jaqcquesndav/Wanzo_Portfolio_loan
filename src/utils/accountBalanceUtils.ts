/**
 * Service utilitaire pour la gestion des soldes de comptes
 * Assure la cohérence des soldes entre banque et mobile money
 */

import type { BankAccount } from '../types/bankAccount';
import type { MobileMoneyAccount } from '../types/mobileMoneyAccount';
import type { 
  TransactionAccountType, 
  PaymentMethod,
  PortfolioBalanceSummary,
  MobileMoneyProviderCode 
} from '../types/payment-method';

export interface AccountBalance {
  accountId: string;
  accountType: TransactionAccountType;
  accountNumber: string;
  accountName: string;
  balance: number;
  currency: string;
  isPrimary: boolean;
  // Spécifique banque
  bankName?: string;
  // Spécifique Mobile Money
  provider?: MobileMoneyProviderCode;
  phoneNumber?: string;
}

export interface TransactionBalanceUpdate {
  accountId: string;
  accountType: TransactionAccountType;
  previousBalance: number;
  newBalance: number;
  transactionAmount: number;
  transactionType: 'debit' | 'credit';
  transactionId: string;
  timestamp: string;
}

/**
 * Calcule le nouveau solde après une transaction
 */
export function calculateNewBalance(
  currentBalance: number,
  amount: number,
  transactionType: 'debit' | 'credit'
): number {
  if (transactionType === 'debit') {
    return currentBalance - amount;
  }
  return currentBalance + amount;
}

/**
 * Vérifie si un compte a un solde suffisant pour une transaction
 */
export function hassufficientBalance(
  currentBalance: number,
  amount: number
): boolean {
  return currentBalance >= amount;
}

/**
 * Convertit un BankAccount en AccountBalance
 */
export function bankAccountToBalance(account: BankAccount): AccountBalance {
  return {
    accountId: account.id,
    accountType: 'bank',
    accountNumber: account.account_number,
    accountName: account.account_name,
    balance: account.balance ?? 0,
    currency: account.currency,
    isPrimary: account.is_primary,
    bankName: account.bank_name
  };
}

/**
 * Convertit un MobileMoneyAccount en AccountBalance
 */
export function mobileMoneyAccountToBalance(account: MobileMoneyAccount): AccountBalance {
  // Mapper le provider string vers MobileMoneyProviderCode
  const providerMapping: Record<string, MobileMoneyProviderCode> = {
    'Orange Money': 'orange_money',
    'M-Pesa': 'mpesa',
    'Airtel Money': 'airtel_money',
    'Africell Money': 'africell_money',
    'Vodacom M-Pesa': 'vodacom_mpesa'
  };

  return {
    accountId: account.id,
    accountType: 'mobile_money',
    accountNumber: account.phone_number,
    accountName: account.account_name,
    balance: account.balance ?? 0,
    currency: account.currency,
    isPrimary: account.is_primary,
    provider: providerMapping[account.provider] || 'orange_money',
    phoneNumber: account.phone_number
  };
}

/**
 * Crée un résumé des soldes pour un portefeuille
 */
export function createPortfolioBalanceSummary(
  portfolioId: string,
  currency: string,
  bankAccounts: BankAccount[],
  mobileMoneyAccounts: MobileMoneyAccount[]
): PortfolioBalanceSummary {
  const bankBalances = bankAccounts.map(acc => ({
    account_id: acc.id,
    account_name: acc.account_name,
    account_number: acc.account_number,
    bank_name: acc.bank_name,
    balance: acc.balance ?? 0,
    is_primary: acc.is_primary
  }));

  const mobileMoneyBalances = mobileMoneyAccounts.map(acc => {
    const providerMapping: Record<string, MobileMoneyProviderCode> = {
      'Orange Money': 'orange_money',
      'M-Pesa': 'mpesa',
      'Airtel Money': 'airtel_money',
      'Africell Money': 'africell_money',
      'Vodacom M-Pesa': 'vodacom_mpesa'
    };

    return {
      account_id: acc.id,
      account_name: acc.account_name,
      phone_number: acc.phone_number,
      provider: providerMapping[acc.provider] || 'orange_money',
      balance: acc.balance ?? 0,
      is_primary: acc.is_primary
    };
  });

  const totalBankBalance = bankBalances.reduce((sum, acc) => sum + acc.balance, 0);
  const totalMobileMoneyBalance = mobileMoneyBalances.reduce((sum, acc) => sum + acc.balance, 0);

  return {
    portfolio_id: portfolioId,
    currency,
    bank_accounts: bankBalances,
    total_bank_balance: totalBankBalance,
    mobile_money_accounts: mobileMoneyBalances,
    total_mobile_money_balance: totalMobileMoneyBalance,
    total_balance: totalBankBalance + totalMobileMoneyBalance,
    last_updated: new Date().toISOString()
  };
}

/**
 * Détermine le compte à utiliser pour une transaction basé sur la méthode de paiement
 */
export function selectAccountForTransaction(
  paymentMethod: PaymentMethod,
  bankAccounts: BankAccount[],
  mobileMoneyAccounts: MobileMoneyAccount[],
  preferredAccountId?: string
): AccountBalance | null {
  // Si un compte préféré est spécifié
  if (preferredAccountId) {
    const bankAccount = bankAccounts.find(acc => acc.id === preferredAccountId);
    if (bankAccount) {
      return bankAccountToBalance(bankAccount);
    }
    const mobileAccount = mobileMoneyAccounts.find(acc => acc.id === preferredAccountId);
    if (mobileAccount) {
      return mobileMoneyAccountToBalance(mobileAccount);
    }
  }

  // Sinon, sélectionner basé sur la méthode de paiement
  if (paymentMethod === 'mobile_money') {
    // Chercher le compte Mobile Money primaire actif
    const primaryMobile = mobileMoneyAccounts.find(acc => acc.is_primary && acc.is_active);
    if (primaryMobile) {
      return mobileMoneyAccountToBalance(primaryMobile);
    }
    // Sinon, le premier compte actif
    const activeMobile = mobileMoneyAccounts.find(acc => acc.is_active);
    if (activeMobile) {
      return mobileMoneyAccountToBalance(activeMobile);
    }
    return null;
  }

  // Pour bank_transfer, check, direct_debit
  if (paymentMethod === 'bank_transfer' || paymentMethod === 'check' || paymentMethod === 'direct_debit') {
    // Chercher le compte bancaire primaire actif
    const primaryBank = bankAccounts.find(acc => acc.is_primary && acc.is_active);
    if (primaryBank) {
      return bankAccountToBalance(primaryBank);
    }
    // Sinon, le premier compte actif
    const activeBank = bankAccounts.find(acc => acc.is_active);
    if (activeBank) {
      return bankAccountToBalance(activeBank);
    }
    return null;
  }

  // Pour cash ou card, retourner le compte primaire (n'importe quel type)
  const primaryBank = bankAccounts.find(acc => acc.is_primary && acc.is_active);
  if (primaryBank) {
    return bankAccountToBalance(primaryBank);
  }
  const primaryMobile = mobileMoneyAccounts.find(acc => acc.is_primary && acc.is_active);
  if (primaryMobile) {
    return mobileMoneyAccountToBalance(primaryMobile);
  }

  return null;
}

/**
 * Crée un enregistrement de mise à jour de solde pour audit
 */
export function createBalanceUpdateRecord(
  account: AccountBalance,
  transactionAmount: number,
  transactionType: 'debit' | 'credit',
  transactionId: string
): TransactionBalanceUpdate {
  const newBalance = calculateNewBalance(
    account.balance,
    transactionAmount,
    transactionType
  );

  return {
    accountId: account.accountId,
    accountType: account.accountType,
    previousBalance: account.balance,
    newBalance,
    transactionAmount,
    transactionType,
    transactionId,
    timestamp: new Date().toISOString()
  };
}

/**
 * Valide qu'un compte peut être utilisé pour une transaction
 */
export function validateAccountForTransaction(
  account: AccountBalance | null,
  amount: number,
  transactionType: 'debit' | 'credit'
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!account) {
    errors.push('Aucun compte sélectionné pour la transaction');
    return { isValid: false, errors };
  }

  if (transactionType === 'debit' && !hassufficientBalance(account.balance, amount)) {
    errors.push(`Solde insuffisant. Disponible: ${account.balance}, Requis: ${amount}`);
  }

  if (amount <= 0) {
    errors.push('Le montant doit être supérieur à zéro');
  }

  return { isValid: errors.length === 0, errors };
}
