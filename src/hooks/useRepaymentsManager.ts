import { useState, useEffect, useCallback } from 'react';
import { CreditPayment } from '../types/credit-payment';
import { traditionalDataService } from '../services/api/traditional/dataService';
import { paymentApi } from '../services/api/traditional/payment.api';
import { useNotification } from '../contexts/useNotification';

/**
 * Hook personnalisé pour la gestion des remboursements
 * Fournit toutes les fonctionnalités pour afficher, filtrer, et manipuler les remboursements
 */
export const useRepaymentsManager = (contractId?: string) => {
  const [payments, setPayments] = useState<CreditPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const { showNotification } = useNotification();

  // Récupérer tous les remboursements ou ceux d'un contrat spécifique
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result: CreditPayment[];
      if (contractId) {
        result = traditionalDataService.getPaymentsByContractId(contractId);
      } else {
        result = traditionalDataService.getAllPayments();
      }
      setPayments(result);
    } catch (err) {
      setError('Erreur lors de la récupération des remboursements');
      console.error('Erreur lors de la récupération des remboursements:', err);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  // Recharger les données
  const refreshPayments = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Télécharger une pièce justificative
  const uploadSupportingDocument = useCallback(async (paymentId: string, file: File) => {
    setLoading(true);
    try {
      const uploadResult = await paymentApi.uploadSupportingDocument(paymentId, file);
      if (uploadResult.success) {
        showNotification('Pièce justificative téléchargée avec succès', 'success');
        refreshPayments();
        return true;
      } else {
        throw new Error(uploadResult.message || 'Erreur lors du téléchargement');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      showNotification(`Échec du téléchargement: ${errorMessage}`, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshPayments, showNotification]);

  // Télécharger la pièce justificative
  const downloadSupportingDocument = useCallback(async (paymentId: string) => {
    try {
      return await paymentApi.downloadSupportingDocument(paymentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      showNotification(`Échec du téléchargement: ${errorMessage}`, 'error');
      return null;
    }
  }, [showNotification]);

  // Ajouter un nouveau remboursement
  const addPayment = useCallback(async (paymentData: Omit<CreditPayment, 'id'>) => {
    setLoading(true);
    try {
      // Créer un nouvel identifiant
      const newPayment = await paymentApi.recordPayment(paymentData);
      
      showNotification('Remboursement ajouté avec succès', 'success');
      
      refreshPayments();
      return newPayment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      showNotification(`Échec de l'ajout du remboursement: ${errorMessage}`, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refreshPayments, showNotification]);

  // Mettre à jour un remboursement existant
  const updatePayment = useCallback(async (payment: CreditPayment) => {
    setLoading(true);
    try {
      const updatedPayment = await paymentApi.updatePayment(payment.id, payment);
      
      showNotification('Remboursement mis à jour avec succès', 'success');
      
      refreshPayments();
      return updatedPayment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      showNotification(`Échec de la mise à jour du remboursement: ${errorMessage}`, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refreshPayments, showNotification]);

  // Supprimer un remboursement
  const deletePayment = useCallback(async (paymentId: string) => {
    setLoading(true);
    try {
      // Utiliser la méthode cancel de l'API si disponible, sinon fallback vers dataService
      try {
        await paymentApi.cancelPayment(paymentId, 'Supprimé par l\'utilisateur');
        showNotification('Remboursement supprimé avec succès', 'success');
        refreshPayments();
        return true;
      } catch {
        // Fallback vers deletePayment de dataService si disponible
        const result = traditionalDataService.deletePayment(paymentId);
        if (result) {
          showNotification('Remboursement supprimé avec succès', 'success');
          refreshPayments();
          return true;
        } else {
          throw new Error('Échec de la suppression du remboursement');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      showNotification(`Échec de la suppression: ${errorMessage}`, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshPayments, showNotification]);

  // Comparer avec les échéances planifiées
  const compareWithSchedule = useCallback((contractId: string) => {
    return traditionalDataService.comparePaymentsWithSchedule(contractId);
  }, []);

  // Charger les données au montage du composant ou quand refreshTrigger change
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments, refreshTrigger]);

  return {
    payments,
    loading,
    error,
    refreshPayments,
    uploadSupportingDocument,
    downloadSupportingDocument,
    addPayment,
    updatePayment,
    deletePayment,
    compareWithSchedule
  };
};
