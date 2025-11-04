// src/hooks/useUsersApi.ts
// Hook pour accéder à la gestion des utilisateurs via l'API backend

import { useState, useEffect, useCallback } from 'react';
import { userApi, type UserDetails, type UserActivity, type UserRoleDetails } from '../services/api/shared/user.api';
import type { User, UserSettings, UserRole, UserType, Permission } from '../types/user';
import type { FlexiblePaginatedResponse } from '../services/api/types';
import { useNotification } from '../contexts/useNotification';

/**
 * Helper pour extraire les informations de pagination de manière sûre
 */
function extractPaginationInfo<T>(response: FlexiblePaginatedResponse<T>) {
  // Vérifier si c'est le format avec meta
  if ('meta' in response && response.meta) {
    return {
      total: response.meta.total,
      page: response.meta.page,
      limit: response.meta.limit,
      totalPages: response.meta.totalPages
    };
  }
  
  // Format direct - utilisation d'un cast sécurisé
  const directResponse = response as {
    data: T[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  
  const total = directResponse.total ?? 0;
  const page = directResponse.page ?? 1;
  const limit = directResponse.limit ?? 10;
  const totalPages = directResponse.totalPages ?? Math.ceil(total / (limit || 1));
  
  return { total, page, limit, totalPages };
}

/**
 * Hook principal pour la gestion des utilisateurs via l'API
 */
export function useUsersApi() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const { showNotification } = useNotification();

  // Charger tous les utilisateurs
  const loadUsers = useCallback(async (filters?: {
    role?: UserRole;
    status?: string;
    department?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getAllUsers(filters);
      
      // Debug: log de la structure de réponse
      console.log('🔍 Structure de réponse API utilisateurs:', {
        hasData: !!response.data,
        dataLength: response.data?.length,
        hasMeta: 'meta' in response,
        responseKeys: Object.keys(response),
        fullResponse: response
      });
      
      setUsers(response.data);
      
      // Utiliser la fonction helper pour extraire les infos de pagination
      const paginationInfo = extractPaginationInfo(response);
      console.log('📊 Pagination extraite:', paginationInfo);
      setPagination(paginationInfo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs';
      setError(errorMessage);
      console.error('Erreur utilisateurs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un nouvel utilisateur
  const createUser = useCallback(async (userData: {
    email: string;
    name?: string;
    givenName?: string;
    familyName?: string;
    phone?: string;
    role?: UserRole;
    userType?: UserType;
    permissions?: string[];
    sendInvitation?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const user = await userApi.createUser(userData);
      setUsers(prev => [...prev, user]);
      showNotification('Utilisateur créé avec succès', 'success');
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'utilisateur';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur création utilisateur:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Mettre à jour un utilisateur
  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await userApi.updateUser(id, updates);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      showNotification('Utilisateur mis à jour avec succès', 'success');
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'utilisateur';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur mise à jour utilisateur:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Supprimer un utilisateur
  const deleteUser = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await userApi.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      showNotification('Utilisateur supprimé avec succès', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'utilisateur';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur suppression utilisateur:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Réinitialiser le mot de passe d'un utilisateur
  const resetUserPassword = useCallback(async (id: string) => {
    try {
      setError(null);
      await userApi.resetUserPassword(id);
      showNotification('Instructions de réinitialisation envoyées par email', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation du mot de passe';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur réinitialisation mot de passe:', err);
      throw err;
    }
  }, [showNotification]);

  // Assigner un portefeuille à un utilisateur
  const assignPortfolio = useCallback(async (userId: string, portfolioId: string, role: 'owner' | 'manager' | 'viewer') => {
    try {
      setError(null);
      const assignment = await userApi.assignPortfolio(userId, portfolioId, role);
      showNotification('Portefeuille assigné avec succès', 'success');
      return assignment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'assignation du portefeuille';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur assignation portefeuille:', err);
      throw err;
    }
  }, [showNotification]);

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    assignPortfolio,
    refetch: () => loadUsers()
  };
}

/**
 * Hook pour récupérer les détails d'un utilisateur spécifique
 */
export function useUserDetails(userId?: string) {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async (id?: string) => {
    const targetId = id || userId;
    if (!targetId) return;

    try {
      setLoading(true);
      setError(null);
      const userData = await userApi.getUserById(targetId);
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'utilisateur';
      setError(errorMessage);
      console.error('Erreur détails utilisateur:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [loadUser, userId]);

  return {
    user,
    loading,
    error,
    refetch: () => loadUser()
  };
}

/**
 * Hook pour le profil de l'utilisateur courant
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const loadCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await userApi.getCurrentUser();
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du profil utilisateur';
      setError(errorMessage);
      console.error('Erreur profil utilisateur:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (settings: Partial<UserSettings>) => {
    try {
      setError(null);
      const response = await userApi.updateUserPreferences(settings);
      setUser(prev => prev ? { ...prev, settings: response.settings } : null);
      showNotification('Préférences mises à jour avec succès', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour des préférences';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Erreur préférences:', err);
      throw err;
    }
  }, [showNotification]);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  return {
    user,
    loading,
    error,
    updatePreferences,
    refetch: loadCurrentUser
  };
}

/**
 * Hook pour les rôles et permissions
 */
export function useUserRolesAndPermissions() {
  const [roles, setRoles] = useState<UserRoleDetails[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRolesAndPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [rolesData, permissionsData] = await Promise.all([
        userApi.getRoles(),
        userApi.getPermissions()
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des rôles et permissions';
      setError(errorMessage);
      console.error('Erreur rôles et permissions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRolesAndPermissions();
  }, [loadRolesAndPermissions]);

  return {
    roles,
    permissions,
    loading,
    error,
    refetch: loadRolesAndPermissions
  };
}

/**
 * Hook pour l'activité des utilisateurs
 */
export function useUserActivity() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  const loadActivity = useCallback(async (filters?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getUserActivity(filters);
      setActivities(response.data);
      
      // Utiliser la fonction helper pour extraire les infos de pagination
      const paginationInfo = extractPaginationInfo(response);
      setPagination(paginationInfo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'activité';
      setError(errorMessage);
      console.error('Erreur activité utilisateurs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  return {
    activities,
    loading,
    error,
    pagination,
    loadActivity,
    refetch: () => loadActivity()
  };
}
