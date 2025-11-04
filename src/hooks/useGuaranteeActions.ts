import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Guarantee } from '../types/guarantee';
import { useNotification } from '../contexts/useNotification';
import { useGuarantees } from './useGuarantees';
import { dataValidationService } from '../services/validation/dataValidationService';

export const useGuaranteeActions = (portfolioId: string) => {
  const { updateGuarantee, deleteGuarantee } = useGuarantees(portfolioId);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmStatusChange, setShowConfirmStatusChange] = useState(false);
  const [guaranteeToAction, setGuaranteeToAction] = useState<Guarantee | null>(null);
  const [newStatusToApply, setNewStatusToApply] = useState<'active' | 'libérée' | 'saisie' | 'expirée' | null>(null);

  // Validation des données avant toute action
  const validateBeforeAction = async (): Promise<boolean> => {
    try {
      const { valid, issues } = await dataValidationService.validateGuaranteeData();
      
      if (!valid) {
        console.warn('Problèmes de validation détectés avant action:', issues);
        showNotification(
          `Problèmes détectés dans les données de garanties. Réinitialisation recommandée.`, 
          'warning'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erreur lors de la validation des données:', error);
      return false;
    }
  };

  const handleStatusChange = async (guarantee: Guarantee, newStatus: 'active' | 'libérée' | 'saisie' | 'expirée') => {
    // Validation préalable
    if (!(await validateBeforeAction())) {
      return;
    }
    
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

  const handleDeleteGuarantee = async (guarantee: Guarantee) => {
    // Validation préalable
    if (!(await validateBeforeAction())) {
      return;
    }
    
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

  const handleViewDetails = async (guaranteeId: string) => {
    // Validation préalable
    await validateBeforeAction();
    
    // Log des détails pour faciliter le débogage
    console.log(`🔍 Navigation vers la garantie avec ID: ${guaranteeId}, portfolioId: ${portfolioId}`);
    
    // Construction d'URL améliorée pour assurer la compatibilité
    let targetUrl: string;
    
    // Cas spécial pour G001 dans trad-1 (pour résoudre le problème spécifique)
    if (guaranteeId === 'G001' && portfolioId === 'trad-1') {
      targetUrl = `/app/traditional/trad-1/guarantees/G001`;
      console.log(`🔍 Utilisation de la route spécifique pour G001: ${targetUrl}`);
      
      // Journaliser les détails de navigation pour le débogage
      console.group('📝 Détails de navigation pour G001:');
      console.log(`- URL actuelle: ${window.location.href}`);
      console.log(`- URL cible: ${targetUrl}`);
      console.log(`- ID de garantie: ${guaranteeId}`);
      console.log(`- ID de portfolio: ${portfolioId}`);
      console.groupEnd();
    } 
    // Construction normale d'URL avec portfolioId si disponible
    else if (portfolioId) {
      targetUrl = `/app/portfolio/${portfolioId}/guarantees/${guaranteeId}`;
      console.log(`Using portfolio route: ${targetUrl}`);
    } 
    // Fallback sans portfolioId
    else {
      targetUrl = `/app/traditional/guarantees/${guaranteeId}`;
      console.log(`Using fallback route: ${targetUrl}`);
    }
    
    // Navigation avec l'URL construite
    navigate(targetUrl);
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
