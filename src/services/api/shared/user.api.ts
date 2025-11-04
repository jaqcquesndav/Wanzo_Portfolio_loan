// src/services/api/shared/user.api.ts
import { apiClient } from '../base.api';
import { FlexiblePaginatedResponse, SuccessResponse } from '../types';
import { 
  User, 
  UserSettings, 
  UserRole as UserRoleEnum, 
  UserType, 
  Permission 
} from '../../../types/user';

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
   * Récupère le profil de l'utilisateur courant
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
  }
};