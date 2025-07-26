// src/services/api/shared/users.api.ts
import { apiClient } from '../base.api';
import { SuccessResponse } from '../types';

/**
 * API pour la gestion des utilisateurs (fonctionnalités de sécurité)
 */
export const usersApi = {
  /**
   * Change le mot de passe de l'utilisateur courant
   */
  changePassword: (currentPassword: string, newPassword: string) => {
    return apiClient.post<SuccessResponse>('/users/me/password', {
      currentPassword,
      newPassword
    });
  },

  /**
   * Envoie un code pour l'authentification à deux facteurs
   */
  sendTwoFactorCode: () => {
    return apiClient.post<SuccessResponse>('/users/me/2fa/send-code');
  },

  /**
   * Vérifie le code d'authentification à deux facteurs
   */
  verifyTwoFactorCode: (code: string) => {
    return apiClient.post<SuccessResponse>('/users/me/2fa/verify', { code });
  },

  /**
   * Active l'authentification à deux facteurs
   */
  enableTwoFactor: () => {
    return apiClient.post<SuccessResponse>('/users/me/2fa/enable');
  },

  /**
   * Désactive l'authentification à deux facteurs
   */
  disableTwoFactor: () => {
    return apiClient.post<SuccessResponse>('/users/me/2fa/disable');
  }
};
