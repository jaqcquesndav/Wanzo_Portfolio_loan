// src/services/api/traditional/funding-request.api.ts
import { apiClient } from '../base.api';
import type { 
  FundingRequest, 
  RiskAnalysis, 
  ApprovalDetails, 
  RejectionDetails, 
  CancellationDetails,
  DocumentAttachment
} from '../../../types/funding-request';
import { traditionalDataService } from './dataService';

/**
 * API pour les demandes de financement
 */
export const fundingRequestApi = {
  /**
   * Récupère toutes les demandes de financement
   */
  getAllRequests: async (portfolioId?: string, filters?: {
    status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'canceled' | 'disbursed';
    clientId?: string;
    productType?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
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
      if (filters?.search) params.append('search', filters.search);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      return await apiClient.get<FundingRequest[]>(`/portfolios/traditional/funding-requests?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for funding requests', error);
      let requests = traditionalDataService.getFundingRequests();
      
      // Appliquer les filtres (simplifié pour le fallback)
      if (portfolioId) {
        requests = requests.filter(r => r.portfolio_id === portfolioId);
      }
      // ... autres filtres ...
      
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
      console.warn(`Fallback to localStorage for funding request ${id}`, error);
      const request = traditionalDataService.getFundingRequestById(id);
      if (!request) throw new Error(`Request with ID ${id} not found`);
      return request;
    }
  },

  /**
   * Crée une nouvelle demande de financement
   */
  createRequest: async (request: Omit<FundingRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'status_date'>) => {
    try {
      return await apiClient.post<FundingRequest>('/portfolios/traditional/funding-requests', request);
    } catch (error) {
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
      console.warn(`Fallback to localStorage for updating funding request ${id}`, error);
      const existingRequest = traditionalDataService.getFundingRequestById(id);
      if (!existingRequest) throw new Error(`Request with ID ${id} not found`);
      const updatedRequest = { ...existingRequest, ...updates, updated_at: new Date().toISOString() };
      traditionalDataService.updateFundingRequest(updatedRequest);
      return updatedRequest;
    }
  },

  /**
   * Assigne une demande pour analyse
   */
  assignRequest: async (id: string, assigned_to: string, comment?: string) => {
    try {
      return await apiClient.post<FundingRequest>(`/portfolios/traditional/funding-requests/${id}/assign`, { assigned_to, comment });
    } catch (error) {
      console.warn(`Fallback to localStorage for assigning funding request ${id}`, error);
      const existingRequest = traditionalDataService.getFundingRequestById(id);
      if (!existingRequest) throw new Error(`Request with ID ${id} not found`);
      const updatedRequest = { 
        ...existingRequest, 
        assigned_to, 
        status: 'under_review' as const,
        updated_at: new Date().toISOString() 
      };
      traditionalDataService.updateFundingRequest(updatedRequest);
      return updatedRequest;
    }
  },

  /**
   * Soumet une analyse de risque
   */
  submitRiskAnalysis: async (id: string, analysis: RiskAnalysis) => {
    try {
      return await apiClient.post<FundingRequest>(`/portfolios/traditional/funding-requests/${id}/risk-analysis`, analysis);
    } catch (error) {
      console.warn(`Fallback to localStorage for submitting risk analysis for ${id}`, error);
      const existingRequest = traditionalDataService.getFundingRequestById(id);
      if (!existingRequest) throw new Error(`Request with ID ${id} not found`);
      const updatedRequest = { 
        ...existingRequest, 
        risk_analysis: analysis,
        updated_at: new Date().toISOString() 
      };
      traditionalDataService.updateFundingRequest(updatedRequest);
      return updatedRequest;
    }
  },

  /**
   * Approuve une demande de financement
   */
  approveRequest: async (id: string, approvalDetails: ApprovalDetails) => {
    try {
      return await apiClient.post<FundingRequest>(`/portfolios/traditional/funding-requests/${id}/approve`, approvalDetails);
    } catch (error) {
      console.warn(`Fallback to localStorage for approving funding request ${id}`, error);
      const existingRequest = traditionalDataService.getFundingRequestById(id);
      if (!existingRequest) throw new Error(`Request with ID ${id} not found`);
      const updatedRequest = { 
        ...existingRequest, 
        status: 'approved' as const, 
        approval_details: approvalDetails,
        status_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      traditionalDataService.updateFundingRequest(updatedRequest);
      return updatedRequest;
    }
  },

  /**
   * Rejette une demande de financement
   */
  rejectRequest: async (id: string, rejectionDetails: RejectionDetails) => {
    try {
      return await apiClient.post<FundingRequest>(`/portfolios/traditional/funding-requests/${id}/reject`, rejectionDetails);
    } catch (error) {
      console.warn(`Fallback to localStorage for rejecting funding request ${id}`, error);
      const existingRequest = traditionalDataService.getFundingRequestById(id);
      if (!existingRequest) throw new Error(`Request with ID ${id} not found`);
      const updatedRequest = { 
        ...existingRequest, 
        status: 'rejected' as const, 
        rejection_details: rejectionDetails,
        status_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      traditionalDataService.updateFundingRequest(updatedRequest);
      return updatedRequest;
    }
  },

  /**
   * Annule une demande de financement
   */
  cancelRequest: async (id: string, cancellationDetails: CancellationDetails) => {
    try {
      return await apiClient.post<FundingRequest>(`/portfolios/traditional/funding-requests/${id}/cancel`, cancellationDetails);
    } catch (error) {
      console.warn(`Fallback to localStorage for cancelling funding request ${id}`, error);
      const existingRequest = traditionalDataService.getFundingRequestById(id);
      if (!existingRequest) throw new Error(`Request with ID ${id} not found`);
      const updatedRequest = { 
        ...existingRequest, 
        status: 'canceled' as const, 
        cancellation_details: cancellationDetails,
        status_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      traditionalDataService.updateFundingRequest(updatedRequest);
      return updatedRequest;
    }
  },

  /**
   * Ajoute un document à une demande
   */
  addDocumentToRequest: async (id: string, document: { name: string; type: string; content: string; contentType: string; description?: string; }) => {
    try {
      return await apiClient.post<DocumentAttachment>(`/portfolios/traditional/funding-requests/${id}/documents`, document);
    } catch (error) {
      console.warn(`Fallback to localStorage for adding document to request ${id}`, error);
      const existingRequest = traditionalDataService.getFundingRequestById(id);
      if (!existingRequest) throw new Error(`Request with ID ${id} not found`);
      
      const newDocument: DocumentAttachment = {
        id: `doc_${Date.now()}`,
        name: document.name,
        type: document.type,
        url: 'http://example.com/fallback-url.pdf', // URL factice pour le fallback
        created_at: new Date().toISOString(),
      };

      const updatedDocuments = [...(existingRequest.documents || []), newDocument];
      const updatedRequest = {
        ...existingRequest,
        documents: updatedDocuments,
        updated_at: new Date().toISOString()
      };
      traditionalDataService.updateFundingRequest(updatedRequest);
      return newDocument;
    }
  },

  /**
   * Crée un contrat à partir d'une demande approuvée
   */
  createContractFromRequest: async (id: string, contractDetails: { start_date: string; terms: string; }) => {
    try {
      return await apiClient.post<{ contract_id: string; contract_number: string; }>(`/portfolios/traditional/funding-requests/${id}/create-contract`, contractDetails);
    } catch (error) {
      console.warn(`Fallback to localStorage for creating contract from request ${id}`, error);
      const contract_id = `cont_${Date.now()}`;
      const existingRequest = traditionalDataService.getFundingRequestById(id);
      if (!existingRequest) throw new Error(`Request with ID ${id} not found`);
      
      const updatedRequest = {
        ...existingRequest,
        contract_id,
        updated_at: new Date().toISOString()
      };
      traditionalDataService.updateFundingRequest(updatedRequest);
      return { contract_id, contract_number: `CONT-FALLBACK-${Date.now()}` };
    }
  },

  /**
   * Récupère les statistiques des demandes pour un portefeuille
   */
  getRequestStats: async (portfolioId: string) => {
    try {
      // Ce type de retour est complexe et devrait être défini
      return await apiClient.get(`/portfolios/traditional/${portfolioId}/funding-requests/stats`);
    } catch (error) {
      console.warn(`Fallback to localStorage for request stats for portfolio ${portfolioId}`, error);
      // Logique de fallback simplifiée
      const requests = traditionalDataService.getFundingRequests().filter(r => r.portfolio_id === portfolioId);
      return {
        total_requests: requests.length,
        by_status: [
          { status: 'approved', count: requests.filter(r => r.status === 'approved').length },
          { status: 'pending', count: requests.filter(r => r.status === 'pending').length },
        ]
      };
    }
  }
};
