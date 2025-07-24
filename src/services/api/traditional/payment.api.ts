// src/services/api/traditional/payment.api.ts
import { apiClient } from '../base.api';
import type { CreditPayment } from '../../../types/credit-payment';
import { traditionalDataService } from './dataService';

/**
 * API pour les paiements de crédit
 */
export const paymentApi = {
  /**
   * Récupère tous les paiements pour un contrat
   */
  getPaymentsByContract: async (contractId: string) => {
    try {
      return await apiClient.get<CreditPayment[]>(`/portfolios/traditional/credit-contracts/${contractId}/payments`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for payments of contract ${contractId}`, error);
      return traditionalDataService.getPaymentsByContractId(contractId);
    }
  },

  /**
   * Récupère tous les paiements en retard pour un portefeuille
   */
  getLatePayments: async (portfolioId: string) => {
    try {
      return await apiClient.get<CreditPayment[]>(`/portfolios/traditional/${portfolioId}/late-payments`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for late payments of portfolio ${portfolioId}`, error);
      return traditionalDataService.getLatePayments(portfolioId);
    }
  },

  /**
   * Récupère un paiement par son ID
   */
  getPaymentById: async (id: string) => {
    try {
      return await apiClient.get<CreditPayment>(`/portfolios/traditional/payments/${id}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for payment ${id}`, error);
      const payment = traditionalDataService.getPaymentById(id);
      if (!payment) {
        throw new Error(`Payment with ID ${id} not found`);
      }
      return payment;
    }
  },

  /**
   * Enregistre un nouveau paiement
   */
  recordPayment: async (payment: Omit<CreditPayment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      return await apiClient.post<CreditPayment>('/portfolios/traditional/payments', payment);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for recording payment', error);
      const newPayment = {
        ...payment,
        id: traditionalDataService.generatePaymentId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as CreditPayment;
      
      traditionalDataService.addPayment(newPayment);
      return newPayment;
    }
  },

  /**
   * Met à jour un paiement
   */
  updatePayment: async (id: string, updates: Partial<CreditPayment>) => {
    try {
      return await apiClient.put<CreditPayment>(`/portfolios/traditional/payments/${id}`, updates);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating payment ${id}`, error);
      const payment = traditionalDataService.getPaymentById(id);
      if (!payment) {
        throw new Error(`Payment with ID ${id} not found`);
      }
      
      const updatedPayment = {
        ...payment,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updatePayment(updatedPayment);
      return updatedPayment;
    }
  },

  /**
   * Annule un paiement
   */
  cancelPayment: async (id: string, reason: string) => {
    try {
      return await apiClient.post<CreditPayment>(`/portfolios/traditional/payments/${id}/cancel`, { reason });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for cancelling payment ${id}`, error);
      const payment = traditionalDataService.getPaymentById(id);
      if (!payment) {
        throw new Error(`Payment with ID ${id} not found`);
      }
      
      const updatedPayment = {
        ...payment,
        status: 'cancelled' as const,
        cancellation_reason: reason,
        cancellation_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updatePayment(updatedPayment);
      return updatedPayment;
    }
  },

  /**
   * Génère un reçu de paiement
   */
  generateReceipt: async (id: string) => {
    try {
      return await apiClient.post<{ receiptUrl: string }>(`/portfolios/traditional/payments/${id}/generate-receipt`, {});
    } catch (error) {
      // Fallback pour le développement
      console.warn(`Fallback for generating receipt for payment ${id}`, error);
      return { receiptUrl: `https://example.com/payment-receipts/${id}.pdf` };
    }
  },

  /**
   * Obtient le calendrier de paiement pour un contrat
   */
  getPaymentSchedule: async (contractId: string) => {
    try {
      return await apiClient.get<Array<{
        id: string;
        due_date: string;
        principal_amount: number;
        interest_amount: number;
        total_amount: number;
        status: 'pending' | 'paid' | 'partial' | 'late' | 'defaulted';
        payment_date?: string;
        payment_amount?: number;
      }>>(`/portfolios/traditional/credit-contracts/${contractId}/payment-schedule`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for payment schedule of contract ${contractId}`, error);
      return traditionalDataService.getPaymentSchedule(contractId);
    }
  }
};
