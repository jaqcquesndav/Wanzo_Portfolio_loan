// src/services/api/leasing/payments.api.ts
import { apiClient } from '../base.api';

/**
 * API pour les paiements de leasing
 */
export const leasingPaymentsApi = {
  /**
   * Récupère tous les paiements pour un contrat ou un portefeuille
   */
  getAllPayments: async (filters: {
    portfolioId?: string;
    contractId?: string;
    clientId?: string;
    status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters.portfolioId) params.append('portfolioId', filters.portfolioId);
    if (filters.contractId) params.append('contractId', filters.contractId);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    return apiClient.get(`/portfolios/leasing/payments?${params.toString()}`);
  },

  /**
   * Récupère un paiement par son ID
   */
  getPaymentById: async (id: string) => {
    return apiClient.get(`/portfolios/leasing/payments/${id}`);
  },

  /**
   * Crée une facture pour un contrat
   */
  createInvoice: async (contractId: string, invoice: {
    amount: number;
    dueDate: string;
    description?: string;
    period?: {
      from: string;
      to: string;
    };
  }) => {
    return apiClient.post(`/portfolios/leasing/contracts/${contractId}/invoices`, invoice);
  },

  /**
   * Récupère les factures d'un contrat
   */
  getInvoices: async (contractId: string, status?: 'pending' | 'paid' | 'overdue' | 'cancelled') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    return apiClient.get(`/portfolios/leasing/contracts/${contractId}/invoices?${params.toString()}`);
  },

  /**
   * Enregistre un paiement pour une facture
   */
  recordPayment: async (invoiceId: string, payment: {
    amount: number;
    date: string;
    method: 'bank_transfer' | 'check' | 'cash' | 'online';
    reference?: string;
    notes?: string;
  }) => {
    return apiClient.post(`/portfolios/leasing/invoices/${invoiceId}/payments`, payment);
  },

  /**
   * Annule une facture
   */
  cancelInvoice: async (invoiceId: string, reason: string) => {
    return apiClient.post(`/portfolios/leasing/invoices/${invoiceId}/cancel`, { reason });
  },

  /**
   * Génère un rapport de paiements
   */
  generatePaymentReport: async (filters: {
    portfolioId?: string;
    contractId?: string;
    clientId?: string;
    dateFrom: string;
    dateTo: string;
    groupBy?: 'day' | 'week' | 'month' | 'client' | 'contract';
  }) => {
    return apiClient.post('/portfolios/leasing/payments/reports', filters);
  },

  /**
   * Récupère les statistiques de paiement
   */
  getPaymentStats: async (portfolioId: string, period: 'month' | 'quarter' | 'year') => {
    return apiClient.get(`/portfolios/leasing/${portfolioId}/payment-stats?period=${period}`);
  }
};
