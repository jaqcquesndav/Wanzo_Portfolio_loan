// src/services/api/traditional/credit-contract.api.ts
import { apiClient } from '../base.api';
import type { CreditContract } from '../../../types/credit-contract';
import { traditionalDataService } from './dataService';

/**
 * API pour les contrats de crédit
 */
export const creditContractApi = {
  /**
   * Récupère tous les contrats de crédit
   */
  getAllContracts: async (portfolioId?: string, filters?: {
    status?: 'active' | 'completed' | 'defaulted' | 'restructured';
    clientId?: string;
    productType?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    try {
      // Version API
      const params = new URLSearchParams();
      if (portfolioId) params.append('portfolioId', portfolioId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.clientId) params.append('clientId', filters.clientId);
      if (filters?.productType) params.append('productType', filters.productType);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      return await apiClient.get<CreditContract[]>(`/portfolios/traditional/credit-contracts?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for credit contracts', error);
      let contracts = traditionalDataService.getCreditContracts();
      
      // Appliquer les filtres
      if (portfolioId) {
        contracts = contracts.filter(c => c.portfolio_id === portfolioId);
      }
      if (filters?.status) {
        contracts = contracts.filter(c => c.status === filters.status);
      }
      if (filters?.clientId) {
        contracts = contracts.filter(c => c.client_id === filters.clientId);
      }
      if (filters?.productType) {
        contracts = contracts.filter(c => c.product_type === filters.productType);
      }
      if (filters?.dateFrom) {
        const fromDate = new Date(filters.dateFrom).getTime();
        contracts = contracts.filter(c => new Date(c.start_date).getTime() >= fromDate);
      }
      if (filters?.dateTo) {
        const toDate = new Date(filters.dateTo).getTime();
        contracts = contracts.filter(c => new Date(c.start_date).getTime() <= toDate);
      }
      
      return contracts;
    }
  },

  /**
   * Récupère un contrat de crédit par son ID
   */
  getContractById: async (id: string) => {
    try {
      return await apiClient.get<CreditContract>(`/portfolios/traditional/credit-contracts/${id}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for credit contract ${id}`, error);
      const contract = traditionalDataService.getCreditContractById(id);
      if (!contract) {
        throw new Error(`Contract with ID ${id} not found`);
      }
      return contract;
    }
  },

  /**
   * Crée un nouveau contrat de crédit
   */
  createContract: async (contract: Omit<CreditContract, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      return await apiClient.post<CreditContract>('/portfolios/traditional/credit-contracts', contract);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for creating credit contract', error);
      const newContract = {
        ...contract,
        id: traditionalDataService.generateCreditContractId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as CreditContract;
      
      traditionalDataService.addCreditContract(newContract);
      return newContract;
    }
  },

  /**
   * Met à jour un contrat de crédit
   */
  updateContract: async (id: string, updates: Partial<CreditContract>) => {
    try {
      return await apiClient.put<CreditContract>(`/portfolios/traditional/credit-contracts/${id}`, updates);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating credit contract ${id}`, error);
      const contract = traditionalDataService.getCreditContractById(id);
      if (!contract) {
        throw new Error(`Contract with ID ${id} not found`);
      }
      
      const updatedContract = {
        ...contract,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateCreditContract(updatedContract);
      return updatedContract;
    }
  },

  /**
   * Génère le document du contrat de crédit
   */
  generateContractDocument: async (id: string) => {
    try {
      return await apiClient.post<{ documentUrl: string }>(`/portfolios/traditional/credit-contracts/${id}/generate-document`, {});
    } catch (error) {
      // Fallback pour le développement
      console.warn(`Fallback for generating contract document for ${id}`, error);
      return { documentUrl: `https://example.com/contract-documents/${id}.pdf` };
    }
  },

  /**
   * Marque un contrat comme défaillant
   */
  markAsDefaulted: async (id: string, reason: string) => {
    try {
      return await apiClient.post<CreditContract>(`/portfolios/traditional/credit-contracts/${id}/default`, { reason });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for marking contract ${id} as defaulted`, error);
      const contract = traditionalDataService.getCreditContractById(id);
      if (!contract) {
        throw new Error(`Contract with ID ${id} not found`);
      }
      
      const updatedContract = {
        ...contract,
        status: 'defaulted' as const,
        default_date: new Date().toISOString(),
        default_reason: reason,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateCreditContract(updatedContract);
      return updatedContract;
    }
  },

  /**
   * Restructure un contrat de crédit
   */
  restructureContract: async (id: string, restructuringDetails: {
    new_terms: string;
    new_rate?: number;
    new_end_date: string;
    reason: string;
  }) => {
    try {
      return await apiClient.post<CreditContract>(`/portfolios/traditional/credit-contracts/${id}/restructure`, restructuringDetails);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for restructuring contract ${id}`, error);
      const contract = traditionalDataService.getCreditContractById(id);
      if (!contract) {
        throw new Error(`Contract with ID ${id} not found`);
      }
      
      const updatedContract = {
        ...contract,
        status: 'restructured' as const,
        terms: restructuringDetails.new_terms,
        interest_rate: restructuringDetails.new_rate || contract.interest_rate,
        end_date: restructuringDetails.new_end_date,
        restructuring_history: [
          ...(contract.restructuring_history || []),
          {
            date: new Date().toISOString(),
            reason: restructuringDetails.reason,
            previous_terms: contract.terms,
            previous_rate: contract.interest_rate,
            previous_end_date: contract.end_date
          }
        ],
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateCreditContract(updatedContract);
      return updatedContract;
    }
  }
};
