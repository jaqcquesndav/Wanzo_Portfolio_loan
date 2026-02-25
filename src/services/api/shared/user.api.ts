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
   * Récupère tous les utilisateurs de l'institution (admin only)
   * GET /admin/users
   * institutionId injecté depuis le JWT, non envoyé dans la requête
   */
  getAllUsers: (filters?: {
    role?: UserRoleEnum;
    status?: string;
    search?: string;
    createdAfter?: string;
    createdBefore?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.role)          params.append('role',          filters.role);
    if (filters?.status)        params.append('status',        filters.status);
    if (filters?.search)        params.append('search',        filters.search);
    if (filters?.createdAfter)  params.append('createdAfter',  filters.createdAfter);
    if (filters?.createdBefore) params.append('createdBefore', filters.createdBefore);
    if (filters?.page)          params.append('page',          filters.page.toString());
    if (filters?.limit)         params.append('limit',         filters.limit.toString());

    return apiClient.get<FlexiblePaginatedResponse<User>>(`/admin/users?${params.toString()}`);
  },

  /**
   * Récupère un utilisateur par son ID
   */
  getUserById: (id: string) => {
    return apiClient.get<UserDetails>(`/users/${id}`);
  },

  /**
   * Crée un utilisateur pour l'institution de l'admin connecté (admin only)
   * POST /admin/users
   *
   * Règles critiques du backend:
   *  - institutionId est forcé depuis le JWT (non injectable via le body)
   *  - Rôles interdits: 'admin', 'super_admin' → 400
   *  - Envoie automatiquement un email reset-password via Auth0 après création
   */
  createUser: (user: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: UserRoleEnum;
    status?: 'active' | 'inactive' | 'suspended' | 'pending';
    department?: string;
    language?: 'fr' | 'en';
    userType?: UserType;
    bio?: string;
    settings?: UserSettings;
    permissions?: string[];
    metadata?: Record<string, unknown>;
  }) => {
    return apiClient.post<User>('/admin/users', user);
  },

  /**
   * Met à jour un utilisateur
   */
  updateUser: (id: string, updates: Partial<User>) => {
    return apiClient.put<User>(`/users/${id}`, updates);
  },

  /**
   * Supprime un utilisateur de l'institution (admin only)
   * DELETE /admin/users/:id
   */
  deleteUser: (id: string) => {
    return apiClient.delete(`/admin/users/${id}`);
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
   * Met à jour les préférences de l'utilisateur courant
   */
  updateUserPreferences: (settings: Partial<UserSettings>) => {
    return apiClient.put<{
      id: string;
      settings: UserSettings;
      updatedAt: string;
    }>('/users/me/preferences', { settings });
  },

  // ===== VÉRIFICATION D'IDENTITÉ =====

  /**
   * Soumet les documents de vérification d'identité
   * Les URLs doivent être des URLs Cloudinary valides
   */
  submitVerification: (data: {
    idType: 'passport' | 'national_id' | 'driver_license' | 'voter_card' | 'other';
    idNumber: string;
    idDocument: string;  // URL Cloudinary du recto
    idDocumentBack?: string;  // URL Cloudinary du verso (optionnel)
  }) => {
    return apiClient.post<{
      id: string;
      idStatus: 'pending' | 'verified' | 'rejected';
      verificationSubmittedAt: string;
      message: string;
    }>('/users/me/verification', data);
  },

  /**
   * Approuve ou rejette une vérification d'identité (admin uniquement)
   */
  reviewVerification: (userId: string, data: {
    action: 'approve' | 'reject';
    rejectionReason?: string;
    verifiedBy: string;  // ID de l'admin
  }) => {
    return apiClient.post<{
      id: string;
      idStatus: 'verified' | 'rejected';
      verificationReviewedAt: string;
      verificationReviewedBy: string;
      rejectionReason?: string;
    }>(`/users/${userId}/verification/review`, data);
  },

  /**
   * Récupère le statut de vérification d'un utilisateur
   */
  getVerificationStatus: (userId: string) => {
    return apiClient.get<{
      idType?: string;
      idNumber?: string;
      idStatus: 'pending' | 'verified' | 'rejected' | null;
      idDocument?: string;
      idDocumentBack?: string;
      verificationSubmittedAt?: string;
      verificationReviewedAt?: string;
      verificationReviewedBy?: string;
      rejectionReason?: string;
    }>(`/users/${userId}/verification`);
  },

  /**
   * Met à jour la photo de profil de l'utilisateur
   * L'URL doit être une URL Cloudinary valide
   */
  updateProfilePicture: (pictureUrl: string) => {
    return apiClient.put<{
      id: string;
      picture: string;
      updatedAt: string;
    }>('/users/me/picture', { picture: pictureUrl });
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
   * Journal d'activités de TOUS les utilisateurs de l'institution (admin only)
   * GET /admin/users/activities
   * Réponse: { success, total, data: [{ id, type, description, ipAddress, userAgent, userId, createdAt, metadata }] }
   */
  getUserActivity: (filters?: { limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', filters.limit.toString());
    return apiClient.get<FlexiblePaginatedResponse<UserActivity>>(`/admin/users/activities?${params.toString()}`);
  },

  // ===== NOUVEAUX ENDPOINTS =====

  /**
   * Modifie le rôle d'un utilisateur (admin only) — même restriction anti-escalade
   * PUT /users/:id/role
   */
  changeUserRole: (id: string, role: UserRoleEnum, permissions?: string[]) => {
    return apiClient.put<{ id: string; role: UserRoleEnum; permissions: string[] }>(
      `/users/${id}/role`,
      { role, permissions }
    );
  },

  /**
   * Suspend un utilisateur (admin only)
   * POST /users/:id/suspend
   */
  suspendUser: (id: string, reason: string, suspendedBy: string) => {
    return apiClient.post<User>(`/users/${id}/suspend`, { reason, suspendedBy });
  },

  /**
   * Réactive un utilisateur suspendu (admin only)
   * POST /users/:id/reactivate
   */
  reactivateUser: (id: string) => {
    return apiClient.post<User>(`/users/${id}/reactivate`);
  },

  /**
   * Change le statut d'un utilisateur — synchronisé avec Auth0 (admin only)
   * PATCH /admin/users/:id/status
   * 'suspended' | 'inactive' → Auth0 blocked ; 'active' → Auth0 unblocked
   */
  changeUserStatus: (id: string, status: 'active' | 'inactive' | 'suspended', reason?: string) => {
    return apiClient.patch<{
      id: string;
      status: 'active' | 'inactive' | 'suspended';
      updatedAt: string;
    }>(`/admin/users/${id}/status`, { status, reason });
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