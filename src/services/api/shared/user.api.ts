// src/services/api/shared/user.api.ts
import { apiClient } from '../base.api';
import { PaginatedResponse, SuccessResponse } from '../types';

/**
 * Interface pour les données utilisateur
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  position: string;
  phone?: string;
  profileImageUrl?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface pour les détails utilisateur complets
 */
export interface UserDetails extends User {
  permissions: string[];
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  directReports: Array<{
    id: string;
    firstName: string;
    lastName: string;
    position: string;
  }>;
  portfolioAssignments: Array<{
    id: string;
    name: string;
    type: 'traditional' | 'investment' | 'leasing';
  }>;
  activityLog: Array<{
    action: string;
    timestamp: string;
    details?: string;
  }>;
}

/**
 * Interface pour le profil utilisateur courant
 */
export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  position: string;
  phone?: string;
  profileImageUrl?: string;
  permissions: string[];
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      desktop: boolean;
    };
    dashboardLayout?: Record<string, unknown>;
  };
  lastLogin?: string;
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
export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interface pour les permissions
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

/**
 * API pour la gestion des utilisateurs
 */
export const userApi = {
  /**
   * Récupère tous les utilisateurs
   */
  getAllUsers: (filters?: {
    role?: string;
    status?: 'active' | 'inactive' | 'pending';
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

    return apiClient.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
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
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    position: string;
    phone?: string;
    profileImageUrl?: string;
    managerId?: string;
    status?: 'active' | 'inactive' | 'pending';
    permissions?: string[];
    sendInvitation?: boolean;
  }) => {
    return apiClient.post<User & { invitationSent: boolean }>('/users', user);
  },

  /**
   * Met à jour un utilisateur
   */
  updateUser: (id: string, updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    department?: string;
    position?: string;
    phone?: string;
    profileImageUrl?: string;
    managerId?: string;
    status?: 'active' | 'inactive' | 'pending';
    permissions?: string[];
  }) => {
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
      assigned_at: string;
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
    return apiClient.get<CurrentUser>('/users/me');
  },

  /**
   * Met à jour les préférences de l'utilisateur courant
   */
  updateUserPreferences: (preferences: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      desktop?: boolean;
    };
    dashboardLayout?: Record<string, unknown>;
  }) => {
    return apiClient.put<{
      id: string;
      preferences: CurrentUser['preferences'];
      updated_at: string;
    }>('/users/me/preferences', preferences);
  },

  /**
   * Récupère les rôles disponibles
   */
  getRoles: () => {
    return apiClient.get<UserRole[]>('/users/roles');
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

    return apiClient.get<PaginatedResponse<UserActivity>>(`/users/activity?${params.toString()}`);
  }
};