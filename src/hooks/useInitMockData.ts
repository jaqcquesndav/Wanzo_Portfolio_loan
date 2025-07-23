// src/hooks/useInitMockData.ts
import { useState, useEffect, useCallback } from 'react';
import { mockDataInitializerService } from '../services/storage/mockDataInitializer';
import { initializeAllStorageData, isStorageInitialized } from '../services/storage';
import { dataValidationService } from '../services/validation/dataValidationService';

/**
 * Hook optimisé pour initialiser et gérer les données mock
 * 
 * Ce hook utilise le service mockDataInitializerService pour gérer l'initialisation
 * et la réinitialisation des données mock. Il fournit des états pour suivre le statut
 * de l'initialisation et expose des méthodes pour réinitialiser les données.
 * 
 * Optimisations:
 * - Initialisation parallèle des données essentielles
 * - Validation différée pour éviter de bloquer le rendu initial
 * - Mise en cache des résultats d'initialisation
 */
export function useInitMockData() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);

  // Initialisation au chargement du composant
  useEffect(() => {
    // Vérifier si on a déjà initialisé dans cette session
    const sessionInitialized = sessionStorage.getItem('app_initialized');
    if (sessionInitialized === 'true') {
      console.log('Application déjà initialisée dans cette session, chargement accéléré');
      setIsInitialized(true);
      setLoading(false);
      return;
    }

    const initialize = async () => {
      setLoading(true);
      const startTime = performance.now();

      try {
        // Paralléliser certaines opérations d'initialisation
        const [isDataInitialized, isStorageInit] = await Promise.all([
          mockDataInitializerService.checkDataInitialized(),
          Promise.resolve(isStorageInitialized())
        ]);
        
        // Initialiser les données si nécessaire
        if (!isDataInitialized) {
          console.log('Initialisation des données mock...');
          await mockDataInitializerService.initializeMockData();
        }
        
        // Initialiser le stockage si nécessaire
        if (!isStorageInit) {
          console.log('Initialisation du stockage...');
          await initializeAllStorageData();
        }
        
        // Marquer comme initialisé pour cette session
        sessionStorage.setItem('app_initialized', 'true');
        setIsInitialized(true);
        
        // Effectuer la validation en arrière-plan sans bloquer le rendu
        setTimeout(async () => {
          try {
            const guaranteeValidation = await dataValidationService.validateGuaranteeData();
            if (!guaranteeValidation.valid) {
              setValidationIssues(guaranteeValidation.issues);
              console.warn('Problèmes de validation détectés:', guaranteeValidation.issues);
            } else {
              setValidationIssues([]);
            }
          } catch (validationError) {
            console.error('Erreur lors de la validation:', validationError);
          }
        }, 0);

        const endTime = performance.now();
        console.log(`Initialisation terminée en ${(endTime - startTime).toFixed(1)}ms`);
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
    setValidationIssues([]);
    try {
      await mockDataInitializerService.resetMockData();
      // Réinitialiser également les données de stockage pour les formulaires de risque
      await initializeAllStorageData();
      
      // Vérifier l'intégrité des données après réinitialisation
      const guaranteeValidation = await dataValidationService.validateGuaranteeData();
      if (!guaranteeValidation.valid) {
        setValidationIssues(guaranteeValidation.issues);
        console.warn('Problèmes de validation après réinitialisation:', guaranteeValidation.issues);
      }
      
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

  return { 
    isInitialized, 
    loading, 
    error, 
    resetMockData, 
    checkMockDataVersion,
    validationIssues 
  };
}
