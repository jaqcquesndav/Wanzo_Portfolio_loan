import { useEffect } from 'react';
import { initLeasingData } from './leasingDataService';

// Ce hook initialise toutes les données de l'application au démarrage
export function useInitData() {
  useEffect(() => {
    // Initialiser les données de leasing
    initLeasingData();
    
    // On pourrait ajouter d'autres initialisations ici
    
    console.log('Données d\'application initialisées');
  }, []);
}
