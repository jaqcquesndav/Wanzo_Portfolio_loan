// src/services/api/productionErrorHandler.ts
/**
 * Gestionnaire d'erreurs centralisé pour la production
 * 
 * Ce service fournit une gestion d'erreurs robuste avec:
 * - Notifications toast pour l'utilisateur
 * - Journalisation détaillée pour le debugging
 * - Gestion des erreurs réseau et offline
 * - Support pour les opérations retry
 */

import toast from 'react-hot-toast';
import { EnvironmentConfig } from '../../config/environment';

/**
 * Types d'erreurs gérées
 */
export enum ErrorType {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  TIMEOUT = 'timeout',
  OFFLINE = 'offline',
  UNKNOWN = 'unknown'
}

/**
 * Interface pour les erreurs standardisées
 */
export interface ProductionError {
  type: ErrorType;
  message: string;
  userMessage: string;
  status?: number;
  details?: Record<string, unknown>;
  timestamp: string;
  canRetry: boolean;
  retryAfter?: number;
}

/**
 * Options de notification
 */
export interface NotificationOptions {
  showNotification?: boolean;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  type?: 'error' | 'warning' | 'info';
}

/**
 * Messages utilisateur par type d'erreur
 */
const USER_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: 'Problème de connexion. Vérifiez votre connexion Internet.',
  [ErrorType.API]: 'Une erreur est survenue lors de la communication avec le serveur.',
  [ErrorType.VALIDATION]: 'Les données fournies sont invalides. Veuillez vérifier et réessayer.',
  [ErrorType.AUTHENTICATION]: 'Votre session a expiré. Veuillez vous reconnecter.',
  [ErrorType.AUTHORIZATION]: 'Vous n\'avez pas les droits pour effectuer cette action.',
  [ErrorType.NOT_FOUND]: 'La ressource demandée n\'existe pas.',
  [ErrorType.SERVER]: 'Erreur serveur. Veuillez réessayer dans quelques instants.',
  [ErrorType.TIMEOUT]: 'La requête a pris trop de temps. Veuillez réessayer.',
  [ErrorType.OFFLINE]: 'Vous êtes hors ligne. Les modifications seront synchronisées lors de la reconnexion.',
  [ErrorType.UNKNOWN]: 'Une erreur inattendue est survenue. Veuillez réessayer.'
};

/**
 * Classe principale de gestion des erreurs en production
 */
class ProductionErrorHandler {
  private errorLog: ProductionError[] = [];
  private readonly MAX_ERROR_LOG = 100;

  /**
   * Analyse une erreur et la convertit en erreur standardisée
   */
  parseError(error: unknown): ProductionError {
    const timestamp = new Date().toISOString();
    const baseError: ProductionError = {
      type: ErrorType.UNKNOWN,
      message: 'Unknown error',
      userMessage: USER_MESSAGES[ErrorType.UNKNOWN],
      timestamp,
      canRetry: true
    };

    // Vérifier si hors ligne
    if (!navigator.onLine) {
      return {
        ...baseError,
        type: ErrorType.OFFLINE,
        message: 'Application is offline',
        userMessage: USER_MESSAGES[ErrorType.OFFLINE],
        canRetry: true
      };
    }

    // Erreur TypeError (généralement réseau)
    if (error instanceof TypeError) {
      const isNetworkError = error.message.toLowerCase().includes('network') ||
                            error.message.toLowerCase().includes('fetch') ||
                            error.message.toLowerCase().includes('failed to fetch');
      
      if (isNetworkError) {
        return {
          ...baseError,
          type: ErrorType.NETWORK,
          message: error.message,
          userMessage: USER_MESSAGES[ErrorType.NETWORK],
          canRetry: true
        };
      }
    }

    // Erreur DOMException (timeout, abort)
    if (error instanceof DOMException) {
      if (error.name === 'AbortError') {
        return {
          ...baseError,
          type: ErrorType.TIMEOUT,
          message: error.message,
          userMessage: USER_MESSAGES[ErrorType.TIMEOUT],
          canRetry: true
        };
      }
    }

    // Erreur API avec status code
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as { status: number; message?: string; data?: unknown };
      const type = this.getErrorTypeFromStatus(apiError.status);
      
      return {
        ...baseError,
        type,
        message: apiError.message || `HTTP ${apiError.status}`,
        userMessage: apiError.message || USER_MESSAGES[type],
        status: apiError.status,
        details: apiError.data as Record<string, unknown>,
        canRetry: this.canRetryStatus(apiError.status),
        retryAfter: apiError.status === 429 ? 10000 : undefined
      };
    }

    // Erreur Error standard
    if (error instanceof Error) {
      return {
        ...baseError,
        message: error.message,
        userMessage: error.message || USER_MESSAGES[ErrorType.UNKNOWN]
      };
    }

    // Erreur string
    if (typeof error === 'string') {
      return {
        ...baseError,
        message: error,
        userMessage: error
      };
    }

    return baseError;
  }

  /**
   * Détermine le type d'erreur à partir du status HTTP
   */
  private getErrorTypeFromStatus(status: number): ErrorType {
    if (status === 400) return ErrorType.VALIDATION;
    if (status === 401) return ErrorType.AUTHENTICATION;
    if (status === 403) return ErrorType.AUTHORIZATION;
    if (status === 404) return ErrorType.NOT_FOUND;
    if (status === 408) return ErrorType.TIMEOUT;
    if (status === 429) return ErrorType.API;
    if (status >= 500) return ErrorType.SERVER;
    return ErrorType.API;
  }

  /**
   * Vérifie si l'erreur peut être retryée
   */
  private canRetryStatus(status: number): boolean {
    // Retry possible pour: timeout, rate limit, erreurs serveur temporaires
    return [408, 429, 500, 502, 503, 504].includes(status);
  }

  /**
   * Gère une erreur et affiche une notification
   */
  handleError(error: unknown, options: NotificationOptions = {}): ProductionError {
    const parsedError = this.parseError(error);
    
    // Ajouter au log
    this.addToErrorLog(parsedError);
    
    // Journaliser en console (si logging activé)
    if (EnvironmentConfig.enableDetailedLogging) {
      console.error('🚨 [ProductionErrorHandler]', parsedError);
    }
    
    // Afficher notification si demandé (par défaut: oui)
    if (options.showNotification !== false) {
      this.showNotification(parsedError, options);
    }
    
    return parsedError;
  }

  /**
   * Affiche une notification toast
   */
  private showNotification(error: ProductionError, options: NotificationOptions): void {
    const duration = options.duration || 5000;
    const toastType = options.type || 'error';
    
    const toastOptions = {
      duration,
      position: options.position || 'top-right' as const,
      style: {
        borderRadius: '10px',
        background: toastType === 'error' ? '#ef4444' : 
                   toastType === 'warning' ? '#f59e0b' : '#3b82f6',
        color: '#fff',
        padding: '12px 16px',
        fontWeight: '500'
      },
      icon: toastType === 'error' ? '❌' : 
            toastType === 'warning' ? '⚠️' : 'ℹ️'
    };
    
    // Utiliser le bon type de toast
    switch (toastType) {
      case 'warning':
        toast(error.userMessage, toastOptions);
        break;
      case 'info':
        toast(error.userMessage, { ...toastOptions, icon: 'ℹ️' });
        break;
      default:
        toast.error(error.userMessage, toastOptions);
    }
  }

  /**
   * Affiche une notification de succès
   */
  showSuccess(message: string, options: Partial<NotificationOptions> = {}): void {
    toast.success(message, {
      duration: options.duration || 3000,
      position: options.position || 'top-right',
      style: {
        borderRadius: '10px',
        background: '#10b981',
        color: '#fff',
        padding: '12px 16px'
      }
    });
  }

  /**
   * Affiche une notification d'information
   */
  showInfo(message: string, options: Partial<NotificationOptions> = {}): void {
    toast(message, {
      duration: options.duration || 3000,
      position: options.position || 'top-right',
      icon: 'ℹ️',
      style: {
        borderRadius: '10px',
        background: '#3b82f6',
        color: '#fff',
        padding: '12px 16px'
      }
    });
  }

  /**
   * Affiche une notification d'avertissement
   */
  showWarning(message: string, options: Partial<NotificationOptions> = {}): void {
    toast(message, {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      icon: '⚠️',
      style: {
        borderRadius: '10px',
        background: '#f59e0b',
        color: '#fff',
        padding: '12px 16px'
      }
    });
  }

  /**
   * Affiche une notification de chargement
   */
  showLoading(message: string = 'Chargement...'): string {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        borderRadius: '10px',
        background: '#6b7280',
        color: '#fff',
        padding: '12px 16px'
      }
    });
  }

  /**
   * Ferme une notification de chargement et affiche le résultat
   */
  dismissLoading(toastId: string, result: 'success' | 'error', message: string): void {
    toast.dismiss(toastId);
    if (result === 'success') {
      this.showSuccess(message);
    } else {
      toast.error(message, {
        duration: 5000,
        position: 'top-right'
      });
    }
  }

  /**
   * Ajoute une erreur au log
   */
  private addToErrorLog(error: ProductionError): void {
    this.errorLog.unshift(error);
    
    // Limiter la taille du log
    if (this.errorLog.length > this.MAX_ERROR_LOG) {
      this.errorLog = this.errorLog.slice(0, this.MAX_ERROR_LOG);
    }
  }

  /**
   * Récupère le log d'erreurs
   */
  getErrorLog(): ProductionError[] {
    return [...this.errorLog];
  }

  /**
   * Vide le log d'erreurs
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Vérifie si l'application est en ligne
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Gestionnaire d'erreur générique pour les mutations React Query
   */
  createMutationErrorHandler(context: string = ''): (error: unknown) => void {
    return (error: unknown) => {
      const prefix = context ? `[${context}] ` : '';
      console.error(`${prefix}Mutation error:`, error);
      this.handleError(error);
    };
  }

  /**
   * Wrapper pour les appels API avec gestion d'erreurs
   */
  async wrapApiCall<T>(
    apiCall: () => Promise<T>,
    options: {
      showLoadingToast?: boolean;
      loadingMessage?: string;
      successMessage?: string;
      errorOptions?: NotificationOptions;
    } = {}
  ): Promise<{ success: boolean; data?: T; error?: ProductionError }> {
    let loadingToastId: string | undefined;
    
    try {
      if (options.showLoadingToast) {
        loadingToastId = this.showLoading(options.loadingMessage);
      }
      
      const data = await apiCall();
      
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      
      if (options.successMessage) {
        this.showSuccess(options.successMessage);
      }
      
      return { success: true, data };
    } catch (error) {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      
      const parsedError = this.handleError(error, options.errorOptions);
      return { success: false, error: parsedError };
    }
  }
}

// Singleton instance
export const productionErrorHandler = new ProductionErrorHandler();

// Export pour compatibilité avec l'ancien errorHandlingService
export const errorHandlingService = {
  parseError: (error: unknown) => productionErrorHandler.parseError(error),
  handleError: (error: unknown, options?: NotificationOptions) => 
    productionErrorHandler.handleError(error, options)
};
