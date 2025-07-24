import { useContext } from 'react';
import { NotificationContext } from './NotificationContext';

/**
 * Hook pour utiliser le contexte de notification
 * @returns Les valeurs et fonctions du contexte de notification
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
