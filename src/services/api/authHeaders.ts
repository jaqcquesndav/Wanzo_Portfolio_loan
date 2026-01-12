// src/services/api/authHeaders.ts
/**
 * Module centralisé pour la gestion des headers d'authentification
 * 
 * Ce module fournit des fonctions utilitaires pour récupérer le token
 * d'authentification Auth0 et construire les headers appropriés pour
 * toutes les requêtes API.
 * 
 * UTILISATION:
 * - Pour JSON: getAuthHeaders()
 * - Pour FormData/Upload: getAuthHeadersForUpload()
 * - Token seul: getAccessToken()
 */

import { auth0Service } from './auth/auth0Service';

/**
 * Récupère le token d'accès Auth0 depuis le service d'authentification
 * ou le localStorage (fallback pour compatibilité)
 * 
 * @returns Le token d'accès ou null si non authentifié
 */
export function getAccessToken(): string | null {
  // Utiliser auth0Service en priorité
  const token = auth0Service.getAccessToken();
  
  if (token) {
    return token;
  }
  
  // Fallback sur les anciennes clés localStorage pour compatibilité
  return localStorage.getItem('token') || 
         localStorage.getItem('auth0_token') || 
         localStorage.getItem('accessToken') ||
         null;
}

/**
 * Vérifie si l'utilisateur est actuellement authentifié
 * 
 * @returns true si un token valide existe
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Construit les headers d'authentification pour les requêtes API JSON
 * 
 * @returns Headers avec Content-Type JSON et Authorization Bearer token
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Construit les headers d'authentification pour les uploads de fichiers (FormData)
 * Note: Ne pas définir Content-Type pour FormData, le navigateur le fait automatiquement
 * 
 * @returns Headers avec Authorization Bearer token (sans Content-Type)
 */
export function getAuthHeadersForUpload(): HeadersInit {
  const token = getAccessToken();
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Construit un objet Headers avec authentification pour fetch API
 * 
 * @param additionalHeaders - Headers supplémentaires à fusionner
 * @returns Instance Headers avec authentification
 */
export function createAuthHeaders(additionalHeaders?: HeadersInit): Headers {
  const token = getAccessToken();
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(additionalHeaders || {})
  });
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return headers;
}

/**
 * Construit un objet Headers pour upload avec authentification
 * 
 * @param additionalHeaders - Headers supplémentaires à fusionner
 * @returns Instance Headers avec authentification (sans Content-Type)
 */
export function createAuthHeadersForUpload(additionalHeaders?: HeadersInit): Headers {
  const token = getAccessToken();
  
  const headers = new Headers({
    'Accept': 'application/json',
    ...(additionalHeaders || {})
  });
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return headers;
}

/**
 * Ajoute le token d'authentification à un objet Headers existant
 * 
 * @param headers - Headers existants (optionnel)
 * @returns Headers avec Authorization ajouté
 */
export function addAuthToHeaders(headers?: HeadersInit): HeadersInit {
  const token = getAccessToken();
  
  if (!token) {
    return headers || {};
  }
  
  if (headers instanceof Headers) {
    headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }
  
  if (Array.isArray(headers)) {
    return [...headers, ['Authorization', `Bearer ${token}`]];
  }
  
  return {
    ...(headers || {}),
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Wrapper pour effectuer une requête fetch authentifiée
 * Utile pour les cas où on ne peut pas utiliser apiClient
 * 
 * @param url - URL de la requête
 * @param options - Options fetch standard
 * @returns Promise<Response>
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  
  const headers = new Headers(options.headers || {});
  
  // Ajouter le token si présent
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Ajouter Content-Type si pas de FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Ajouter Accept si absent
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  
  return fetch(url, {
    ...options,
    headers
  });
}

// Export par défaut pour compatibilité
export default {
  getAccessToken,
  isAuthenticated,
  getAuthHeaders,
  getAuthHeadersForUpload,
  createAuthHeaders,
  createAuthHeadersForUpload,
  addAuthToHeaders,
  authenticatedFetch
};
