// src/hooks/useRepayments.ts
import { useState, useEffect, useCallback } from 'react';
import { paymentApi } from '../services/api/traditional/payment.api';
import { Repayment } from '../components/portfolio/traditional/RepaymentsTable';

/**
 * Hook pour gérer les remboursements
 */
export const useRepayments = (contractId?: string, portfolioId?: string) => {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les remboursements
  const fetchRepayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: Repayment[] = [];
      
      if (contractId) {
        // Récupérer les remboursements pour un contrat spécifique
        const payments = await paymentApi.getPaymentsByContract(contractId);
        
        // Convertir les CreditPayment en Repayment pour l'affichage
        data = payments.map(payment => ({
          id: payment.id,
          company: payment.client_id, // Dans une vraie implémentation, récupérer le nom de l'entreprise
          product: 'Crédit', // Dans une vraie implémentation, récupérer le type de produit
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
        }));
      } else if (portfolioId) {
        // Récupérer les remboursements par portfolio
        try {
          const payments = await paymentApi.getPaymentsByPortfolio(portfolioId);
          
          // Même traitement que pour les contrats
          data = payments.map(payment => ({
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
          }));
        } catch (error) {
          // Fallback vers les données mockées en cas d'erreur API
          console.warn('Fallback to mock data for repayments', error);
          
          // Importer les données mockées directement
          const { mockRepayments } = await import('../data/mockRepayments');
          
          // Filtrer par portfolioId si nécessaire
          data = mockRepayments.filter(r => r.portfolioId === portfolioId);
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

  // Fonction pour marquer un remboursement comme payé
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

  // Fonction pour télécharger un justificatif
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

  return {
    repayments,
    loading,
    error,
    markAsPaid,
    downloadReceipt,
    refresh: fetchRepayments
  };
};
