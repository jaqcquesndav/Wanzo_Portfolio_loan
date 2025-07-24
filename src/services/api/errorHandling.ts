// src/services/api/errorHandling.ts
import toast from 'react-hot-toast';

/**
 * Types d'erreurs API
 */
export enum ApiErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

/**
 * Interface pour les erreurs API standardisées
 */
export interface ApiErrorResponse {
  type: ApiErrorType;
  message: string;
  details?: Record<string, unknown>;
  status?: number;
  path?: string;
}

/**
 * Options pour la gestion des erreurs
 */
export interface ErrorHandlingOptions {
  /**
   * Si true, affiche une notification pour cette erreur
   */
  showNotification?: boolean;
  
  /**
   * Message personnalisé à afficher à la place du message d'erreur par défaut
   */
  customMessage?: string;
  
  /**
   * Fonction de rappel personnalisée à exécuter en cas d'erreur
   */
  onError?: (error: ApiErrorResponse) => void;
}

/**
 * Service centralisé pour la gestion des erreurs API
 */
export const errorHandlingService = {
  /**
   * Analyse une erreur et la convertit en une erreur API standardisée
   */
  parseError(error: unknown): ApiErrorResponse {
    // Erreur de réseau (pas de connexion)
    if (error instanceof TypeError && error.message.includes('network')) {
      return {
        type: ApiErrorType.NETWORK,
        message: 'La connexion au serveur a échoué. Vérifiez votre connexion Internet.'
      };
    }
    
    // Erreur API avec status code
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as { status: number; message: string; data?: unknown };
      
      switch (apiError.status) {
        case 400:
          return {
            type: ApiErrorType.VALIDATION,
            message: apiError.message || 'Données invalides',
            status: 400,
            details: apiError.data as Record<string, unknown>
          };
        case 401:
          return {
            type: ApiErrorType.AUTHENTICATION,
            message: 'Votre session a expiré. Veuillez vous reconnecter.',
            status: 401
          };
        case 403:
          return {
            type: ApiErrorType.AUTHORIZATION,
            message: 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.',
            status: 403
          };
        case 404:
          return {
            type: ApiErrorType.NOT_FOUND,
            message: 'La ressource demandée n\'existe pas.',
            status: 404
          };
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: ApiErrorType.SERVER,
            message: 'Une erreur est survenue sur le serveur. Veuillez réessayer ultérieurement.',
            status: apiError.status
          };
        default:
          return {
            type: ApiErrorType.UNKNOWN,
            message: apiError.message || 'Une erreur inconnue est survenue',
            status: apiError.status
          };
      }
    }
    
    // Erreur générique
    return {
      type: ApiErrorType.UNKNOWN,
      message: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
    };
  },
  
  /**
   * Gère une erreur API
   */
  handleError(error: unknown, options: ErrorHandlingOptions = {}): ApiErrorResponse {
    const parsedError = this.parseError(error);
    
    // Notification utilisateur si demandé
    if (options.showNotification !== false) {
      toast.error(options.customMessage || parsedError.message, {
        duration: 5000,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
    
    // Journalisation de l'erreur
    console.error('API Error:', parsedError);
    
    // Exécution du callback personnalisé
    if (options.onError) {
      options.onError(parsedError);
    }
    
    return parsedError;
  }
};
