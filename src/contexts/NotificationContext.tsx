import React, { createContext, useState } from 'react';
import { NotificationType, Notification } from '../types/notifications';
import NotificationContainer from '../components/notifications/NotificationContainer';
import { notificationsApi } from '../services/api/shared/notifications.api';

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = async (message: string, type: NotificationType, duration = 5000) => {
    // Génération d'un ID local temporaire
    const id = Math.random().toString(36).substring(2);
    const notification: Notification = { 
      id, 
      type, 
      message, 
      duration,
      date: new Date().toISOString(),
      read: false
    };
    
    // Ajout immédiat pour l'UI (optimistic update)
    setNotifications(prev => [...prev, notification]);

    try {
      // Tente de créer la notification via l'API
      const response = await notificationsApi.createNotification({
        type,
        message,
        duration
      });
      
      // Remplace la notification temporaire par celle de l'API
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, id: response.id } : n)
      );
      
      // Supprime après la durée spécifiée
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(response.id);
        }, duration);
      }
    } catch (err) {
      console.error('Erreur lors de la création de la notification:', err);
      
      // Si l'API échoue, garde la notification locale et la supprime après la durée
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    }
  };

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

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}