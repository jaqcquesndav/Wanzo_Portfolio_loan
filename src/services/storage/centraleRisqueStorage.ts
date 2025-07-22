// src/services/storage/centraleRisqueStorage.ts
import { 
  mockCreditRiskData, 
  mockLeasingRiskData, 
  mockInvestmentRiskData, 
  CreditRiskEntry,
  LeasingRiskEntry,
  InvestmentRiskEntry
} from '../../data/mockCentraleRisque';

// Clés de stockage pour la centrale de risque
export const CENTRALE_RISQUE_KEYS = {
  CREDITS: 'wanzo_centrale_risque_credits',
  LEASING: 'wanzo_centrale_risque_leasing',
  INVESTMENTS: 'wanzo_centrale_risque_investments'
};

/**
 * Service pour la gestion des données de la centrale de risque dans le localStorage
 */
class CentraleRisqueStorageService {
  /**
   * Initialise les données par défaut de la centrale de risque
   */
  async initializeDefaultData(): Promise<void> {
    try {
      // Vérifier si les données existent déjà
      const creditData = localStorage.getItem(CENTRALE_RISQUE_KEYS.CREDITS);
      const leasingData = localStorage.getItem(CENTRALE_RISQUE_KEYS.LEASING);
      const investmentData = localStorage.getItem(CENTRALE_RISQUE_KEYS.INVESTMENTS);
      
      // Initialiser les données de risque crédit si nécessaire
      if (!creditData) {
        localStorage.setItem(CENTRALE_RISQUE_KEYS.CREDITS, JSON.stringify(mockCreditRiskData));
        console.log('✅ Données de risque crédit initialisées');
      }
      
      // Initialiser les données de risque leasing si nécessaire
      if (!leasingData) {
        localStorage.setItem(CENTRALE_RISQUE_KEYS.LEASING, JSON.stringify(mockLeasingRiskData));
        console.log('✅ Données de risque leasing initialisées');
      }
      
      // Initialiser les données de risque investissement si nécessaire
      if (!investmentData) {
        localStorage.setItem(CENTRALE_RISQUE_KEYS.INVESTMENTS, JSON.stringify(mockInvestmentRiskData));
        console.log('✅ Données de risque investissement initialisées');
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
