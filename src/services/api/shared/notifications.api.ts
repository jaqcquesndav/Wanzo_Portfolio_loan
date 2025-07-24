import { apiClient } from '../base.api';
import { API_ENDPOINTS } from '../endpoints';
import type { Notification } from '../../../types/notifications';

export interface NotificationFilters {
  read?: boolean;
  type?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface NotificationResponse {
  id: string;
  message: string;
  type: string;
  date: string;
  read: boolean;
}

export interface NotificationsServiceResponse {
  notifications: NotificationResponse[];
  total: number;
  unreadCount: number;
}

/**
 * Service API pour la gestion des notifications
 */
export const notificationsApi = {
  /**
   * Récupère toutes les notifications pour l'utilisateur courant
   * @param filters Filtres optionnels pour les notifications
   */
  async getNotifications(filters?: NotificationFilters): Promise<NotificationsServiceResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.read !== undefined) queryParams.append('read', String(filters.read));
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.limit) queryParams.append('limit', String(filters.limit));
    }
    
    const endpoint = `${API_ENDPOINTS.settings.notifications}?${queryParams.toString()}`;
    return apiClient.request<NotificationsServiceResponse>(endpoint);
  },

  /**
   * Marque une notification comme lue
   * @param id ID de la notification
   */
  async markAsRead(id: string): Promise<void> {
    const endpoint = `${API_ENDPOINTS.settings.notifications}/${id}/read`;
    return apiClient.request(endpoint, { 
      url: endpoint,
      method: 'PUT' 
    });
  },

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<void> {
    const endpoint = `${API_ENDPOINTS.settings.notifications}/read-all`;
    return apiClient.request(endpoint, { 
      url: endpoint,
      method: 'PUT' 
    });
  },
  
  /**
   * Supprime une notification
   * @param id ID de la notification
   */
  async deleteNotification(id: string): Promise<void> {
    const endpoint = `${API_ENDPOINTS.settings.notifications}/${id}`;
    return apiClient.request(endpoint, { 
      url: endpoint,
      method: 'DELETE' 
    });
  },
  
  /**
   * Envoie une nouvelle notification
   * @param notification Données de la notification
   */
  async createNotification(notification: Omit<Notification, 'id' | 'date' | 'read'>): Promise<NotificationResponse> {
    const endpoint = API_ENDPOINTS.settings.notifications;
    // Ajoute automatiquement la date et le statut de lecture
    const notificationWithDate = {
      ...notification,
      date: new Date().toISOString(),
      read: false
    };
    
    return apiClient.request<NotificationResponse>(endpoint, {
      url: endpoint,
      method: 'POST',
      body: JSON.stringify(notificationWithDate)
    });
  }
};
