// src/services/storage/indexedDB/creditStore.ts
/**
 * Store IndexedDB pour les demandes et contrats de crédit
 * Remplace creditRequestsStorageService et creditContractsStorageService (localStorage)
 */

import { STORES } from './database';
import { getById, getAll, getByIndex, put, putMany, remove, clear } from './operations';
import type { CreditRequest, CreditRequestStatus } from '../../../types/credit';

// Type pour les contrats de crédit
export interface CreditContract {
  id: string;
  requestId: string;
  portfolioId: string;
  companyId: string;
  status: string;
  amount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export const creditRequestStore = {
  /**
   * Récupère une demande de crédit par son ID
   */
  async getById(id: string): Promise<CreditRequest | undefined> {
    return getById<CreditRequest>(STORES.CREDIT_REQUESTS, id);
  },

  /**
   * Récupère toutes les demandes de crédit
   */
  async getAll(): Promise<CreditRequest[]> {
    return getAll<CreditRequest>(STORES.CREDIT_REQUESTS);
  },

  /**
   * Récupère les demandes par statut
   */
  async getByStatus(status: CreditRequestStatus): Promise<CreditRequest[]> {
    return getByIndex<CreditRequest>(STORES.CREDIT_REQUESTS, 'status', status);
  },

  /**
   * Récupère les demandes par portefeuille
   */
  async getByPortfolio(portfolioId: string): Promise<CreditRequest[]> {
    return getByIndex<CreditRequest>(STORES.CREDIT_REQUESTS, 'portfolioId', portfolioId);
  },

  /**
   * Récupère les demandes par entreprise
   */
  async getByCompany(companyId: string): Promise<CreditRequest[]> {
    return getByIndex<CreditRequest>(STORES.CREDIT_REQUESTS, 'companyId', companyId);
  },

  /**
   * Ajoute ou met à jour une demande
   */
  async save(request: CreditRequest, offline = false): Promise<CreditRequest> {
    return put<CreditRequest>(STORES.CREDIT_REQUESTS, request, offline);
  },

  /**
   * Ajoute ou met à jour plusieurs demandes (batch)
   */
  async saveMany(requests: CreditRequest[]): Promise<CreditRequest[]> {
    return putMany<CreditRequest>(STORES.CREDIT_REQUESTS, requests);
  },

  /**
   * Met à jour le statut d'une demande
   */
  async updateStatus(id: string, status: CreditRequestStatus, offline = false): Promise<CreditRequest | undefined> {
    const request = await this.getById(id);
    if (request) {
      return this.save({ ...request, status }, offline);
    }
    return undefined;
  },

  /**
   * Supprime une demande
   */
  async delete(id: string, offline = false): Promise<void> {
    return remove(STORES.CREDIT_REQUESTS, id, offline);
  },

  /**
   * Supprime toutes les demandes
   */
  async clear(): Promise<void> {
    return clear(STORES.CREDIT_REQUESTS);
  },
};

export const creditContractStore = {
  /**
   * Récupère un contrat par son ID
   */
  async getById(id: string): Promise<CreditContract | undefined> {
    return getById<CreditContract>(STORES.CREDIT_CONTRACTS, id);
  },

  /**
   * Récupère tous les contrats
   */
  async getAll(): Promise<CreditContract[]> {
    return getAll<CreditContract>(STORES.CREDIT_CONTRACTS);
  },

  /**
   * Récupère les contrats par statut
   */
  async getByStatus(status: string): Promise<CreditContract[]> {
    return getByIndex<CreditContract>(STORES.CREDIT_CONTRACTS, 'status', status);
  },

  /**
   * Récupère les contrats par portefeuille
   */
  async getByPortfolio(portfolioId: string): Promise<CreditContract[]> {
    return getByIndex<CreditContract>(STORES.CREDIT_CONTRACTS, 'portfolioId', portfolioId);
  },

  /**
   * Récupère le contrat lié à une demande
   */
  async getByRequest(requestId: string): Promise<CreditContract[]> {
    return getByIndex<CreditContract>(STORES.CREDIT_CONTRACTS, 'requestId', requestId);
  },

  /**
   * Ajoute ou met à jour un contrat
   */
  async save(contract: CreditContract, offline = false): Promise<CreditContract> {
    return put<CreditContract>(STORES.CREDIT_CONTRACTS, contract, offline);
  },

  /**
   * Ajoute ou met à jour plusieurs contrats (batch)
   */
  async saveMany(contracts: CreditContract[]): Promise<CreditContract[]> {
    return putMany<CreditContract>(STORES.CREDIT_CONTRACTS, contracts);
  },

  /**
   * Supprime un contrat
   */
  async delete(id: string, offline = false): Promise<void> {
    return remove(STORES.CREDIT_CONTRACTS, id, offline);
  },

  /**
   * Supprime tous les contrats
   */
  async clear(): Promise<void> {
    return clear(STORES.CREDIT_CONTRACTS);
  },
};
