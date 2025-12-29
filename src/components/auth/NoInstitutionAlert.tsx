/**
 * Composant d'alerte pour les utilisateurs sans institution
 * 
 * Affiché quand le user est authentifié mais n'a pas d'institution associée.
 * Propose soit le mode démo, soit de créer son institution sur wanzo.com
 */

import React from 'react';
import { AlertTriangle, ExternalLink, Play } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';

interface NoInstitutionAlertProps {
  /** Callback optionnel quand le mode démo est activé */
  onDemoActivated?: () => void;
}

export const NoInstitutionAlert: React.FC<NoInstitutionAlertProps> = ({ onDemoActivated }) => {
  const { enableDemoMode, contextStatus } = useAuth();

  // Ne rien afficher si pas dans l'état 'no_institution'
  if (contextStatus !== 'no_institution') {
    return null;
  }

  const handleEnableDemoMode = () => {
    enableDemoMode();
    onDemoActivated?.();
  };

  const handleGoToWanzo = () => {
    window.open('https://wanzo.com', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
            Aucune institution associée
          </h3>
          
          <p className="text-amber-700 dark:text-amber-300 mb-4">
            Votre compte n'est pas encore associé à une institution financière. 
            Pour utiliser toutes les fonctionnalités de Portfolio, vous devez d'abord créer 
            votre institution sur la plateforme Wanzo.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGoToWanzo}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Créer mon institution
            </button>
            
            <button
              onClick={handleEnableDemoMode}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              <Play className="w-4 h-4" />
              Explorer en mode démo
            </button>
          </div>
          
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-3">
            💡 Le mode démo vous permet d'explorer l'application avec des données fictives.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Badge compact indiquant le mode démo actif
 */
export const DemoModeBadge: React.FC = () => {
  const { isDemoMode } = useAuth();

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-full">
      <Play className="w-3.5 h-3.5" />
      Mode Démo
    </div>
  );
};

export default NoInstitutionAlert;
