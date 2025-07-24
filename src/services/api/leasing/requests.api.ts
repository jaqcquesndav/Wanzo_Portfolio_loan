// src/services/api/leasing/requests.api.ts
import { apiClient } from '../base.api';
import type { LeasingRequest, LeasingRequestStatus } from '../../../types/leasing-request';
import { leasingDataService } from './dataService';

/**
 * API pour les demandes de leasing
 */
export const leasingRequestsApi = {
  /**
   * Récupère toutes les demandes de leasing
   */
  getAllRequests: async (portfolioId?: string, filters?: {
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'contract_created';
    clientId?: string;
    equipmentType?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    try {
      // Version API
      const params = new URLSearchParams();
      if (portfolioId) params.append('portfolioId', portfolioId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.clientId) params.append('clientId', filters.clientId);
      if (filters?.equipmentType) params.append('equipmentType', filters.equipmentType);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      return await apiClient.get<LeasingRequest[]>(`/portfolios/leasing/requests?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for leasing requests', error);
      let requests = leasingDataService.getLeasingRequests();
      
      // Appliquer les filtres
      if (portfolioId) {
        // Filtrer par portfolioId (ne fait pas partie de l'interface LeasingRequest par défaut)
        requests = requests.filter(r => ('portfolio_id' in r && r.portfolio_id === portfolioId));
      }
      if (filters?.status) {
        requests = requests.filter(r => r.status === filters.status);
      }
      if (filters?.clientId) {
        requests = requests.filter(r => r.client_id === filters.clientId);
      }
      if (filters?.equipmentType) {
        // Filtrer par type d'équipement (ne fait pas partie de l'interface LeasingRequest par défaut)
        requests = requests.filter(r => ('equipment_type' in r && r.equipment_type === filters.equipmentType));
      }
      if (filters?.dateFrom) {
        const fromDate = new Date(filters.dateFrom).getTime();
        // Utiliser request_date au lieu de created_at pour la cohérence avec l'interface
        requests = requests.filter(r => new Date(r.request_date).getTime() >= fromDate);
      }
      if (filters?.dateTo) {
        const toDate = new Date(filters.dateTo).getTime();
        // Utiliser request_date au lieu de created_at pour la cohérence avec l'interface
        requests = requests.filter(r => new Date(r.request_date).getTime() <= toDate);
      }
      
      return requests;
    }
  },

  /**
   * Récupère une demande de leasing par son ID
   */
  getRequestById: async (id: string) => {
    try {
      return await apiClient.get<LeasingRequest>(`/portfolios/leasing/requests/${id}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for leasing request ${id}`, error);
      const request = leasingDataService.getLeasingRequestById(id);
      if (!request) {
        throw new Error(`Request with ID ${id} not found`);
      }
      return request;
    }
  },

  /**
   * Crée une nouvelle demande de leasing
   */
  createRequest: async (request: Omit<LeasingRequest, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      return await apiClient.post<LeasingRequest>('/portfolios/leasing/requests', request);
    } catch (error) {
      // Pas de fallback pour la création
      console.error('Error creating leasing request', error);
      throw error;
    }
  },

  /**
   * Met à jour une demande de leasing
   */
  updateRequest: async (id: string, updates: Partial<LeasingRequest>) => {
    try {
      return await apiClient.put<LeasingRequest>(`/portfolios/leasing/requests/${id}`, updates);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating leasing request ${id}`, error);
      const request = leasingDataService.getLeasingRequestById(id);
      if (!request) {
        throw new Error(`Request with ID ${id} not found`);
      }
      
      const updatedRequest = {
        ...request,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      leasingDataService.updateLeasingRequest(updatedRequest);
      return updatedRequest;
    }
  },

  /**
   * Approuve une demande de leasing
   */
  approveRequest: async (id: string) => {
    try {
      return await apiClient.post<LeasingRequest>(`/portfolios/leasing/requests/${id}/approve`, {});
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for approving leasing request ${id}`, error);
      const request = leasingDataService.getLeasingRequestById(id);
      if (!request) {
        throw new Error(`Request with ID ${id} not found`);
      }
      
      const updatedRequest = {
        ...request,
        status: 'approved' as const,
        status_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      leasingDataService.updateLeasingRequest(updatedRequest);
      return updatedRequest;
    }
  },

  /**
   * Rejette une demande de leasing
   */
  rejectRequest: async (id: string, reason: string) => {
    try {
      return await apiClient.post<LeasingRequest>(`/portfolios/leasing/requests/${id}/reject`, { reason });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for rejecting leasing request ${id}`, error);
      const request = leasingDataService.getLeasingRequestById(id);
      if (!request) {
        throw new Error(`Request with ID ${id} not found`);
      }
      
      const updatedRequest = {
        ...request,
        status: 'rejected' as const,
        status_date: new Date().toISOString(),
        rejectionReason: reason,
        updated_at: new Date().toISOString()
      };
      
      leasingDataService.updateLeasingRequest(updatedRequest);
      return updatedRequest;
    }
  },

  /**
   * Annule une demande de leasing
   */
  cancelRequest: async (id: string, reason: string) => {
    try {
      return await apiClient.post<LeasingRequest>(`/portfolios/leasing/requests/${id}/cancel`, { reason });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for cancelling leasing request ${id}`, error);
      const request = leasingDataService.getLeasingRequestById(id);
      if (!request) {
        throw new Error(`Request with ID ${id} not found`);
      }
      
      const updatedRequest = {
        ...request,
        status: 'rejected' as LeasingRequestStatus, // Utiliser 'rejected' car 'cancelled' n'existe pas dans LeasingRequestStatus
        status_date: new Date().toISOString(),
        rejectionReason: reason, // Utiliser rejectionReason au lieu de cancellationReason
        updated_at: new Date().toISOString()
      };
      
      leasingDataService.updateLeasingRequest(updatedRequest);
      return updatedRequest;
    }
  }
};
