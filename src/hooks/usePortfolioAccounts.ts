// src/hooks/usePortfolioAccounts.ts
import { useState, useCallback, useRef } from 'react';
import { portfolioAccountsApi } from '../services/api/shared';
import type { BankAccount } from '../types/bankAccount';
import type { MobileMoneyAccount, MobileMoneyProvider } from '../types/mobileMoneyAccount';

// ── Field normalizers ──────────────────────────────────────────────────────────
// L'API retourne des champs légèrement différents du type front :
//   name        → account_name
//   is_default  → is_primary
//   status      → is_active
// Ces fonctions normalisent les deux formes.

export function normalizeMobileMoneyAccount(raw: unknown): MobileMoneyAccount {
  const r = raw as Record<string, unknown>;
  return {
    id:              r.id as string,
    account_name:    ((r.account_name ?? r.name) as string) ?? '',
    phone_number:    r.phone_number as string ?? '',
    provider:        r.provider as MobileMoneyProvider,
    currency:        (r.currency as string) ?? 'CDF',
    is_primary:      ((r.is_primary ?? r.is_default ?? false) as boolean),
    is_active:       r.is_active !== undefined
                       ? (r.is_active as boolean)
                       : r.status === 'active',
    created_at:      (r.created_at as string) ?? new Date().toISOString(),
    updated_at:      (r.updated_at as string) ?? new Date().toISOString(),
    portfolio_id:    r.portfolio_id as string | undefined,
    service_number:  r.service_number as string | undefined,
    account_status:  r.account_status as 'verified' | 'pending' | 'suspended' | undefined,
    balance:         r.balance as number | undefined,
  };
}

export function normalizeBankAccount(raw: unknown): BankAccount {
  const r = raw as Record<string, unknown>;
  return {
    id:             r.id as string,
    account_number: r.account_number as string ?? '',
    account_name:   r.account_name as string ?? '',
    bank_name:      r.bank_name as string ?? '',
    branch:         r.branch as string | undefined,
    swift_code:     r.swift_code as string | undefined,
    iban:           r.iban as string | undefined,
    currency:       (r.currency as string) ?? 'CDF',
    is_primary:     (r.is_primary ?? r.is_default ?? false) as boolean,
    is_active:      r.is_active !== undefined ? (r.is_active as boolean) : r.status === 'active',
    created_at:     (r.created_at as string) ?? new Date().toISOString(),
    updated_at:     (r.updated_at as string) ?? new Date().toISOString(),
    portfolio_id:   r.portfolio_id as string | undefined,
    purpose:        r.purpose as BankAccount['purpose'] | undefined,
  };
}

/**
 * Hook pour gérer les comptes d'un portefeuille (bancaires et Mobile Money).
 *
 * @param portfolioId   ID du portefeuille
 * @param embedded      Données embarquées dans la réponse portfolio (fallback quand l'API
 *                      des comptes retourne vide) — champs API bruts acceptés, normalisés
 *                      automatiquement.
 */
export function usePortfolioAccounts(
  portfolioId: string,
  embedded?: {
    bankAccounts?:        unknown[] | null;
    mobileMoneyAccounts?: unknown[] | null;
  },
) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() =>
    Array.isArray(embedded?.bankAccounts)
      ? embedded!.bankAccounts!.map(normalizeBankAccount)
      : [],
  );
  const [mobileMoneyAccounts, setMobileMoneyAccounts] = useState<MobileMoneyAccount[]>(() =>
    Array.isArray(embedded?.mobileMoneyAccounts)
      ? embedded!.mobileMoneyAccounts!.map(normalizeMobileMoneyAccount)
      : [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ── Stabilise the embedded reference so useCallbacks don't recreate on every render
  // (an inline object literal passed as prop is a new reference each render → infinite loop)
  const embeddedRef = useRef(embedded);
  embeddedRef.current = embedded;

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

  // Helper: normalise any API response to a plain array
  const toArray = <T,>(raw: unknown): T[] => {
    if (Array.isArray(raw)) return raw as T[];
    if (raw && typeof raw === 'object') {
      const wrapped = raw as Record<string, unknown>;
      if (Array.isArray(wrapped.data))  return wrapped.data as T[];
      if (Array.isArray(wrapped.items)) return wrapped.items as T[];
    }
    return [];
  };

  // Charger tous les comptes bancaires
  const loadBankAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await portfolioAccountsApi.getBankAccounts(portfolioId);
      const result = toArray<unknown>(raw).map(normalizeBankAccount);
      // Si l'API retourne vide, conserver les données embarquées du portfolio
      if (result.length > 0) setBankAccounts(result);
      else if (Array.isArray(embeddedRef.current?.bankAccounts) && embeddedRef.current!.bankAccounts!.length > 0) {
        setBankAccounts(embeddedRef.current!.bankAccounts!.map(normalizeBankAccount));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load bank accounts'));
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);  // ⚠️ ne pas ajouter embedded/embeddedRef ici (réf stable via ref)

  // Charger tous les comptes Mobile Money
  const loadMobileMoneyAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await portfolioAccountsApi.getMobileMoneyAccounts(portfolioId);
      const result = toArray<unknown>(raw).map(normalizeMobileMoneyAccount);
      // Si l'API retourne vide, conserver les données embarquées du portfolio
      if (result.length > 0) setMobileMoneyAccounts(result);
      else if (Array.isArray(embeddedRef.current?.mobileMoneyAccounts) && embeddedRef.current!.mobileMoneyAccounts!.length > 0) {
        setMobileMoneyAccounts(embeddedRef.current!.mobileMoneyAccounts!.map(normalizeMobileMoneyAccount));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load mobile money accounts'));
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);  // ⚠️ ne pas ajouter embedded/embeddedRef ici (réf stable via ref)

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
