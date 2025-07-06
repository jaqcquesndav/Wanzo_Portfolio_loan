import { useState } from 'react';
import type { Notification } from '../../../types/notifications';

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

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearAll = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  return {
    notifications,
    markAsRead,
    clearAll
  };
}