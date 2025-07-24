// src/services/payment/paymentService.ts
import { createOfflineClient } from '../api/offlineClient';
import { OFFLINE_STORAGE_CONFIG } from '../offlineService';
import type { Payment, PaymentStatus } from '../../types/payment';

/**
 * Service pour la gestion des paiements avec support du mode hors ligne
 */
export const paymentService = () => {
  // Dans un contexte réel, ces valeurs proviendraient du contexte ConnectivityContext
  const isOnline = navigator.onLine;
  const addPendingAction = (action: { type: string; resourceId: string; payload?: unknown }) => {
    console.log('Action en attente ajoutée:', action);
    return action;
  };
  
  const offlineClient = createOfflineClient(isOnline, addPendingAction);
  const storageKey = OFFLINE_STORAGE_CONFIG.PAYMENTS;
  const endpoint = '/payments';

  /**
   * Récupère tous les paiements
   * @param filters Filtres optionnels (contrat, dates, etc.)
   */
  const getAllPayments = (filters?: Record<string, string | number | boolean>) => {
    return offlineClient.getWithOfflineSupport<Payment>(endpoint, storageKey, filters);
  };

  /**
   * Récupère un paiement par son ID
   */
  const getPaymentById = async (id: string) => {
    try {
      const payments = await getAllPayments();
      return payments.find(payment => payment.id === id) || null;
    } catch (error) {
      console.error(`Erreur lors de la récupération du paiement ${id}:`, error);
      return null;
    }
  };

  /**
   * Récupère les paiements d'un contrat
   */
  const getPaymentsByContract = async (contractId: string) => {
    try {
      const payments = await getAllPayments();
      return payments.filter(payment => payment.contractId === contractId);
    } catch (error) {
      console.error(`Erreur lors de la récupération des paiements du contrat ${contractId}:`, error);
      return [];
    }
  };

  /**
   * Crée un nouveau paiement
   */
  const createPayment = (data: Omit<Payment, 'id'>) => {
    return offlineClient.createWithOfflineSupport<Payment>(
      endpoint,
      storageKey,
      data as Payment
    );
  };

  /**
   * Met à jour un paiement
   */
  const updatePayment = (id: string, data: Partial<Payment>) => {
    return offlineClient.updateWithOfflineSupport<Payment>(
      endpoint,
      storageKey,
      id,
      data
    );
  };

  /**
   * Supprime un paiement
   */
  const deletePayment = (id: string) => {
    return offlineClient.deleteWithOfflineSupport(
      endpoint,
      storageKey,
      id
    );
  };

  /**
   * Change le statut d'un paiement
   */
  const changePaymentStatus = async (id: string, status: PaymentStatus) => {
    return offlineClient.updateWithOfflineSupport<Payment>(
      endpoint,
      storageKey,
      id,
      { status }
    );
  };

  /**
   * Marque un paiement comme reçu
   */
  const markPaymentAsReceived = async (id: string, receivedAmount: number, receivedDate: string = new Date().toISOString()) => {
    return offlineClient.updateWithOfflineSupport<Payment>(
      endpoint,
      storageKey,
      id,
      { 
        status: 'received', 
        receivedAmount, 
        receivedDate 
      }
    );
  };

  return {
    getAllPayments,
    getPaymentById,
    getPaymentsByContract,
    createPayment,
    updatePayment,
    deletePayment,
    changePaymentStatus,
    markPaymentAsReceived
  };
};

// Export singleton pour utilisation dans l'application
export default paymentService();
