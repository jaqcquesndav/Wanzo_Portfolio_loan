import { API_BASE_URL, API_TIMEOUT } from './apiConfig';
import { getAuthHeaders } from './authHeaders';

// Type générique pour les réponses API
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Service générique pour les requêtes API
 * 
 * Ce service utilise automatiquement le token d'authentification Auth0
 * via getAuthHeaders() pour toutes les requêtes.
 */
export class ApiService {
  /**
   * Méthode générique pour effectuer des requêtes GET
   */
  static async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
      const url = `${API_BASE_URL}${endpoint}${queryParams}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        data,
        status: response.status
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`La requête a expiré après ${API_TIMEOUT}ms`);
        }
        throw error;
      }
      throw new Error('Erreur inconnue lors de la requête API');
    }
  }
  
  /**
   * Méthode générique pour effectuer des requêtes POST
   */
  static async post<T, U>(endpoint: string, data: U): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      return {
        data: responseData,
        status: response.status
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`La requête a expiré après ${API_TIMEOUT}ms`);
        }
        throw error;
      }
      throw new Error('Erreur inconnue lors de la requête API');
    }
  }
  
  /**
   * Méthode générique pour effectuer des requêtes PUT
   */
  static async put<T, U>(endpoint: string, data: U): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      return {
        data: responseData,
        status: response.status
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`La requête a expiré après ${API_TIMEOUT}ms`);
        }
        throw error;
      }
      throw new Error('Erreur inconnue lors de la requête API');
    }
  }
  
  /**
   * Méthode générique pour effectuer des requêtes DELETE
   */
  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      return {
        data: responseData,
        status: response.status
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`La requête a expiré après ${API_TIMEOUT}ms`);
        }
        throw error;
      }
      throw new Error('Erreur inconnue lors de la requête API');
    }
  }
}
