// src/hooks/useWallet.ts
import { useState, useEffect, useCallback } from 'react';
import { walletApi } from '../services/api/shared/wallet.api';
import { useNotification } from '../contexts/useNotification';
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
} from '../types/wallet';

export interface UseWalletResult {
  wallet: InstitutionWallet | null;
  balance: WalletBalance | null;
  dashboard: WalletDashboard | null;
  pendingCount: number;
  transactions: WalletTransaction[];
  transactionTotal: number;
  isLoading: boolean;
  isLoadingTransactions: boolean;
  error: string | null;
  fetchWallet: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  fetchTransactions: (filters?: WalletTransactionFilters) => Promise<WalletTransactionListResponse | null>;
  approveTransaction: (transactionId: string, payload?: WalletApproveTransactionPayload) => Promise<WalletTransaction | null>;
  rejectTransaction: (transactionId: string, reason: string) => Promise<WalletTransaction | null>;
  deposit: (payload: WalletDepositPayload) => Promise<WalletTransaction | null>;
  withdrawal: (payload: WalletWithdrawalPayload) => Promise<WalletTransaction | null>;
  refresh: () => Promise<void>;
}

/**
 * Hook pour la gestion du wallet d'un portefeuille institution.
 * Les endpoints wallet/* sont indépendants du portfolioId car le backend
 * résout automatiquement le wallet depuis le JWT.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useWallet(_portfolioId?: string): UseWalletResult {
  const [wallet, setWallet] = useState<InstitutionWallet | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [dashboard, setDashboard] = useState<WalletDashboard | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [transactionTotal, setTransactionTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // ── Fetch wallet info ────────────────────────────────────────────────────────

  const fetchWallet = useCallback(async () => {
    try {
      const data = await walletApi.getMyWallet();
      setWallet(data);
    } catch (err) {
      console.error('Erreur lors de la récupération du wallet:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    try {
      const data = await walletApi.getBalance();
      setBalance(data);
    } catch (err) {
      console.error('Erreur lors de la récupération du solde:', err);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await walletApi.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Erreur lors de la récupération du dashboard wallet:', err);
    }
  }, []);

  const fetchPendingCount = useCallback(async () => {
    try {
      const { count } = await walletApi.getPendingCount();
      setPendingCount(count);
    } catch (err) {
      console.error('Erreur lors de la récupération du nombre de transactions en attente:', err);
    }
  }, []);

  // ── Initial load ─────────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchWallet(),
        fetchBalance(),
        fetchDashboard(),
        fetchPendingCount(),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWallet, fetchBalance, fetchDashboard, fetchPendingCount]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Transactions ─────────────────────────────────────────────────────────────

  const fetchTransactions = useCallback(
    async (filters?: WalletTransactionFilters): Promise<WalletTransactionListResponse | null> => {
      setIsLoadingTransactions(true);
      try {
        const result = await walletApi.listTransactions(filters);
        setTransactions(result.data);
        setTransactionTotal(result.meta.total);
        return result;
      } catch (err) {
        console.error('Erreur lors de la récupération des transactions:', err);
        showNotification('Erreur lors du chargement des transactions', 'error');
        return null;
      } finally {
        setIsLoadingTransactions(false);
      }
    },
    [showNotification],
  );

  // Load initial transaction list
  useEffect(() => {
    fetchTransactions({ page: 1, limit: 20 });
  }, [fetchTransactions]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const approveTransaction = useCallback(
    async (
      transactionId: string,
      payload?: WalletApproveTransactionPayload,
    ): Promise<WalletTransaction | null> => {
      try {
        const updated = await walletApi.approveTransaction(transactionId, payload);
        setTransactions((prev) =>
          prev.map((t) => (t.id === transactionId ? updated : t)),
        );
        setPendingCount((c) => Math.max(0, c - 1));
        showNotification('Transaction approuvée avec succès', 'success');
        return updated;
      } catch (err) {
        console.error(`Erreur lors de l'approbation de la transaction ${transactionId}:`, err);
        showNotification('Erreur lors de l\'approbation de la transaction', 'error');
        return null;
      }
    },
    [showNotification],
  );

  const rejectTransaction = useCallback(
    async (transactionId: string, reason: string): Promise<WalletTransaction | null> => {
      try {
        const updated = await walletApi.rejectTransaction(transactionId, { reason });
        setTransactions((prev) =>
          prev.map((t) => (t.id === transactionId ? updated : t)),
        );
        setPendingCount((c) => Math.max(0, c - 1));
        showNotification('Transaction rejetée', 'success');
        return updated;
      } catch (err) {
        console.error(`Erreur lors du rejet de la transaction ${transactionId}:`, err);
        showNotification('Erreur lors du rejet de la transaction', 'error');
        return null;
      }
    },
    [showNotification],
  );

  const deposit = useCallback(
    async (payload: WalletDepositPayload): Promise<WalletTransaction | null> => {
      try {
        const tx = await walletApi.deposit(payload);
        showNotification('Dépôt initié avec succès', 'success');
        // Rafraîchir le solde après dépôt
        fetchBalance();
        return tx;
      } catch (err) {
        console.error('Erreur lors du dépôt:', err);
        showNotification('Erreur lors de l\'initiation du dépôt', 'error');
        return null;
      }
    },
    [showNotification, fetchBalance],
  );

  const withdrawal = useCallback(
    async (payload: WalletWithdrawalPayload): Promise<WalletTransaction | null> => {
      try {
        const tx = await walletApi.withdrawal(payload);
        showNotification('Retrait initié avec succès', 'success');
        fetchBalance();
        return tx;
      } catch (err) {
        console.error('Erreur lors du retrait:', err);
        showNotification('Erreur lors de l\'initiation du retrait', 'error');
        return null;
      }
    },
    [showNotification, fetchBalance],
  );

  const refresh = useCallback(async () => {
    await loadAll();
    await fetchTransactions({ page: 1, limit: 20 });
  }, [loadAll, fetchTransactions]);

  return {
    wallet,
    balance,
    dashboard,
    pendingCount,
    transactions,
    transactionTotal,
    isLoading,
    isLoadingTransactions,
    error,
    fetchWallet,
    fetchBalance,
    fetchDashboard,
    fetchTransactions,
    approveTransaction,
    rejectTransaction,
    deposit,
    withdrawal,
    refresh,
  };
}
