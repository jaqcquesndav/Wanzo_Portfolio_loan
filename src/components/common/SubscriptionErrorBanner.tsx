// src/components/common/SubscriptionErrorBanner.tsx
/**
 * Bannière d'affichage des erreurs d'abonnement et quota
 * 
 * Affiche une bannière contextuelle lorsque l'utilisateur rencontre
 * une erreur liée à son abonnement ou quota de requêtes.
 */

import React from 'react';
import { X, AlertTriangle, AlertCircle, Info, ExternalLink, RefreshCw } from 'lucide-react';
import type { SubscriptionErrorState } from '../../types/subscription-errors';
import { 
  getSubscriptionErrorSeverity, 
  formatQuotaResetDate 
} from '../../types/subscription-errors';

interface SubscriptionErrorBannerProps {
  /** État de l'erreur d'abonnement */
  error: SubscriptionErrorState;
  
  /** Callback pour fermer la bannière */
  onDismiss?: () => void;
  
  /** Afficher le bouton de fermeture */
  showDismiss?: boolean;
  
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Styles par sévérité
 */
const severityStyles = {
  error: {
    container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-800 dark:text-red-200',
    text: 'text-red-700 dark:text-red-300',
    button: 'bg-red-600 hover:bg-red-700 text-white',
    secondaryButton: 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200',
  },
  warning: {
    container: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    title: 'text-amber-800 dark:text-amber-200',
    text: 'text-amber-700 dark:text-amber-300',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
    secondaryButton: 'text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200',
  },
  info: {
    container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-800 dark:text-blue-200',
    text: 'text-blue-700 dark:text-blue-300',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondaryButton: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200',
  },
};

/**
 * Icône par sévérité
 */
const SeverityIcon: React.FC<{ severity: 'error' | 'warning' | 'info'; className?: string }> = ({ 
  severity, 
  className = 'h-5 w-5' 
}) => {
  switch (severity) {
    case 'error':
      return <AlertCircle className={className} />;
    case 'warning':
      return <AlertTriangle className={className} />;
    case 'info':
    default:
      return <Info className={className} />;
  }
};

/**
 * Titres par type d'erreur
 */
const errorTitles: Record<string, string> = {
  quota_exhausted: 'Quota épuisé',
  subscription_expired: 'Abonnement expiré',
  subscription_inactive: 'Abonnement inactif',
  plan_limit_reached: 'Limite atteinte',
  payment_required: 'Paiement requis',
  feature_not_available: 'Fonctionnalité non disponible',
};

export function SubscriptionErrorBanner({
  error,
  onDismiss,
  showDismiss = true,
  className = '',
}: SubscriptionErrorBannerProps) {
  // Ne pas afficher si pas d'erreur
  if (!error.hasError || !error.errorType) {
    return null;
  }

  const severity = getSubscriptionErrorSeverity(error.errorType);
  const styles = severityStyles[severity];
  const title = errorTitles[error.errorType] || 'Erreur d\'abonnement';

  const handleRenewal = () => {
    if (error.renewalUrl) {
      window.open(error.renewalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      role="alert"
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border
        ${styles.container}
        ${className}
      `}
    >
      {/* Icône */}
      <div className={`flex-shrink-0 ${styles.icon}`}>
        <SeverityIcon severity={severity} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        {/* Titre */}
        <h4 className={`font-semibold text-sm ${styles.title}`}>
          {title}
        </h4>
        
        {/* Message */}
        <p className={`mt-1 text-sm ${styles.text}`}>
          {error.message}
        </p>

        {/* Informations supplémentaires */}
        <div className="mt-2 space-y-1">
          {/* Date de réinitialisation du quota */}
          {error.quotaResetDate && (
            <p className={`text-xs ${styles.text} flex items-center gap-1`}>
              <RefreshCw className="h-3 w-3" />
              Réinitialisation le {formatQuotaResetDate(error.quotaResetDate)}
            </p>
          )}

          {/* Période de grâce */}
          {error.gracePeriodDaysRemaining !== null && error.gracePeriodDaysRemaining > 0 && (
            <p className={`text-xs ${styles.text}`}>
              ⏳ {error.gracePeriodDaysRemaining} jour{error.gracePeriodDaysRemaining > 1 ? 's' : ''} restant{error.gracePeriodDaysRemaining > 1 ? 's' : ''} avant suspension
            </p>
          )}
        </div>

        {/* Actions */}
        {error.requiresAction && error.renewalUrl && (
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleRenewal}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md
                transition-colors duration-150
                ${styles.button}
              `}
            >
              Renouveler mon abonnement
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Bouton fermer */}
      {showDismiss && onDismiss && (
        <button
          onClick={onDismiss}
          className={`
            flex-shrink-0 p-1 rounded-md transition-colors
            ${styles.secondaryButton}
          `}
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default SubscriptionErrorBanner;
