import { useState, useEffect, useCallback } from 'react';
import { localStorageService } from '../services/localStorageService';
import { useNotification } from '../contexts/useNotification';

interface UseLocalFormOptions {
  formType: 'portfolio' | 'credit_request' | 'credit_contract';
  onSuccessfulSync?: () => void;
}

export function useLocalForm({ formType, onSuccessfulSync }: UseLocalFormOptions) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { showNotification } = useNotification();

  const loadPendingCount = useCallback(async () => {
    try {
      const forms = await localStorageService.getPendingForms(formType);
      setPendingCount(forms.filter(f => f.status === 'pending').length);
    } catch (error) {
      console.error('Erreur lors du chargement du compteur:', error);
    }
  }, [formType]);

  const syncPendingForms = useCallback(async () => {
    try {
      const result = await localStorageService.syncPendingForms();
      
      if (result.success > 0) {
        showNotification(
          `${result.success} formulaire(s) synchronisé(s) avec succès.`,
          'success',
          5000
        );
        
        await loadPendingCount();
        onSuccessfulSync?.();
      }
      
      if (result.failed > 0) {
        showNotification(
          `${result.failed} formulaire(s) n'ont pas pu être synchronisés.`,
          'warning',
          5000
        );
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      showNotification(
        'Impossible de synchroniser les formulaires en attente.',
        'error',
        5000
      );
    }
  }, [showNotification, loadPendingCount, onSuccessfulSync]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Charger le nombre de formulaires en attente
    loadPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadPendingCount]);

  useEffect(() => {
    // Tentative de synchronisation quand on redevient en ligne
    if (isOnline && pendingCount > 0) {
      syncPendingForms();
    }
  }, [isOnline, pendingCount, syncPendingForms]);

  const saveFormLocally = useCallback(async (formData: Record<string, unknown>): Promise<string> => {
    setIsSaving(true);
    try {
      const formId = await localStorageService.saveForm(formType, formData);
      await loadPendingCount();
      
      showNotification(
        'Vos données ont été sauvegardées localement et seront synchronisées dès que la connexion sera rétablie.',
        'info',
        5000
      );
      
      return formId;
    } catch (error) {
      showNotification(
        'Impossible de sauvegarder le formulaire localement.',
        'error',
        5000
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [formType, loadPendingCount, showNotification]);

  const submitForm = useCallback(async (
    formData: Record<string, unknown>,
    apiCall: () => Promise<void>
  ): Promise<void> => {
    if (!isOnline) {
      // Mode hors ligne - sauvegarde locale
      await saveFormLocally(formData);
      return;
    }

    try {
      // Tentative d'envoi direct
      await apiCall();
      
      showNotification(
        'Vos données ont été envoyées avec succès.',
        'success',
        3000
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      
      // En cas d'erreur, sauvegarder localement
      await saveFormLocally(formData);
      
      showNotification(
        'Le formulaire a été sauvegardé localement et sera envoyé automatiquement.',
        'warning',
        5000
      );
    }
  }, [isOnline, saveFormLocally, showNotification]);

  return {
    isOnline,
    isSaving,
    pendingCount,
    saveFormLocally,
    syncPendingForms,
    submitForm,
    loadPendingCount
  };
}