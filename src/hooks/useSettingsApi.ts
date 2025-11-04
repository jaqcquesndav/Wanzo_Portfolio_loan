// src/hooks/useSettingsApi.ts
// Hook pour accéder aux paramètres de l'application via l'API backend

import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../services/api/shared/settings.api';
import { useNotification } from '../contexts/useNotification';

/**
 * Types pour les paramètres de l'application (seulement ce qui est vraiment utilisé)
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
