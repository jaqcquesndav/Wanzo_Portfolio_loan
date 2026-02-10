// src/types/subscription-errors.ts
/**
 * Types et helpers pour la gestion des erreurs d'abonnement et quota
 * 
 * Ces types permettent de parser les métadonnées d'erreur envoyées par le backend
 * lorsqu'un utilisateur dépasse son quota ou a un abonnement expiré.
 * 
 * @see API DOCUMENTATION/chat/README.md - Section "Gestion des erreurs"
 */

/**
 * Types d'erreurs liées aux abonnements et quotas
 */
export type SubscriptionErrorType =
  | 'quota_exhausted'        // Quota de tokens/requêtes épuisé pour la période
  | 'subscription_expired'   // Abonnement expiré (période de grâce terminée)
  | 'subscription_inactive'  // Abonnement inactif (non renouvelé)
  | 'plan_limit_reached'     // Limite du plan atteinte (fonctionnalité non disponible)
  | 'payment_required'       // Paiement requis pour continuer
  | 'feature_not_available'; // Fonctionnalité non incluse dans le plan

/**
 * Métadonnées d'erreur enrichies envoyées par le backend
 * Ces métadonnées sont incluses dans les événements d'erreur WebSocket
 */
export interface SubscriptionErrorMetadata {
  /** Type d'erreur d'abonnement */
  error_type?: SubscriptionErrorType;
  
  /** URL pour renouveler/mettre à jour l'abonnement */
  subscription_renewal_url?: string;
  
  /** Indique si une action utilisateur est requise */
  requires_action?: boolean;
  
  /** Indique si une mise à niveau du plan est nécessaire */
  upgradeRequired?: boolean;
  
  /** Date de réinitialisation du quota (ISO 8601) */
  quota_reset_date?: string;
  
  /** Plan actuel de l'utilisateur */
  current_plan?: string;
  
  /** Usage actuel vs limite */
  current_usage?: number;
  limit?: number;
  
  /** Fonctionnalité concernée (pour plan_limit_reached) */
  feature?: string;
  
  /** Jours restants avant expiration complète */
  grace_period_days_remaining?: number;
}

/**
 * État d'erreur d'abonnement pour l'UI
 */
export interface SubscriptionErrorState {
  /** Indique s'il y a une erreur d'abonnement active */
  hasError: boolean;
  
  /** Type d'erreur */
  errorType: SubscriptionErrorType | null;
  
  /** Message d'erreur à afficher */
  message: string;
  
  /** URL de renouvellement */
  renewalUrl: string | null;
  
  /** Action requise */
  requiresAction: boolean;
  
  /** Date de réinitialisation du quota */
  quotaResetDate: Date | null;
  
  /** Jours restants (période de grâce) */
  gracePeriodDaysRemaining: number | null;
}

/**
 * URL par défaut pour le renouvellement d'abonnement
 * Peut être surchargée par la variable d'environnement VITE_SUBSCRIPTION_RENEWAL_URL
 */
export const DEFAULT_SUBSCRIPTION_RENEWAL_URL = 
  import.meta.env.VITE_SUBSCRIPTION_RENEWAL_URL || 'https://wanzo.com/abonnement';

/**
 * Messages d'erreur localisés par type
 */
export const SUBSCRIPTION_ERROR_MESSAGES: Record<SubscriptionErrorType, string> = {
  quota_exhausted: 'Votre quota de requêtes pour ce mois est épuisé.',
  subscription_expired: 'Votre abonnement a expiré.',
  subscription_inactive: 'Votre abonnement est inactif.',
  plan_limit_reached: 'Vous avez atteint la limite de votre plan actuel.',
  payment_required: 'Un paiement est requis pour continuer à utiliser ce service.',
  feature_not_available: 'Cette fonctionnalité n\'est pas disponible dans votre plan actuel.',
};

/**
 * Parse les métadonnées d'erreur depuis un chunk d'erreur WebSocket
 * 
 * @param metadata - Métadonnées brutes de l'erreur
 * @returns État d'erreur d'abonnement structuré
 */
export function parseSubscriptionError(
  metadata?: Record<string, unknown>
): SubscriptionErrorState {
  // État par défaut (pas d'erreur d'abonnement)
  const defaultState: SubscriptionErrorState = {
    hasError: false,
    errorType: null,
    message: '',
    renewalUrl: null,
    requiresAction: false,
    quotaResetDate: null,
    gracePeriodDaysRemaining: null,
  };

  if (!metadata) return defaultState;

  const errorType = metadata.error_type as SubscriptionErrorType | undefined;
  
  // Vérifier si c'est une erreur d'abonnement reconnue
  if (!errorType || !Object.keys(SUBSCRIPTION_ERROR_MESSAGES).includes(errorType)) {
    return defaultState;
  }

  // Construire l'état d'erreur
  const renewalUrl = (metadata.subscription_renewal_url as string) || DEFAULT_SUBSCRIPTION_RENEWAL_URL;
  const quotaResetDateStr = metadata.quota_reset_date as string | undefined;
  const gracePeriodDays = metadata.grace_period_days_remaining as number | undefined;

  return {
    hasError: true,
    errorType,
    message: SUBSCRIPTION_ERROR_MESSAGES[errorType],
    renewalUrl,
    requiresAction: Boolean(metadata.requires_action),
    quotaResetDate: quotaResetDateStr ? new Date(quotaResetDateStr) : null,
    gracePeriodDaysRemaining: gracePeriodDays ?? null,
  };
}

/**
 * Détermine la sévérité de l'erreur pour le style visuel
 * 
 * @param errorType - Type d'erreur d'abonnement
 * @returns 'error' | 'warning' | 'info'
 */
export function getSubscriptionErrorSeverity(
  errorType: SubscriptionErrorType | null
): 'error' | 'warning' | 'info' {
  if (!errorType) return 'info';

  switch (errorType) {
    case 'subscription_expired':
    case 'subscription_inactive':
      return 'error'; // Rouge - action urgente requise
    
    case 'quota_exhausted':
    case 'plan_limit_reached':
      return 'warning'; // Orange - attention requise
    
    case 'payment_required':
    case 'feature_not_available':
      return 'info'; // Bleu - informatif
    
    default:
      return 'info';
  }
}

/**
 * Formate la date de réinitialisation du quota pour l'affichage
 * 
 * @param date - Date de réinitialisation
 * @returns Chaîne formatée localisée
 */
export function formatQuotaResetDate(date: Date | null): string {
  if (!date) return '';
  
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Vérifie si une erreur est une erreur d'abonnement
 * 
 * @param error - Erreur à vérifier
 * @returns true si c'est une erreur d'abonnement
 */
export function isSubscriptionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  
  const metadata = (error as { metadata?: Record<string, unknown> }).metadata;
  if (!metadata) return false;
  
  const errorType = metadata.error_type as string | undefined;
  return !!errorType && Object.keys(SUBSCRIPTION_ERROR_MESSAGES).includes(errorType);
}
