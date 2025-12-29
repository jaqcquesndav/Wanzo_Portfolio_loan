// src/services/api/shared/user.api.ts
import { apiClient } from '../base.api';
import { FlexiblePaginatedResponse, SuccessResponse } from '../types';
import { 
  User, 
  UserSettings, 
  UserRole as UserRoleEnum, 
  UserType, 
  Permission,
  UserWithInstitutionResponse
} from '../../../types/user';
import type { InstitutionLite } from '../../../types/institution';

/**
 * Interface pour les détails utilisateur complets
 */
export interface UserDetails extends User {
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  directReports: Array<{
    id: string;
    name: string;
    position: string;
  }>;
  portfolioAssignments: Array<{
    id: string;
    name: string;
    type: 'traditional';
  }>;
  activityLog: Array<{
    action: string;
    timestamp: string;
    details?: string;
  }>;
}

/**
 * Interface pour les logs d'activité utilisateur
 */
export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
}

/**
 * Interface pour les rôles utilisateur
 */
export interface UserRoleDetails {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * API pour la gestion des utilisateurs
 */
export const userApi = {
  /**
   * Récupère tous les utilisateurs
   */
  getAllUsers: (filters?: {
    role?: UserRoleEnum;
    status?: string;
    department?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient.get<FlexiblePaginatedResponse<User>>(`/users?${params.toString()}`);
  },

  /**
   * Récupère un utilisateur par son ID
   */
  getUserById: (id: string) => {
    return apiClient.get<UserDetails>(`/users/${id}`);
  },

  /**
   * Crée un nouvel utilisateur
   */
  createUser: (user: {
    email: string;
    name?: string;
    givenName?: string;
    familyName?: string;
    picture?: string;
    phone?: string;
    role?: UserRoleEnum;
    userType?: UserType;
    permissions?: string[];
    sendInvitation?: boolean;
  }) => {
    return apiClient.post<User & { invitationSent?: boolean }>('/users', user);
  },

  /**
   * Met à jour un utilisateur
   */
  updateUser: (id: string, updates: Partial<User>) => {
    return apiClient.put<User>(`/users/${id}`, updates);
  },

  /**
   * Supprime un utilisateur
   */
  deleteUser: (id: string) => {
    return apiClient.delete(`/users/${id}`);
  },

  /**
   * Réinitialise le mot de passe d'un utilisateur
   */
  resetUserPassword: (id: string) => {
    return apiClient.post<SuccessResponse>(`/users/${id}/reset-password`);
  },

  /**
   * Assigne un portefeuille à un utilisateur
   */
  assignPortfolio: (userId: string, portfolioId: string, role: 'owner' | 'manager' | 'viewer') => {
    return apiClient.post<{
      userId: string;
      portfolioId: string;
      role: 'owner' | 'manager' | 'viewer';
      assignedAt: string;
    }>(`/users/${userId}/portfolios`, { portfolioId, role });
  },

  /**
   * Supprime l'assignation d'un portefeuille à un utilisateur
   */
  removePortfolioAssignment: (userId: string, portfolioId: string) => {
    return apiClient.delete(`/users/${userId}/portfolios/${portfolioId}`);
  },

  /**
   * Récupère l'utilisateur courant avec son institution (version lite)
   * Endpoint optimisé pour le login/dashboard (~5KB vs ~100KB+)
   * Retourne: { user, institution (lite), auth0Id, role, permissions }
   */
  getCurrentUserWithInstitution: () => {
    return apiClient.get<UserWithInstitutionResponse>('/users/me');
  },

  /**
   * Récupère le profil simple de l'utilisateur courant (sans institution)
   * Pour les cas où seules les données utilisateur sont nécessaires (~2KB)
   */
  getUserProfile: () => {
    return apiClient.get<User>('/users/profile');
  },

  /**
   * @deprecated Utiliser getCurrentUserWithInstitution() pour le nouveau format de réponse
   * Récupère l'utilisateur courant - maintenu pour rétrocompatibilité
   */
  getCurrentUser: () => {
    return apiClient.get<User>('/users/me');
  },

  /**
   * Met à jour les préférences de l'utilisateur courant
   */
  updateUserPreferences: (settings: Partial<UserSettings>) => {
    return apiClient.put<{
      id: string;
      settings: UserSettings;
      updatedAt: string;
    }>('/users/me/preferences', { settings });
  },

  /**
   * Récupère les rôles disponibles
   */
  getRoles: () => {
    return apiClient.get<UserRoleDetails[]>('/users/roles');
  },

  /**
   * Récupère les permissions disponibles
   */
  getPermissions: () => {
    return apiClient.get<Permission[]>('/users/permissions');
  },

  /**
   * Récupère l'activité des utilisateurs
   */
  getUserActivity: (filters?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient.get<FlexiblePaginatedResponse<UserActivity>>(`/users/activity?${params.toString()}`);
  },

  // ===== NOUVEAUX ENDPOINTS - Intégrité des données =====

  /**
   * Change le statut d'un utilisateur (active, inactive, suspended)
   */
  changeUserStatus: (id: string, status: 'active' | 'inactive' | 'suspended', reason?: string) => {
    return apiClient.patch<{
      id: string;
      name: string;
      status: 'active' | 'inactive' | 'suspended';
      statusReason?: string;
      updatedAt: string;
    }>(`/users/${id}/status`, { status, reason });
  },

  /**
   * Récupère l'historique des activités d'un utilisateur spécifique
   */
  getUserActivities: (userId: string) => {
    return apiClient.get<UserActivity[]>(`/users/${userId}/activities`);
  },

  /**
   * Récupère les préférences d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param category - Catégorie optionnelle (GENERAL, NOTIFICATIONS, DASHBOARD, SECURITY)
   */
  getUserPreferences: (userId: string, category?: 'GENERAL' | 'NOTIFICATIONS' | 'DASHBOARD' | 'SECURITY') => {
    const url = category 
      ? `/users/${userId}/preferences/${category}`
      : `/users/${userId}/preferences`;
    return apiClient.get<UserPreference[]>(url);
  },

  /**
   * Définit ou met à jour une préférence utilisateur
   */
  setUserPreference: (userId: string, preference: {
    category: 'GENERAL' | 'NOTIFICATIONS' | 'DASHBOARD' | 'SECURITY';
    key: string;
    value: string;
  }) => {
    return apiClient.post<UserPreference>(`/users/${userId}/preferences`, preference);
  },

  /**
   * Supprime une préférence utilisateur
   */
  deleteUserPreference: (userId: string, preferenceId: string) => {
    return apiClient.delete(`/users/${userId}/preferences/${preferenceId}`);
  },

  /**
   * Récupère toutes les sessions actives d'un utilisateur
   */
  getUserSessions: (userId: string) => {
    return apiClient.get<UserSession[]>(`/users/${userId}/sessions`);
  },

  /**
   * Termine une session spécifique
   */
  terminateSession: (userId: string, sessionId: string) => {
    return apiClient.delete<SuccessResponse>(`/users/${userId}/sessions/${sessionId}`);
  },

  /**
   * Termine toutes les sessions d'un utilisateur
   * @param exceptCurrent - Si true, conserve la session courante
   */
  terminateAllSessions: (userId: string, exceptCurrent: boolean = false) => {
    const params = exceptCurrent ? '?exceptCurrent=true' : '';
    return apiClient.delete<SuccessResponse>(`/users/${userId}/sessions${params}`);
  }
};

/**
 * Interface pour les préférences utilisateur
 */
export interface UserPreference {
  id: string;
  userId: string;
  category: 'GENERAL' | 'NOTIFICATIONS' | 'DASHBOARD' | 'SECURITY';
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour les sessions utilisateur
 */
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  deviceType: string;
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
}