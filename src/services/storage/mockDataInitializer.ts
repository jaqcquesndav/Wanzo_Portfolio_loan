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
import { mockAmortizationSchedules, saveAmortizationSchedulesToLocalStorage } from '../../data/mockAmortizationSchedules';
import type { PortfolioWithType } from '../../types/portfolioWithType';
import { guaranteeStorageService } from './guaranteeStorageUnified';
import { centraleRisqueStorageService } from './centraleRisqueStorage';
import { initCompaniesData, STORAGE_KEYS } from '../../scripts/initLocalStorage';
import { dataValidationService } from '../validation/dataValidationService';

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
        
        // Initialiser les échéanciers d'amortissement
        this.initializeAmortizationSchedules();
        
        // Initialiser les garanties
        await guaranteeStorageService.initializeDefaultData();
        
        // Initialiser les données d'entreprises
        initCompaniesData();
        
        // Initialiser les données de la centrale de risque
        await centraleRisqueStorageService.initializeDefaultData();
        
        // Marquer comme initialisé
        localStorage.setItem(this.MOCK_DATA_INITIALIZED_KEY, 'true');
        
        console.info('Initialisation des données mock terminée avec succès');
      } else {
        console.info('Les données mock sont déjà initialisées');
        
        // Vérifier si les données d'entreprises sont initialisées
        if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
          console.info('Initialisation des données d\'entreprises manquantes...');
          initCompaniesData();
        }
      }
      
      // Valider l'intégrité des données
      await this.validateDataIntegrity();
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des données mock:', error);
      throw error;
    }
  }
  
  /**
   * Initialise les données d'échéanciers d'amortissement
   * 
   * @returns {void}
   * @private
   */
  private initializeAmortizationSchedules(): void {
    try {
      // Vérifier si les données d'échéanciers existent déjà
      const existingData = localStorage.getItem('amortizationSchedules');
      
      if (!existingData) {
        console.info('Initialisation des données d\'échéanciers d\'amortissement...');
        saveAmortizationSchedulesToLocalStorage(mockAmortizationSchedules);
        console.info('Données d\'échéanciers d\'amortissement initialisées avec succès');
      } else {
        console.info('Les données d\'échéanciers d\'amortissement sont déjà initialisées');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des données d\'échéanciers:', error);
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
   * Valide l'intégrité des données critiques et tente de les réparer si nécessaire
   * 
   * @returns {Promise<void>}
   * @private
   */
  private async validateDataIntegrity(): Promise<void> {
    console.info('Validation de l\'intégrité des données critiques...');
    
    // Valider les données de garanties
    const guaranteeValidation = await dataValidationService.validateGuaranteeData();
    
    if (!guaranteeValidation.valid) {
      console.warn('Problèmes détectés dans les données de garanties:', guaranteeValidation.issues);
      
      // Tenter de réparer les données
      console.info('Tentative de réparation des données de garanties...');
      const repairResult = await dataValidationService.repairGuaranteeData();
      
      if (repairResult.success) {
        console.info('Réparation réussie:', repairResult.message);
      } else {
        console.error('Échec de la réparation:', repairResult.message);
      }
    } else {
      console.info('Les données de garanties sont valides.');
    }
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
