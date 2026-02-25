// src/hooks/useUsersApi.ts
// Hook pour accéder à la gestion des utilisateurs via l'API backend

import { useState, useEffect, useCallback } from 'react';
import { userApi, type UserDetails, type UserActivity, type UserRoleDetails, type UserPreference, type UserSession } from '../services/api/shared/user.api';
import type { User, UserSettings, UserRole, UserType, Permission, UserWithInstitutionResponse } from '../types/user';
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
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: UserRole;
    status?: 'active' | 'inactive' | 'suspended' | 'pending';
    department?: string;
    language?: 'fr' | 'en';
    userType?: UserType;
    bio?: string;
    settings?: UserSettings;
    permissions?: string[];
    metadata?: Record<string, unknown>;
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
 * Hook pour le profil de l'utilisateur courant AVEC son institution
 * Utilise l'endpoint optimisé GET /users/me qui retourne ~5KB
 * Idéal pour: Login, Dashboard, Header (contexte institutionnel)
 */
export function useCurrentUserWithInstitution() {
  const [user, setUser] = useState<User | null>(null);
  const [institution, setInstitution] = useState<UserWithInstitutionResponse['institution'] | null>(null);
  const [auth0Id, setAuth0Id] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const loadCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getCurrentUserWithInstitution();
      
      // Extraire les données de la réponse structurée
      setUser(response.user);
      setInstitution(response.institution);
      setAuth0Id(response.auth0Id);
      setRole(response.role);
      setPermissions(response.permissions);
      
      console.log('✅ Utilisateur et institution chargés:', {
        userId: response.user.id,
        userName: response.user.name,
        institutionId: response.institution.id,
        institutionName: response.institution.name
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du profil utilisateur';
      setError(errorMessage);
      console.error('❌ Erreur profil utilisateur avec institution:', err);
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
    institution,
    auth0Id,
    role,
    permissions,
    loading,
    error,
    updatePreferences,
    refetch: loadCurrentUser
  };
}

/**
 * Hook pour le profil simple de l'utilisateur courant (sans institution)
 * Utilise l'endpoint GET /users/profile qui retourne ~2KB
 * Pour les cas où seules les données utilisateur sont nécessaires
 * @deprecated Préférer useCurrentUserWithInstitution pour avoir le contexte institutionnel
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
      // Utilise le nouveau endpoint /users/profile pour profil simple
      const userData = await userApi.getUserProfile();
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
/**
 * Hook pour la gestion des sessions utilisateur
 */
export function useUserSessions(userId: string) {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const loadSessions = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getUserSessions(userId);
      setSessions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des sessions';
      setError(errorMessage);
      console.error('Erreur sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const terminateSession = useCallback(async (sessionId: string) => {
    try {
      await userApi.terminateSession(userId, sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      showNotification('Session terminée avec succès', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la terminaison de la session';
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [userId, showNotification]);

  const terminateAllSessions = useCallback(async (exceptCurrent: boolean = false) => {
    try {
      await userApi.terminateAllSessions(userId, exceptCurrent);
      if (exceptCurrent) {
        // Recharger pour avoir uniquement la session courante
        await loadSessions();
      } else {
        setSessions([]);
      }
      showNotification('Toutes les sessions terminées avec succès', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la terminaison des sessions';
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [userId, loadSessions, showNotification]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    loading,
    error,
    terminateSession,
    terminateAllSessions,
    refetch: loadSessions
  };
}

/**
 * Hook pour la gestion des préférences d'un utilisateur spécifique
 */
export function useUserPreferences(userId: string) {
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const loadPreferences = useCallback(async (category?: 'GENERAL' | 'NOTIFICATIONS' | 'DASHBOARD' | 'SECURITY') => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getUserPreferences(userId, category);
      setPreferences(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des préférences';
      setError(errorMessage);
      console.error('Erreur préférences:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const setPreference = useCallback(async (preference: {
    category: 'GENERAL' | 'NOTIFICATIONS' | 'DASHBOARD' | 'SECURITY';
    key: string;
    value: string;
  }) => {
    try {
      const newPreference = await userApi.setUserPreference(userId, preference);
      setPreferences(prev => {
        // Remplacer si existe, sinon ajouter
        const index = prev.findIndex(p => p.category === preference.category && p.key === preference.key);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = newPreference;
          return updated;
        }
        return [...prev, newPreference];
      });
      showNotification('Préférence mise à jour avec succès', 'success');
      return newPreference;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la préférence';
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [userId, showNotification]);

  const deletePreference = useCallback(async (preferenceId: string) => {
    try {
      await userApi.deleteUserPreference(userId, preferenceId);
      setPreferences(prev => prev.filter(p => p.id !== preferenceId));
      showNotification('Préférence supprimée avec succès', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la préférence';
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [userId, showNotification]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    error,
    loadPreferences,
    setPreference,
    deletePreference,
    refetch: () => loadPreferences()
  };
}

/**
 * Hook pour changer le statut d'un utilisateur
 */
export function useChangeUserStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const changeStatus = useCallback(async (
    userId: string, 
    status: 'active' | 'inactive' | 'suspended', 
    reason?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await userApi.changeUserStatus(userId, status, reason);
      showNotification(`Statut de l'utilisateur modifié en "${status}"`, 'success');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du changement de statut';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  return {
    changeStatus,
    loading,
    error
  };
}