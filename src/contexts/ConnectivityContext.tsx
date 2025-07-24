// src/contexts/ConnectivityContext.tsx
import React, { createContext, useState, useEffect } from 'react';

export interface PendingAction {
  id: string;
  type: string;
  resourceId: string;
  payload?: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

interface ConnectivityContextType {
  isOnline: boolean;
  pendingActions: PendingAction[];
  addPendingAction: (action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) => string;
  removePendingAction: (id: string) => void;
  getPendingActionsByType: (type: string) => PendingAction[];
  hasPendingActions: boolean;
  processPendingActions: (callback: (action: PendingAction) => Promise<boolean>) => Promise<void>;
}

export const ConnectivityContext = createContext<ConnectivityContextType | undefined>(undefined);

// Clé de stockage local pour les actions en attente
const PENDING_ACTIONS_STORAGE_KEY = 'wanzo_pending_actions';

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>(() => {
    // Récupérer les actions en attente stockées
    const storedActions = localStorage.getItem(PENDING_ACTIONS_STORAGE_KEY);
    return storedActions ? JSON.parse(storedActions) : [];
  });

  // Mettre à jour l'état de la connexion
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

  // Persister les actions en attente dans le stockage local
  useEffect(() => {
    localStorage.setItem(PENDING_ACTIONS_STORAGE_KEY, JSON.stringify(pendingActions));
  }, [pendingActions]);

  // Ajouter une action en attente
  const addPendingAction = (action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAction: PendingAction = {
      ...action,
      id,
      timestamp: Date.now(),
      retryCount: 0
    };

    setPendingActions(prev => [...prev, newAction]);
    return id;
  };

  // Supprimer une action en attente
  const removePendingAction = (id: string) => {
    setPendingActions(prev => prev.filter(action => action.id !== id));
  };

  // Obtenir les actions en attente par type
  const getPendingActionsByType = (type: string) => {
    return pendingActions.filter(action => action.type === type);
  };

  // Traiter toutes les actions en attente
  const processPendingActions = async (callback: (action: PendingAction) => Promise<boolean>) => {
    if (!isOnline || pendingActions.length === 0) return;

    const actionsCopy = [...pendingActions];
    const results: { id: string; success: boolean }[] = [];

    for (const action of actionsCopy) {
      try {
        const success = await callback(action);
        results.push({ id: action.id, success });
      } catch (error) {
        console.error(`Échec du traitement de l'action en attente ${action.id}:`, error);
        
        // Incrémenter le compteur de tentatives
        setPendingActions(prev => 
          prev.map(a => 
            a.id === action.id 
              ? { ...a, retryCount: a.retryCount + 1 } 
              : a
          )
        );
        
        results.push({ id: action.id, success: false });
      }
    }

    // Supprimer les actions réussies
    const successfulIds = results.filter(r => r.success).map(r => r.id);
    if (successfulIds.length > 0) {
      setPendingActions(prev => prev.filter(action => !successfulIds.includes(action.id)));
    }
  };

  return (
    <ConnectivityContext.Provider
      value={{
        isOnline,
        pendingActions,
        addPendingAction,
        removePendingAction,
        getPendingActionsByType,
        hasPendingActions: pendingActions.length > 0,
        processPendingActions
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
};
