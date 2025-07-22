/**
 * Service d'initialisation des données mock
 * 
 * Ce service centralise l'initialisation des données mock pour tous les services
 * de stockage. Il permet d'avoir un point unique pour réinitialiser toutes les
 * données de test en une seule opération.
 */

import { mockTraditionalPortfolios } from '../../data/mockTraditionalPortfolios';
import { mockInvestmentPortfolios } from '../../data/mockInvestmentPortfolios';
import { mockLeasingPortfolios } from '../../data/mockLeasingPortfolios';
import type { PortfolioWithType } from '../../types/portfolio';
import { guaranteesStorageService } from './guaranteesStorage';

/**
 * Classe de service pour l'initialisation et la gestion des données mock
 */
class MockDataInitializerService {
  private readonly MOCK_DATA_INITIALIZED_KEY = 'mockDataInitialized';
  private readonly PORTFOLIOS_KEY = 'portfolios';
  
  /**
   * Initialise toutes les données mock si ce n'est pas déjà fait
   * 
   * @returns {Promise<void>}
   */
  async initializeMockData(): Promise<void> {
    try {
      // Vérifier si les données sont déjà initialisées
      const hasBeenInitialized = localStorage.getItem(this.MOCK_DATA_INITIALIZED_KEY) === 'true';

      if (!hasBeenInitialized) {
        console.info('Initialisation des données mock...');

        // Initialiser les portefeuilles
        await this.initializePortfolios();
        
        // Initialiser les garanties
        await guaranteesStorageService.initializeDefaultData();
        
        // Marquer comme initialisé
        localStorage.setItem(this.MOCK_DATA_INITIALIZED_KEY, 'true');
        
        console.info('Initialisation des données mock terminée avec succès');
      } else {
        console.info('Les données mock sont déjà initialisées');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des données mock:', error);
      throw error;
    }
  }
  
  /**
   * Initialise les données de portefeuilles
   * 
   * @returns {Promise<void>}
   * @private
   */
  private async initializePortfolios(): Promise<void> {
    // Vider les anciennes données
    localStorage.removeItem(this.PORTFOLIOS_KEY);
    
    // Validation des données mockées
    if (!Array.isArray(mockTraditionalPortfolios)) {
      throw new Error("Les données mockTraditionalPortfolios ne sont pas un tableau");
    }
    if (!Array.isArray(mockInvestmentPortfolios)) {
      throw new Error("Les données mockInvestmentPortfolios ne sont pas un tableau");
    }
    if (!Array.isArray(mockLeasingPortfolios)) {
      throw new Error("Les données mockLeasingPortfolios ne sont pas un tableau");
    }
    
    // Combiner toutes les données mockées
    const allPortfolios: PortfolioWithType[] = [
      ...mockTraditionalPortfolios,
      ...mockInvestmentPortfolios,
      ...mockLeasingPortfolios
    ];
    
    // Log pour debug
    console.info(`Initialisation des données mock: ${allPortfolios.length} portefeuilles au total`);
    console.info(`- ${mockTraditionalPortfolios.length} portefeuilles traditionnels`);
    console.info(`- ${mockInvestmentPortfolios.length} portefeuilles d'investissement`);
    console.info(`- ${mockLeasingPortfolios.length} portefeuilles de leasing`);
    
    // Sauvegarder dans localStorage
    localStorage.setItem(this.PORTFOLIOS_KEY, JSON.stringify(allPortfolios));
  }

  /**
   * Réinitialise toutes les données mock
   * 
   * @returns {Promise<void>}
   */
  async resetMockData(): Promise<void> {
    // Supprimer l'indicateur d'initialisation
    localStorage.removeItem(this.MOCK_DATA_INITIALIZED_KEY);
    
    // Réinitialiser
    return this.initializeMockData();
  }
  
  /**
   * Vérifie si les données sont initialisées
   * 
   * @returns {Promise<boolean>} True si les données sont initialisées
   */
  async checkDataInitialized(): Promise<boolean> {
    return localStorage.getItem(this.MOCK_DATA_INITIALIZED_KEY) === 'true';
  }
}

// Exporter une instance singleton du service
export const mockDataInitializerService = new MockDataInitializerService();

// Fonctions de compatibilité pour l'API existante
export const initializeMockData = () => mockDataInitializerService.initializeMockData();
export const resetMockData = () => mockDataInitializerService.resetMockData();
