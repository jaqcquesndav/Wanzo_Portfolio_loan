// src/services/api/types.ts

/**
 * Interface pour les réponses paginées
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Interface pour les options de pagination
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Interface pour les options de filtrage
 */
export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

/**
 * Interface pour les options de requête API
 */
export interface QueryOptions extends PaginationOptions, FilterOptions {}

/**
 * Erreur API
 */
export interface ApiErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

/**
 * Réponse de succès générique
 */
export interface SuccessResponse {
  success: boolean;
  message: string;
}

/**
 * Interface pour les options de téléchargement de fichier
 */
export interface FileUploadOptions {
  fileName?: string;
  contentType?: string;
  folder?: string;
  isPublic?: boolean;
}
