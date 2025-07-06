import { API_CONFIG } from '../../config/api';
import { apiClient } from './base.api';
import { emailService } from '../email/emailService';
import { generateSecurePassword } from '../../utils/password';
import type { User } from '../../types/users';

export const usersApi = {
  create: async (userData: {
    email: string;
    name: string;
    role: 'admin' | 'user';
    phone?: string;
  }): Promise<User> => {
    const password = generateSecurePassword();
    const response = await apiClient.post<User>('/users', {
      ...userData,
      password
    });

    await emailService.sendNewUserCredentials(
      userData.name,
      userData.email,
      password
    );

    return response;
  },

  resetPassword: async (userId: string): Promise<void> => {
    const password = generateSecurePassword();
    await apiClient.post(`/users/${userId}/reset-password`, { password });

    const user = await this.getById(userId);
    await emailService.sendPasswordReset(user.name, user.email, password);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/users/change-password', {
      currentPassword,
      newPassword
    });
  },

  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${userId}`, data);
    return response;
  },

  getById: async (userId: string): Promise<User> => {
    return apiClient.get<User>(`/users/${userId}`);
  },

  // Nouvelles méthodes pour l'authentification à deux facteurs
  sendTwoFactorCode: async (): Promise<void> => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await apiClient.post('/users/2fa/send-code', { code });
    // Dans un cas réel, le code serait envoyé par email via le backend
  },

  verifyTwoFactorCode: async (code: string): Promise<boolean> => {
    const response = await apiClient.post('/users/2fa/verify-code', { code });
    return response.verified;
  }
};