// src/services/storage/centraleRisqueStorage.ts
import { isProduction, allowMockData } from '../../config/environment';
import type { 
  CreditRiskEntry,
  LeasingRiskEntry,
  InvestmentRiskEntry
} from '../../data/mockCentraleRisque';

// Re-export types for consumers
export type { CreditRiskEntry, LeasingRiskEntry, InvestmentRiskEntry };

// Clés de stockage pour la centrale de risque
export const CENTRALE_RISQUE_KEYS = {
  CREDITS: 'wanzo_centrale_risque_credits',
  LEASING: 'wanzo_centrale_risque_leasing',
  INVESTMENTS: 'wanzo_centrale_risque_investments'
};

// Import dynamique des mocks (uniquement en développement)
const getMockRiskData = async () => {
  if (isProduction || !allowMockData) {
    return { credits: [], leasing: [], investments: [] };
  }
  const { 
    mockCreditRiskData, 
    mockLeasingRiskData, 
    mockInvestmentRiskData 
  } = await import('../../data/mockCentraleRisque');
  return {
    credits: mockCreditRiskData,
    leasing: mockLeasingRiskData,
    investments: mockInvestmentRiskData
  };
};

/**
 * Service pour la gestion des données de la centrale de risque dans le localStorage
 * 
 * ⚠️ En PRODUCTION:
 * - Les données viennent exclusivement du backend via l'API
 * - Le localStorage sert uniquement de cache temporaire
 * - Les mocks ne sont JAMAIS utilisés
 */
class CentraleRisqueStorageService {
  /**
   * Initialise les données par défaut de la centrale de risque
   * ⚠️ En production, cette méthode ne fait rien
   */
  async initializeDefaultData(): Promise<void> {
    // En production, ne pas initialiser de données mock
    if (isProduction || !allowMockData) {
      console.log('[PROD] CentraleRisqueStorageService.initializeDefaultData() - utilisation du backend uniquement');
      return;
    }
    
    try {
      const mockData = await getMockRiskData();
      
      // Vérifier si les données existent déjà
      const creditData = localStorage.getItem(CENTRALE_RISQUE_KEYS.CREDITS);
      const leasingData = localStorage.getItem(CENTRALE_RISQUE_KEYS.LEASING);
      const investmentData = localStorage.getItem(CENTRALE_RISQUE_KEYS.INVESTMENTS);
      
      // Initialiser les données de risque crédit si nécessaire
      if (!creditData && mockData.credits.length > 0) {
        localStorage.setItem(CENTRALE_RISQUE_KEYS.CREDITS, JSON.stringify(mockData.credits));
        console.log('[DEV] ✅ Données de risque crédit initialisées');
      }
      
      // Initialiser les données de risque leasing si nécessaire
      if (!leasingData && mockData.leasing.length > 0) {
        localStorage.setItem(CENTRALE_RISQUE_KEYS.LEASING, JSON.stringify(mockData.leasing));
        console.log('[DEV] ✅ Données de risque leasing initialisées');
      }
      
      // Initialiser les données de risque investissement si nécessaire
      if (!investmentData && mockData.investments.length > 0) {
        localStorage.setItem(CENTRALE_RISQUE_KEYS.INVESTMENTS, JSON.stringify(mockData.investments));
        console.log('[DEV] ✅ Données de risque investissement initialisées');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des données de la centrale de risque:', error);
      throw error;
    }
  }
  
  /**
   * Récupère toutes les données de risque crédit
   */
  async getCreditRiskData(): Promise<CreditRiskEntry[]> {
    try {
      const storedData = localStorage.getItem(CENTRALE_RISQUE_KEYS.CREDITS);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des données de risque crédit:', error);
      return [];
    }
  }
  
  /**
   * Récupère toutes les données de risque leasing
   */
  async getLeasingRiskData(): Promise<LeasingRiskEntry[]> {
    try {
      const storedData = localStorage.getItem(CENTRALE_RISQUE_KEYS.LEASING);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des données de risque leasing:', error);
      return [];
    }
  }
  
  /**
   * Récupère toutes les données de risque investissement
   */
  async getInvestmentRiskData(): Promise<InvestmentRiskEntry[]> {
    try {
      const storedData = localStorage.getItem(CENTRALE_RISQUE_KEYS.INVESTMENTS);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des données de risque investissement:', error);
      return [];
    }
  }
  
  /**
   * Récupère les données de risque crédit pour une entreprise spécifique
   */
  async getCreditRiskByCompanyId(companyId: string): Promise<CreditRiskEntry | undefined> {
    try {
      const allData = await this.getCreditRiskData();
      return allData.find(entry => entry.companyId === companyId);
    } catch (error) {
      console.error(`Erreur lors de la récupération des données de risque crédit pour l'entreprise ${companyId}:`, error);
      return undefined;
    }
  }
  
  /**
   * Récupère les données de risque leasing pour une entreprise spécifique
   */
  async getLeasingRiskByCompanyId(companyId: string): Promise<LeasingRiskEntry | undefined> {
    try {
      const allData = await this.getLeasingRiskData();
      return allData.find(entry => entry.companyId === companyId);
    } catch (error) {
      console.error(`Erreur lors de la récupération des données de risque leasing pour l'entreprise ${companyId}:`, error);
      return undefined;
    }
  }
  
  /**
   * Récupère les données de risque investissement pour une entreprise spécifique
   */
  async getInvestmentRiskByCompanyId(companyId: string): Promise<InvestmentRiskEntry | undefined> {
    try {
      const allData = await this.getInvestmentRiskData();
      return allData.find(entry => entry.companyId === companyId);
    } catch (error) {
      console.error(`Erreur lors de la récupération des données de risque investissement pour l'entreprise ${companyId}:`, error);
      return undefined;
    }
  }
}

// Exporter l'instance du service
export const centraleRisqueStorageService = new CentraleRisqueStorageService();
