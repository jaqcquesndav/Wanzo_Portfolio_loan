// src/services/storage/indexedDB/companyStore.ts
/**
 * Store IndexedDB pour les entreprises
 * Remplace companyStorageService (localStorage)
 */

import { STORES } from './database';
import { getById, getAll, getByIndex, put, putMany, remove, clear } from './operations';
import type { CompanyData } from '../../../data/companies';

export const companyStore = {
  /**
   * Récupère une entreprise par son ID
   */
  async getById(id: string): Promise<CompanyData | undefined> {
    return getById<CompanyData>(STORES.COMPANIES, id);
  },

  /**
   * Récupère toutes les entreprises
   */
  async getAll(): Promise<CompanyData[]> {
    return getAll<CompanyData>(STORES.COMPANIES);
  },

  /**
   * Récupère les entreprises par secteur
   */
  async getBySector(sector: string): Promise<CompanyData[]> {
    return getByIndex<CompanyData>(STORES.COMPANIES, 'sector', sector);
  },

  /**
   * Récupère les entreprises par statut
   */
  async getByStatus(status: string): Promise<CompanyData[]> {
    return getByIndex<CompanyData>(STORES.COMPANIES, 'status', status);
  },

  /**
   * Recherche des entreprises par nom
   */
  async search(searchTerm: string): Promise<CompanyData[]> {
    if (!searchTerm) return this.getAll();
    
    const all = await this.getAll();
    const term = searchTerm.toLowerCase();
    
    return all.filter(company => 
      company.id?.toLowerCase().includes(term) ||
      company.name?.toLowerCase().includes(term) ||
      company.sector?.toLowerCase().includes(term)
    );
  },

  /**
   * Ajoute ou met à jour une entreprise
   */
  async save(company: CompanyData): Promise<CompanyData> {
    return put<CompanyData>(STORES.COMPANIES, company);
  },

  /**
   * Ajoute ou met à jour plusieurs entreprises (batch)
   */
  async saveMany(companies: CompanyData[]): Promise<CompanyData[]> {
    return putMany<CompanyData>(STORES.COMPANIES, companies);
  },

  /**
   * Supprime une entreprise
   */
  async delete(id: string): Promise<void> {
    return remove(STORES.COMPANIES, id);
  },

  /**
   * Supprime toutes les entreprises
   */
  async clear(): Promise<void> {
    return clear(STORES.COMPANIES);
  },

  /**
   * Synchronise les entreprises depuis le backend
   */
  async syncFromBackend(companies: CompanyData[]): Promise<void> {
    await this.saveMany(companies);
    console.log(`✅ [IndexedDB] ${companies.length} entreprises synchronisées`);
  },
};
