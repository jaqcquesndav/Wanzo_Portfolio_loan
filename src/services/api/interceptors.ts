// src/services/api/interceptors.ts

/**
 * Interface pour un intercepteur de requête
 */
export interface RequestInterceptor {
  /**
   * Fonction appelée avant l'envoi d'une requête
   * @param request La requête à intercepter
   * @returns La requête modifiée ou la requête originale
   */
  onRequest(request: RequestConfig): Promise<RequestConfig> | RequestConfig;
}

/**
 * Interface pour un intercepteur de réponse
 */
export interface ResponseInterceptor {
  /**
   * Fonction appelée après réception d'une réponse
   * @param response La réponse à intercepter
   * @returns La réponse modifiée ou la réponse originale
   */
  onResponse<T>(response: T): Promise<T> | T;
  
  /**
   * Fonction appelée en cas d'erreur
   * @param error L'erreur interceptée
   * @returns L'erreur modifiée, une nouvelle réponse, ou rejette l'erreur
   */
  onError<E extends Error>(error: E): Promise<unknown> | E;
}

/**
 * Configuration pour une requête
 */
export interface RequestConfig extends RequestInit {
  url: string;
  baseUrl?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Gestionnaire d'intercepteurs pour les requêtes API
 */
class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  
  /**
   * Ajoute un intercepteur de requête
   * @param interceptor L'intercepteur à ajouter
   * @returns Un ID pour supprimer l'intercepteur
   */
  addRequestInterceptor(interceptor: RequestInterceptor): number {
    return this.requestInterceptors.push(interceptor) - 1;
  }
  
  /**
   * Ajoute un intercepteur de réponse
   * @param interceptor L'intercepteur à ajouter
   * @returns Un ID pour supprimer l'intercepteur
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): number {
    return this.responseInterceptors.push(interceptor) - 1;
  }
  
  /**
   * Supprime un intercepteur de requête
   * @param id L'ID de l'intercepteur à supprimer
   */
  removeRequestInterceptor(id: number): void {
    if (id >= 0 && id < this.requestInterceptors.length) {
      this.requestInterceptors.splice(id, 1);
    }
  }
  
  /**
   * Supprime un intercepteur de réponse
   * @param id L'ID de l'intercepteur à supprimer
   */
  removeResponseInterceptor(id: number): void {
    if (id >= 0 && id < this.responseInterceptors.length) {
      this.responseInterceptors.splice(id, 1);
    }
  }
  
  /**
   * Applique tous les intercepteurs de requête
   * @param config La configuration de la requête
   * @returns La configuration modifiée
   */
  async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let modifiedConfig = { ...config };
    
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor.onRequest(modifiedConfig);
    }
    
    return modifiedConfig;
  }
  
  /**
   * Applique tous les intercepteurs de réponse
   * @param response La réponse
   * @returns La réponse modifiée
   */
  async applyResponseInterceptors<T>(response: T): Promise<T> {
    let modifiedResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor.onResponse(modifiedResponse);
    }
    
    return modifiedResponse;
  }
  
  /**
   * Applique tous les intercepteurs d'erreur
   * @param error L'erreur
   * @returns L'erreur modifiée ou rejette l'erreur
   */
  async applyErrorInterceptors<E extends Error>(error: E): Promise<unknown> {
    let currentError = error;
    
    for (const interceptor of this.responseInterceptors) {
      try {
        // L'intercepteur peut résoudre l'erreur en une réponse valide
        const result = await interceptor.onError(currentError);
        if (result !== currentError) {
          return result;
        }
        if (result instanceof Error) {
          currentError = result as E;
        }
      } catch (e) {
        if (e instanceof Error) {
          currentError = e as E;
        } else {
          throw e;
        }
      }
    }
    
    throw currentError;
  }
}

// Exporte une instance singleton du gestionnaire d'intercepteurs
export const interceptorManager = new InterceptorManager();

/**
 * Intercepteur de logging pour les requêtes API
 */
export const loggingInterceptor: RequestInterceptor & ResponseInterceptor = {
  onRequest(request: RequestConfig): RequestConfig {
    if (import.meta.env.DEV) {
      console.log(
        `🚀 API Request: ${request.method || 'GET'} ${request.url}`,
        request.params || {}
      );
    }
    return request;
  },
  
  onResponse<T>(response: T): T {
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', response);
    }
    return response;
  },
  
  onError<E extends Error>(error: E): E {
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', error);
    }
    return error;
  }
};

// Ajoute l'intercepteur de logging par défaut en mode développement
if (import.meta.env.DEV) {
  interceptorManager.addRequestInterceptor(loggingInterceptor);
  interceptorManager.addResponseInterceptor(loggingInterceptor);
}
