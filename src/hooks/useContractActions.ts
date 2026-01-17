// src/hooks/useContractActions.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditContract } from '../types/credit-contract';
import { useNotification } from '../contexts/useNotification';
import { creditContractApi } from '../services/api/traditional/credit-contract.api';

// Hook pour gérer les actions sur les contrats
export const useContractActions = (portfolioId: string) => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Fonction pour mettre à jour un contrat
  const handleUpdateContract = useCallback(async (id: string, updates: Partial<CreditContract>) => {
    try {
      const updatedContract = await creditContractApi.updateContract(id, updates);
      showNotification(`Contrat mis à jour avec succès`, 'success');
      return updatedContract;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      showNotification(`Erreur lors de la mise à jour: ${errorMessage}`, 'error');
      throw error;
    }
  }, [showNotification]);

  // Fonction pour supprimer un contrat (simulation - pas d'endpoint de suppression défini)
  const handleDeleteContract = useCallback(async (id: string) => {
    try {
      showNotification(`Contrat ${id} marqué pour suppression`, 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      showNotification(`Erreur lors de la suppression: ${errorMessage}`, 'error');
      return false;
    }
  }, [showNotification]);

  // Fonction pour générer un PDF du contrat
  const handleGeneratePDF = useCallback(async (contract: CreditContract) => {
    if (!contract) {
      showNotification('Impossible de générer un PDF pour un contrat inexistant', 'error');
      return;
    }
    
    try {
      if (!navigator.onLine) {
        showNotification(`Mode hors ligne: La génération du PDF pour le contrat ${contract.contract_number} est indisponible`, 'warning');
        return;
      }
      
      showNotification(`Génération du PDF pour le contrat ${contract.contract_number} en cours...`, 'info');
      
      const result = await creditContractApi.generateContractDocument(contract.id);
      
      if (result.documentUrl) {
        showNotification(`PDF du contrat ${contract.contract_number} généré avec succès`, 'success');
        // Ouvrir le document ou déclencher le téléchargement
        window.open(result.documentUrl, '_blank');
      } else {
        showNotification(`Erreur lors de la génération du PDF`, 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      showNotification(`Erreur lors de la génération du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
    }
  }, [showNotification]);

  // Fonction pour afficher l'échéancier d'un contrat
  const handleViewSchedule = useCallback((contract: CreditContract) => {
    if (!contract) {
      showNotification('Impossible d\'afficher l\'échéancier d\'un contrat inexistant', 'error');
      return;
    }
    
    navigate(`/app/traditional/portfolio/${portfolioId}/contracts/${contract.id}/schedule`);
    showNotification(`Navigation vers l'échéancier du contrat ${contract.contract_number}`, 'info');
  }, [navigate, portfolioId, showNotification]);

  // Fonction pour marquer un contrat comme défaillant
  const handleMarkAsDefaulted = useCallback(async (contract: CreditContract, reason: string) => {
    if (!contract) {
      showNotification('Impossible de marquer un contrat inexistant comme défaillant', 'error');
      return false;
    }
    
    try {
      await creditContractApi.markAsDefaulted(contract.id, reason);
      showNotification(`Contrat ${contract.contract_number} marqué comme défaillant`, 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      showNotification(`Erreur lors du marquage comme défaillant: ${errorMessage}`, 'error');
      return false;
    }
  }, [showNotification]);

  // Fonction pour restructurer un contrat
  const handleRestructureContract = useCallback(async (
    contract: CreditContract, 
    restructuringDetails: {
      new_terms: string;
      new_rate?: number;
      new_end_date: string;
      reason: string;
    }
  ) => {
    if (!contract) {
      showNotification('Impossible de restructurer un contrat inexistant', 'error');
      return false;
    }
    
    try {
      await creditContractApi.restructureContract(contract.id, restructuringDetails);
      showNotification(`Contrat ${contract.contract_number} restructuré avec succès`, 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      showNotification(`Erreur lors de la restructuration: ${errorMessage}`, 'error');
      return false;
    }
  }, [showNotification]);

  // Fonction pour clôturer un contrat
  const handleCompleteContract = useCallback(async (
    contract: CreditContract, 
    completionDetails: {
      completion_date: string;
      notes?: string;
    }
  ) => {
    if (!contract) {
      showNotification('Impossible de clôturer un contrat inexistant', 'error');
      return false;
    }
    
    try {
      // Correction: completeContract prend contractId et completionDetails (pas portfolioId)
      await creditContractApi.completeContract(contract.id, completionDetails);
      showNotification(`Contrat ${contract.contract_number} clôturé avec succès`, 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      showNotification(`Erreur lors de la clôture: ${errorMessage}`, 'error');
      return false;
    }
  }, [showNotification]);

  // Fonction pour récupérer l'échéancier de paiement
  const handleGetPaymentSchedule = useCallback(async (contractId: string) => {
    try {
      const schedule = await creditContractApi.getPaymentSchedule(contractId);
      showNotification('Échéancier récupéré avec succès', 'success');
      return schedule;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      showNotification(`Erreur lors de la récupération de l'échéancier: ${errorMessage}`, 'error');
      return null;
    }
  }, [showNotification]);
  
  // Retourne les fonctions du hook
  return {
    // Actions de base
    handleUpdateContract,
    handleDeleteContract,
    handleGeneratePDF,
    handleViewSchedule,
    
    // Actions avancées
    handleMarkAsDefaulted,
    handleRestructureContract,
    handleCompleteContract,
    handleGetPaymentSchedule
  };
};