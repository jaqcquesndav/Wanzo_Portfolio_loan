// src/services/api/tokenInterceptor.ts
import { auth0Service } from './auth/auth0Service';
import { interceptorManager, RequestInterceptor, ResponseInterceptor } from './interceptors';

interface TokenRefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

/**
 * Intercepteur pour la gestion des tokens d'authentification
 * - Ajoute le token d'authentification à chaque requête
 * - Tente de rafraîchir le token si celui-ci est expiré
 * - Redirige vers la page de connexion si le token ne peut pas être rafraîchi
 */
export const tokenInterceptor: RequestInterceptor & ResponseInterceptor = {
  /**
   * Intercepte les requêtes pour ajouter le token d'authentification
   */
  onRequest(request) {
    const token = auth0Service.getAccessToken();
    
    if (token) {
      // Assurez-vous que l'en-tête Headers existe
      const headers = request.headers instanceof Headers 
        ? request.headers 
        : new Headers(request.headers || {});
      
      // Ajoutez le token d'autorisation
      headers.set('Authorization', `Bearer ${token}`);
      
      // Mettez à jour la configuration de la requête
      return {
        ...request,
        headers
      };
    }
    
    return request;
  },
  
  /**
   * Intercepte les réponses pour traiter les erreurs liées aux tokens
   */
  onResponse(response) {
    return response;
  },
  
  /**
   * Intercepte les erreurs pour gérer les problèmes d'authentification
   */
  async onError(error) {
    // Si l'erreur est une erreur 401 (non autorisé), tenter de rafraîchir le token
    if (error && typeof error === 'object' && 'status' in error && (error as { status: number }).status === 401) {
      try {
        // Tenter de rafraîchir le token
        const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('auth0_refresh_token');
        
        if (!refreshToken) {
          throw new Error('Pas de refresh token disponible');
        }
        
        // Appel à l'API pour rafraîchir le token
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        if (!response.ok) {
          throw new Error('Échec du rafraîchissement du token');
        }
        
        const data: TokenRefreshResponse = await response.json();
        
        // Enregistrer les nouveaux tokens
        auth0Service.saveTokens(
          data.access_token,
          undefined, // id_token n'est généralement pas renvoyé lors du refresh
          data.refresh_token || refreshToken // utiliser le nouveau refresh_token s'il est fourni
        );
        
        // Rediriger vers la page de connexion si le rafraîchissement échoue
        return Promise.reject(error);
      } catch (refreshError) {
        console.error('Échec du rafraîchissement du token:', refreshError);
        
        // Effacer les données d'authentification
        auth0Service.clearAuth();
        
        // Rediriger vers la page de connexion
        window.location.href = '/login';
        
        return Promise.reject(error);
      }
    }
    
    // Si ce n'est pas une erreur 401 ou si le rafraîchissement a échoué, rejeter l'erreur
    return Promise.reject(error);
  }
};

// Ajouter l'intercepteur de token
interceptorManager.addRequestInterceptor(tokenInterceptor);
interceptorManager.addResponseInterceptor(tokenInterceptor);
