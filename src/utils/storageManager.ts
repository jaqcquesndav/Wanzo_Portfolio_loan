// src/utils/storageManager.ts

/**
 * Utilitaire pour gérer le stockage local et traiter les erreurs de quota
 */
export const storageManager = {
  /**
   * Essaie de stocker une valeur dans localStorage avec gestion des erreurs
   * @param key Clé de stockage
   * @param value Valeur à stocker
   * @returns True si le stockage a réussi, false sinon
   */
  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Erreur lors du stockage de ${key}:`, error);
      
      // Si c'est une erreur de quota, tenter de libérer de l'espace
      if (error instanceof DOMException && 
          (error.name === 'QuotaExceededError' || 
           error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        
        this.clearOldData();
        
        // Réessayer après nettoyage
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (retryError) {
          console.error('Impossible de stocker les données même après nettoyage:', retryError);
          return false;
        }
      }
      
      return false;
    }
  },

  /**
   * Nettoie les données anciennes ou moins importantes pour libérer de l'espace
   */
  clearOldData(): void {
    console.log("Nettoyage du stockage local pour libérer de l'espace...");
    
    const keysToPreserve = [
      'currentPortfolioId',
      'portfolioType',
      'auth0_access_token',
      'auth0_id_token',
      'auth0_refresh_token',
      'auth0_user'
    ];
    
    // 1. D'abord supprimer les journaux et données temporaires
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
          key.includes('log') || 
          key.includes('temp') || 
          key.includes('cache') ||
          key.includes('history')
        )) {
        localStorage.removeItem(key);
      }
    }
    
    // 2. Supprimer les données les moins critiques si nécessaire
    const totalItems = localStorage.length;
    if (totalItems > 30) { // Si encore beaucoup d'éléments
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToPreserve.includes(key)) {
          // Conserver les clés essentielles, supprimer les autres
          localStorage.removeItem(key);
        }
      }
    }
  },
  
  /**
   * Récupère une valeur du stockage local avec gestion des erreurs
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Erreur lors de la récupération de ${key}:`, error);
      return null;
    }
  },
  
  /**
   * Supprime une valeur du stockage local avec gestion des erreurs
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Erreur lors de la suppression de ${key}:`, error);
      return false;
    }
  }
};
