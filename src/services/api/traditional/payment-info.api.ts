// src/services/api/traditional/payment-info.api.ts
/**
 * API Informations de Paiement Portefeuille
 * Prefix: /portfolios/:portfolioId/payment-info
 *
 * Configure les comptes bancaires et mobile money utilisés pour les décaissements.
 */
import { apiClient } from '../base.api';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface BankAccount {
  id?: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  swiftCode?: string;
  iban?: string;
  branchCode?: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface MobileMoneyAccount {
  id?: string;
  /** Opérateur : AM | OM | WAVE | MP | AF */
  operator: 'AM' | 'OM' | 'WAVE' | 'MP' | 'AF';
  phoneNumber: string;
  accountHolderName: string;
  isDefault?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  createdAt?: string;
}

export interface PaymentPreferences {
  preferredMethod?: 'bank' | 'mobile_money';
  defaultBankAccount?: string;
  defaultMobileMoneyAccount?: string;
  allowAutomaticPayments?: boolean;
  minimumPaymentThreshold?: number;
}

export interface PortfolioPaymentInfo {
  portfolioId: string;
  bankAccounts: BankAccount[];
  mobileMoneyAccounts: MobileMoneyAccount[];
  paymentPreferences: PaymentPreferences;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const paymentInfoApi = {
  /**
   * Récupère les informations de paiement d'un portefeuille
   * GET /portfolios/:portfolioId/payment-info
   */
  getPaymentInfo: async (portfolioId: string): Promise<PortfolioPaymentInfo> => {
    return apiClient.get<PortfolioPaymentInfo>(`/portfolios/${portfolioId}/payment-info`);
  },

  /**
   * Met à jour les informations de paiement d'un portefeuille
   * PUT /portfolios/:portfolioId/payment-info
   */
  updatePaymentInfo: async (
    portfolioId: string,
    payload: Partial<PortfolioPaymentInfo>,
  ): Promise<PortfolioPaymentInfo> => {
    return apiClient.put<PortfolioPaymentInfo>(`/portfolios/${portfolioId}/payment-info`, payload);
  },

  /**
   * Ajoute un compte bancaire
   * POST /portfolios/:portfolioId/payment-info/bank-accounts
   */
  addBankAccount: async (
    portfolioId: string,
    account: Omit<BankAccount, 'id' | 'createdAt'>,
  ): Promise<PortfolioPaymentInfo> => {
    return apiClient.post<PortfolioPaymentInfo>(
      `/portfolios/${portfolioId}/payment-info/bank-accounts`,
      account,
    );
  },

  /**
   * Ajoute un compte Mobile Money
   * POST /portfolios/:portfolioId/payment-info/mobile-money-accounts
   * operator: AM | OM | WAVE | MP | AF
   */
  addMobileMoneyAccount: async (
    portfolioId: string,
    account: Omit<MobileMoneyAccount, 'id' | 'verificationStatus' | 'createdAt'>,
  ): Promise<PortfolioPaymentInfo> => {
    return apiClient.post<PortfolioPaymentInfo>(
      `/portfolios/${portfolioId}/payment-info/mobile-money-accounts`,
      account,
    );
  },
};
