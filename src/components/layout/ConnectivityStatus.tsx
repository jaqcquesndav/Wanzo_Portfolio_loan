// src/components/layout/ConnectivityStatus.tsx
import React from 'react';
import { useConnectivity } from '../../hooks/useConnectivity';
import { useSyncManager } from '../../hooks/useSyncManager';
import { PendingAction } from '../../contexts/ConnectivityContext';
import { apiClient } from '../../services/api/base.api';

interface ConnectivityStatusProps {
  minimal?: boolean;
}

/**
 * Composant qui affiche l'état de la connexion et permet de lancer une synchronisation
 */
export const ConnectivityStatus: React.FC<ConnectivityStatusProps> = ({ minimal = false }) => {
  const { isOnline, hasPendingActions, pendingActions } = useConnectivity();
  
  // Fonction de traitement des actions en attente
  const processAction = async (action: PendingAction): Promise<boolean> => {
    try {
      // Traitement selon le type d'action
      switch (action.type) {
        case 'create':
          await apiClient.post(`/${action.resourceId}`, action.payload);
          return true;
          
        case 'update':
          await apiClient.put(`/${action.resourceId}`, action.payload);
          return true;
          
        case 'delete':
          await apiClient.delete(`/${action.resourceId}`);
          return true;
          
        case 'status_change':
          await apiClient.put(`/${action.resourceId}/status`, action.payload);
          return true;
          
        default:
          console.warn(`Type d'action non pris en charge: ${action.type}`);
          return false;
      }
    } catch (error) {
      console.error(`Erreur lors du traitement de l'action ${action.type}:`, error);
      return false;
    }
  };
  
  const { synchronize, isSync7ing, pendingActionsCount } = useSyncManager(processAction, {
    syncInterval: 60000, // Synchronisation automatique toutes les minutes
  });

  // Affichage minimal (pour la barre d'état)
  if (minimal) {
    return (
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs font-medium">
          {isOnline ? 'En ligne' : 'Hors ligne'}
        </span>
        {hasPendingActions && (
          <button
            onClick={() => synchronize()}
            disabled={!isOnline || isSync7ing}
            className="text-xs text-blue-500 hover:underline disabled:opacity-50 disabled:hover:no-underline"
          >
            {isSync7ing ? 'Synchronisation...' : `Synchroniser (${pendingActionsCount})`}
          </button>
        )}
      </div>
    );
  }

  // Affichage complet
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <h3 className="text-lg font-medium">
            {isOnline ? 'Connecté' : 'Mode hors ligne'}
          </h3>
        </div>
        
        {hasPendingActions && (
          <button
            onClick={() => synchronize()}
            disabled={!isOnline || isSync7ing}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500"
          >
            {isSync7ing ? 'Synchronisation en cours...' : `Synchroniser (${pendingActionsCount})`}
          </button>
        )}
      </div>
      
      {hasPendingActions && (
        <div className="mt-2">
          <h4 className="text-sm font-medium mb-2">Actions en attente:</h4>
          <div className="max-h-60 overflow-y-auto">
            <ul className="text-xs space-y-1">
              {pendingActions.map(action => (
                <li key={action.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium capitalize">{action.type}</span>
                    <span className="text-gray-500">
                      {new Date(action.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="truncate">
                    ID: {action.resourceId}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {!hasPendingActions && isOnline && (
        <p className="text-sm text-gray-500">
          Toutes les données sont synchronisées.
        </p>
      )}
      
      {!isOnline && (
        <p className="text-sm text-gray-500">
          Les modifications seront synchronisées automatiquement lorsque la connexion sera rétablie.
        </p>
      )}
    </div>
  );
};
