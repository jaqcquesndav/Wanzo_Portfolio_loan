// src/services/api/shared/portfolio-accounts.api.ts
import { apiClient } from '../base.api';
import type { BankAccount } from '../../../types/bankAccount';
import type { MobileMoneyAccount } from '../../../types/mobileMoneyAccount';

/**
 * Service de données local pour les comptes (fallback)
 */
const accountsDataService = {
  getBankAccounts: (portfolioId: string): BankAccount[] => {
    const key = `portfolio_${portfolioId}_bank_accounts`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveBankAccounts: (portfolioId: string, accounts: BankAccount[]) => {
    const key = `portfolio_${portfolioId}_bank_accounts`;
    localStorage.setItem(key, JSON.stringify(accounts));
  },

  getMobileMoneyAccounts: (portfolioId: string): MobileMoneyAccount[] => {
    const key = `portfolio_${portfolioId}_mobile_money_accounts`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveMobileMoneyAccounts: (portfolioId: string, accounts: MobileMoneyAccount[]) => {
    const key = `portfolio_${portfolioId}_mobile_money_accounts`;
    localStorage.setItem(key, JSON.stringify(accounts));
  },

  generateAccountId: () => `acc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
};

/**
 * API pour la gestion des comptes d'un portefeuille
 * Conforme à la documentation API
 */
export const portfolioAccountsApi = {
  /**
   * Récupère tous les comptes bancaires d'un portefeuille
   * GET /portfolios/{portfolioId}/accounts/bank
   */
  getBankAccounts: async (portfolioId: string): Promise<BankAccount[]> => {
    try {
      return await apiClient.get<BankAccount[]>(`/portfolios/${portfolioId}/accounts/bank`);
    } catch (error) {
      console.warn(`Fallback to localStorage for bank accounts of portfolio ${portfolioId}`, error);
      return accountsDataService.getBankAccounts(portfolioId);
    }
  },

  /**
   * Récupère un compte bancaire spécifique
   * GET /portfolios/{portfolioId}/accounts/bank/{accountId}
   */
  getBankAccountById: async (portfolioId: string, accountId: string): Promise<BankAccount> => {
    try {
      return await apiClient.get<BankAccount>(`/portfolios/${portfolioId}/accounts/bank/${accountId}`);
    } catch (error) {
      console.warn(`Fallback to localStorage for bank account ${accountId}`, error);
      const accounts = accountsDataService.getBankAccounts(portfolioId);
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) {
        throw new Error(`Bank account ${accountId} not found`);
      }
      return account;
    }
  },

  /**
   * Ajoute un nouveau compte bancaire
   * POST /portfolios/{portfolioId}/accounts/bank
   */
  addBankAccount: async (
    portfolioId: string,
    account: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>
  ): Promise<BankAccount> => {
    try {
      return await apiClient.post<BankAccount>(`/portfolios/${portfolioId}/accounts/bank`, account);
    } catch (error) {
      console.warn(`Fallback to localStorage for adding bank account to portfolio ${portfolioId}`, error);
      const accounts = accountsDataService.getBankAccounts(portfolioId);
      
      const newAccount: BankAccount = {
        ...account,
        id: accountsDataService.generateAccountId(),
        portfolio_id: portfolioId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      accounts.push(newAccount);
      accountsDataService.saveBankAccounts(portfolioId, accounts);
      return newAccount;
    }
  },

  /**
   * Met à jour un compte bancaire
   * PUT /portfolios/{portfolioId}/accounts/bank/{accountId}
   */
  updateBankAccount: async (
    portfolioId: string,
    accountId: string,
    updates: Partial<BankAccount>
  ): Promise<BankAccount> => {
    try {
      return await apiClient.put<BankAccount>(`/portfolios/${portfolioId}/accounts/bank/${accountId}`, updates);
    } catch (error) {
      console.warn(`Fallback to localStorage for updating bank account ${accountId}`, error);
      const accounts = accountsDataService.getBankAccounts(portfolioId);
      const index = accounts.findIndex(acc => acc.id === accountId);
      
      if (index === -1) {
        throw new Error(`Bank account ${accountId} not found`);
      }
      
      const updatedAccount: BankAccount = {
        ...accounts[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      accounts[index] = updatedAccount;
      accountsDataService.saveBankAccounts(portfolioId, accounts);
      return updatedAccount;
    }
  },

  /**
   * Supprime un compte bancaire
   * DELETE /portfolios/{portfolioId}/accounts/bank/{accountId}
   */
  deleteBankAccount: async (portfolioId: string, accountId: string): Promise<void> => {
    try {
      await apiClient.delete(`/portfolios/${portfolioId}/accounts/bank/${accountId}`);
    } catch (error) {
      console.warn(`Fallback to localStorage for deleting bank account ${accountId}`, error);
      const accounts = accountsDataService.getBankAccounts(portfolioId);
      const filtered = accounts.filter(acc => acc.id !== accountId);
      accountsDataService.saveBankAccounts(portfolioId, filtered);
    }
  },

  /**
   * Récupère tous les comptes Mobile Money d'un portefeuille
   * GET /portfolios/{portfolioId}/accounts/mobile-money
   */
  getMobileMoneyAccounts: async (portfolioId: string): Promise<MobileMoneyAccount[]> => {
    try {
      return await apiClient.get<MobileMoneyAccount[]>(`/portfolios/${portfolioId}/accounts/mobile-money`);
    } catch (error) {
      console.warn(`Fallback to localStorage for mobile money accounts of portfolio ${portfolioId}`, error);
      return accountsDataService.getMobileMoneyAccounts(portfolioId);
    }
  },

  /**
   * Récupère un compte Mobile Money spécifique
   * GET /portfolios/{portfolioId}/accounts/mobile-money/{accountId}
   */
  getMobileMoneyAccountById: async (portfolioId: string, accountId: string): Promise<MobileMoneyAccount> => {
    try {
      return await apiClient.get<MobileMoneyAccount>(`/portfolios/${portfolioId}/accounts/mobile-money/${accountId}`);
    } catch (error) {
      console.warn(`Fallback to localStorage for mobile money account ${accountId}`, error);
      const accounts = accountsDataService.getMobileMoneyAccounts(portfolioId);
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) {
        throw new Error(`Mobile money account ${accountId} not found`);
      }
      return account;
    }
  },

  /**
   * Ajoute un nouveau compte Mobile Money
   * POST /portfolios/{portfolioId}/accounts/mobile-money
   */
  addMobileMoneyAccount: async (
    portfolioId: string,
    account: Omit<MobileMoneyAccount, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MobileMoneyAccount> => {
    try {
      return await apiClient.post<MobileMoneyAccount>(`/portfolios/${portfolioId}/accounts/mobile-money`, account);
    } catch (error) {
      console.warn(`Fallback to localStorage for adding mobile money account to portfolio ${portfolioId}`, error);
      const accounts = accountsDataService.getMobileMoneyAccounts(portfolioId);
      
      const newAccount: MobileMoneyAccount = {
        ...account,
        id: accountsDataService.generateAccountId(),
        portfolio_id: portfolioId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      accounts.push(newAccount);
      accountsDataService.saveMobileMoneyAccounts(portfolioId, accounts);
      return newAccount;
    }
  },

  /**
   * Met à jour un compte Mobile Money
   * PUT /portfolios/{portfolioId}/accounts/mobile-money/{accountId}
   */
  updateMobileMoneyAccount: async (
    portfolioId: string,
    accountId: string,
    updates: Partial<MobileMoneyAccount>
  ): Promise<MobileMoneyAccount> => {
    try {
      return await apiClient.put<MobileMoneyAccount>(`/portfolios/${portfolioId}/accounts/mobile-money/${accountId}`, updates);
    } catch (error) {
      console.warn(`Fallback to localStorage for updating mobile money account ${accountId}`, error);
      const accounts = accountsDataService.getMobileMoneyAccounts(portfolioId);
      const index = accounts.findIndex(acc => acc.id === accountId);
      
      if (index === -1) {
        throw new Error(`Mobile money account ${accountId} not found`);
      }
      
      const updatedAccount: MobileMoneyAccount = {
        ...accounts[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      accounts[index] = updatedAccount;
      accountsDataService.saveMobileMoneyAccounts(portfolioId, accounts);
      return updatedAccount;
    }
  },

  /**
   * Supprime un compte Mobile Money
   * DELETE /portfolios/{portfolioId}/accounts/mobile-money/{accountId}
   */
  deleteMobileMoneyAccount: async (portfolioId: string, accountId: string): Promise<void> => {
    try {
      await apiClient.delete(`/portfolios/${portfolioId}/accounts/mobile-money/${accountId}`);
    } catch (error) {
      console.warn(`Fallback to localStorage for deleting mobile money account ${accountId}`, error);
      const accounts = accountsDataService.getMobileMoneyAccounts(portfolioId);
      const filtered = accounts.filter(acc => acc.id !== accountId);
      accountsDataService.saveMobileMoneyAccounts(portfolioId, filtered);
    }
  },

  /**
   * Définit un compte comme principal (un seul compte principal par type et par portefeuille)
   * PUT /portfolios/{portfolioId}/accounts/{accountType}/{accountId}/set-primary
   */
  setPrimaryAccount: async (
    portfolioId: string,
    accountId: string,
    accountType: 'bank' | 'mobile_money'
  ): Promise<void> => {
    try {
      await apiClient.put(`/portfolios/${portfolioId}/accounts/${accountType}/${accountId}/set-primary`, {});
    } catch (error) {
      console.warn(`Fallback to localStorage for setting primary account ${accountId}`, error);
      
      if (accountType === 'bank') {
        const accounts = accountsDataService.getBankAccounts(portfolioId);
        const updated = accounts.map(acc => ({
          ...acc,
          is_primary: acc.id === accountId,
          updated_at: new Date().toISOString(),
        }));
        accountsDataService.saveBankAccounts(portfolioId, updated);
      } else {
        const accounts = accountsDataService.getMobileMoneyAccounts(portfolioId);
        const updated = accounts.map(acc => ({
          ...acc,
          is_primary: acc.id === accountId,
          updated_at: new Date().toISOString(),
        }));
        accountsDataService.saveMobileMoneyAccounts(portfolioId, updated);
      }
    }
  },

  /**
   * Récupère tous les comptes (bancaires et Mobile Money) d'un portefeuille
   * GET /portfolios/{portfolioId}/accounts
   */
  getAllAccounts: async (portfolioId: string): Promise<{
    bankAccounts: BankAccount[];
    mobileMoneyAccounts: MobileMoneyAccount[];
  }> => {
    try {
      return await apiClient.get<{
        bankAccounts: BankAccount[];
        mobileMoneyAccounts: MobileMoneyAccount[];
      }>(`/portfolios/${portfolioId}/accounts`);
    } catch (error) {
      console.warn(`Fallback to localStorage for all accounts of portfolio ${portfolioId}`, error);
      return {
        bankAccounts: accountsDataService.getBankAccounts(portfolioId),
        mobileMoneyAccounts: accountsDataService.getMobileMoneyAccounts(portfolioId),
      };
    }
  },
};
