/**
 * OnboardingBanner - Bannière d'information pour les portefeuilles vides
 * 
 * S'affiche quand un portefeuille existe mais n'a pas encore de demandes de crédit
 * ou de contrats. Guide l'utilisateur vers les prochaines étapes.
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Info, 
  X, 
  FileText, 
  Settings, 
  HelpCircle,
  ArrowRight,
  Lightbulb,
  LucideIcon
} from 'lucide-react';
import { Button } from '../ui/Button';

interface OnboardingBannerProps {
  /** Type de contenu manquant */
  type: 'no_requests' | 'no_contracts' | 'no_products' | 'empty_portfolio';
  /** Callback pour créer l'élément manquant */
  onCreate?: () => void;
  /** Permet de masquer la bannière */
  dismissible?: boolean;
  /** ID du portefeuille actuel */
  portfolioId?: string;
}

// Interface pour la configuration
interface BannerConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction: {
    label: string;
    onClick: (() => void) | undefined;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  tips: string[];
}

export const OnboardingBanner: React.FC<OnboardingBannerProps> = ({
  type,
  onCreate,
  dismissible = true,
  portfolioId
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentPortfolioId = portfolioId || id;
  
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Clé de localStorage pour persister l'état de fermeture
  const dismissKey = `onboarding_banner_${type}_${currentPortfolioId}_dismissed`;
  
  // Vérifier si déjà fermé
  React.useEffect(() => {
    const wasDismissed = localStorage.getItem(dismissKey);
    if (wasDismissed) {
      setIsDismissed(true);
    }
  }, [dismissKey]);

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(dismissKey, 'true');
  };

  // Configuration selon le type
  const configs: Record<OnboardingBannerProps['type'], BannerConfig> = {
    no_requests: {
      icon: FileText,
      title: 'Aucune demande de crédit',
      description: 'Votre portefeuille est prêt ! Vous pouvez maintenant recevoir des demandes de crédit ou en créer manuellement.',
      primaryAction: {
        label: 'Créer une demande',
        onClick: onCreate
      },
      secondaryAction: {
        label: 'Configurer les produits',
        onClick: () => navigate(`/app/traditional/${currentPortfolioId}`)
      },
      tips: [
        'Les demandes de crédit peuvent être soumises par les clients via le portail',
        'Vous pouvez aussi créer des demandes manuellement pour vos clients'
      ]
    },
    no_contracts: {
      icon: FileText,
      title: 'Aucun contrat actif',
      description: 'Vous n\'avez pas encore de contrats de crédit. Les contrats sont créés après validation des demandes.',
      primaryAction: {
        label: 'Voir les demandes',
        onClick: () => navigate(`/app/traditional/${currentPortfolioId}`)
      },
      secondaryAction: undefined,
      tips: [
        'Validez une demande de crédit pour créer un contrat',
        'Les contrats actifs apparaîtront dans l\'onglet Contrats'
      ]
    },
    no_products: {
      icon: Settings,
      title: 'Configurez vos produits financiers',
      description: 'Définissez les types de crédits que vous proposez : taux, durées, conditions.',
      primaryAction: {
        label: 'Ajouter un produit',
        onClick: onCreate || (() => navigate(`/app/traditional/${currentPortfolioId}`))
      },
      secondaryAction: undefined,
      tips: [
        'Les produits définissent les caractéristiques de vos offres de crédit',
        'Vous pouvez créer plusieurs produits avec différentes conditions'
      ]
    },
    empty_portfolio: {
      icon: Lightbulb,
      title: 'Votre portefeuille est vide',
      description: 'C\'est normal pour un nouveau portefeuille ! Commencez par configurer vos produits financiers, puis créez ou recevez des demandes de crédit.',
      primaryAction: {
        label: 'Configurer le portefeuille',
        onClick: () => navigate(`/app/traditional/${currentPortfolioId}`)
      },
      secondaryAction: {
        label: 'Voir l\'aide',
        onClick: () => navigate('/app/traditional/help')
      },
      tips: [
        'Étape 1 : Configurez vos produits financiers dans les paramètres',
        'Étape 2 : Créez ou recevez des demandes de crédit',
        'Étape 3 : Validez les demandes pour générer des contrats'
      ]
    }
  };

  const currentConfig = configs[type];
  const Icon = currentConfig.icon;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6 relative">
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1 pr-8">
            {currentConfig.title}
          </h3>
          
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            {currentConfig.description}
          </p>

          {/* Tips */}
          {currentConfig.tips && currentConfig.tips.length > 0 && (
            <div className="mb-4 space-y-1">
              {currentConfig.tips.map((tip, index) => (
                <p key={index} className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  {tip}
                </p>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {currentConfig.primaryAction && currentConfig.primaryAction.onClick && (
              <Button
                size="sm"
                onClick={currentConfig.primaryAction.onClick}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {currentConfig.primaryAction.label}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
            
            {currentConfig.secondaryAction && (
              <Button
                size="sm"
                variant="outline"
                onClick={currentConfig.secondaryAction.onClick}
                className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800/50"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                {currentConfig.secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingBanner;
