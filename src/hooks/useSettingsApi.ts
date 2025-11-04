// src/hooks/useSettingsApi.ts
// Hook pour accéder aux paramètres de l'application via l'API backend

import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../services/api/shared/settings.api';
import { useNotification } from '../contexts/useNotification';

/**
 * Types pour les paramètres de l'application
 */
interface ApplicationSettings {
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
}

interface SystemSettings {
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
}

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  service: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Hook principal pour la gestion des paramètres de l'application
 */
export function useApplicationSettings() {
  const [settings, setSettings] = useState<ApplicationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Charger les paramètres de l'application
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsApi.getApplicationSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des paramètres';
      setError(errorMessage);
      console.error('Erreur paramètres:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour les paramètres généraux
  const updateGeneralSettings = useCallback(async (updates: {
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
    try {
      setError(null);
      const response = await settingsApi.updateGeneralSettings(updates);
      setSettings(prev => prev ? { ...prev, general: response.settings } : null);
      showNotification('Paramètres généraux mis à jour avec succès', 'success');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour des paramètres généraux';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur mise à jour paramètres généraux:', err);
      throw err;
    }
  }, [showNotification]);

  // Mettre à jour les paramètres de sécurité
  const updateSecuritySettings = useCallback(async (updates: {
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
    try {
      setError(null);
      const response = await settingsApi.updateSecuritySettings(updates);
      setSettings(prev => prev ? { ...prev, security: response.settings } : null);
      showNotification('Paramètres de sécurité mis à jour avec succès', 'success');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour des paramètres de sécurité';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur mise à jour paramètres sécurité:', err);
      throw err;
    }
  }, [showNotification]);

  // Mettre à jour les paramètres de notification
  const updateNotificationSettings = useCallback(async (updates: {
    emailEnabled?: boolean;
    pushEnabled?: boolean;
    desktopEnabled?: boolean;
    notificationSettings?: Record<string, {
      enabled: boolean;
      channels: string[];
    }>;
  }) => {
    try {
      setError(null);
      const response = await settingsApi.updateNotificationSettings(updates);
      setSettings(prev => prev ? { ...prev, notifications: response.settings } : null);
      showNotification('Paramètres de notification mis à jour avec succès', 'success');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour des paramètres de notification';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur mise à jour paramètres notification:', err);
      throw err;
    }
  }, [showNotification]);

  // Charger les paramètres au montage du composant
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    updateGeneralSettings,
    updateSecuritySettings,
    updateNotificationSettings,
    refetch: loadSettings
  };
}

/**
 * Hook pour la gestion des clés API
 */
export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<Array<{
    id: string;
    name: string;
    createdAt: string;
    lastUsed?: string;
    status: 'active' | 'inactive';
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Créer une nouvelle clé API
  const createApiKey = useCallback(async (name: string, permissions?: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const apiKey = await settingsApi.createApiKey(name, permissions);
      setApiKeys(prev => [...prev, {
        id: apiKey.id,
        name: apiKey.name,
        createdAt: apiKey.createdAt,
        status: apiKey.status
      }]);
      showNotification('Clé API créée avec succès', 'success');
      return apiKey;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la clé API';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur création clé API:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Révoquer une clé API
  const revokeApiKey = useCallback(async (id: string) => {
    try {
      setError(null);
      await settingsApi.revokeApiKey(id);
      setApiKeys(prev => prev.filter(key => key.id !== id));
      showNotification('Clé API révoquée avec succès', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la révocation de la clé API';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur révocation clé API:', err);
      throw err;
    }
  }, [showNotification]);

  return {
    apiKeys,
    loading,
    error,
    createApiKey,
    revokeApiKey
  };
}

/**
 * Hook pour la gestion des webhooks
 */
export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<Array<{
    id: string;
    event: string;
    url: string;
    active: boolean;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Créer un nouveau webhook
  const createWebhook = useCallback(async (webhook: {
    event: string;
    url: string;
    active?: boolean;
    secret?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const newWebhook = await settingsApi.createWebhook(webhook);
      setWebhooks(prev => [...prev, newWebhook]);
      showNotification('Webhook créé avec succès', 'success');
      return newWebhook;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du webhook';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur création webhook:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Mettre à jour un webhook
  const updateWebhook = useCallback(async (id: string, updates: {
    event?: string;
    url?: string;
    active?: boolean;
    secret?: string;
  }) => {
    try {
      setError(null);
      const updatedWebhook = await settingsApi.updateWebhook(id, updates);
      setWebhooks(prev => prev.map(webhook => 
        webhook.id === id ? updatedWebhook : webhook
      ));
      showNotification('Webhook mis à jour avec succès', 'success');
      return updatedWebhook;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du webhook';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur mise à jour webhook:', err);
      throw err;
    }
  }, [showNotification]);

  // Supprimer un webhook
  const deleteWebhook = useCallback(async (id: string) => {
    try {
      setError(null);
      await settingsApi.deleteWebhook(id);
      setWebhooks(prev => prev.filter(webhook => webhook.id !== id));
      showNotification('Webhook supprimé avec succès', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du webhook';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur suppression webhook:', err);
      throw err;
    }
  }, [showNotification]);

  // Tester un webhook
  const testWebhook = useCallback(async (id: string) => {
    try {
      setError(null);
      const result = await settingsApi.testWebhook(id);
      if (result.success) {
        showNotification('Webhook testé avec succès', 'success');
      } else {
        showNotification('Échec du test du webhook', 'error');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du test du webhook';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur test webhook:', err);
      throw err;
    }
  }, [showNotification]);

  return {
    webhooks,
    loading,
    error,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook
  };
}

/**
 * Hook pour les paramètres système
 */
export function useSystemSettings() {
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [logsPagination, setLogsPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Charger les paramètres système
  const loadSystemSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsApi.getSystemSettings();
      setSystemSettings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des paramètres système';
      setError(errorMessage);
      console.error('Erreur paramètres système:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les logs système
  const loadSystemLogs = useCallback(async (filters?: {
    level?: 'info' | 'warning' | 'error' | 'critical';
    startDate?: string;
    endDate?: string;
    service?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLogsLoading(true);
      setError(null);
      const response = await settingsApi.getSystemLogs(filters);
      setLogs(response.data);
      setLogsPagination({
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit,
        totalPages: response.meta.totalPages
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des logs système';
      setError(errorMessage);
      console.error('Erreur logs système:', err);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  // Planifier une maintenance
  const scheduleMaintenance = useCallback(async (maintenance: {
    startTime: string;
    endTime: string;
    message: string;
    notifyUsers?: boolean;
  }) => {
    try {
      setError(null);
      const response = await settingsApi.scheduleSystemMaintenance(maintenance);
      setSystemSettings(prev => prev ? {
        ...prev,
        maintenance: response.maintenance
      } : null);
      showNotification('Maintenance planifiée avec succès', 'success');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la planification de la maintenance';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur planification maintenance:', err);
      throw err;
    }
  }, [showNotification]);

  // Annuler une maintenance planifiée
  const cancelMaintenance = useCallback(async () => {
    try {
      setError(null);
      await settingsApi.cancelSystemMaintenance();
      setSystemSettings(prev => prev ? {
        ...prev,
        maintenance: { scheduled: false }
      } : null);
      showNotification('Maintenance annulée avec succès', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'annulation de la maintenance';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur annulation maintenance:', err);
      throw err;
    }
  }, [showNotification]);

  // Charger les paramètres système au montage du composant
  useEffect(() => {
    loadSystemSettings();
  }, [loadSystemSettings]);

  return {
    systemSettings,
    logs,
    logsPagination,
    loading,
    logsLoading,
    error,
    loadSystemLogs,
    scheduleMaintenance,
    cancelMaintenance,
    refetch: loadSystemSettings
  };
}
