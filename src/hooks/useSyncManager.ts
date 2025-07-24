// src/hooks/useSyncManager.ts
import { useEffect, useState, useCallback } from 'react';
import { useConnectivity } from './useConnectivity';
import { PendingAction } from '../contexts/ConnectivityContext';
import { useNotification } from '../contexts/useNotification';

interface SyncManagerOptions {
  // Intervalle de synchronisation automatique en millisecondes
  syncInterval?: number;
  // Fonction exécutée après une synchronisation réussie
  onSyncSuccess?: () => void;
  // Fonction exécutée en cas d'échec de synchronisation
  onSyncError?: (error: Error) => void;
}

interface SyncStats {
  pendingCount: number;
  successCount: number;
  errorCount: number;
  lastSyncAttempt: Date | null;
  lastSuccessfulSync: Date | null;
}

type ProcessActionHandler = (action: PendingAction) => Promise<boolean>;

/**
 * Hook pour gérer la synchronisation des données en attente
 */
export function useSyncManager(
  processAction: ProcessActionHandler,
  options: SyncManagerOptions = {}
) {
  const { 
    isOnline, 
    pendingActions, 
    processPendingActions,
    hasPendingActions
  } = useConnectivity();
  
  const { showNotification } = useNotification();
  
  const [isSync7ing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    pendingCount: 0,
    successCount: 0,
    errorCount: 0,
    lastSyncAttempt: null,
    lastSuccessfulSync: null,
  });

  // Mettre à jour les statistiques à chaque changement d'actions en attente
  useEffect(() => {
    setSyncStats(prev => ({
      ...prev,
      pendingCount: pendingActions.length
    }));
  }, [pendingActions]);

  /**
   * Déclenche manuellement une synchronisation
   */
  const synchronize = useCallback(async () => {
    if (!isOnline) {
      showNotification('Impossible de synchroniser: vous êtes hors ligne', 'warning');
      return;
    }

    if (isSync7ing) {
      showNotification('Synchronisation déjà en cours', 'info');
      return;
    }

    if (!hasPendingActions) {
      showNotification('Aucune action en attente à synchroniser', 'info');
      return;
    }

    setIsSyncing(true);
    setSyncStats(prev => ({ ...prev, lastSyncAttempt: new Date() }));
    
    let successCount = 0;
    let errorCount = 0;

    try {
      await processPendingActions(async (action) => {
        try {
          const success = await processAction(action);
          if (success) successCount++;
          else errorCount++;
          return success;
        } catch (err) {
          console.error(`Erreur lors du traitement de l'action ${action.id}:`, err);
          errorCount++;
          return false;
        }
      });

      // Mettre à jour les statistiques
      setSyncStats(prev => ({
        ...prev,
        successCount: prev.successCount + successCount,
        errorCount: prev.errorCount + errorCount,
        lastSuccessfulSync: successCount > 0 ? new Date() : prev.lastSuccessfulSync
      }));

      // Notification de succès
      if (successCount > 0) {
        showNotification(
          `Synchronisation terminée: ${successCount} action${successCount > 1 ? 's' : ''} synchronisée${successCount > 1 ? 's' : ''}`,
          'success'
        );
        
        if (options.onSyncSuccess) {
          options.onSyncSuccess();
        }
      }

      // Notification d'erreur partielle
      if (errorCount > 0) {
        showNotification(
          `${errorCount} action${errorCount > 1 ? 's' : ''} n'a pas pu être synchronisée${errorCount > 1 ? 's' : ''}`,
          'error'
        );
      }
    } catch (error) {
      // Erreur générale de synchronisation
      showNotification('Erreur lors de la synchronisation', 'error');
      setSyncStats(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
      
      if (options.onSyncError && error instanceof Error) {
        options.onSyncError(error);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSync7ing, hasPendingActions, processPendingActions, processAction, showNotification, options]);

  // Synchronisation automatique lorsque la connexion est rétablie
  useEffect(() => {
    if (isOnline && hasPendingActions && !isSync7ing) {
      synchronize();
    }
  }, [isOnline, hasPendingActions, isSync7ing, synchronize]);

  // Synchronisation périodique si un intervalle est spécifié
  useEffect(() => {
    if (!options.syncInterval) return;
    
    const intervalId = setInterval(() => {
      if (isOnline && hasPendingActions && !isSync7ing) {
        synchronize();
      }
    }, options.syncInterval);
    
    return () => clearInterval(intervalId);
  }, [isOnline, hasPendingActions, isSync7ing, options.syncInterval, synchronize]);

  return {
    synchronize,
    isSync7ing,
    syncStats,
    pendingActionsCount: pendingActions.length,
    isOnline
  };
}
