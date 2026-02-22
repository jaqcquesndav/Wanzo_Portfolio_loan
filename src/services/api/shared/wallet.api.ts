// src/services/api/shared/wallet.api.ts
import { apiClient } from '../base.api';
import type {
  InstitutionWallet,
  WalletBalance,
  WalletDashboard,
  WalletTransaction,
  WalletTransactionListResponse,
  WalletTransactionFilters,
  WalletDepositPayload,
  WalletWithdrawalPayload,
  WalletApproveTransactionPayload,
  WalletRejectTransactionPayload,
  WalletStatusUpdatePayload,
} from '../../../types/wallet';

const BASE = '/wallet';

/**
 * API Wallet Institution
 * Endpoints: /portfolio/api/v1/wallet/*
 *
 * Rôles requis selon l'endpoint (voir wallet/README.md) :
 *   - my-wallet, balance, dashboard, pending-count : admin, manager
 *   - transactions/* : admin, manager, analyst
 *   - approve/reject : admin
 *   - deposit/withdrawal : admin, manager
 */
export const walletApi = {
  // ─── Wallet ──────────────────────────────────────────────────────────────────

  /**
   * Récupère le wallet de l'institution connectée (portfolioId extrait du JWT).
   */
  getMyWallet: async (): Promise<InstitutionWallet> => {
    return apiClient.get<InstitutionWallet>(`${BASE}/my-wallet`);
  },

  /**
   * Récupère le résumé du solde du wallet.
   */
  getBalance: async (): Promise<WalletBalance> => {
    return apiClient.get<WalletBalance>(`${BASE}/balance`);
  },

  /**
   * Récupère les statistiques du dashboard wallet.
   */
  getDashboard: async (): Promise<WalletDashboard> => {
    return apiClient.get<WalletDashboard>(`${BASE}/dashboard`);
  },

  /**
   * Compte les transactions en attente d'approbation.
   */
  getPendingCount: async (): Promise<{ count: number }> => {
    return apiClient.get<{ count: number }>(`${BASE}/pending-count`);
  },

  /**
   * Récupère les détails d'un wallet par son ID.
   */
  getWalletById: async (walletId: string): Promise<InstitutionWallet> => {
    return apiClient.get<InstitutionWallet>(`${BASE}/${walletId}`);
  },

  /**
   * Modifie le statut d'un wallet (admin uniquement).
   */
  updateWalletStatus: async (
    walletId: string,
    payload: WalletStatusUpdatePayload,
  ): Promise<InstitutionWallet> => {
    return apiClient.patch<InstitutionWallet>(`${BASE}/${walletId}/status`, payload);
  },

  // ─── Transactions ─────────────────────────────────────────────────────────

  /**
   * Liste les transactions du portefeuille avec filtrage.
   * portfolioId injecté automatiquement côté backend depuis le JWT.
   */
  listTransactions: async (
    filters?: WalletTransactionFilters,
  ): Promise<WalletTransactionListResponse> => {
    const params = new URLSearchParams();
    if (filters?.walletId) params.append('walletId', filters.walletId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    return apiClient.get<WalletTransactionListResponse>(
      `${BASE}/transactions/list?${params.toString()}`,
    );
  },

  /**
   * Récupère les détails d'une transaction.
   */
  getTransactionById: async (transactionId: string): Promise<WalletTransaction> => {
    return apiClient.get<WalletTransaction>(`${BASE}/transactions/${transactionId}`);
  },

  /**
   * Récupère une transaction par sa référence.
   */
  getTransactionByRef: async (reference: string): Promise<WalletTransaction> => {
    return apiClient.get<WalletTransaction>(`${BASE}/transactions/ref/${reference}`);
  },

  /**
   * Approuve une transaction en attente (admin uniquement).
   */
  approveTransaction: async (
    transactionId: string,
    payload?: WalletApproveTransactionPayload,
  ): Promise<WalletTransaction> => {
    return apiClient.post<WalletTransaction>(
      `${BASE}/transactions/${transactionId}/approve`,
      payload ?? {},
    );
  },

  /**
   * Rejette une transaction en attente (admin uniquement).
   */
  rejectTransaction: async (
    transactionId: string,
    payload: WalletRejectTransactionPayload,
  ): Promise<WalletTransaction> => {
    return apiClient.post<WalletTransaction>(
      `${BASE}/transactions/${transactionId}/reject`,
      payload,
    );
  },

  // ─── Dépôt / Retrait (SerdiPay) ───────────────────────────────────────────

  /**
   * Approvisionne le wallet via mobile money (SerdiPay).
   * Le walletId est résolu automatiquement côté backend.
   */
  deposit: async (payload: WalletDepositPayload): Promise<WalletTransaction> => {
    return apiClient.post<WalletTransaction>(`${BASE}/deposit`, payload);
  },

  /**
   * Effectue un retrait mobile money (SerdiPay).
   */
  withdrawal: async (payload: WalletWithdrawalPayload): Promise<WalletTransaction> => {
    return apiClient.post<WalletTransaction>(`${BASE}/withdrawal`, payload);
  },
};
