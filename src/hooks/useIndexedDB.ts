// src/hooks/useIndexedDB.ts
/**
 * Hook React pour utiliser IndexedDB de manière déclarative
 * 
 * Fournit:
 * - Initialisation automatique de la base de données
 * - État de synchronisation en temps réel
 * - Gestion du mode offline/online
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  initializeIndexedDB, 
  isIndexedDBSupported,
  sync,
  hasPendingSync,
  getPendingSyncCount,
  startAutoSync,
  stopAutoSync,
  stores,
} from '../services/storage/indexedDB';

interface UseIndexedDBReturn {
  isInitialized: boolean;
  isOnline: boolean;
  isSupported: boolean;
  pendingSyncCount: number;
  hasPendingSync: boolean;
  error: Error | null;
  
  // Actions
  manualSync: () => Promise<{ success: number; failed: number }>;
  refreshPendingCount: () => Promise<void>;
  
  // Stores
  stores: typeof stores;
}

export function useIndexedDB(): UseIndexedDBReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [hasPending, setHasPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const isSupported = isIndexedDBSupported();

  // Rafraîchir le compteur de synchronisation
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingSyncCount();
      const pending = await hasPendingSync();
      setPendingSyncCount(count);
      setHasPending(pending);
    } catch (err) {
      console.error('Erreur de récupération du compteur sync:', err);
    }
  }, []);

  // Synchronisation manuelle
  const manualSync = useCallback(async () => {
    const result = await sync();
    await refreshPendingCount();
    return result;
  }, [refreshPendingCount]);

  // Initialisation
  useEffect(() => {
    if (!isSupported) {
      setError(new Error('IndexedDB n\'est pas supporté par ce navigateur'));
      return;
    }

    const init = async () => {
      try {
        await initializeIndexedDB();
        setIsInitialized(true);
        
        // Démarrer l'auto-sync
        startAutoSync();
        
        // Rafraîchir le compteur initial
        await refreshPendingCount();
        
      } catch (err) {
        console.error('Erreur d\'initialisation IndexedDB:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    init();

    // Cleanup
    return () => {
      stopAutoSync();
    };
  }, [isSupported, refreshPendingCount]);

  // Écouter les changements de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Synchroniser automatiquement quand on revient en ligne
      manualSync().catch(console.error);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [manualSync]);

  // Rafraîchir le compteur périodiquement
  useEffect(() => {
    if (!isInitialized) return;

    const intervalId = setInterval(() => {
      refreshPendingCount();
    }, 10000); // Toutes les 10 secondes

    return () => clearInterval(intervalId);
  }, [isInitialized, refreshPendingCount]);

  return {
    isInitialized,
    isOnline,
    isSupported,
    pendingSyncCount,
    hasPendingSync: hasPending,
    error,
    manualSync,
    refreshPendingCount,
    stores,
  };
}

export default useIndexedDB;
