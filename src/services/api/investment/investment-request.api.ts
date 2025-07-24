// src/services/api/investment/investment-request.api.ts
import { apiClient } from '../base.api';
import type { 
  InvestmentRequest, 
  DueDiligenceReport, 
  InvestmentDecision 
} from '../../../types/investment-portfolio';

/**
 * API pour les demandes d'investissement
 */
export const investmentRequestApi = {
  /**
   * Récupère toutes les demandes d'investissement
   */
  getAllRequests: (filters?: {
    status?: 'en instruction' | 'acceptée' | 'refusée' | 'abandonnée';
    stage?: 'amorcage' | 'developpement' | 'transmission' | 'reprise';
    portfolioId?: string;
    companyId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.stage) params.append('stage', filters.stage);
    if (filters?.portfolioId) params.append('portfolioId', filters.portfolioId);
    if (filters?.companyId) params.append('companyId', filters.companyId);

    return apiClient.get<InvestmentRequest[]>(`/investment-requests?${params.toString()}`);
  },

  /**
   * Récupère une demande d'investissement par son ID
   */
  getRequestById: (id: string) => {
    return apiClient.get<InvestmentRequest>(`/investment-requests/${id}`);
  },

  /**
   * Crée une nouvelle demande d'investissement
   */
  createRequest: (request: Omit<InvestmentRequest, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<InvestmentRequest>('/investment-requests', request);
  },

  /**
   * Met à jour une demande d'investissement
   */
  updateRequest: (id: string, updates: Partial<InvestmentRequest>) => {
    return apiClient.put<InvestmentRequest>(`/investment-requests/${id}`, updates);
  },

  /**
   * Change le statut d'une demande d'investissement
   */
  updateRequestStatus: (id: string, status: 'en instruction' | 'acceptée' | 'refusée' | 'abandonnée') => {
    return apiClient.put<InvestmentRequest>(`/investment-requests/${id}/status`, { status });
  },

  /**
   * Récupère les rapports de due diligence pour une demande d'investissement
   */
  getDueDiligenceReports: (requestId: string) => {
    return apiClient.get<DueDiligenceReport[]>(`/investment-requests/${requestId}/due-diligence`);
  },

  /**
   * Ajoute un rapport de due diligence à une demande d'investissement
   */
  addDueDiligenceReport: (requestId: string, report: Omit<DueDiligenceReport, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<DueDiligenceReport>(`/investment-requests/${requestId}/due-diligence`, report);
  },

  /**
   * Met à jour un rapport de due diligence
   */
  updateDueDiligenceReport: (requestId: string, reportId: string, updates: Partial<DueDiligenceReport>) => {
    return apiClient.put<DueDiligenceReport>(`/investment-requests/${requestId}/due-diligence/${reportId}`, updates);
  },

  /**
   * Récupère la décision d'investissement pour une demande
   */
  getDecision: (requestId: string) => {
    return apiClient.get<InvestmentDecision>(`/investment-requests/${requestId}/decision`);
  },

  /**
   * Crée une décision d'investissement pour une demande
   */
  createDecision: (requestId: string, decision: Omit<InvestmentDecision, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<InvestmentDecision>(`/investment-requests/${requestId}/decision`, decision);
  },

  /**
   * Met à jour une décision d'investissement
   */
  updateDecision: (requestId: string, decisionId: string, updates: Partial<InvestmentDecision>) => {
    return apiClient.put<InvestmentDecision>(`/investment-requests/${requestId}/decision/${decisionId}`, updates);
  },

  /**
   * Récupère les documents associés à une demande d'investissement
   */
  getRequestDocuments: (requestId: string) => {
    return apiClient.get<Array<{
      id: string;
      requestId: string;
      name: string;
      type: string;
      fileUrl: string;
      uploadedAt: string;
      uploadedBy: string;
    }>>(`/investment-requests/${requestId}/documents`);
  },

  /**
   * Ajoute un document à une demande d'investissement
   */
  addRequestDocument: (requestId: string, document: {
    name: string;
    type: string;
    fileUrl: string;
    uploadedBy: string;
  }) => {
    return apiClient.post<{
      id: string;
      requestId: string;
      name: string;
      type: string;
      fileUrl: string;
      uploadedAt: string;
      uploadedBy: string;
    }>(`/investment-requests/${requestId}/documents`, document);
  },

  /**
   * Supprime un document d'une demande d'investissement
   */
  deleteRequestDocument: (requestId: string, documentId: string) => {
    return apiClient.delete(`/investment-requests/${requestId}/documents/${documentId}`);
  },
};
