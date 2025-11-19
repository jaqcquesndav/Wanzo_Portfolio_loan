// src/hooks/usePortfolioAccounts.ts
import { useState, useCallback } from 'react';
import { portfolioAccountsApi } from '../services/api/shared';
import type { BankAccount } from '../types/bankAccount';
import type { MobileMoneyAccount } from '../types/mobileMoneyAccount';

/**
 * Hook pour gérer les comptes d'un portefeuille (bancaires et Mobile Money)
 */
export function usePortfolioAccounts(portfolioId: string) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [mobileMoneyAccounts, setMobileMoneyAccounts] = useState<MobileMoneyAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fonction de synchronisation avec le portfolio (définie d'abord car utilisée par les autres)
  const syncAccountsToPortfolio = useCallback(async () => {
    try {
      const { portfolioStorageService } = await import('../services/storage/localStorage');
      const { bankAccounts: latestBank, mobileMoneyAccounts: latestMobile } = 
        await portfolioAccountsApi.getAllAccounts(portfolioId);
      const portfolio = await portfolioStorageService.getPortfolio(portfolioId);
      
      if (portfolio) {
        await portfolioStorageService.addOrUpdatePortfolio({
          ...portfolio,
          bank_accounts: latestBank,
          mobile_money_accounts: latestMobile,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to sync accounts to portfolio:', error);
    }
  }, [portfolioId]);

  // Charger tous les comptes bancaires
  const loadBankAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accounts = await portfolioAccountsApi.getBankAccounts(portfolioId);
      setBankAccounts(accounts);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load bank accounts'));
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  // Charger tous les comptes Mobile Money
  const loadMobileMoneyAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accounts = await portfolioAccountsApi.getMobileMoneyAccounts(portfolioId);
      setMobileMoneyAccounts(accounts);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load mobile money accounts'));
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  // Ajouter un compte bancaire
  const addBankAccount = useCallback(async (account: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newAccount = await portfolioAccountsApi.addBankAccount(portfolioId, account);
      setBankAccounts(prev => [...prev, newAccount]);
      
      // Synchroniser avec le portfolio principal
      await syncAccountsToPortfolio();
      
      return newAccount;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add bank account'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [portfolioId, syncAccountsToPortfolio]);

  // Mettre à jour un compte bancaire
  const updateBankAccount = useCallback(async (accountId: string, updates: Partial<BankAccount>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedAccount = await portfolioAccountsApi.updateBankAccount(portfolioId, accountId, updates);
      setBankAccounts(prev => prev.map(acc => acc.id === accountId ? updatedAccount : acc));
      
      // Synchroniser avec le portfolio principal
      await syncAccountsToPortfolio();
      
      return updatedAccount;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update bank account'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [portfolioId, syncAccountsToPortfolio]);

  // Supprimer un compte bancaire
  const deleteBankAccount = useCallback(async (accountId: string) => {
    setLoading(true);
    setError(null);
    try {
      await portfolioAccountsApi.deleteBankAccount(portfolioId, accountId);
      setBankAccounts(prev => prev.filter(acc => acc.id !== accountId));
      
      // Synchroniser avec le portfolio principal
      await syncAccountsToPortfolio();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete bank account'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [portfolioId, syncAccountsToPortfolio]);

  // Ajouter un compte Mobile Money
  const addMobileMoneyAccount = useCallback(async (account: Omit<MobileMoneyAccount, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newAccount = await portfolioAccountsApi.addMobileMoneyAccount(portfolioId, account);
      setMobileMoneyAccounts(prev => [...prev, newAccount]);
      
      // Synchroniser avec le portfolio principal
      await syncAccountsToPortfolio();
      
      return newAccount;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add mobile money account'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [portfolioId, syncAccountsToPortfolio]);

  // Mettre à jour un compte Mobile Money
  const updateMobileMoneyAccount = useCallback(async (accountId: string, updates: Partial<MobileMoneyAccount>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedAccount = await portfolioAccountsApi.updateMobileMoneyAccount(portfolioId, accountId, updates);
      setMobileMoneyAccounts(prev => prev.map(acc => acc.id === accountId ? updatedAccount : acc));
      
      // Synchroniser avec le portfolio principal
      await syncAccountsToPortfolio();
      
      return updatedAccount;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update mobile money account'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [portfolioId, syncAccountsToPortfolio]);

  // Supprimer un compte Mobile Money
  const deleteMobileMoneyAccount = useCallback(async (accountId: string) => {
    setLoading(true);
    setError(null);
    try {
      await portfolioAccountsApi.deleteMobileMoneyAccount(portfolioId, accountId);
      setMobileMoneyAccounts(prev => prev.filter(acc => acc.id !== accountId));
      
      // Synchroniser avec le portfolio principal
      await syncAccountsToPortfolio();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete mobile money account'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [portfolioId, syncAccountsToPortfolio]);

  // Définir un compte comme principal
  const setPrimaryAccount = useCallback(async (accountId: string, accountType: 'bank' | 'mobile_money') => {
    setLoading(true);
    setError(null);
    try {
      await portfolioAccountsApi.setPrimaryAccount(portfolioId, accountId, accountType);
      
      // Mettre à jour l'état local
      if (accountType === 'bank') {
        setBankAccounts(prev => prev.map(acc => ({
          ...acc,
          is_primary: acc.id === accountId
        })));
      } else {
        setMobileMoneyAccounts(prev => prev.map(acc => ({
          ...acc,
          is_primary: acc.id === accountId
        })));
      }
      
      // Synchroniser avec le portfolio principal
      await syncAccountsToPortfolio();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to set primary account'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [portfolioId, syncAccountsToPortfolio]);

  return {
    bankAccounts,
    mobileMoneyAccounts,
    loading,
    error,
    loadBankAccounts,
    loadMobileMoneyAccounts,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addMobileMoneyAccount,
    updateMobileMoneyAccount,
    deleteMobileMoneyAccount,
    setPrimaryAccount,
  };
}
