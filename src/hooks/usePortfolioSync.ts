// src/hooks/usePortfolioSync.ts
import { useEffect, useCallback } from 'react';
import { portfolioStorageService } from '../services/storage/localStorage';
import { portfolioAccountsApi } from '../services/api/shared';
import type { Portfolio } from '../types/portfolio';

/**
 * Hook pour synchroniser les comptes entre l'API/localStorage et le portfolio principal
 * Assure la cohérence des données entre les deux sources
 */
export function usePortfolioSync(portfolioId: string) {
  /**
   * Synchronise les comptes depuis le storage dédié vers le portfolio principal
   */
  const syncAccountsToPortfolio = useCallback(async () => {
    try {
      // Récupérer les comptes depuis l'API/localStorage dédié
      const { bankAccounts, mobileMoneyAccounts } = await portfolioAccountsApi.getAllAccounts(portfolioId);
      
      // Récupérer le portfolio actuel
      const portfolio = await portfolioStorageService.getPortfolio(portfolioId);
      
      if (!portfolio) {
        console.warn(`Portfolio ${portfolioId} not found for sync`);
        return;
      }
      
      // Mettre à jour le portfolio avec les comptes synchronisés
      await portfolioStorageService.addOrUpdatePortfolio({
        ...portfolio,
        bank_accounts: bankAccounts,
        mobile_money_accounts: mobileMoneyAccounts,
        updated_at: new Date().toISOString(),
      });
      
      console.log(`Accounts synchronized for portfolio ${portfolioId}`);
    } catch (error) {
      console.error('Error syncing accounts to portfolio:', error);
    }
  }, [portfolioId]);

  /**
   * Synchronise les comptes depuis le portfolio vers le storage dédié
   * Utile lors de l'import ou la migration de données
   */
  const syncAccountsFromPortfolio = useCallback(async (portfolio: Portfolio) => {
    try {
      // Si le portfolio a des comptes bancaires, les synchroniser
      if (portfolio.bank_accounts && portfolio.bank_accounts.length > 0) {
        for (const account of portfolio.bank_accounts) {
          try {
            // Vérifier si le compte existe déjà
            const existingAccounts = await portfolioAccountsApi.getBankAccounts(portfolioId);
            const exists = existingAccounts.some(acc => acc.id === account.id);
            
            if (!exists) {
              await portfolioAccountsApi.addBankAccount(portfolioId, account);
            }
          } catch (error) {
            console.warn(`Failed to sync bank account ${account.id}:`, error);
          }
        }
      }
      
      // Si le portfolio a des comptes Mobile Money, les synchroniser
      if (portfolio.mobile_money_accounts && portfolio.mobile_money_accounts.length > 0) {
        for (const account of portfolio.mobile_money_accounts) {
          try {
            // Vérifier si le compte existe déjà
            const existingAccounts = await portfolioAccountsApi.getMobileMoneyAccounts(portfolioId);
            const exists = existingAccounts.some(acc => acc.id === account.id);
            
            if (!exists) {
              await portfolioAccountsApi.addMobileMoneyAccount(portfolioId, account);
            }
          } catch (error) {
            console.warn(`Failed to sync mobile money account ${account.id}:`, error);
          }
        }
      }
      
      console.log(`Accounts synchronized from portfolio ${portfolioId}`);
    } catch (error) {
      console.error('Error syncing accounts from portfolio:', error);
    }
  }, [portfolioId]);

  /**
   * Synchronise automatiquement au montage et lors des changements de portfolioId
   */
  useEffect(() => {
    syncAccountsToPortfolio();
  }, [syncAccountsToPortfolio]);

  return {
    syncAccountsToPortfolio,
    syncAccountsFromPortfolio,
  };
}
