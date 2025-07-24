// src/services/api/traditional/funding-request.api.ts
import { apiClient } from '../base.api';
import type { FundingApplication } from '../../../types/funding';

/**
 * API pour les demandes de financement
 */
export const fundingRequestApi = {
  /**
   * Récupère toutes les demandes de financement pour un portefeuille
   */
  getRequestsByPortfolio: (portfolioId: string, filters?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    companyId?: string;
  }) => {
    const params = new URLSearchParams();
    params.append('portfolioId', portfolioId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.companyId) params.append('companyId', filters.companyId);

    return apiClient.get<FundingApplication[]>(`/funding-requests?${params.toString()}`);
  },

  /**
   * Récupère une demande de financement par son ID
   */
  getRequestById: (requestId: string) => {
    return apiClient.get<FundingApplication>(`/funding-requests/${requestId}`);
  },

  /**
   * Crée une nouvelle demande de financement
   */
  createRequest: (request: Omit<FundingApplication, 'id' | 'submittedAt'>) => {
    return apiClient.post<FundingApplication>('/funding-requests', request);
  },

  /**
   * Met à jour une demande de financement
   */
  updateRequest: (requestId: string, updates: Partial<FundingApplication>) => {
    return apiClient.put<FundingApplication>(`/funding-requests/${requestId}`, updates);
  },

  /**
   * Change le statut d'une demande de financement
   */
  updateRequestStatus: (requestId: string, status: string, comments?: string) => {
    return apiClient.put<FundingApplication>(`/funding-requests/${requestId}/status`, { status, comments });
  },

  /**
   * Soumet une demande de financement pour évaluation
   */
  submitRequestForReview: (requestId: string) => {
    return apiClient.post<{ status: string }>(`/funding-requests/${requestId}/submit`, {});
  },

  /**
   * Approuve une demande de financement
   */
  approveRequest: (requestId: string, approvalData: {
    approvedAmount?: number;
    approvedDuration?: number;
    interestRate?: number;
    startDate?: string;
    comments?: string;
  }) => {
    return apiClient.post<FundingApplication>(`/funding-requests/${requestId}/approve`, approvalData);
  },

  /**
   * Rejette une demande de financement
   */
  rejectRequest: (requestId: string, reason: string) => {
    return apiClient.post<FundingApplication>(`/funding-requests/${requestId}/reject`, { reason });
  },

  /**
   * Télécharge un document lié à une demande de financement
   */
  uploadRequestDocument: (requestId: string, file: File, metadata: { type: string; description?: string }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', metadata.type);
    if (metadata.description) {
      formData.append('description', metadata.description);
    }

    return apiClient.upload<{ id: string; url: string }>(`/funding-requests/${requestId}/documents`, formData);
  },

  /**
   * Récupère tous les documents d'une demande de financement
   */
  getRequestDocuments: (requestId: string) => {
    return apiClient.get<Array<{
      id: string;
      name: string;
      type: string;
      url: string;
      size: number;
      uploadDate: string;
      description?: string;
    }>>(`/funding-requests/${requestId}/documents`);
  },
};
