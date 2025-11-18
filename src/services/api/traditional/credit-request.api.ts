// src/services/api/traditional/credit-request.api.ts
import { apiClient } from '../base.api';
import { CreditRequest, CreditRequestStatus } from '../../../types/credit';
import { creditRequestsStorageService } from '../../storage/creditRequestsStorage';

/**
 * API pour les demandes de crédit
 */
export const creditRequestApi = {
  /**
   * Récupère toutes les demandes de crédit
   * @param portfolioId ID du portefeuille
   * @param filters Filtres optionnels (statut, clientId, etc.)
   */
  getAllRequests: async (
    portfolioId?: string, 
    filters?: { 
      status?: CreditRequestStatus; 
      clientId?: string; 
      productType?: string; 
      dateFrom?: string; 
      dateTo?: string;
      search?: string;
    }
  ): Promise<CreditRequest[]> => {
    try {
      let endpoint = '/portfolios/traditional/credit-requests';
      const queryParams = new URLSearchParams();
      
      if (portfolioId) {
        queryParams.append('portfolioId', portfolioId);
      }
      
      if (filters) {
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.clientId) queryParams.append('clientId', filters.clientId);
        if (filters.productType) queryParams.append('productType', filters.productType);
        if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
        if (filters.search) queryParams.append('search', filters.search);
      }
      
      const queryString = queryParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
      
      return await apiClient.get<CreditRequest[]>(endpoint);
    } catch (error) {
      console.warn('Fallback to localStorage for credit requests', error);
      return creditRequestsStorageService.getAllRequests();
    }
  },
  
  /**
   * Récupère une demande de crédit par son ID
   */
  getRequestById: async (id: string): Promise<CreditRequest | undefined> => {
    try {
      return await apiClient.get<CreditRequest>(`/portfolios/traditional/credit-requests/${id}`);
    } catch (error) {
      console.warn(`Fallback to localStorage for credit request ${id}`, error);
      return creditRequestsStorageService.getRequestById(id);
    }
  },
  
  /**
   * Crée une nouvelle demande de crédit
   */
  createRequest: async (request: Omit<CreditRequest, 'id' | 'createdAt' | 'status'>): Promise<CreditRequest> => {
    try {
      // Assurer que currency est défini (valeur par défaut: CDF)
      const requestWithCurrency = {
        ...request,
        currency: request.currency || 'CDF', // Code ISO 4217 par défaut
      };
      return await apiClient.post<CreditRequest>('/portfolios/traditional/credit-requests', requestWithCurrency);
    } catch (error) {
      console.warn('Fallback to localStorage for creating credit request', error);
      // Pour le fallback, nous devons créer un ID et définir le statut et la date nous-mêmes
      const newRequest: CreditRequest = {
        ...request,
        currency: request.currency || 'CDF', // Code ISO 4217 par défaut
        id: `req-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      return creditRequestsStorageService.addRequest(newRequest);
    }
  },
  
  /**
   * Met à jour le statut d'une demande de crédit
   */
  updateRequestStatus: async (id: string, status: CreditRequestStatus): Promise<CreditRequest> => {
    try {
      return await apiClient.patch<CreditRequest>(`/portfolios/traditional/credit-requests/${id}/status`, { status });
    } catch (error) {
      console.warn(`Fallback to localStorage for updating credit request ${id} status`, error);
      const updatedRequest = await creditRequestsStorageService.updateRequestStatus(id, status);
      if (!updatedRequest) {
        throw new Error(`Credit request with ID ${id} not found`);
      }
      return updatedRequest;
    }
  },
  
  /**
   * Met à jour une demande de crédit
   */
  updateRequest: async (id: string, updates: Partial<CreditRequest>): Promise<CreditRequest> => {
    try {
      return await apiClient.patch<CreditRequest>(`/portfolios/traditional/credit-requests/${id}`, updates);
    } catch (error) {
      console.warn(`Fallback to localStorage for updating credit request ${id}`, error);
      const updatedRequest = await creditRequestsStorageService.updateRequest(id, updates);
      if (!updatedRequest) {
        throw new Error(`Credit request with ID ${id} not found`);
      }
      return updatedRequest;
    }
  },
  
  /**
   * Supprime une demande de crédit
   */
  deleteRequest: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/portfolios/traditional/credit-requests/${id}`);
      return true;
    } catch (error) {
      console.warn(`Fallback to localStorage for deleting credit request ${id}`, error);
      return await creditRequestsStorageService.deleteRequest(id);
    }
  },
  
  /**
   * Réinitialise les données aux valeurs initiales (pour les tests)
   */
  resetToMockData: async (): Promise<CreditRequest[]> => {
    try {
      await apiClient.post('/portfolios/traditional/credit-requests/reset');
      return await creditRequestApi.getAllRequests();
    } catch (error) {
      console.warn('Fallback to localStorage for resetting credit requests', error);
      return await creditRequestsStorageService.resetToMockData();
    }
  }
};
