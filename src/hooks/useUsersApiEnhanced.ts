// src/hooks/useUsersApiEnhanced.ts
// Version améliorée du hook Users API avec cache et gestion d'erreurs robuste

import { useState, useCallback, useRef, useEffect } from 'react';
import { userApi } from '../services/api/shared/user.api';
import type { User, UserRole, UserType } from '../types/user';
import { useNotification } from '../contexts/useNotification';

interface LoadUsersParams {
  role?: UserRole;
  status?: string;
  department?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface UsersApiState {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface RequestCache {
  data: unknown;
  timestamp: number;
  params: string;
}

/**
 * Hook amélioré pour la gestion des utilisateurs avec cache et retry automatique
 */
export function useUsersApiEnhanced() {
  const [state, setState] = useState<UsersApiState>({
    users: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }
  });

  const { showNotification } = useNotification();
  const cache = useRef<Map<string, RequestCache>>(new Map());
  const loadingRef = useRef<boolean>(false);
  const lastParamsRef = useRef<string>('');

  // Générer une clé de cache
  const getCacheKey = useCallback((params: LoadUsersParams = {}) => {
    return `users-${JSON.stringify(params)}`;
  }, []);

  // Vérifier si les données du cache sont valides (5 minutes)
  const isCacheValid = useCallback((entry: RequestCache) => {
    return Date.now() - entry.timestamp < 5 * 60 * 1000;
  }, []);

  // Fonction de retry avec backoff exponentiel
  const retryWithBackoff = useCallback(async <T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Vérifier si c'est une erreur 429
        const is429 = lastError.message.includes('429') || 
                     lastError.message.toLowerCase().includes('too many requests');

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Calculer le délai (plus long pour les erreurs 429)
        const delay = is429 ? baseDelay * Math.pow(2, attempt + 1) : baseDelay * (attempt + 1);
        
        if (is429 && attempt === 0) {
          showNotification(
            `Trop de requêtes. Nouvelle tentative dans ${delay / 1000}s...`,
            'warning'
          );
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }, [showNotification]);

  // Charger les utilisateurs avec cache et retry
  const loadUsers = useCallback(async (params: LoadUsersParams = {}, force = false) => {
    const cacheKey = getCacheKey(params);
    const paramsString = JSON.stringify(params);
    
    // Éviter les requêtes en double
    if (loadingRef.current && lastParamsRef.current === paramsString && !force) {
      return;
    }

    // Vérifier le cache
    const cachedData = cache.current.get(cacheKey);
    if (!force && cachedData && isCacheValid(cachedData)) {
      setState(prev => ({
        ...prev,
        ...(cachedData.data as Partial<UsersApiState>),
        loading: false,
        error: null
      }));
      return;
    }

    try {
      loadingRef.current = true;
      lastParamsRef.current = paramsString;
      
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await retryWithBackoff(() => userApi.getAllUsers(params));

      const newState = {
        users: response.data,
        loading: false,
        error: null,
        pagination: {
          total: response.meta.total,
          page: response.meta.page,
          limit: response.meta.limit,
          totalPages: response.meta.totalPages
        }
      };

      // Mettre à jour le cache
      cache.current.set(cacheKey, {
        data: newState,
        timestamp: Date.now(),
        params: paramsString
      });

      setState(newState);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des utilisateurs';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      loadingRef.current = false;
    }
  }, [getCacheKey, isCacheValid, retryWithBackoff]);

  // Créer un utilisateur
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
      setState(prev => ({ ...prev, loading: true, error: null }));

      const user = await retryWithBackoff(() => userApi.createUser(userData));
      
      // Invalider le cache et recharger
      cache.current.clear();
      await loadUsers(undefined, true);
      
      showNotification('Utilisateur créé avec succès', 'success');
      return user;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de l\'utilisateur';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      showNotification(errorMessage, 'error');
      throw error;
    }
  }, [retryWithBackoff, loadUsers, showNotification]);

  // Mettre à jour un utilisateur
  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const updatedUser = await retryWithBackoff(() => userApi.updateUser(id, updates));
      
      // Mettre à jour localement et invalider le cache
      setState(prev => ({
        ...prev,
        users: prev.users.map(user => user.id === id ? updatedUser : user),
        loading: false
      }));
      
      cache.current.clear();
      showNotification('Utilisateur mis à jour avec succès', 'success');
      return updatedUser;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'utilisateur';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      showNotification(errorMessage, 'error');
      throw error;
    }
  }, [retryWithBackoff, showNotification]);

  // Supprimer un utilisateur
  const deleteUser = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      await retryWithBackoff(() => userApi.deleteUser(id));
      
      // Mettre à jour localement et invalider le cache
      setState(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== id),
        loading: false
      }));
      
      cache.current.clear();
      showNotification('Utilisateur supprimé avec succès', 'success');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'utilisateur';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      showNotification(errorMessage, 'error');
      throw error;
    }
  }, [retryWithBackoff, showNotification]);

  // Fonction de retry pour l'utilisateur
  const retry = useCallback(() => {
    const params = lastParamsRef.current ? JSON.parse(lastParamsRef.current) : {};
    loadUsers(params, true);
  }, [loadUsers]);

  // Invalider le cache
  const invalidateCache = useCallback(() => {
    cache.current.clear();
  }, []);

  // Charger automatiquement au montage
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    ...state,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    retry,
    invalidateCache,
    refresh: () => loadUsers(undefined, true)
  };
}
