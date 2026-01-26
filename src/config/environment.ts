// src/config/environment.ts
/**
 * Configuration d'environnement centralisée
 * 
 * Ce fichier centralise toutes les vérifications d'environnement pour:
 * - Déterminer si l'application est en production ou développement
 * - Activer/désactiver les fonctionnalités selon l'environnement
 * - Gérer les flags de configuration globaux
 */

/**
 * Variables d'environnement avec valeurs par défaut sécurisées
 */
const env = {
  VITE_PRODUCTION_MODE: import.meta.env.VITE_PRODUCTION_MODE,
  VITE_ALLOW_MOCKS: import.meta.env.VITE_ALLOW_MOCKS,
  VITE_ALLOW_OFFLINE_FALLBACK: import.meta.env.VITE_ALLOW_OFFLINE_FALLBACK,
  VITE_ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING,
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV,
  MODE: import.meta.env.MODE,
};

/**
 * Détermine si l'application est en mode production
 * En production: pas de mocks, pas de données fallback locales
 */
export const isProduction: boolean = 
  env.VITE_PRODUCTION_MODE === 'true' || 
  env.PROD === true || 
  env.MODE === 'production' ||
  // Par défaut, considérer comme production pour la sécurité
  (!env.DEV && !env.VITE_ALLOW_MOCKS);

/**
 * Détermine si l'application est en mode développement
 */
export const isDevelopment: boolean = 
  env.DEV === true || 
  env.MODE === 'development' ||
  env.VITE_ALLOW_MOCKS === 'true';

/**
 * Autorise l'utilisation des données mock (DEV uniquement)
 */
export const allowMockData: boolean = 
  isDevelopment && 
  !isProduction &&
  env.VITE_ALLOW_MOCKS !== 'false';

/**
 * Autorise le fallback localStorage en cas d'échec API (offline mode)
 */
export const allowOfflineFallback: boolean = 
  env.VITE_ALLOW_OFFLINE_FALLBACK === 'true';

/**
 * Active les logs détaillés
 */
export const enableDetailedLogging: boolean = 
  isDevelopment || 
  env.VITE_ENABLE_LOGGING === 'true';

/**
 * Configuration d'environnement exportée
 */
export const EnvironmentConfig = {
  isProduction,
  isDevelopment,
  allowMockData,
  allowOfflineFallback,
  enableDetailedLogging,
  
  /**
   * Affiche la configuration actuelle (pour le debugging)
   */
  logConfig() {
    console.group('🔧 Environment Configuration');
    console.log('isProduction:', this.isProduction);
    console.log('isDevelopment:', this.isDevelopment);
    console.log('allowMockData:', this.allowMockData);
    console.log('allowOfflineFallback:', this.allowOfflineFallback);
    console.log('enableDetailedLogging:', this.enableDetailedLogging);
    console.groupEnd();
  },
  
  /**
   * Vérifie si une fonctionnalité est disponible selon l'environnement
   */
  isFeatureEnabled(feature: 'mock' | 'offline' | 'logging'): boolean {
    switch (feature) {
      case 'mock':
        return this.allowMockData;
      case 'offline':
        return this.allowOfflineFallback;
      case 'logging':
        return this.enableDetailedLogging;
      default:
        return false;
    }
  }
} as const;

// Log de configuration au démarrage (en développement uniquement)
if (isDevelopment) {
  EnvironmentConfig.logConfig();
}
