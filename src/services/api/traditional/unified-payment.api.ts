// src/services/api/traditional/unified-payment.api.ts
/**
 * API Paiements Unifiés — /unified-payments
 *
 * Ce service gère les paiements unifiés (décaissements ET remboursements)
 * via le contrôleur UnifiedPaymentController du portfolio-institution-service.
 *
 * Workflow décaissement : DRAFT → PENDING → APPROVED → PROCESSING → COMPLETED
 * Méthodes de paiement  : bank_transfer | mobile_money
 * Opérateurs Mobile Money: AM | OM | WAVE | MP | AF
 */
import { apiClient } from '../base.api';

// ─── Enums / types locaux ──────────────────────────────────────────────────────

export type UnifiedPaymentType = 'disbursement' | 'repayment';
export type UnifiedPaymentMethod = 'bank_transfer' | 'mobile_money';
export type MobileMoneyOperator = 'AM' | 'OM' | 'WAVE' | 'MP' | 'AF';

export interface BankAccountInfo {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode?: string;
  swiftCode?: string;
}

export interface BankInfo {
  debitAccount?: BankAccountInfo;
  beneficiaryAccount: BankAccountInfo;
}

export interface MobileMoneyInfo {
  /** Numéro de téléphone du compte mobile money */
  phoneNumber: string;
  /** Opérateur: AM=Africell Money, OM=Orange Money, WAVE, MP=M-Pesa, AF=Airtel */
  operator: MobileMoneyOperator;
  operatorName: string;
  accountName?: string;
}

/**
 * DTO pour POST /unified-payments/process
 */
export interface ProcessUnifiedPaymentDto {
  type: UnifiedPaymentType;
  contractId: string;
  amount: number;
  paymentMethod: UnifiedPaymentMethod;
  scheduleIds?: string[];
  paymentType?: 'standard' | 'partial' | 'advance' | 'early_payoff';
  reference?: string;
  description?: string;
  /** Requis si paymentMethod = 'bank_transfer' */
  bankInfo?: BankInfo;
  /** Requis si paymentMethod = 'mobile_money' */
  mobileMoneyInfo?: MobileMoneyInfo;
}

export interface UnifiedPaymentResult {
  success: boolean;
  data: {
    type: UnifiedPaymentType;
    disbursement?: unknown;
    repayment?: unknown;
    contract?: {
      id: string;
      contractNumber: string;
      status: string;
    };
  };
  message: string;
}

export interface ContractPaymentInfo {
  contractId: string;
  clientPaymentInfo: {
    bankAccounts: BankAccountInfo[];
    mobileMoneyAccounts: Array<{ operator: MobileMoneyOperator; phoneNumber: string; accountName: string }>;
  };
  portfolioPaymentInfo: {
    bankAccounts: BankAccountInfo[];
    mobileMoneyAccounts: Array<{ operator: MobileMoneyOperator; phoneNumber: string; accountName: string }>;
  };
}

// ─── API ───────────────────────────────────────────────────────────────────────

export const unifiedPaymentApi = {
  /**
   * Traite un paiement unifié (décaissement ou remboursement)
   * POST /unified-payments/process
   */
  processPayment: async (dto: ProcessUnifiedPaymentDto): Promise<UnifiedPaymentResult> => {
    return apiClient.post<UnifiedPaymentResult>('/unified-payments/process', dto);
  },

  /**
   * Raccourci : décaissement sur un contrat
   * POST /unified-payments/disbursement/:contractId
   */
  disbursement: async (
    contractId: string,
    payload: {
      amount: number;
      paymentMethod: UnifiedPaymentMethod;
      bankInfo?: BankInfo;
      mobileMoneyInfo?: MobileMoneyInfo;
      description?: string;
    },
  ): Promise<UnifiedPaymentResult> => {
    return apiClient.post<UnifiedPaymentResult>(
      `/unified-payments/disbursement/${contractId}`,
      payload,
    );
  },

  /**
   * Raccourci : remboursement sur un contrat
   * POST /unified-payments/repayment/:contractId
   */
  repayment: async (
    contractId: string,
    payload: {
      amount: number;
      paymentMethod: UnifiedPaymentMethod;
      paymentType?: 'standard' | 'partial' | 'advance' | 'early_payoff';
      scheduleIds?: string[];
      bankInfo?: BankInfo;
      mobileMoneyInfo?: MobileMoneyInfo;
      reference?: string;
    },
  ): Promise<UnifiedPaymentResult> => {
    return apiClient.post<UnifiedPaymentResult>(
      `/unified-payments/repayment/${contractId}`,
      payload,
    );
  },

  /**
   * Récupère les infos de paiement d'un contrat (comptes disponibles)
   * GET /unified-payments/contract/:contractId/payment-info
   *
   * Les comptes mobile money du portefeuille peuvent être utilisés
   * pour pré-remplir les formulaires de dépôt/retrait wallet.
   */
  getContractPaymentInfo: async (contractId: string): Promise<{ success: boolean; data: ContractPaymentInfo }> => {
    return apiClient.get<{ success: boolean; data: ContractPaymentInfo }>(
      `/unified-payments/contract/${contractId}/payment-info`,
    );
  },
};
