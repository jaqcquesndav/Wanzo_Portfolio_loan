import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Guarantee } from '../components/portfolio/traditional/GuaranteesTable';
import { useNotification } from '../contexts/NotificationContext';
import { useGuarantees } from './useGuarantees';

export const useGuaranteeActions = (portfolioId: string) => {
  const { updateGuarantee, deleteGuarantee } = useGuarantees(portfolioId);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmStatusChange, setShowConfirmStatusChange] = useState(false);
  const [guaranteeToAction, setGuaranteeToAction] = useState<Guarantee | null>(null);
  const [newStatusToApply, setNewStatusToApply] = useState<'active' | 'libérée' | 'saisie' | 'expirée' | null>(null);

  const handleStatusChange = async (guarantee: Guarantee, newStatus: 'active' | 'libérée' | 'saisie' | 'expirée') => {
    if (newStatus === 'saisie') {
      setGuaranteeToAction(guarantee);
      setNewStatusToApply(newStatus);
      setShowConfirmStatusChange(true);
      return;
    }
    
    try {
      await updateGuarantee(guarantee.id, { ...guarantee, status: newStatus });
      showNotification(`Le statut de la garantie ${guarantee.id} a été changé en "${newStatus}"`, 'success');
    } catch (error) {
      showNotification(`Erreur lors du changement de statut: ${error}`, 'error');
    }
  };

  const confirmStatusChange = async () => {
    if (!guaranteeToAction || !newStatusToApply) return;
    
    try {
      await updateGuarantee(guaranteeToAction.id, { ...guaranteeToAction, status: newStatusToApply });
      showNotification(`Le statut de la garantie ${guaranteeToAction.id} a été changé en "${newStatusToApply}"`, 'success');
    } catch (error) {
      showNotification(`Erreur lors du changement de statut: ${error}`, 'error');
    } finally {
      setShowConfirmStatusChange(false);
      setGuaranteeToAction(null);
      setNewStatusToApply(null);
    }
  };

  const handleDeleteGuarantee = (guarantee: Guarantee) => {
    setGuaranteeToAction(guarantee);
    setShowConfirmDelete(true);
  };

  const confirmDeleteGuarantee = async () => {
    if (!guaranteeToAction) return;
    
    try {
      await deleteGuarantee(guaranteeToAction.id);
      showNotification(`La garantie ${guaranteeToAction.id} a été supprimée`, 'success');
    } catch (error) {
      showNotification(`Erreur lors de la suppression: ${error}`, 'error');
    } finally {
      setShowConfirmDelete(false);
      setGuaranteeToAction(null);
    }
  };

  const handleViewDetails = (guaranteeId: string) => {
    // Log des détails pour faciliter le débogage
    console.log(`Navigating to guarantee details with ID: ${guaranteeId}, portfolioId: ${portfolioId}`);
    
    // Utiliser la route correcte pour les détails de garantie
    if (portfolioId) {
      navigate(`/app/traditional/${portfolioId}/guarantees/${guaranteeId}`);
    } else {
      navigate(`/app/traditional/guarantees/${guaranteeId}`);
    }
  };

  const handleRelease = (guarantee: Guarantee) => {
    handleStatusChange(guarantee, 'libérée');
  };

  const handleSeize = (guarantee: Guarantee) => {
    handleStatusChange(guarantee, 'saisie');
  };

  return {
    showConfirmDelete,
    showConfirmStatusChange,
    guaranteeToAction,
    newStatusToApply,
    handleStatusChange,
    confirmStatusChange,
    handleDeleteGuarantee,
    confirmDeleteGuarantee,
    handleViewDetails,
    handleRelease,
    handleSeize,
    setShowConfirmDelete,
    setShowConfirmStatusChange
  };
};
