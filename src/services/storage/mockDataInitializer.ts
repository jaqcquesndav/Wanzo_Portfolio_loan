/**
 * Service d'initialisation des données mock
 * 
 * Ce service centralise l'initialisation des données mock pour tous les services
 * de stockage. Il permet d'avoir un point unique pour réinitialiser toutes les
 * données de test en une seule opération.
 * 
 * ⚠️ IMPORTANT: En mode PRODUCTION, ce service ne fait RIEN.
 * Les données mock ne sont initialisées qu'en développement.
 */

import { isProduction, allowMockData } from '../../config/environment';
import type { PortfolioWithType } from '../../types/portfolioWithType';
import { STORAGE_KEYS } from '../../scripts/initLocalStorage';
import { dataValidationService } from '../validation/dataValidationService';

// Imports dynamiques pour éviter de charger les mocks en production
const getMockData = async () => {
  if (isProduction || !allowMockData) {
    return null;
  }
  
  const [
    { mockTraditionalPortfolios },
    { mockAmortizationSchedules, saveAmortizationSchedulesToLocalStorage },
    { guaranteeService },
    { centraleRisqueStorageService },
    { initCompaniesData }
  ] = await Promise.all([
    import('../../data/mockTraditionalPortfolios'),
    import('../../data/mockAmortizationSchedules'),
    import('../guaranteeService'),
    import('./centraleRisqueStorage'),
    import('../../scripts/initLocalStorage')
  ]);
  
  return {
    mockTraditionalPortfolios,
    mockAmortizationSchedules,
    saveAmortizationSchedulesToLocalStorage,
    guaranteeService,
    centraleRisqueStorageService,
    initCompaniesData
  };
};

/**
 * Classe de service pour l'initialisation et la gestion des données mock
 * 
 * ⚠️ En production, toutes les méthodes retournent immédiatement sans rien faire.
 */
class MockDataInitializerService {
  private readonly MOCK_DATA_INITIALIZED_KEY = 'mockDataInitialized';
  private readonly PORTFOLIOS_KEY = 'portfolios';
  
  /**
   * Initialise toutes les données mock si ce n'est pas déjà fait
   * 
   * ⚠️ En PRODUCTION, cette méthode ne fait RIEN et retourne immédiatement.
   * 
   * @returns {Promise<void>}
   */
  async initializeMockData(): Promise<void> {
    // ⛔ En production, ne jamais initialiser de données mock
    if (isProduction || !allowMockData) {
      console.log('[PROD] Mode production - pas d\'initialisation de données mock');
      return;
    }
    
    try {
      const mockData = await getMockData();
      if (!mockData) {
        console.log('[PROD] Données mock non disponibles en production');
        return;
      }
      
      // Vérifier si les données sont déjà initialisées
      const hasBeenInitialized = localStorage.getItem(this.MOCK_DATA_INITIALIZED_KEY) === 'true';

      if (!hasBeenInitialized) {
        console.info('[DEV] Initialisation des données mock...');

        // Initialiser les portefeuilles
        await this.initializePortfolios();
        
        // Initialiser les échéanciers d'amortissement
        await this.initializeAmortizationSchedules();
        
        // Initialiser les garanties
        await mockData.guaranteeService.initializeDefaultData();
        
        // Initialiser les données d'entreprises
        mockData.initCompaniesData();
        
        // Initialiser les données de la centrale de risque
        await mockData.centraleRisqueStorageService.initializeDefaultData();
        
        // Marquer comme initialisé
        localStorage.setItem(this.MOCK_DATA_INITIALIZED_KEY, 'true');
        
        console.info('[DEV] Initialisation des données mock terminée avec succès');
      } else {
        console.info('[DEV] Les données mock sont déjà initialisées');
        
        // Vérifier si les données d'entreprises sont initialisées
        if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
          console.info('[DEV] Initialisation des données d\'entreprises manquantes...');
          mockData.initCompaniesData();
        }
      }
      
      // Valider l'intégrité des données
      await this.validateDataIntegrity();
      
    } catch (error) {
      console.error('[DEV] Erreur lors de l\'initialisation des données mock:', error);
      throw error;
    }
  }
  
  /**
   * Initialise les données d'échéanciers d'amortissement
   * 
   * @returns {Promise<void>}
   * @private
   */
  private async initializeAmortizationSchedules(): Promise<void> {
    // En production, ne rien faire
    if (isProduction || !allowMockData) return;
    
    try {
      const mockData = await getMockData();
      if (!mockData) return;
      
      // Vérifier si les données d'échéanciers existent déjà
      const existingData = localStorage.getItem('amortizationSchedules');
      
      if (!existingData) {
        console.info('[DEV] Initialisation des données d\'échéanciers d\'amortissement...');
        mockData.saveAmortizationSchedulesToLocalStorage(mockData.mockAmortizationSchedules);
        console.info('[DEV] Données d\'échéanciers d\'amortissement initialisées avec succès');
      } else {
        console.info('[DEV] Les données d\'échéanciers d\'amortissement sont déjà initialisées');
      }
    } catch (error) {
      console.error('[DEV] Erreur lors de l\'initialisation des données d\'échéanciers:', error);
    }
  }
  
  /**
   * Initialise les données de portefeuilles
   * 
   * @returns {Promise<void>}
   * @private
   */
  private async initializePortfolios(): Promise<void> {
    // En production, ne rien faire
    if (isProduction || !allowMockData) return;
    
    const mockData = await getMockData();
    if (!mockData) return;
    
    // Vider les anciennes données
    localStorage.removeItem(this.PORTFOLIOS_KEY);
    
    // Validation des données mockées
    if (!Array.isArray(mockData.mockTraditionalPortfolios)) {
      throw new Error("Les données mockTraditionalPortfolios ne sont pas un tableau");
    }
    
    // Utiliser uniquement les portefeuilles traditionnels
    const allPortfolios: PortfolioWithType[] = [
      ...mockData.mockTraditionalPortfolios
    ];
    
    // Log pour debug
    console.info(`[DEV] Initialisation des données mock: ${allPortfolios.length} portefeuilles au total`);
    console.info(`[DEV] - ${mockData.mockTraditionalPortfolios.length} portefeuilles traditionnels`);
    
    // Sauvegarder dans localStorage
    localStorage.setItem(this.PORTFOLIOS_KEY, JSON.stringify(allPortfolios));
  }
  
  /**
   * Valide l'intégrité des données critiques et tente de les réparer si nécessaire
   * (En production, cette validation est optionnelle car les données viennent du backend)
   * 
   * @returns {Promise<void>}
   * @private
   */
  private async validateDataIntegrity(): Promise<void> {
    // En production, la validation est simplifiée
    if (isProduction) {
      console.info('[PROD] Validation de l\'intégrité des données (mode production)');
      return;
    }
    
    console.info('[DEV] Validation de l\'intégrité des données critiques...');
    
    // Valider les données de garanties
    const guaranteeValidation = await dataValidationService.validateGuaranteeData();
    
    if (!guaranteeValidation.valid) {
      console.warn('[DEV] Problèmes détectés dans les données de garanties:', guaranteeValidation.issues);
      
      // Tenter de réparer les données
      console.info('[DEV] Tentative de réparation des données de garanties...');
      const repairResult = await dataValidationService.repairGuaranteeData();
      
      if (repairResult.success) {
        console.info('[DEV] Réparation réussie:', repairResult.message);
      } else {
        console.error('[DEV] Échec de la réparation:', repairResult.message);
      }
    } else {
      console.info('[DEV] Les données de garanties sont valides.');
    }
  }

  /**
   * Réinitialise toutes les données mock
   * ⚠️ En production, ne fait rien
   * 
   * @returns {Promise<void>}
   */
  async resetMockData(): Promise<void> {
    // En production, ne jamais reset les données mock
    if (isProduction || !allowMockData) {
      console.warn('[PROD] resetMockData ignoré en production');
      return;
    }
    
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
    // En production, on considère toujours comme initialisé (données du backend)
    if (isProduction) return true;
    return localStorage.getItem(this.MOCK_DATA_INITIALIZED_KEY) === 'true';
  }
}

// Exporter une instance singleton du service
export const mockDataInitializerService = new MockDataInitializerService();

// Fonctions de compatibilité pour l'API existante
export const initializeMockData = () => mockDataInitializerService.initializeMockData();
export const resetMockData = () => mockDataInitializerService.resetMockData();
