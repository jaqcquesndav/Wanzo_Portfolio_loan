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
        contracts = contracts.filter(c => c.portfolioId === portfolioId);
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
      return await apiClient.post<CreditContract>(`/portfolios/traditional/credit-contracts/from-request`, contract);
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
  },

  /**
   * Récupère l'échéancier de paiement d'un contrat
   * Conforme à la documentation: GET /contracts/${contractId}/schedule
   */
  getPaymentSchedule: async (contractId: string) => {
    try {
      return await apiClient.get<{
        contract_id: string;
        schedule: Array<{
          installment_number: number;
          due_date: string;
          principal_amount: number;
          interest_amount: number;
          total_amount: number;
          status: 'pending' | 'paid' | 'overdue';
          payment_date?: string;
          remaining_balance: number;
        }>;
        total_installments: number;
        total_amount: number;
        total_paid: number;
        remaining_amount: number;
      }>(`/contracts/${contractId}/schedule`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for payment schedule of contract ${contractId}`, error);
      
      // Simulation d'un échéancier basique
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) {
        throw new Error(`Contract with ID ${contractId} not found`);
      }

      // Génération d'un échéancier simulé
      const monthlyAmount = contract.amount / 12; // Simulation 12 mois
      const schedule = Array.from({ length: 12 }, (_, index) => ({
        installment_number: index + 1,
        due_date: new Date(Date.now() + (index + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        principal_amount: monthlyAmount * 0.8,
        interest_amount: monthlyAmount * 0.2,
        total_amount: monthlyAmount,
        status: index < 3 ? 'paid' as const : 'pending' as const,
        payment_date: index < 3 ? new Date(Date.now() - (12 - index) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
        remaining_balance: contract.amount - (monthlyAmount * (index + 1))
      }));

      return {
        contract_id: contractId,
        schedule,
        total_installments: 12,
        total_amount: contract.amount,
        total_paid: monthlyAmount * 3,
        remaining_amount: contract.amount - (monthlyAmount * 3)
      };
    }
  },

  /**
   * Marque un contrat comme terminé/clôturé
   */
  completeContract: async (portfolioId: string, contractId: string, completionDetails: {
    completion_date: string;
    notes?: string;
  }) => {
    try {
      return await apiClient.post<CreditContract>(`/portfolios/traditional/${portfolioId}/credit-contracts/${contractId}/complete`, completionDetails);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for completing contract ${contractId}`, error);
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) {
        throw new Error(`Contract with ID ${contractId} not found`);
      }
      
      const updatedContract = {
        ...contract,
        status: 'completed' as const,
        completion_date: completionDetails.completion_date,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateCreditContract(updatedContract);
      return {
        success: true,
        data: {
          id: contractId,
          portfolio_id: portfolioId,
          contract_number: contract.contract_number,
          status: 'completed' as const,
          completion_date: completionDetails.completion_date,
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Met un contrat en contentieux
   */
  putInLitigation: async (contractId: string, litigationDetails: {
    reason: string;
    litigation_date?: string;
    notes?: string;
  }) => {
    try {
      return await apiClient.post<CreditContract>(`/contracts/${contractId}/litigation`, litigationDetails);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for putting contract ${contractId} in litigation`, error);
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) {
        throw new Error(`Contract with ID ${contractId} not found`);
      }
      
      const updatedContract = {
        ...contract,
        status: 'in_litigation' as const,
        litigation_date: litigationDetails.litigation_date || new Date().toISOString(),
        litigation_reason: litigationDetails.reason,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateCreditContract(updatedContract);
      return updatedContract;
    }
  },

  /**
   * Active un contrat (DRAFT → ACTIVE)
   * Conforme à la documentation: POST /contracts/${id}/activate
   */
  activateContract: async (contractId: string, activationDetails?: {
    activation_date?: string;
    notes?: string;
  }) => {
    try {
      return await apiClient.post<CreditContract>(`/contracts/${contractId}/activate`, activationDetails || {});
    } catch (error) {
      console.warn(`Fallback to localStorage for activating contract ${contractId}`, error);
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) {
        throw new Error(`Contract with ID ${contractId} not found`);
      }
      
      const updatedContract = {
        ...contract,
        status: 'active' as const,
        activation_date: activationDetails?.activation_date || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateCreditContract(updatedContract);
      return updatedContract;
    }
  },

  /**
   * Suspend un contrat (ACTIVE → SUSPENDED)
   * Conforme à la documentation: POST /contracts/${id}/suspend
   */
  suspendContract: async (contractId: string, suspensionDetails: {
    reason: string;
    suspension_date?: string;
    notes?: string;
  }) => {
    try {
      return await apiClient.post<CreditContract>(`/contracts/${contractId}/suspend`, suspensionDetails);
    } catch (error) {
      console.warn(`Fallback to localStorage for suspending contract ${contractId}`, error);
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) {
        throw new Error(`Contract with ID ${contractId} not found`);
      }
      
      const updatedContract = {
        ...contract,
        status: 'suspended' as const,
        suspension_date: suspensionDetails.suspension_date || new Date().toISOString(),
        suspension_reason: suspensionDetails.reason,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateCreditContract(updatedContract);
      return updatedContract;
    }
  },

  /**
   * Annule un contrat (DRAFT/ACTIVE → CANCELLED)
   * Conforme à la documentation: POST /contracts/${id}/cancel
   */
  cancelContract: async (contractId: string, cancellationDetails: {
    reason: string;
    cancellation_date?: string;
    notes?: string;
  }) => {
    try {
      return await apiClient.post<CreditContract>(`/contracts/${contractId}/cancel`, cancellationDetails);
    } catch (error) {
      console.warn(`Fallback to localStorage for cancelling contract ${contractId}`, error);
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) {
        throw new Error(`Contract with ID ${contractId} not found`);
      }
      
      const updatedContract = {
        ...contract,
        status: 'cancelled' as const,
        cancellation_date: cancellationDetails.cancellation_date || new Date().toISOString(),
        cancellation_reason: cancellationDetails.reason,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateCreditContract(updatedContract);
      return updatedContract;
    }
  }
};
