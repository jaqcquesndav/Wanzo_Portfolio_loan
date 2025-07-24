import { useState, useEffect } from 'react';
import type { Notification } from '../../../types/notifications';
import { notificationsApi, NotificationFilters } from '../../../services/api/shared/notifications.api';

// Utilisation de mock en fallback si l'API n'est pas disponible
const mockNotifications: Notification[] = [
  {
    id: '1',
    message: 'Nouvelle opération en attente de validation',
    type: 'info',
    date: new Date().toISOString(),
    read: false
  },
  {
    id: '2',
    message: 'Votre demande de financement a été approuvée',
    type: 'success',
    date: new Date(Date.now() - 3600000).toISOString(),
    read: false
  }
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async (filters?: NotificationFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await notificationsApi.getNotifications(filters);
      setNotifications(response.notifications as Notification[]);
    } catch (err) {
      console.error('Erreur lors de la récupération des notifications:', err);
      setError('Impossible de récupérer les notifications');
      // Fallback sur les données mockées en cas d'erreur
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Erreur lors du marquage de la notification comme lue:', err);
      // Fallback pour UI en cas d'échec de l'API
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    }
  };

  const clearAll = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', err);
      // Fallback pour UI en cas d'échec de l'API
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    }
  };

  return {
    notifications,
    loading,
    error,
    markAsRead,
    clearAll,
    refreshNotifications: fetchNotifications
  };
}