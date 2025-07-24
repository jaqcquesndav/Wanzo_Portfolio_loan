// src/hooks/useConnectivity.ts
import { useContext } from 'react';
import { ConnectivityContext } from '../contexts/ConnectivityContext';

/**
 * Hook pour accéder au contexte de connectivité
 * Permet de gérer l'état de connexion et les actions en attente
 */
export const useConnectivity = () => {
  const context = useContext(ConnectivityContext);
  if (context === undefined) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return context;
};
