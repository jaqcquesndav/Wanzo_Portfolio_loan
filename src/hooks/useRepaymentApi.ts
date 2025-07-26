// src/hooks/useRepaymentApi.ts
import { useState, useEffect, useCallback } from 'react';
import { paymentApi } from '../services/api/traditional/payment.api';
import { CreditPayment } from '../types/credit-payment';

/**
 * Hook pour gérer les remboursements d'un contrat spécifique
 */
export function useContractRepayments(contractId: string) {
  const [repayments, setRepayments] = useState<CreditPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await paymentApi.getPaymentsByContract(contractId);
      
      // Calcul des données supplémentaires pour chaque remboursement
      const enhancedRepayments = response.map((repayment) => {
        // Calcul du glissement (jours de retard ou d'avance)
        const slippage = repayment.due_date && repayment.payment_date 
          ? Math.round((new Date(repayment.payment_date).getTime() - new Date(repayment.due_date).getTime()) / (1000 * 60 * 60 * 24))
          : undefined;
        
        // Calcul du pourcentage restant (si applicable)
        const totalAmount = repayment.payment_details 
          ? repayment.payment_details.principal_amount + repayment.payment_details.interest_amount
          : repayment.amount;
        
        const remainingPercentage = repayment.remaining_amount !== undefined
          ? Math.round((repayment.remaining_amount / totalAmount) * 100)
          : undefined;
        
        return {
          ...repayment,
          slippage,
          remaining_percentage: remainingPercentage
        };
      });
      
      setRepayments(enhancedRepayments);
      setError(null);
    } catch (err) {
      console.error('Error fetching repayments:', err);
      setError('Erreur lors de la récupération des remboursements');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchRepayments();
  }, [fetchRepayments]);

  const getRepaymentById = useCallback(async (repaymentId: string): Promise<CreditPayment | null> => {
    try {
      const repayment = await paymentApi.getPaymentById(repaymentId);
      
      // Calcul des données supplémentaires
      const slippage = repayment.due_date && repayment.payment_date 
        ? Math.round((new Date(repayment.payment_date).getTime() - new Date(repayment.due_date).getTime()) / (1000 * 60 * 60 * 24))
        : undefined;
      
      const totalAmount = repayment.payment_details 
        ? repayment.payment_details.principal_amount + repayment.payment_details.interest_amount
        : repayment.amount;
      
      const remainingPercentage = repayment.remaining_amount !== undefined
        ? Math.round((repayment.remaining_amount / totalAmount) * 100)
        : undefined;
      
      return {
        ...repayment,
        slippage,
        remaining_percentage: remainingPercentage
      };
    } catch (err) {
      console.error(`Error getting repayment ${repaymentId}:`, err);
      setError(`Erreur lors de la récupération du remboursement ${repaymentId}`);
      return null;
    }
  }, []);

  const markAsPaid = useCallback(async (repaymentId: string, paymentData: {
    payment_date: string;
    payment_method: string;
    payment_reference: string;
    receipt?: File;
  }): Promise<boolean> => {
    try {
      // Mettre à jour le remboursement
      await paymentApi.updatePayment(repaymentId, {
        status: 'completed',
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        payment_reference: paymentData.payment_reference
      });
      
      // Si un justificatif est fourni, télécharger le document
      if (paymentData.receipt) {
        await paymentApi.uploadPaymentReceipt(repaymentId, paymentData.receipt);
      }
      
      // Rafraîchir la liste après le paiement
      fetchRepayments();
      
      return true;
    } catch (err) {
      console.error(`Error marking payment ${repaymentId} as paid:`, err);
      setError(`Erreur lors du marquage du paiement ${repaymentId} comme payé`);
      return false;
    }
  }, [fetchRepayments]);

  const downloadReceipt = useCallback(async (repaymentId: string): Promise<Blob | null> => {
    try {
      return await paymentApi.downloadPaymentReceipt(repaymentId);
    } catch (err) {
      console.error(`Error downloading receipt for payment ${repaymentId}:`, err);
      setError(`Erreur lors du téléchargement du justificatif pour le paiement ${repaymentId}`);
      return null;
    }
  }, []);

  return {
    repayments,
    loading,
    error,
    getRepaymentById,
    markAsPaid,
    downloadReceipt,
    refreshRepayments: fetchRepayments
  };
}

/**
 * Hook pour obtenir des statistiques sur les remboursements d'un portefeuille
 * @deprecated Le paramètre portfolioId n'est pas utilisé, mais conservé pour compatibilité API
 */
export function useRepaymentStats(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _portfolioId: string
) {
  const [stats, setStats] = useState<{
    total_repayments_count: number;
    total_repayments_amount: number;
    on_time_payments_count: number;
    on_time_payments_percentage: number;
    late_payments_count: number;
    late_payments_percentage: number;
    average_delay_days: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Dans une application réelle, vous feriez un appel API ici
      // Pour la démo, nous simulons des statistiques
      
      setTimeout(() => {
        setStats({
          total_repayments_count: 48,
          total_repayments_amount: 12500000,
          on_time_payments_count: 42,
          on_time_payments_percentage: 87.5,
          late_payments_count: 6,
          late_payments_percentage: 12.5,
          average_delay_days: 3.2
        });
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error fetching repayment stats:', err);
      setError('Erreur lors de la récupération des statistiques de remboursements');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refreshStats: fetchStats };
}
