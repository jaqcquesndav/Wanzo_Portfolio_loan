// src/services/api/shared/settings.api.ts
import { apiClient } from '../base.api';

/**
 * API pour la gestion des paramètres
 */
export const settingsApi = {
  /**
   * Récupère les paramètres de l'application
   */
  getApplicationSettings: () => {
    return apiClient.get<{
      general: {
        applicationName: string;
        logo: string;
        favicon: string;
        primaryColor: string;
        secondaryColor: string;
        tertiaryColor: string;
        currency: string;
        language: string;
        dateFormat: string;
        timeFormat: string;
      };
      security: {
        passwordPolicy: {
          minLength: number;
          requireLowercase: boolean;
          requireUppercase: boolean;
          requireNumbers: boolean;
          requireSpecialChars: boolean;
          expiryDays: number;
        };
        sessionTimeout: number;
        mfaEnabled: boolean;
        mfaMethods: string[];
      };
      notifications: {
        emailEnabled: boolean;
        pushEnabled: boolean;
        desktopEnabled: boolean;
        notificationSettings: Record<string, {
          enabled: boolean;
          channels: string[];
        }>;
      };
      integration: {
        apiKeys: Array<{
          id: string;
          name: string;
          createdAt: string;
          lastUsed?: string;
          status: 'active' | 'inactive';
        }>;
        webhooks: Array<{
          id: string;
          event: string;
          url: string;
          active: boolean;
        }>;
      };
    }>('/settings');
  },

  /**
   * Met à jour les paramètres généraux
   */
  updateGeneralSettings: (settings: {
    applicationName?: string;
    logo?: string;
    favicon?: string;
    primaryColor?: string;
    secondaryColor?: string;
    tertiaryColor?: string;
    currency?: string;
    language?: string;
    dateFormat?: string;
    timeFormat?: string;
  }) => {
    return apiClient.put<{
      success: boolean;
      settings: {
        applicationName: string;
        logo: string;
        favicon: string;
        primaryColor: string;
        secondaryColor: string;
        tertiaryColor: string;
        currency: string;
        language: string;
        dateFormat: string;
        timeFormat: string;
      };
    }>('/settings/general', settings);
  },

  /**
   * Met à jour les paramètres de sécurité
   */
  updateSecuritySettings: (settings: {
    passwordPolicy?: {
      minLength?: number;
      requireLowercase?: boolean;
      requireUppercase?: boolean;
      requireNumbers?: boolean;
      requireSpecialChars?: boolean;
      expiryDays?: number;
    };
    sessionTimeout?: number;
    mfaEnabled?: boolean;
    mfaMethods?: string[];
  }) => {
    return apiClient.put<{
      success: boolean;
      settings: {
        passwordPolicy: {
          minLength: number;
          requireLowercase: boolean;
          requireUppercase: boolean;
          requireNumbers: boolean;
          requireSpecialChars: boolean;
          expiryDays: number;
        };
        sessionTimeout: number;
        mfaEnabled: boolean;
        mfaMethods: string[];
      };
    }>('/settings/security', settings);
  },

  /**
   * Met à jour les paramètres de notification
   */
  updateNotificationSettings: (settings: {
    emailEnabled?: boolean;
    pushEnabled?: boolean;
    desktopEnabled?: boolean;
    notificationSettings?: Record<string, {
      enabled: boolean;
      channels: string[];
    }>;
  }) => {
    return apiClient.put<{
      success: boolean;
      settings: {
        emailEnabled: boolean;
        pushEnabled: boolean;
        desktopEnabled: boolean;
        notificationSettings: Record<string, {
          enabled: boolean;
          channels: string[];
        }>;
      };
    }>('/settings/notifications', settings);
  },

  /**
   * Crée une nouvelle clé API
   */
  createApiKey: (name: string, permissions?: string[]) => {
    return apiClient.post<{
      id: string;
      name: string;
      key: string; // La clé n'est retournée qu'une seule fois lors de la création
      permissions?: string[];
      createdAt: string;
      status: 'active';
    }>('/settings/api-keys', { name, permissions });
  },

  /**
   * Révoque une clé API
   */
  revokeApiKey: (id: string) => {
    return apiClient.delete(`/settings/api-keys/${id}`);
  },

  /**
   * Crée un nouveau webhook
   */
  createWebhook: (webhook: {
    event: string;
    url: string;
    active?: boolean;
    secret?: string;
  }) => {
    return apiClient.post<{
      id: string;
      event: string;
      url: string;
      active: boolean;
      createdAt: string;
    }>('/settings/webhooks', webhook);
  },

  /**
   * Met à jour un webhook
   */
  updateWebhook: (id: string, updates: {
    event?: string;
    url?: string;
    active?: boolean;
    secret?: string;
  }) => {
    return apiClient.put<{
      id: string;
      event: string;
      url: string;
      active: boolean;
      updatedAt: string;
    }>(`/settings/webhooks/${id}`, updates);
  },

  /**
   * Supprime un webhook
   */
  deleteWebhook: (id: string) => {
    return apiClient.delete(`/settings/webhooks/${id}`);
  },

  /**
   * Teste un webhook
   */
  testWebhook: (id: string) => {
    return apiClient.post<{
      success: boolean;
      message: string;
      details?: {
        statusCode?: number;
        response?: string;
        latency?: number;
      };
    }>(`/settings/webhooks/${id}/test`);
  },

  /**
   * Récupère les paramètres du système
   */
  getSystemSettings: () => {
    return apiClient.get<{
      environment: string;
      version: string;
      lastUpdate: string;
      storage: {
        totalSize: number;
        usedSize: number;
        percentage: number;
      };
      maintenance: {
        scheduled: boolean;
        startTime?: string;
        endTime?: string;
        message?: string;
      };
      limits: {
        maxUploadSize: number;
        maxUsers: number;
        maxPortfolios: number;
        apiRateLimit: number;
      };
    }>('/settings/system');
  },

  /**
   * Récupère les logs du système
   */
  getSystemLogs: (filters?: {
    level?: 'info' | 'warning' | 'error' | 'critical';
    startDate?: string;
    endDate?: string;
    service?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.level) params.append('level', filters.level);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.service) params.append('service', filters.service);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient.get<{
      data: Array<{
        id: string;
        timestamp: string;
        level: 'info' | 'warning' | 'error' | 'critical';
        service: string;
        message: string;
        details?: Record<string, unknown>;
      }>;
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/settings/system/logs?${params.toString()}`);
  },

  /**
   * Planifie une maintenance du système
   */
  scheduleSystemMaintenance: (maintenance: {
    startTime: string;
    endTime: string;
    message: string;
    notifyUsers?: boolean;
  }) => {
    return apiClient.post<{
      success: boolean;
      maintenance: {
        scheduled: boolean;
        startTime: string;
        endTime: string;
        message: string;
        createdAt: string;
        notificationSent: boolean;
      };
    }>('/settings/system/maintenance', maintenance);
  },

  /**
   * Annule une maintenance planifiée
   */
  cancelSystemMaintenance: () => {
    return apiClient.delete('/settings/system/maintenance');
  }
};
