// src/hooks/useUsersApiOptimized.ts
// Version optimisée du hook Users API avec gestion d'erreurs avancée

import { useCallback, useMemo, useEffect } from 'react';
import { userApi } from '../services/api/shared/user.api';
import type { User, UserRole } from '../types/user';
import { useNotification } from '../contexts/NotificationContext';
import { useApiRequest, useApiList } from './useApiRequest';

interface UserFilters {
  role?: UserRole;
  status?: string;
  department?: string;
  search?: string;
}

/**
 * Hook optimisé pour la gestion des utilisateurs avec retry automatique
 */
export function useUsersApiOptimized() {
  const { showNotification } = useNotification();

  // Hook pour la liste des utilisateurs avec pagination
  const usersListRequest = useApiList(
    async (params = { page: 1, limit: 10, search: '' }) => {
      const response = await userApi.getAllUsers({
        ...params,
        // Conversion des paramètres génériques vers les filtres spécifiques
        role: undefined, // À définir selon les besoins
        status: undefined,
        department: undefined,
      });
      
      // Transformer la réponse pour correspondre au format attendu par useApiList
      return {
        data: response.data,
        total: response.meta.total
      };
    },
    {
      onError: (error: Error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    }
  );

  // Fonction pour appliquer des filtres
  const applyFilters = useCallback((filters: UserFilters) => {
    usersListRequest.updateParams({ 
      page: 1, // Reset à la première page lors du filtrage
      search: filters.search || ''
    });
  }, [usersListRequest]);

  // Fonction pour changer de page
  const changePage = useCallback((page: number) => {
    usersListRequest.updateParams({ page });
  }, [usersListRequest]);

  // Fonction pour changer la limite par page
  const changeLimit = useCallback((limit: number) => {
    usersListRequest.updateParams({ limit, page: 1 });
  }, [usersListRequest]);

  // Hook pour créer un utilisateur
  const createUserRequest = useApiRequest(
    async () => {
      throw new Error('Fonction execute doit être appelée avec des données');
    },
    {
      onSuccess: () => {
        showNotification('Utilisateur créé avec succès', 'success');
        usersListRequest.refresh(true);
      }
    }
  );

  // Hook pour mettre à jour un utilisateur
  const updateUserRequest = useApiRequest(
    async () => {
      throw new Error('Fonction execute doit être appelée avec des données');
    },
    {
      onSuccess: () => {
        showNotification('Utilisateur mis à jour avec succès', 'success');
        usersListRequest.refresh(true);
      }
    }
  );

  // Hook pour supprimer un utilisateur
  const deleteUserRequest = useApiRequest(
    async () => {
      throw new Error('Fonction execute doit être appelée avec un ID');
    },
    {
      onSuccess: () => {
        showNotification('Utilisateur supprimé avec succès', 'success');
        usersListRequest.refresh(true);
      }
    }
  );

  // Hook pour obtenir les détails d'un utilisateur
  const userDetailsRequest = useApiRequest(
    async () => {
      throw new Error('Fonction execute doit être appelée avec un ID');
    }
  );

  // Fonctions exposées
  const createUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newUser = await userApi.createUser(userData);
      usersListRequest.refresh(true);
      showNotification('Utilisateur créé avec succès', 'success');
      return newUser;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }, [usersListRequest, showNotification]);

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      const updatedUser = await userApi.updateUser(id, updates);
      usersListRequest.refresh(true);
      showNotification('Utilisateur mis à jour avec succès', 'success');
      return updatedUser;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }, [usersListRequest, showNotification]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await userApi.deleteUser(userId);
      usersListRequest.refresh(true);
      showNotification('Utilisateur supprimé avec succès', 'success');
      return userId;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }, [usersListRequest, showNotification]);

  const loadUserDetails = useCallback(async (userId: string) => {
    try {
      const userDetails = await userApi.getUserById(userId);
      return userDetails;
    } catch (error) {
      console.error('Erreur lors du chargement des détails utilisateur:', error);
      throw error;
    }
  }, []);

  // État consolidé
  const state = useMemo(() => ({
    // Liste des utilisateurs
    users: usersListRequest.items,
    total: usersListRequest.total,
    pagination: {
      page: usersListRequest.params.page,
      limit: usersListRequest.params.limit,
      total: usersListRequest.total,
      totalPages: Math.ceil(usersListRequest.total / usersListRequest.params.limit)
    },
    
    // États de chargement
    loading: {
      list: usersListRequest.loading,
      create: createUserRequest.loading,
      update: updateUserRequest.loading,
      delete: deleteUserRequest.loading,
      details: userDetailsRequest.loading
    },
    
    // Erreurs
    error: {
      list: usersListRequest.error,
      create: createUserRequest.error,
      update: updateUserRequest.error,
      delete: deleteUserRequest.error,
      details: userDetailsRequest.error
    },
    
    // Détails de l'utilisateur sélectionné
    selectedUser: userDetailsRequest.data,
    
    // Fonctions
    applyFilters,
    changePage,
    changeLimit,
    createUser,
    updateUser,
    deleteUser,
    loadUserDetails,
    refresh: usersListRequest.refresh,
    retry: {
      list: usersListRequest.retry,
      create: createUserRequest.retry,
      update: updateUserRequest.retry,
      delete: deleteUserRequest.retry,
      details: userDetailsRequest.retry
    }
  }), [
    usersListRequest,
    createUserRequest,
    updateUserRequest,
    deleteUserRequest,
    userDetailsRequest,
    applyFilters,
    changePage,
    changeLimit,
    createUser,
    updateUser,
    deleteUser,
    loadUserDetails
  ]);

  return state;
}

// Hook pour charger les détails d'un utilisateur spécifique
export function useUserDetails(userId: string | null) {
  const detailsRequest = useApiRequest(
    async () => {
      if (!userId) throw new Error('ID utilisateur requis');
      return await userApi.getUserById(userId);
    }
  );

  // Charger automatiquement quand l'ID change
  useEffect(() => {
    if (userId) {
      detailsRequest.execute();
    }
  }, [userId, detailsRequest]);

  return {
    user: detailsRequest.data,
    loading: detailsRequest.loading,
    error: detailsRequest.error,
    retry: detailsRequest.retry,
    refresh: detailsRequest.refresh
  };
}