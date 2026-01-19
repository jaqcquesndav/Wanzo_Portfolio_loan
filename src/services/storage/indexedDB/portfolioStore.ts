// src/services/storage/indexedDB/portfolioStore.ts
/**
 * Store IndexedDB pour les portefeuilles
 * Remplace portfolioStorageService (localStorage)
 */

import { STORES } from './database';
import { getById, getAll, getByIndex, put, putMany, remove, clear } from './operations';
import type { PortfolioWithType } from '../../../types/portfolioWithType';
import type { TraditionalPortfolio } from '../../../types/traditional-portfolio';

export const portfolioStore = {
  /**
   * Récupère un portefeuille par son ID
   */
  async getById(id: string): Promise<PortfolioWithType | undefined> {
    return getById<PortfolioWithType>(STORES.PORTFOLIOS, id);
  },

  /**
   * Récupère tous les portefeuilles
   */
  async getAll(): Promise<PortfolioWithType[]> {
    return getAll<PortfolioWithType>(STORES.PORTFOLIOS);
  },

  /**
   * Récupère les portefeuilles par type
   */
  async getByType(type: string): Promise<PortfolioWithType[]> {
    return getByIndex<PortfolioWithType>(STORES.PORTFOLIOS, 'type', type);
  },

  /**
   * Récupère les portefeuilles par institution
   */
  async getByInstitution(institutionId: string): Promise<PortfolioWithType[]> {
    return getByIndex<PortfolioWithType>(STORES.PORTFOLIOS, 'institution_id', institutionId);
  },

  /**
   * Récupère les portefeuilles par manager
   */
  async getByManager(managerId: string): Promise<PortfolioWithType[]> {
    return getByIndex<PortfolioWithType>(STORES.PORTFOLIOS, 'manager_id', managerId);
  },

  /**
   * Récupère les portefeuilles en attente de synchronisation
   */
  async getPendingSync(): Promise<PortfolioWithType[]> {
    return getByIndex<PortfolioWithType>(STORES.PORTFOLIOS, '_pendingSync', 1);
  },

  /**
   * Ajoute ou met à jour un portefeuille
   */
  async save(portfolio: PortfolioWithType, offline = false): Promise<PortfolioWithType> {
    const portfolioToSave = offline 
      ? { ...portfolio, _pendingSync: true }
      : portfolio;
    return put<PortfolioWithType>(STORES.PORTFOLIOS, portfolioToSave, offline);
  },

  /**
   * Ajoute ou met à jour plusieurs portefeuilles (batch)
   */
  async saveMany(portfolios: PortfolioWithType[]): Promise<PortfolioWithType[]> {
    return putMany<PortfolioWithType>(STORES.PORTFOLIOS, portfolios);
  },

  /**
   * Supprime un portefeuille
   */
  async delete(id: string, offline = false): Promise<void> {
    return remove(STORES.PORTFOLIOS, id, offline);
  },

  /**
   * Supprime tous les portefeuilles
   */
  async clear(): Promise<void> {
    return clear(STORES.PORTFOLIOS);
  },

  /**
   * Synchronise les portefeuilles depuis le backend
   * (remplace les données locales par les données du backend)
   */
  async syncFromBackend(portfolios: TraditionalPortfolio[]): Promise<void> {
    // Ne pas supprimer les portefeuilles en attente de sync
    const pending = await this.getPendingSync();
    const pendingIds = new Set(pending.map(p => p.id));
    
    // Mettre à jour ou ajouter les portefeuilles du backend
    for (const portfolio of portfolios) {
      if (!pendingIds.has(portfolio.id)) {
        await this.save(portfolio as unknown as PortfolioWithType);
      }
    }
    
    console.log(`✅ [IndexedDB] ${portfolios.length} portefeuilles synchronisés`);
  },

  /**
   * Marque un portefeuille comme synchronisé
   */
  async markAsSynced(id: string): Promise<void> {
    const portfolio = await this.getById(id);
    if (portfolio && (portfolio as { _pendingSync?: boolean })._pendingSync) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _pendingSync: _unused, ...cleanPortfolio } = portfolio as PortfolioWithType & { _pendingSync?: boolean };
      await this.save(cleanPortfolio as PortfolioWithType);
    }
  },
};
