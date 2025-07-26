// src/services/api/shared/payment.api.ts
import { apiClient } from '../base.api';
import type { PaymentOrderData } from '../../../components/payment/PaymentOrderModal';

/**
 * API pour les opérations liées aux paiements
 */
export const paymentApi = {
  /**
   * Récupère tous les ordres de paiement
   */
  getAllPaymentOrders: (filters?: {
    portfolioId?: string;
    status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';
    fromDate?: string;
    toDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.portfolioId) params.append('portfolioId', filters.portfolioId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);

    return apiClient.get<PaymentOrderData[]>(`/payments?${params.toString()}`);
  },

  /**
   * Récupère un ordre de paiement par son ID
   */
  getPaymentOrderById: (id: string) => {
    return apiClient.get<PaymentOrderData>(`/payments/${id}`);
  },

  /**
   * Crée un nouvel ordre de paiement
   */
  createPaymentOrder: (paymentOrder: Omit<PaymentOrderData, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiClient.post<PaymentOrderData>('/payments', paymentOrder);
  },

  /**
   * Met à jour un ordre de paiement
   */
  updatePaymentOrder: (id: string, paymentOrder: Partial<PaymentOrderData>) => {
    return apiClient.put<PaymentOrderData>(`/payments/${id}`, paymentOrder);
  },

  /**
   * Met à jour le statut d'un ordre de paiement
   */
  updatePaymentStatus: (id: string, status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid', comments?: string) => {
    return apiClient.put<PaymentOrderData>(`/payments/${id}/status`, { status, comments });
  },

  /**
   * Annule un ordre de paiement
   */
  cancelPayment: (id: string, reason: string) => {
    return apiClient.put<PaymentOrderData>(`/payments/${id}/cancel`, { reason });
  },

  /**
   * Récupère l'historique des modifications d'un ordre de paiement
   */
  getPaymentHistory: (id: string) => {
    return apiClient.get<Array<{
      date: string;
      user: string;
      action: string;
      details: string;
    }>>(`/payments/${id}/history`);
  },

  /**
   * Génère un rapport de paiement
   */
  generatePaymentReport: (filters: {
    portfolioId?: string;
    fromDate: string;
    toDate: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    return apiClient.post<{
      reportUrl: string;
      summary: {
        totalAmount: number;
        totalCount: number;
        byStatus: Record<string, { count: number; amount: number }>;
      };
    }>('/payments/reports', filters);
  },

  /**
   * Récupère les ordres de paiement par bénéficiaire
   */
  getPaymentOrdersByBeneficiary: (beneficiaryName: string) => {
    return apiClient.get<PaymentOrderData[]>(`/payments/beneficiary/${encodeURIComponent(beneficiaryName)}`);
  }
};
