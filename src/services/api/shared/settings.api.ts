// src/services/api/shared/settings.api.ts
import { apiClient } from '../base.api';

/**
 * API pour la gestion des paramètres d'application (seulement ce qui est vraiment utilisé)
 */
export const settingsApi = {
  /**
   * Récupère les paramètres de l'application en appelant les 3 endpoints catégoriels.
   * Le backend retourne { success: true, data: {...} } pour chaque catégorie.
   */
  getApplicationSettings: async () => {
    const [general, security, notifications] = await Promise.all([
      apiClient.get<{
        applicationName: string;
        logo?: string;
        favicon?: string;
        primaryColor: string;
        secondaryColor: string;
        tertiaryColor: string;
        currency: string;
        language: string;
        dateFormat: string;
        timeFormat: string;
      }>('/settings/general'),
      apiClient.get<{
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
      }>('/settings/security'),
      apiClient.get<{
        emailEnabled: boolean;
        pushEnabled: boolean;
        desktopEnabled: boolean;
        notificationSettings: Record<string, {
          enabled: boolean;
          channels: string[];
        }>;
      }>('/settings/notifications'),
    ]);
    return { general, security, notifications };
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
      applicationName: string;
      logo?: string;
      favicon?: string;
      primaryColor: string;
      secondaryColor: string;
      tertiaryColor: string;
      currency: string;
      language: string;
      dateFormat: string;
      timeFormat: string;
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
      emailEnabled: boolean;
      pushEnabled: boolean;
      desktopEnabled: boolean;
      notificationSettings: Record<string, {
        enabled: boolean;
        channels: string[];
      }>;
    }>('/settings/notifications', settings);
  }
};