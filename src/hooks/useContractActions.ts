import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditContract } from '../types/credit';
import { useNotification } from '../contexts/useNotification';
import { useCreditContracts } from './useCreditContracts';
import { statusConfig } from '../utils/credit';

export const useContractActions = (portfolioId: string) => {
  const { updateContract, deleteContract } = useCreditContracts(portfolioId);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmStatusChange, setShowConfirmStatusChange] = useState(false);
  const [contractToAction, setContractToAction] = useState<CreditContract | null>(null);
  const [newStatusToApply, setNewStatusToApply] = useState<'active' | 'closed' | 'defaulted' | 'suspended' | 'in_litigation' | null>(null);
  const [pendingActions, setPendingActions] = useState<Array<{
    type: 'status_change' | 'delete';
    contractId: string;
    data?: Partial<CreditContract>;
  }>>([]);

  // Surveiller l'état de la connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Exécuter les actions en attente lorsque la connexion est rétablie
  useEffect(() => {
    const processPendingActions = async () => {
      if (isOnline && pendingActions.length > 0) {
        showNotification('Connexion rétablie. Traitement des actions en attente...', 'info');
        
        // Copier les actions pour éviter les problèmes de concurrence
        const actionsToProcess = [...pendingActions];
        
        // Vider la liste des actions en attente
        setPendingActions([]);
        
        // Traiter chaque action
        for (const action of actionsToProcess) {
          try {
            if (action.type === 'status_change' && action.data) {
              await updateContract(action.contractId, action.data);
              showNotification(`Mise à jour du statut du contrat effectuée`, 'success');
            } else if (action.type === 'delete') {
              await deleteContract(action.contractId);
              showNotification(`Suppression du contrat effectuée`, 'success');
            }
          } catch (error) {
            console.error(`Échec de l'exécution de l'action en attente:`, error);
            showNotification(`Une action n'a pas pu être exécutée. Veuillez réessayer manuellement.`, 'error');
            // Remettre l'action dans la file d'attente
            setPendingActions(prev => [...prev, action]);
          }
        }
      }
    };
    
    processPendingActions();
  }, [isOnline, pendingActions, updateContract, deleteContract, showNotification]);

  const handleStatusChange = async (contract: CreditContract, newStatus: 'active' | 'closed' | 'defaulted' | 'suspended' | 'in_litigation') => {
    if (!contract) {
      showNotification('Impossible de modifier un contrat inexistant', 'error');
      return;
    }

    if (newStatus === 'defaulted' || newStatus === 'in_litigation') {
      setContractToAction(contract);
      setNewStatusToApply(newStatus);
      setShowConfirmStatusChange(true);
      return;
    }
    
    try {
      if (!isOnline) {
        // Mode hors ligne: ajouter à la file d'attente
        setPendingActions(prev => [...prev, {
          type: 'status_change',
          contractId: contract.id,
          data: { status: newStatus }
        }]);
        showNotification(`Mode hors ligne: Le statut du contrat ${contract.reference} sera changé en "${statusConfig[newStatus]?.label || newStatus}" lors de la prochaine connexion`, 'warning');
        return;
      }
      
      await updateContract(contract.id, { ...contract, status: newStatus });
      showNotification(`Le statut du contrat ${contract.reference} a été changé en "${statusConfig[newStatus] ? statusConfig[newStatus].label : newStatus}"`, 'success');
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      
      // Fallback en mode hors ligne - simuler la mise à jour localement
      setPendingActions(prev => [...prev, {
        type: 'status_change',
        contractId: contract.id,
        data: { status: newStatus }
      }]);
      showNotification(`Mode hors ligne: Le statut du contrat ${contract.reference} sera changé en "${statusConfig[newStatus]?.label || newStatus}" lors de la prochaine connexion`, 'warning');
    }
  };

  const confirmStatusChange = async () => {
    if (!contractToAction || !newStatusToApply) {
      showNotification('Données du contrat incomplètes, impossible de continuer', 'error');
      return;
    }
    
    try {
      if (!isOnline) {
        // Mode hors ligne: ajouter à la file d'attente
        setPendingActions(prev => [...prev, {
          type: 'status_change',
          contractId: contractToAction.id,
          data: { status: newStatusToApply }
        }]);
        
        showNotification(`Mode hors ligne: Le statut du contrat sera mis à jour lors de la prochaine connexion`, 'warning');
        
        // On ferme la modale
        setContractToAction(null);
        setNewStatusToApply(null);
        setShowConfirmStatusChange(false);
        return;
      }
      
      await updateContract(contractToAction.id, { ...contractToAction, status: newStatusToApply });
      showNotification(`Le statut du contrat ${contractToAction.reference} a été changé en "${statusConfig[newStatusToApply] ? statusConfig[newStatusToApply].label : newStatusToApply}"`, 'success');
      
      setContractToAction(null);
      setNewStatusToApply(null);
      setShowConfirmStatusChange(false);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      
      // Fallback en mode hors ligne
      setPendingActions(prev => [...prev, {
        type: 'status_change',
        contractId: contractToAction.id,
        data: { status: newStatusToApply }
      }]);
      
      showNotification(`Mode hors ligne: Le statut du contrat sera mis à jour lors de la prochaine connexion`, 'warning');
      
      // On ferme quand même la modale pour ne pas bloquer l'utilisateur
      setContractToAction(null);
      setNewStatusToApply(null);
      setShowConfirmStatusChange(false);
    }
  };

  const openDeleteConfirm = (contract: CreditContract) => {
    if (!contract) {
      showNotification('Impossible de supprimer un contrat inexistant', 'error');
      return;
    }
    setContractToAction(contract);
    setShowConfirmDelete(true);
  };

  const handleDeleteContract = async () => {
    if (!contractToAction) {
      showNotification('Données du contrat incomplètes, impossible de continuer', 'error');
      return;
    }
    
    try {
      if (!isOnline) {
        // Mode hors ligne: ajouter à la file d'attente
        setPendingActions(prev => [...prev, {
          type: 'delete',
          contractId: contractToAction.id
        }]);
        
        showNotification(`Mode hors ligne: La suppression du contrat sera effectuée lors de la prochaine connexion`, 'warning');
        
        // On ferme la modale
        setContractToAction(null);
        setShowConfirmDelete(false);
        return;
      }
      
      await deleteContract(contractToAction.id);
      showNotification(`Le contrat ${contractToAction.reference} a été supprimé avec succès`, 'success');
      
      setContractToAction(null);
      setShowConfirmDelete(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      
      // Vérifier si l'erreur est due à un problème de connexion
      if (error instanceof Error && error.message.includes('network') || !navigator.onLine) {
        // Ajouter à la file d'attente
        setPendingActions(prev => [...prev, {
          type: 'delete',
          contractId: contractToAction.id
        }]);
        
        showNotification(`Mode hors ligne: La suppression du contrat sera effectuée lors de la prochaine connexion`, 'warning');
        
        // On ferme quand même la modale pour ne pas bloquer l'utilisateur
        setContractToAction(null);
        setShowConfirmDelete(false);
      } else {
        showNotification(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
      }
    }
  };

  const handleGeneratePDF = (contract: CreditContract) => {
    if (!contract) {
      showNotification('Impossible de générer un PDF pour un contrat inexistant', 'error');
      return;
    }
    
    try {
      // TODO: Implémenter la génération de PDF
      if (!navigator.onLine) {
        showNotification(`Mode hors ligne: La génération du PDF pour le contrat ${contract.reference} est indisponible`, 'warning');
        return;
      }
      
      showNotification(`Génération du PDF pour le contrat ${contract.reference} en cours...`, 'info');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      showNotification(`Erreur lors de la génération du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
    }
  };

  const handleViewSchedule = (contract: CreditContract) => {
    if (!contract) {
      showNotification('Impossible d\'afficher l\'échéancier d\'un contrat inexistant', 'error');
      return;
    }
    
    navigate(`/app/traditional/portfolio/${portfolioId}/contracts/${contract.id}/schedule`);
    showNotification(`Navigation vers l'échéancier du contrat ${contract.reference}`, 'info');
  };
  
  return {
    showConfirmDelete,
    showConfirmStatusChange,
    contractToAction,
    newStatusToApply,
    handleStatusChange,
    confirmStatusChange,
    handleDeleteContract,
    handleGeneratePDF,
    handleViewSchedule,
    openDeleteConfirm,
    setShowConfirmDelete,
    setContractToAction,
    setShowConfirmStatusChange,
    setNewStatusToApply,
    isOnline,
    pendingActions: pendingActions.length,
  };
};
