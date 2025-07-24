// src/utils/localStorageInit.ts
import { 
  mockAmortizationSchedules,
  saveAmortizationSchedulesToLocalStorage
} from '../data/mockAmortizationSchedules';

// Fonction pour initialiser le localStorage avec les données mock
export const initializeLocalStorage = (): void => {
  try {
    // Vérifier si les données d'échéancier existent déjà
    if (!localStorage.getItem('amortizationSchedules')) {
      console.log('Initialisation des données d\'échéanciers dans le localStorage');
      saveAmortizationSchedulesToLocalStorage(mockAmortizationSchedules);
    }
    
    // Ajouter ici d'autres initialisations si nécessaire
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du localStorage:', error);
  }
};
