// src/services/storage/indexedDB/guaranteeStore.ts
/**
 * Store IndexedDB pour les garanties
 * Remplace guaranteeStorageService (localStorage)
 */

import { STORES } from './database';
import { getById, getAll, getByIndex, put, putMany, remove, clear } from './operations';
import type { Guarantee } from '../../../types/guarantee';

export const guaranteeStore = {
  /**
   * Récupère une garantie par son ID
   */
  async getById(id: string): Promise<Guarantee | undefined> {
    return getById<Guarantee>(STORES.GUARANTEES, id);
  },

  /**
   * Récupère toutes les garanties
   */
  async getAll(): Promise<Guarantee[]> {
    return getAll<Guarantee>(STORES.GUARANTEES);
  },

  /**
   * Récupère les garanties par type
   */
  async getByType(type: string): Promise<Guarantee[]> {
    return getByIndex<Guarantee>(STORES.GUARANTEES, 'type', type);
  },

  /**
   * Récupère les garanties par statut
   */
  async getByStatus(status: string): Promise<Guarantee[]> {
    return getByIndex<Guarantee>(STORES.GUARANTEES, 'status', status);
  },

  /**
   * Récupère les garanties par contrat
   */
  async getByContract(contractId: string): Promise<Guarantee[]> {
    return getByIndex<Guarantee>(STORES.GUARANTEES, 'contractId', contractId);
  },

  /**
   * Récupère les garanties par entreprise
   */
  async getByCompany(companyName: string): Promise<Guarantee[]> {
    return getByIndex<Guarantee>(STORES.GUARANTEES, 'company', companyName);
  },

  /**
   * Récupère les garanties actives pour une entreprise
   */
  async getActiveByCompany(companyName: string): Promise<Guarantee[]> {
    const all = await this.getByCompany(companyName);
    return all.filter(g => g.status === 'active');
  },

  /**
   * Ajoute ou met à jour une garantie
   */
  async save(guarantee: Guarantee, offline = false): Promise<Guarantee> {
    return put<Guarantee>(STORES.GUARANTEES, guarantee, offline);
  },

  /**
   * Ajoute ou met à jour plusieurs garanties (batch)
   */
  async saveMany(guarantees: Guarantee[]): Promise<Guarantee[]> {
    return putMany<Guarantee>(STORES.GUARANTEES, guarantees);
  },

  /**
   * Supprime une garantie
   */
  async delete(id: string, offline = false): Promise<void> {
    return remove(STORES.GUARANTEES, id, offline);
  },

  /**
   * Supprime toutes les garanties
   */
  async clear(): Promise<void> {
    return clear(STORES.GUARANTEES);
  },
};
