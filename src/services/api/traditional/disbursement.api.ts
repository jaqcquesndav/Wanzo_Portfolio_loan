// src/services/api/traditional/disbursement.api.ts
import { apiClient } from '../base.api';
import { Disbursement } from '../../../types/disbursement';
import { traditionalDataService } from './dataService';

/**
 * API pour les virements et déboursements
 */
export const disbursementApi = {
  /**
   * Récupère tous les virements pour un portefeuille
   */
  getDisbursementsByPortfolio: async (portfolioId: string): Promise<Disbursement[]> => {
    try {
      return await apiClient.get<Disbursement[]>(`/portfolios/traditional/disbursements?portfolioId=${portfolioId}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for disbursements of portfolio ${portfolioId}`, error);
      return traditionalDataService.getLocalData<Disbursement[]>('DISBURSEMENTS')
        .filter(d => d.portfolioId === portfolioId);
    }
  },

  /**
   * Récupère tous les virements pour un contrat
   */
  getDisbursementsByContract: async (contractId: string): Promise<Disbursement[]> => {
    try {
      return await apiClient.get<Disbursement[]>(`/portfolios/traditional/disbursements?contractId=${contractId}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for disbursements of contract ${contractId}`, error);
      return traditionalDataService.getContractRelatedData<Disbursement>(contractId, 'DISBURSEMENTS');
    }
  },

  /**
   * Récupère un virement par son ID
   */
  getDisbursementById: async (id: string): Promise<Disbursement | null> => {
    try {
      return await apiClient.get<Disbursement>(`/portfolios/traditional/disbursements/${id}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for disbursement ${id}`, error);
      const disbursements = traditionalDataService.getLocalData<Disbursement[]>('DISBURSEMENTS');
      return disbursements.find(d => d.id === id) || null;
    }
  },

  /**
   * Crée un nouveau virement
   */
  createDisbursement: async (disbursement: Omit<Disbursement, 'id'>): Promise<Disbursement> => {
    try {
      // Assurer que currency est défini (valeur par défaut: CDF) et status est pending
      const disbursementWithDefaults = {
        ...disbursement,
        currency: disbursement.currency || 'CDF', // Code ISO 4217 par défaut
        status: disbursement.status || 'pending',
      };
      return await apiClient.post<Disbursement>(`/portfolios/traditional/disbursements`, disbursementWithDefaults);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for creating disbursement', error);
      
      // Générer un ID unique au format conforme: DISB-YYYY-NNNNNN
      const year = new Date().getFullYear();
      const sequence = Date.now() % 1000000;
      const id = `DISB-${year}-${sequence.toString().padStart(6, '0')}`;
      const newDisbursement: Disbursement = {
        ...disbursement,
        currency: disbursement.currency || 'CDF',
        status: (disbursement.status || 'pending') as any,
        id
      };
      
      // Ajouter à la liste des virements
      const disbursements = traditionalDataService.getLocalData<Disbursement[]>('DISBURSEMENTS');
      const updatedDisbursements = [...disbursements, newDisbursement];
      localStorage.setItem(traditionalDataService.STORAGE_KEYS.DISBURSEMENTS, JSON.stringify(updatedDisbursements));
      
      // Ajouter aux données du contrat
      if (newDisbursement.contractReference) {
        traditionalDataService.saveContractRelatedData(
          newDisbursement.contractReference,
          'DISBURSEMENTS',
          [...traditionalDataService.getContractRelatedData<Disbursement>(newDisbursement.contractReference, 'DISBURSEMENTS'), newDisbursement]
        );
      }
      
      return newDisbursement;
    }
  },

  /**
   * Met à jour un virement existant
   */
  updateDisbursement: async (id: string, updates: Partial<Disbursement>): Promise<Disbursement | null> => {
    try {
      return await apiClient.put<Disbursement>(`/portfolios/traditional/disbursements/${id}`, updates);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating disbursement ${id}`, error);
      
      const disbursements = traditionalDataService.getLocalData<Disbursement[]>('DISBURSEMENTS');
      const index = disbursements.findIndex(d => d.id === id);
      
      if (index === -1) {
        console.error(`Disbursement with ID ${id} not found`);
        return null;
      }
      
      const updatedDisbursement = {
        ...disbursements[index],
        ...updates
      };
      
      disbursements[index] = updatedDisbursement;
      localStorage.setItem(traditionalDataService.STORAGE_KEYS.DISBURSEMENTS, JSON.stringify(disbursements));
      
      // Mettre à jour les données du contrat
      if (updatedDisbursement.contractReference) {
        const contractDisbursements = traditionalDataService.getContractRelatedData<Disbursement>(
          updatedDisbursement.contractReference, 
          'DISBURSEMENTS'
        );
        
        const contractIndex = contractDisbursements.findIndex(d => d.id === id);
        if (contractIndex !== -1) {
          contractDisbursements[contractIndex] = updatedDisbursement;
          traditionalDataService.saveContractRelatedData(
            updatedDisbursement.contractReference,
            'DISBURSEMENTS',
            contractDisbursements
          );
        }
      }
      
      return updatedDisbursement;
    }
  },

  /**
   * Confirme un virement (change son statut en "effectué")
   */
  confirmDisbursement: async (id: string, transactionDetails: {
    transactionReference: string;
    executionDate: string;
    valueDate?: string;
  }): Promise<Disbursement | null> => {
    try {
      return await apiClient.post<Disbursement>(`/portfolios/traditional/disbursements/${id}/confirm`, transactionDetails);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for confirming disbursement ${id}`, error);
      
      return disbursementApi.updateDisbursement(id, {
        status: 'completed' as any, // Statut conforme à DisbursementStatus.COMPLETED
        transactionReference: transactionDetails.transactionReference,
        executionDate: transactionDetails.executionDate,
        valueDate: transactionDetails.valueDate
      });
    }
  },

  /**
   * Annule un virement
   */
  cancelDisbursement: async (id: string, reason: string): Promise<boolean> => {
    try {
      await apiClient.post(`/portfolios/traditional/disbursements/${id}/cancel`, { reason });
      return true;
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for cancelling disbursement ${id}`, error);
      
      // Supprimer le virement
      const disbursements = traditionalDataService.getLocalData<Disbursement[]>('DISBURSEMENTS');
      const filteredDisbursements = disbursements.filter(d => d.id !== id);
      
      if (filteredDisbursements.length === disbursements.length) {
        console.error(`Disbursement with ID ${id} not found`);
        return false;
      }
      
      localStorage.setItem(traditionalDataService.STORAGE_KEYS.DISBURSEMENTS, JSON.stringify(filteredDisbursements));
      
      // Trouver le contrat associé
      const disbursement = disbursements.find(d => d.id === id);
      if (disbursement && disbursement.contractReference) {
        const contractDisbursements = traditionalDataService.getContractRelatedData<Disbursement>(
          disbursement.contractReference, 
          'DISBURSEMENTS'
        );
        
        const filteredContractDisbursements = contractDisbursements.filter(d => d.id !== id);
        traditionalDataService.saveContractRelatedData(
          disbursement.contractReference,
          'DISBURSEMENTS',
          filteredContractDisbursements
        );
      }
      
      return true;
    }
  }
};
