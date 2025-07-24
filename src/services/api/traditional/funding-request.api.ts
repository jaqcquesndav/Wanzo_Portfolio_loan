// src/services/api/traditional/funding-request.api.ts
import { apiClient } from '../base.api';
import type { FundingRequest } from '../../../types/funding-request';
import { traditionalDataService } from './dataService';

/**
 * API pour les demandes de financement
 */
export const fundingRequestApi = {
  /**
   * Récupère toutes les demandes de financement
   */
  getAllRequests: async (portfolioId?: string, filters?: {
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
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

      return await apiClient.get<FundingRequest[]>(`/portfolios/traditional/funding-requests?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for funding requests', error);
      let requests = traditionalDataService.getFundingRequests();
      
      // Appliquer les filtres
      if (portfolioId) {
        requests = requests.filter(r => r.portfolio_id === portfolioId);
      }
      if (filters?.status) {
        requests = requests.filter(r => r.status === filters.status);
      }
      if (filters?.clientId) {
        requests = requests.filter(r => r.client_id === filters.clientId);
      }
      if (filters?.productType) {
        requests = requests.filter(r => r.product_type === filters.productType);
      }
      if (filters?.dateFrom) {
        const fromDate = new Date(filters.dateFrom).getTime();
        requests = requests.filter(r => new Date(r.created_at).getTime() >= fromDate);
      }
      if (filters?.dateTo) {
        const toDate = new Date(filters.dateTo).getTime();
        requests = requests.filter(r => new Date(r.created_at).getTime() <= toDate);
      }
      
      return requests;
    }
  },

  /**
   * Récupère une demande de financement par son ID
   */
  getRequestById: async (id: string) => {
    try {
      return await apiClient.get<FundingRequest>(`/portfolios/traditional/funding-requests/${id}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for funding request ${id}`, error);
      const request = traditionalDataService.getFundingRequestById(id);
      if (!request) {
        throw new Error(`Request with ID ${id} not found`);
      }
      return request;
    }
  },

  /**
   * Crée une nouvelle demande de financement
   */
  createRequest: async (request: Omit<FundingRequest, 'id' | 'created_at' | 'updated_at' | 'status_date'>) => {
    try {
      return await apiClient.post<FundingRequest>('/portfolios/traditional/funding-requests', request);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for creating funding request', error);
      const newRequest: FundingRequest = {
        ...request,
        id: traditionalDataService.generateFundingRequestId(),
        status: 'pending',
        status_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      traditionalDataService.addFundingRequest(newRequest);
      return newRequest;
    }
  },

  /**
   * Met à jour une demande de financement
   */
  updateRequest: async (id: string, updates: Partial<FundingRequest>) => {
    try {
      return await apiClient.put<FundingRequest>(`/portfolios/traditional/funding-requests/${id}`, updates);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating funding request ${id}`, error);
      const request = traditionalDataService.getFundingRequestById(id);
      if (!request) {
        throw new Error(`Request with ID ${id} not found`);
      }
      
      const updatedRequest = {
        ...request,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateFundingRequest(updatedRequest);
      return updatedRequest;
    }
  },

  /**
   * Approuve une demande de financement
   */
  approveRequest: async (id: string, notes?: string) => {
    try {
      return await apiClient.post<FundingRequest>(`/portfolios/traditional/funding-requests/${id}/approve`, { notes });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for approving funding request ${id}`, error);
      const request = traditionalDataService.getFundingRequestById(id);
      if (!request) {
        throw new Error(`Request with ID ${id} not found`);
      }
      
      const updatedRequest = {
        ...request,
        status: 'approved' as const,
        status_date: new Date().toISOString(),
        approval_notes: notes,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateFundingRequest(updatedRequest);
      return updatedRequest;
    }
  },

  /**
   * Rejette une demande de financement
   */
  rejectRequest: async (id: string, reason: string) => {
    try {
      return await apiClient.post<FundingRequest>(`/portfolios/traditional/funding-requests/${id}/reject`, { reason });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for rejecting funding request ${id}`, error);
      const request = traditionalDataService.getFundingRequestById(id);
      if (!request) {
        throw new Error(`Request with ID ${id} not found`);
      }
      
      const updatedRequest = {
        ...request,
        status: 'rejected' as const,
        status_date: new Date().toISOString(),
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateFundingRequest(updatedRequest);
      return updatedRequest;
    }
  },

  /**
   * Annule une demande de financement
   */
  cancelRequest: async (id: string, reason: string) => {
    try {
      return await apiClient.post<FundingRequest>(`/portfolios/traditional/funding-requests/${id}/cancel`, { reason });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for cancelling funding request ${id}`, error);
      const request = traditionalDataService.getFundingRequestById(id);
      if (!request) {
        throw new Error(`Request with ID ${id} not found`);
      }
      
      const updatedRequest = {
        ...request,
        status: 'cancelled' as const,
        status_date: new Date().toISOString(),
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateFundingRequest(updatedRequest);
      return updatedRequest;
    }
  }
};
