import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditContract } from '../types/credit';
import { useNotification } from '../contexts/NotificationContext';
import { useCreditContracts } from './useCreditContracts';
import { statusConfig } from '../utils/credit';

export const useContractActions = (portfolioId: string) => {
  const { updateContract, deleteContract } = useCreditContracts(portfolioId);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmStatusChange, setShowConfirmStatusChange] = useState(false);
  const [contractToAction, setContractToAction] = useState<CreditContract | null>(null);
  const [newStatusToApply, setNewStatusToApply] = useState<'active' | 'closed' | 'defaulted' | 'suspended' | 'in_litigation' | null>(null);

  const handleStatusChange = async (contract: CreditContract, newStatus: 'active' | 'closed' | 'defaulted' | 'suspended' | 'in_litigation') => {
    if (newStatus === 'defaulted' || newStatus === 'in_litigation') {
      setContractToAction(contract);
      setNewStatusToApply(newStatus);
      setShowConfirmStatusChange(true);
      return;
    }
    
    try {
      await updateContract(contract.id, { ...contract, status: newStatus });
      showNotification(`Le statut du contrat ${contract.reference} a été changé en "${statusConfig[newStatus] ? statusConfig[newStatus].label : newStatus}"`, 'success');
    } catch (error) {
      showNotification(`Erreur lors du changement de statut: ${error}`, 'error');
    }
  };

  const confirmStatusChange = async () => {
    if (!contractToAction || !newStatusToApply) return;
    
    try {
      await updateContract(contractToAction.id, { ...contractToAction, status: newStatusToApply });
      showNotification(`Le statut du contrat ${contractToAction.reference} a été changé en "${statusConfig[newStatusToApply] ? statusConfig[newStatusToApply].label : newStatusToApply}"`, 'success');
      
      setContractToAction(null);
      setNewStatusToApply(null);
      setShowConfirmStatusChange(false);
    } catch (error) {
      showNotification(`Erreur lors du changement de statut: ${error}`, 'error');
    }
  };

  const openDeleteConfirm = (contract: CreditContract) => {
    setContractToAction(contract);
    setShowConfirmDelete(true);
  };

  const handleDeleteContract = async () => {
    if (!contractToAction) return;
    
    try {
      await deleteContract(contractToAction.id);
      showNotification(`Le contrat ${contractToAction.reference} a été supprimé avec succès`, 'success');
      
      setContractToAction(null);
      setShowConfirmDelete(false);
    } catch (error) {
      showNotification(`Erreur lors de la suppression: ${error}`, 'error');
    }
  };

  const handleGeneratePDF = (contract: CreditContract) => {
    showNotification(`Génération du PDF pour le contrat ${contract.reference} en cours...`, 'info');
  };

  const handleViewSchedule = (contract: CreditContract) => {
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
  };
};
