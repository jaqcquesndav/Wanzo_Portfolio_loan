// src/types/api.ts
/**
 * Interface générique pour les réponses API
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Type pour les réponses encapsulées dans un objet data
 * (format utilisé par l'API Wanzo)
 */
export interface WanzoApiResponse<T> {
  data: ApiResponse<T>;
}
