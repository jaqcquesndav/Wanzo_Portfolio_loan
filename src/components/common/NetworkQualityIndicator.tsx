/**
 * Composant d'indicateur de qualité réseau
 * Affiche un badge visuel de l'état de la connexion
 */

import React, { useState, useEffect } from 'react';
import { 
  SignalIcon,
  SignalSlashIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface NetworkQualityIndicatorProps {
  /** Afficher comme badge compact */
  compact?: boolean;
  /** Afficher le texte descriptif */
  showLabel?: boolean;
  /** Afficher les détails au survol */
  showTooltip?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
}

export const NetworkQualityIndicator: React.FC<NetworkQualityIndicatorProps> = ({
  compact = false,
  showLabel = true,
  showTooltip = true,
  className = '',
}) => {
  const status = useNetworkStatus();
  const [showDetails, setShowDetails] = useState(false);

  const getIcon = () => {
    if (status.isOffline) {
      return <SignalSlashIcon className="h-4 w-4" />;
    }
    if (status.isPoor) {
      return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
    return <SignalIcon className="h-4 w-4" />;
  };

  const getColor = () => {
    if (status.isOffline) return 'text-red-500 dark:text-red-400';
    if (status.isPoor) return 'text-yellow-500 dark:text-yellow-400';
    if (status.isFair) return 'text-yellow-400 dark:text-yellow-300';
    if (status.isGood) return 'text-green-500 dark:text-green-400';
    return 'text-green-600 dark:text-green-300';
  };

  const getBgColor = () => {
    if (status.isOffline) return 'bg-red-100 dark:bg-red-900/30';
    if (status.isPoor) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (status.isFair) return 'bg-yellow-50 dark:bg-yellow-900/20';
    if (status.isGood) return 'bg-green-100 dark:bg-green-900/30';
    return 'bg-green-50 dark:bg-green-900/20';
  };

  const getLabel = () => {
    if (status.isOffline) return 'Hors ligne';
    if (status.isPoor) return 'Connexion faible';
    if (status.isFair) return 'Connexion moyenne';
    if (status.isGood) return 'Bonne connexion';
    return 'Excellente connexion';
  };

  const getSignalBars = () => {
    if (status.isOffline) return 0;
    if (status.isPoor) return 1;
    if (status.isFair) return 2;
    if (status.isGood) return 3;
    return 4;
  };

  if (compact) {
    return (
      <div 
        className={`relative ${className}`}
        onMouseEnter={() => showTooltip && setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        <div className={`p-1 rounded ${getBgColor()} ${getColor()}`}>
          {getIcon()}
        </div>
        
        {showDetails && (
          <div className="absolute z-50 top-full right-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {getLabel()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {status.effectiveType !== 'unknown' && (
                <span className="mr-2">Type: {status.effectiveType}</span>
              )}
              {status.downlink > 0 && (
                <span>↓ {status.downlink.toFixed(1)} Mbps</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      onMouseEnter={() => showTooltip && setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getBgColor()}`}>
        <span className={getColor()}>{getIcon()}</span>
        
        {/* Barres de signal */}
        <div className="flex items-end gap-0.5 h-3">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`w-1 rounded-sm transition-all ${
                bar <= getSignalBars()
                  ? getColor().replace('text-', 'bg-')
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              style={{ height: `${bar * 3}px` }}
            />
          ))}
        </div>
        
        {showLabel && (
          <span className={`text-xs font-medium ${getColor()}`}>
            {getLabel()}
          </span>
        )}
      </div>

      {showDetails && showTooltip && (
        <div className="absolute z-50 mt-8 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[200px]">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Qualité:</span>
              <span className={`font-medium ${getColor()}`}>{status.quality}</span>
            </div>
            {status.effectiveType !== 'unknown' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                <span className="text-gray-900 dark:text-white">{status.effectiveType}</span>
              </div>
            )}
            {status.downlink > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Débit:</span>
                <span className="text-gray-900 dark:text-white">{status.downlink.toFixed(1)} Mbps</span>
              </div>
            )}
            {status.rtt > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Latence:</span>
                <span className="text-gray-900 dark:text-white">{status.rtt} ms</span>
              </div>
            )}
            {status.saveData && (
              <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                <ExclamationTriangleIcon className="h-3 w-3" />
                Mode économie de données activé
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Composant de bannière de connexion (pour afficher en haut de page)
 */
export const ConnectionBanner: React.FC<{
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}> = ({ 
  onDismiss, 
  autoDismiss = true, 
  autoDismissDelay = 5000 
}) => {
  const status = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ((status.isOffline || status.isPoor) && !dismissed) {
      setVisible(true);
      
      if (autoDismiss) {
        const timer = setTimeout(() => {
          setVisible(false);
        }, autoDismissDelay);
        return () => clearTimeout(timer);
      }
    } else if (status.isOnline && !status.isPoor) {
      setVisible(false);
      setDismissed(false);
    }
  }, [status.isOffline, status.isPoor, status.isOnline, dismissed, autoDismiss, autoDismissDelay]);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`
      fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96
      ${status.isOffline ? 'bg-red-500' : 'bg-yellow-500'} text-white
      rounded-lg shadow-lg p-4
      flex items-start gap-3
      animate-slideUp z-50
    `}>
      <span className="text-2xl">
        {status.isOffline ? '📴' : '📶'}
      </span>
      <div className="flex-1">
        <h4 className="font-semibold">
          {status.isOffline ? 'Hors ligne' : 'Connexion lente'}
        </h4>
        <p className="text-sm opacity-90">
          {status.isOffline 
            ? 'Vous êtes hors ligne. Les données locales sont utilisées.' 
            : 'Votre connexion est lente. Le chargement peut prendre plus de temps.'}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="text-white/80 hover:text-white transition-colors"
        aria-label="Fermer"
      >
        ✕
      </button>
    </div>
  );
};

export default NetworkQualityIndicator;
