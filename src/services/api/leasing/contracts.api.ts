// src/services/api/leasing/contracts.api.ts
import { apiClient } from '../base.api';
import type { LeasingContract } from '../../../types/leasing';
import { leasingDataService } from './dataService';

/**
 * API pour les contrats de leasing
 */
export const leasingContractsApi = {
  /**
   * Récupère tous les contrats de leasing
   */
  getAllContracts: async (portfolioId?: string, filters?: {
    status?: 'pending' | 'active' | 'expired' | 'terminated';
    clientId?: string;
    equipmentId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    try {
      // Version API
      const params = new URLSearchParams();
      if (portfolioId) params.append('portfolioId', portfolioId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.clientId) params.append('clientId', filters.clientId);
      if (filters?.equipmentId) params.append('equipmentId', filters.equipmentId);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      return await apiClient.get<LeasingContract[]>(`/portfolios/leasing/contracts?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for leasing contracts', error);
      let contracts = leasingDataService.getLeasingContracts();
      
      // Appliquer les filtres
      if (filters?.status) {
        contracts = contracts.filter(c => c.status === filters.status);
      }
      if (filters?.clientId) {
        contracts = contracts.filter(c => c.client_id === filters.clientId);
      }
      if (filters?.equipmentId) {
        contracts = contracts.filter(c => c.equipment_id === filters.equipmentId);
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
   * Récupère un contrat de leasing par son ID
   */
  getContractById: async (id: string) => {
    try {
      return await apiClient.get<LeasingContract>(`/portfolios/leasing/contracts/${id}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for leasing contract ${id}`, error);
      const contract = leasingDataService.getLeasingContractById(id);
      if (!contract) {
        throw new Error(`Contract with ID ${id} not found`);
      }
      return contract;
    }
  },

  /**
   * Crée un nouveau contrat de leasing
   */
  createContract: async (contract: Omit<LeasingContract, 'id'>) => {
    try {
      return await apiClient.post<LeasingContract>('/portfolios/leasing/contracts', contract);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for creating leasing contract', error);
      
      // Créer un nouveau contrat en utilisant un spread pour éviter "any"
      const newContract: LeasingContract = {
        ...contract,
        id: leasingDataService.generateContractId()
      };
      
      leasingDataService.addLeasingContract(newContract);
      return newContract;
    }
  },

  /**
   * Met à jour un contrat de leasing
   */
  updateContract: async (id: string, updates: Partial<LeasingContract>) => {
    try {
      return await apiClient.put<LeasingContract>(`/portfolios/leasing/contracts/${id}`, updates);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating leasing contract ${id}`, error);
      const contract = leasingDataService.getLeasingContractById(id);
      if (!contract) {
        throw new Error(`Contract with ID ${id} not found`);
      }
      
      const updatedContract = {
        ...contract,
        ...updates
      };
      
      leasingDataService.updateLeasingContract(updatedContract);
      return updatedContract;
    }
  },

  /**
   * Crée un contrat à partir d'une demande
   */
  createContractFromRequest: async (requestId: string) => {
    try {
      return await apiClient.post<LeasingContract>(`/portfolios/leasing/requests/${requestId}/create-contract`, {});
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for creating contract from request ${requestId}`, error);
      
      // Récupérer la demande
      const request = leasingDataService.getLeasingRequestById(requestId);
      if (!request) {
        throw new Error(`Request with ID ${requestId} not found`);
      }
      
      // Récupérer les détails de l'équipement
      const equipment = leasingDataService.getEquipmentById(request.equipment_id);
      if (!equipment) {
        throw new Error(`Equipment with ID ${request.equipment_id} not found`);
      }
      
      // Calculer la date de fin basée sur la durée demandée
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + request.requested_duration);
      
      // Créer un nouveau contrat
      const newContractId = leasingDataService.generateContractId();
      const newContract: LeasingContract = {
        id: newContractId,
        equipment_id: request.equipment_id,
        client_id: request.client_id,
        client_name: request.client_name,
        request_id: request.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        monthly_payment: request.monthly_budget,
        interest_rate: 4.5, // Exemple de taux
        maintenance_included: request.maintenance_included,
        insurance_included: request.insurance_included,
        status: 'pending',
        nextInvoiceDate: new Date(startDate.setMonth(startDate.getMonth() + 1)).toISOString().split('T')[0]
      };
      
      // Ajouter le contrat
      leasingDataService.addLeasingContract(newContract);
      
      // Mettre à jour le statut de la demande
      const updatedRequest = {
        ...request,
        status: 'contract_created' as const,
        status_date: new Date().toISOString(),
        contract_id: newContractId
      };
      
      leasingDataService.updateLeasingRequest(updatedRequest);
      
      return newContract;
    }
  },

  /**
   * Génère le calendrier des paiements d'un contrat
   */
  getPaymentSchedule: async (contractId: string) => {
    try {
      return await apiClient.get(`/portfolios/leasing/contracts/${contractId}/payment-schedule`);
    } catch (error) {
      // Pas de fallback pour le calendrier des paiements
      console.error(`Error getting payment schedule for contract ${contractId}`, error);
      throw error;
    }
  },

  /**
   * Génère les documents d'un contrat
   */
  generateContractDocuments: async (contractId: string, documentType: 'agreement' | 'schedule' | 'invoice') => {
    try {
      return await apiClient.post(`/portfolios/leasing/contracts/${contractId}/documents`, { type: documentType });
    } catch (error) {
      // Pas de fallback pour la génération de documents
      console.error(`Error generating ${documentType} document for contract ${contractId}`, error);
      throw error;
    }
  }
};
