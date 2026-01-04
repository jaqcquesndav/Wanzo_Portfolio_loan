// src/hooks/useRepayments.ts
import { useState, useEffect, useCallback } from 'react';
import { paymentApi } from '../services/api/traditional/payment.api';
import { Repayment } from '../components/portfolio/traditional/RepaymentsTable';
import type { CreditPayment, PaymentStatus, PaymentMethod } from '../types/credit-payment';

/**
 * Hook pour gérer les remboursements
 * Conforme à l'API documentation: /portfolios/traditional/payments & /contracts/{id}/payments
 */
export const useRepayments = (contractId?: string, portfolioId?: string) => {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction utilitaire pour convertir CreditPayment en Repayment
  const convertToRepayment = (payment: CreditPayment): Repayment => ({
    id: payment.id,
    company: payment.client_id,
    product: 'Crédit',
    dueDate: payment.due_date || payment.payment_date,
    amount: payment.amount,
    status: payment.status === 'pending' ? 'à venir' : 
            payment.status === 'completed' ? 'payé' : 'retard',
    requestId: payment.scheduled_payment_id,
    portfolioId: payment.portfolio_id,
    contractReference: payment.contract_id,
    transactionReference: payment.transaction_reference,
    paymentDate: payment.payment_date,
    paymentMethod: payment.payment_method as 'virement' | 'transfert' | 'chèque' | 'espèces',
    paymentReference: payment.payment_reference,
    installmentNumber: payment.installment_number,
    totalInstallments: payment.total_installments,
    principal: payment.payment_details?.principal_amount,
    interest: payment.payment_details?.interest_amount,
    penalties: payment.payment_details?.penalty_amount,
    receiptUrl: payment.receipt_url,
    remainingAmount: payment.remaining_amount,
    remainingPercentage: payment.remaining_percentage,
    slippage: payment.slippage
  });

  /**
   * Récupérer les remboursements avec filtres
   * GET /portfolios/traditional/{portfolioId}/payments ou GET /contracts/{contractId}/payments
   */
  const fetchRepayments = useCallback(async (filters?: {
    status?: PaymentStatus;
    dateFrom?: string;
    dateTo?: string;
    clientId?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      let data: Repayment[] = [];
      
      if (contractId) {
        // Récupérer les remboursements pour un contrat spécifique
        const payments = await paymentApi.getPaymentsByContract(contractId);
        data = payments.map(convertToRepayment);
      } else if (portfolioId) {
        try {
          // Essayer d'abord l'API getAllRepayments avec filtres
          const payments = await paymentApi.getAllRepayments({
            portfolioId,
            status: filters?.status,
            dateFrom: filters?.dateFrom,
            dateTo: filters?.dateTo
          });
          data = payments.map(convertToRepayment);
        } catch (apiError) {
          // Fallback vers getPaymentsByPortfolio
          try {
            const payments = await paymentApi.getPaymentsByPortfolio(portfolioId);
            data = payments.map(convertToRepayment);
            
            // Appliquer les filtres manuellement si nécessaire
            if (filters?.status) {
              const statusMap: Record<PaymentStatus, string> = {
                pending: 'à venir',
                completed: 'payé',
                failed: 'retard',
                partial: 'partiel',
                cancelled: 'annulé',
                processing: 'en cours'
              };
              data = data.filter(r => r.status === statusMap[filters.status!]);
            }
          } catch (error) {
            // Fallback vers les données mockées
            console.warn('Fallback to mock data for repayments', error);
            const { mockRepayments } = await import('../data/mockRepayments');
            data = mockRepayments.filter(r => r.portfolioId === portfolioId);
          }
        }
      }
      
      setRepayments(data);
    } catch (err) {
      console.error('Error fetching repayments:', err);
      setError('Erreur lors de la récupération des remboursements');
    } finally {
      setLoading(false);
    }
  }, [contractId, portfolioId]);

  // Charger les remboursements au montage du composant
  useEffect(() => {
    fetchRepayments();
  }, [fetchRepayments]);

  /**
   * Enregistrer un paiement (marquer comme payé)
   * POST /portfolios/traditional/repayments
   */
  const recordPayment = useCallback(async (paymentData: {
    contract_id: string;
    portfolio_id: string;
    client_id: string;
    amount: number;
    payment_date: string;
    payment_method: PaymentMethod;
    payment_reference?: string;
    transaction_reference?: string;
    payment_type?: 'principal' | 'interest' | 'penalty' | 'mixed';
    installment_number?: number;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const newPayment = await paymentApi.recordPayment({
        contract_id: paymentData.contract_id,
        portfolio_id: paymentData.portfolio_id,
        client_id: paymentData.client_id,
        amount: paymentData.amount,
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        payment_reference: paymentData.payment_reference || `PMT-${Date.now()}`,
        transaction_reference: paymentData.transaction_reference,
        status: 'completed',
        payment_type: paymentData.payment_type || 'mixed',
        installment_number: paymentData.installment_number,
        notes: paymentData.notes
      });
      
      await fetchRepayments();
      return newPayment;
    } catch (err) {
      console.error('Error recording payment:', err);
      setError('Erreur lors de l\'enregistrement du paiement');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRepayments]);

  /**
   * Marquer un remboursement comme payé (mise à jour)
   * PUT /payments/{id}
   */
  const markAsPaid = useCallback(async (
    id: string, 
    paymentData: { 
      date: string; 
      method: string; 
      reference: string;
      transactionReference?: string;
      receipt?: File;
    }
  ) => {
    try {
      setError(null);
      
      // Mettre à jour le statut du paiement
      await paymentApi.updatePayment(id, {
        status: 'completed',
        payment_date: paymentData.date,
        payment_method: paymentData.method,
        payment_reference: paymentData.reference,
        transaction_reference: paymentData.transactionReference
      });
      
      // Si un justificatif est fourni, le télécharger
      if (paymentData.receipt) {
        await paymentApi.uploadPaymentReceipt(id, paymentData.receipt);
      }
      
      // Rafraîchir la liste des remboursements
      await fetchRepayments();
      
      return true;
    } catch (err) {
      console.error('Error marking payment as paid:', err);
      setError('Erreur lors du marquage du paiement comme payé');
      return false;
    }
  }, [fetchRepayments]);

  /**
   * Annuler un paiement
   * POST /payments/{id}/cancel
   */
  const cancelPayment = useCallback(async (id: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await paymentApi.cancelPayment(id, reason);
      await fetchRepayments();
      
      return true;
    } catch (err) {
      console.error('Error cancelling payment:', err);
      setError('Erreur lors de l\'annulation du paiement');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchRepayments]);

  /**
   * Supprimer un paiement
   * DELETE /payments/{id}
   */
  const deletePayment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await paymentApi.deletePayment(id);
      
      // Mettre à jour l'état local
      setRepayments(prev => prev.filter(r => r.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting payment:', err);
      setError('Erreur lors de la suppression du paiement');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Ajouter un justificatif à un paiement
   * POST /payments/{id}/receipt
   */
  const addReceipt = useCallback(async (id: string, file: File) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await paymentApi.addReceipt(id, file);
      await fetchRepayments();
      
      return result;
    } catch (err) {
      console.error('Error adding receipt:', err);
      setError('Erreur lors de l\'ajout du justificatif');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRepayments]);

  /**
   * Télécharger un justificatif
   */
  const downloadReceipt = useCallback(async (id: string) => {
    try {
      setError(null);
      const blob = await paymentApi.downloadPaymentReceipt(id);
      
      // Créer un lien temporaire pour télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `justificatif-paiement-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      console.error('Error downloading receipt:', err);
      setError('Erreur lors du téléchargement du justificatif');
      return false;
    }
  }, []);

  /**
   * Récupérer les statistiques de paiement pour un contrat
   */
  const getPaymentStats = useCallback(async (targetContractId: string) => {
    try {
      const payments = await paymentApi.getPaymentsByContract(targetContractId);
      
      const stats = {
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
        paidAmount: payments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0),
        pendingAmount: payments
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0),
        failedAmount: payments
          .filter(p => p.status === 'failed')
          .reduce((sum, p) => sum + p.amount, 0),
        completedCount: payments.filter(p => p.status === 'completed').length,
        pendingCount: payments.filter(p => p.status === 'pending').length,
        failedCount: payments.filter(p => p.status === 'failed').length
      };
      
      return stats;
    } catch (err) {
      console.error('Error getting payment stats:', err);
      throw err;
    }
  }, []);

  return {
    repayments,
    loading,
    error,
    // CRUD Operations
    fetchRepayments,
    recordPayment,
    markAsPaid,
    cancelPayment,
    deletePayment,
    // Receipt Operations
    addReceipt,
    downloadReceipt,
    // Stats
    getPaymentStats,
    // Utilities
    refresh: fetchRepayments
  };
};
