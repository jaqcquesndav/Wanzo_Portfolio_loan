// src/hooks/useInitMockData.ts
import { useState, useEffect, useCallback } from 'react';
import { mockDataInitializerService } from '../services/storage/mockDataInitializer';

/**
 * Hook pour initialiser et gérer les données mock
 * 
 * Ce hook utilise le service mockDataInitializerService pour gérer l'initialisation
 * et la réinitialisation des données mock. Il fournit des états pour suivre le statut
 * de l'initialisation et expose des méthodes pour réinitialiser les données.
 */
export function useInitMockData() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialisation au chargement du composant
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        // Vérifier si les données sont déjà initialisées
        const isDataInitialized = await mockDataInitializerService.checkDataInitialized();
        
        if (!isDataInitialized) {
          // Initialiser les données si nécessaire
          await mockDataInitializerService.initializeMockData();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des données mock:', error);
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Fonction pour forcer la réinitialisation des données
  const resetMockData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await mockDataInitializerService.resetMockData();
      setIsInitialized(true);
      console.info('Données mock réinitialisées avec succès');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des données mock:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour vérifier si la version des données est à jour
  const checkMockDataVersion = useCallback(() => {
    const currentVersion = localStorage.getItem('mockDataVersion');
    // Définir une version basée sur la date pour forcer le rechargement après les mises à jour
    const requiredVersion = '2025-07-13';
    
    if (currentVersion !== requiredVersion) {
      console.log(`Mise à jour des données mock: version ${currentVersion || 'inconnue'} -> ${requiredVersion}`);
      resetMockData().then(() => {
        localStorage.setItem('mockDataVersion', requiredVersion);
      });
      return false;
    }
    return true;
  }, [resetMockData]);
  
  // Vérifier automatiquement la version des données au chargement
  useEffect(() => {
    if (isInitialized && !loading) {
      checkMockDataVersion();
    }
  }, [isInitialized, loading, checkMockDataVersion]);

  return { isInitialized, loading, error, resetMockData, checkMockDataVersion };
}
