// src/services/api/leasing/useInitData.ts
import { useEffect } from 'react';
import { leasingDataService } from './dataService';

/**
 * Hook pour initialiser les données spécifiques au leasing
 * 
 * Ce hook s'assure que les données nécessaires pour le module de leasing
 * sont correctement chargées et initialisées avant utilisation.
 */
export function useInitData() {
  useEffect(() => {
    const initializeLeasingData = async () => {
      try {
        // Vérifier si les données de leasing sont déjà initialisées
        const isInitialized = await leasingDataService.checkDataInitialized();
        
        if (!isInitialized) {
          console.log('Initialisation des données de leasing...');
          await leasingDataService.initializeData();
          console.log('Données de leasing initialisées avec succès');
        } else {
          console.log('Données de leasing déjà initialisées');
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des données de leasing:', error);
      }
    };

    initializeLeasingData();
  }, []);

  // Ce hook ne retourne rien car il est utilisé uniquement pour ses effets secondaires
  return;
}
