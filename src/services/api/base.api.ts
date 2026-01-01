import { API_CONFIG } from '../../config/api';
import { auth0Service } from './auth/auth0Service';
import { apiCache, CacheOptions } from './cache';
import { interceptorManager, RequestConfig } from './interceptors';
import { apiCoordinator } from './apiCoordinator';
import { getInstitutionId, isAppContextReady } from '../../stores/appContextStore';

// Gestionnaire global de rate limiting
class RateLimitManager {
  private static instance: RateLimitManager;
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private resetTime: number = 0;
  private isBlocked: boolean = false;
  
  public static getInstance(): RateLimitManager {
    if (!RateLimitManager.instance) {
      RateLimitManager.instance = new RateLimitManager();
    }
    return RateLimitManager.instance;
  }
  
  public async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Réinitialiser le compteur toutes les minutes
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60000; // 1 minute
      this.isBlocked = false;
    }
    
    // Si bloqué, attendre
    if (this.isBlocked) {
      const waitTime = this.resetTime - now;
      throw new ApiError(429, `Rate limit dépassé. Réessayez dans ${Math.ceil(waitTime / 1000)} secondes.`);
    }
    
    // Limiter à 30 requêtes par minute
    if (this.requestCount >= 30) {
      this.isBlocked = true;
      throw new ApiError(429, 'Rate limit dépassé. Trop de requêtes par minute.');
    }
    
    // Espacer les requêtes d'au moins 2 secondes
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < 2000) {
      const waitTime = 2000 - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requestCount++;
    this.lastRequestTime = Date.now();
  }
  
  public handleRateLimitResponse(retryAfter?: number): void {
    this.isBlocked = true;
    this.resetTime = Date.now() + (retryAfter || 60000);
  }
}

const rateLimitManager = RateLimitManager.getInstance();

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

/**
 * Interface pour les réponses API avec enveloppe standard
 * Le backend renvoie toujours: { success: boolean, data: T, message?: string }
 */
interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

/**
 * Vérifie si la réponse est une enveloppe API standard
 */
function isApiWrapper<T>(response: unknown): response is ApiResponseWrapper<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    typeof (response as ApiResponseWrapper<T>).success === 'boolean'
  );
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('Content-Type') || '';
  
  // Si la réponse est vide, retourne null
  if (response.status === 204) {
    return null as unknown as T;
  }

  // Gestion spéciale du rate limiting (429)
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 10000; // 10 secondes par défaut
    
    throw new ApiError(
      429, 
      `Trop de requêtes. Veuillez patienter ${Math.ceil(waitTime / 1000)} secondes avant de réessayer.`,
      { retryAfter: waitTime }
    );
  }

  // Gestion des réponses JSON
  if (contentType.includes('application/json')) {
    const rawData = await response.json();
    
    if (!response.ok) {
      throw new ApiError(response.status, rawData.message || 'Une erreur est survenue', rawData);
    }
    
    // Extraire les données de l'enveloppe si présente
    // Le backend renvoie: { success: true, data: {...} }
    // On veut retourner directement le contenu de "data"
    if (isApiWrapper<T>(rawData)) {
      if (!rawData.success) {
        throw new ApiError(response.status, rawData.message || 'Erreur API', rawData);
      }
      // Si c'est une réponse paginée, on garde la structure avec meta
      if (rawData.meta) {
        return { data: rawData.data, meta: rawData.meta } as T;
      }
      return rawData.data;
    }
    
    // Si pas d'enveloppe standard, retourner tel quel
    return rawData as T;
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
    // Vérifier le rate limiting avant de faire la requête
    await rateLimitManager.checkRateLimit();
    
    // Récupération du token d'authentification via auth0Service
    const token = auth0Service.getAccessToken() || localStorage.getItem('token');
    
    // Récupération de l'institutionId depuis le store global
    // NOTE: Le header X-Institution-Id est désactivé temporairement car le backend
    // doit configurer CORS pour l'autoriser (Access-Control-Allow-Headers)
    // L'institutionId devrait être extrait du token JWT côté backend
    const institutionId = getInstitutionId();
    if (institutionId) {
      console.debug('📍 Institution ID disponible:', institutionId);
    }
    
    const requestConfig: RequestConfig = {
      ...options,
      url: endpoint,
      baseUrl: API_CONFIG.baseUrl,
      headers: new Headers({
        ...API_CONFIG.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        // NOTE: Header X-Institution-Id désactivé - CORS non configuré sur le backend
        // Réactiver quand le backend aura ajouté 'X-Institution-Id' dans Access-Control-Allow-Headers
        // ...(institutionId ? { 'X-Institution-Id': institutionId } : {}),
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
        // Gestion spécifique du rate limiting
        if (error.status === 429) {
          const retryAfter = (error.data as { retryAfter?: number })?.retryAfter || 60000;
          rateLimitManager.handleRateLimitResponse(retryAfter);
        }
        
        // Gestion des erreurs 401 (non autorisé)
        if (error.status === 401) {
          // Ne pas rediriger si on est dans le processus d'auth callback
          // Le composant AuthCallback gère son propre fallback
          const isAuthCallbackInProgress = sessionStorage.getItem('auth_callback_in_progress') === 'true';
          
          if (isAuthCallbackInProgress) {
            console.warn('401 pendant auth callback - le fallback sera géré par AuthCallback');
          } else {
            console.warn('Session expirée, redirection vers la page de connexion');
            // Redirection vers la page de connexion ou déconnexion
            auth0Service.clearAuth();
            window.location.href = '/';
          }
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
    
    // Utiliser le coordinateur pour les appels GET (lecture)
    const callId = `GET:${url}`;
    return apiCoordinator.scheduleApiCall(
      callId,
      () => this.request<T>(url, { url, method: 'GET' }),
      'medium', // Priorité normale pour les GET
      2 // Max 2 tentatives pour les GET
    );
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