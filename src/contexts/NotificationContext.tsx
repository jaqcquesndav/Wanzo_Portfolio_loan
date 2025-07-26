import React, { createContext, useState } from 'react';
import { NotificationType, Notification } from '../types/notifications';
import NotificationContainer from '../components/notifications/NotificationContainer';
import { notificationsApi } from '../services/api/shared/notifications.api';

// R�exporter le hook useNotification depuis le fichier d�di�
export { useNotification } from './useNotification';

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // D�clarer removeNotification avant de l'utiliser
  const removeNotification = async (id: string) => {
    try {
      // Tente de supprimer la notification via l'API
      await notificationsApi.deleteNotification(id);
    } catch (err) {
      console.error('Erreur lors de la suppression de la notification:', err);
    } finally {
      // Supprime de l'UI dans tous les cas
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }
  };

  const showNotification = async (message: string, type: NotificationType, duration = 5000) => {
    // G�n�ration d'un ID local temporaire
    const id = Math.random().toString(36).substring(2);
    const notification: Notification = { 
      id, 
      type, 
      message, 
      duration,
      date: new Date().toISOString(),
      read: false
    };
    
    // Ajout imm�diat pour l'UI (optimistic update)
    setNotifications(prev => [...prev, notification]);

    try {
      // Tente de cr�er la notification via l'API
      const response = await notificationsApi.createNotification({
        type,
        message,
        duration
      });
      
      // Remplace la notification temporaire par celle de l'API
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, id: response.id } : n)
      );
      
      // Supprime apr�s la dur�e sp�cifi�e
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(response.id);
        }, duration);
      }
    } catch (err) {
      console.error('Erreur lors de la cr�ation de la notification:', err);
      
      // Si l'API �choue, garde la notification locale et la supprime apr�s la dur�e
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}
