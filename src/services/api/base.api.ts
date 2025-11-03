import { API_CONFIG } from '../../config/api';
import { auth0Service } from './auth/auth0Service';
import { apiCache, CacheOptions } from './cache';
import { interceptorManager, RequestConfig } from './interceptors';

export class ApiError extends Error {
  constructor(
    public status: number, 
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('Content-Type') || '';
  
  // Si la réponse est vide, retourne null
  if (response.status === 204) {
    return null as unknown as T;
  }

  // Gestion des réponses JSON
  if (contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'Une erreur est survenue', data);
    }
    
    return data;
  }
  
  // Gestion des réponses non-JSON
  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(response.status, error || 'Une erreur est survenue');
  }
  
  return response.json();
}

export const apiClient = {
  async request<T>(endpoint: string, options: RequestConfig = { url: endpoint }): Promise<T> {
    // Récupération du token d'authentification via auth0Service
    const token = auth0Service.getAccessToken() || localStorage.getItem('token');
    
    const requestConfig: RequestConfig = {
      ...options,
      url: endpoint,
      baseUrl: API_CONFIG.baseUrl,
      headers: new Headers({
        ...API_CONFIG.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
      })
    };
    
    try {
      // Applique les intercepteurs de requête
      const modifiedConfig = await interceptorManager.applyRequestInterceptors(requestConfig);
      
      // Construit l'URL finale directement (base URL contient déjà le préfixe)
      const url = `${modifiedConfig.baseUrl || API_CONFIG.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      
      const response = await fetch(url, {
        ...modifiedConfig,
        headers: modifiedConfig.headers
      });

      const data = await handleResponse<T>(response);
      
      // Applique les intercepteurs de réponse
      return await interceptorManager.applyResponseInterceptors<T>(data);
    } catch (error) {
      if (error instanceof ApiError) {
        // Gestion des erreurs 401 (non autorisé)
        if (error.status === 401) {
          console.warn('Session expirée, redirection vers la page de connexion');
          // Redirection vers la page de connexion ou déconnexion
          auth0Service.clearAuth();
          window.location.href = '/';
        }
        throw error;
      }
      
      try {
        // Applique les intercepteurs d'erreur
        return await interceptorManager.applyErrorInterceptors(error instanceof Error 
          ? error 
          : new ApiError(500, (error as Error)?.message || 'Une erreur est survenue')
        ) as T;
      } catch (transformedError) {
        throw transformedError instanceof Error 
          ? transformedError 
          : new ApiError(500, 'Une erreur est survenue');
      }
    }
  },

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => [key, String(value)])
        )}`
      : endpoint;
    
    return this.request<T>(url, { url, method: 'GET' });
  },

  async post<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
    return this.request<T>(endpoint, {
      url: endpoint,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  },

  async put<T, D = unknown>(endpoint: string, data: D): Promise<T> {
    return this.request<T>(endpoint, {
      url: endpoint,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  async patch<T, D = unknown>(endpoint: string, data: D): Promise<T> {
    return this.request<T>(endpoint, {
      url: endpoint,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async delete(endpoint: string): Promise<void> {
    await this.request(endpoint, { url: endpoint, method: 'DELETE' });
  },

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      url: endpoint,
      method: 'POST',
      headers: {
        // Ne pas inclure Content-Type, il sera automatiquement défini
      },
      body: formData
    });
  },
  
  /**
   * Effectue une requête GET avec mise en cache
   * @param endpoint URL de l'endpoint
   * @param params Paramètres de requête optionnels
   * @param cacheOptions Options de mise en cache
   * @returns Données de réponse
   */
  async getCached<T>(
    endpoint: string, 
    params?: Record<string, string | number | boolean | undefined>,
    cacheOptions?: CacheOptions
  ): Promise<T> {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => [key, String(value)])
        )}`
      : endpoint;
    
    // Génère une clé de cache unique pour cette requête
    const cacheKey = apiCache.generateKey(url, {});
    
    // Si pas de forceRefresh, vérifie le cache
    if (!cacheOptions?.forceRefresh) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData !== null) {
        return cachedData;
      }
    }
    
    // Si pas dans le cache ou forceRefresh, fait la requête
    const data = await this.get<T>(url);
    
    // Met en cache le résultat
    apiCache.set(cacheKey, data, cacheOptions?.ttl);
    
    return data;
  }
};