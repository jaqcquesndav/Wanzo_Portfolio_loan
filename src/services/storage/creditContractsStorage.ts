// src/services/storage/creditContractsStorage.ts
import { CreditContract } from '../../types/credit-contract';
import { isProduction, allowMockData } from '../../config/environment';

const STORAGE_KEYS = {
  CREDIT_CONTRACTS: 'credit_contracts'
};

// Import dynamique des mocks (uniquement en développement)
const getMockCreditContracts = async (): Promise<CreditContract[]> => {
  if (isProduction || !allowMockData) {
    return [];
  }
  const { mockCreditContracts } = await import('../../data/mockCreditContractsNew');
  return mockCreditContracts;
};

/**
 * Service de gestion des contrats de crédit dans le localStorage
 * 
 * ⚠️ En PRODUCTION:
 * - Les données viennent exclusivement du backend via l'API
 * - Le localStorage sert uniquement de cache temporaire
 * - Les mocks ne sont JAMAIS utilisés
 */
export const creditContractsStorageService = {
  /**
   * Initialise les données dans le localStorage si elles n'existent pas déjà
   * ⚠️ En production, cette méthode ne fait rien
   */
  async init(): Promise<void> {
    // En production, ne pas initialiser de données mock
    if (isProduction || !allowMockData) {
      console.log('[PROD] creditContractsStorageService.init() - utilisation du backend uniquement');
      return;
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CREDIT_CONTRACTS);
      if (!stored) {
        const initialMockData = await getMockCreditContracts();
        if (initialMockData.length === 0) {
          console.log('[DEV] Pas de données mock disponibles pour les contrats');
          return;
        }
        
        // Récupérer tous les portfolios traditionnels du localStorage
        const storedPortfolios = localStorage.getItem('portfolios');
        const portfolios = storedPortfolios ? JSON.parse(storedPortfolios) : [];
        const traditionalPortfolios = portfolios.filter((p: { type: string }) => p.type === 'traditional');
        
        // Obtenir l'ID du portfolio actuel depuis l'URL (pour le fallback)
        const currentUrl = window.location.pathname;
        const portfolioIdMatch = currentUrl.match(/\/portfolio\/traditional\/([^/]+)/);
        const currentPortfolioId = portfolioIdMatch ? portfolioIdMatch[1] : 'qf3081zdd';
        
        console.log('[DEV] Initializing credit contracts');
        console.log('[DEV] Available traditional portfolios:', traditionalPortfolios.map((p: { id: string }) => p.id));
        
        let updatedMockData: CreditContract[] = [];
        
        if (traditionalPortfolios.length > 0) {
          // Répartir les contrats entre les portfolios
          const contractsPerPortfolio = Math.ceil(initialMockData.length / traditionalPortfolios.length);
          
          for (let i = 0; i < traditionalPortfolios.length; i++) {
            const portfolioId = traditionalPortfolios[i].id;
            const startIdx = i * contractsPerPortfolio;
            const endIdx = Math.min(startIdx + contractsPerPortfolio, initialMockData.length);
            
            for (let j = startIdx; j < endIdx; j++) {
              if (j < initialMockData.length) {
                updatedMockData.push({
                  ...initialMockData[j],
                  portfolioId: portfolioId
                });
              }
            }
          }
          
          console.log(`[DEV] Created ${updatedMockData.length} contracts distributed across ${traditionalPortfolios.length} portfolios`);
        } else {
          // Si aucun portfolio traditionnel n'existe, utiliser l'ID de l'URL actuelle
          updatedMockData = initialMockData.map(contract => ({
            ...contract,
            portfolioId: currentPortfolioId
          }));
          
          console.log(`[DEV] Created ${updatedMockData.length} contracts for portfolioId: ${currentPortfolioId}`);
        }
        
        localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(updatedMockData));
        console.log('[DEV] Credit contracts initialized in localStorage with', updatedMockData.length, 'items');
      } else {
        console.log('[DEV] Credit contracts already exist in localStorage');
      }
    } catch (error) {
      console.error('Error initializing credit contracts in localStorage:', error);
    }
  },

  /**
   * Récupère tous les contrats de crédit
   */
  async getAllContracts(): Promise<CreditContract[]> {
    try {
      await this.init(); // S'assurer que les données sont initialisées (en DEV)
      const stored = localStorage.getItem(STORAGE_KEYS.CREDIT_CONTRACTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting credit contracts from localStorage:', error);
      return [];
    }
  },

  /**
   * Récupère un contrat de crédit par son identifiant
   */
  async getContractById(id: string): Promise<CreditContract | undefined> {
    try {
      const contracts = await this.getAllContracts();
      return contracts.find(contract => contract.id === id);
    } catch (error) {
      console.error(`Error getting credit contract with id ${id} from localStorage:`, error);
      return undefined;
    }
  },

  /**
   * Ajoute un nouveau contrat de crédit
   */
  async addContract(contract: CreditContract): Promise<CreditContract> {
    try {
      const contracts = await this.getAllContracts();
      contracts.push(contract);
      localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(contracts));
      return contract;
    } catch (error) {
      console.error('Error adding credit contract to localStorage:', error);
      throw error;
    }
  },

  /**
   * Met à jour un contrat de crédit existant
   */
  async updateContract(id: string, updates: Partial<CreditContract>): Promise<CreditContract | undefined> {
    try {
      const contracts = await this.getAllContracts();
      const index = contracts.findIndex(contract => contract.id === id);
      
      if (index !== -1) {
        contracts[index] = { 
          ...contracts[index], 
          ...updates,
          updated_at: new Date().toISOString() 
        };
        localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(contracts));
        return contracts[index];
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error updating credit contract with id ${id} in localStorage:`, error);
      throw error;
    }
  },

  /**
   * Supprime un contrat de crédit
   */
  async deleteContract(id: string): Promise<boolean> {
    try {
      const contracts = await this.getAllContracts();
      const updatedContracts = contracts.filter(contract => contract.id !== id);
      localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(updatedContracts));
      return true;
    } catch (error) {
      console.error(`Error deleting credit contract with id ${id} from localStorage:`, error);
      throw error;
    }
  },

  /**
   * Réinitialise les données de contrats de crédit aux valeurs initiales
   * ⚠️ En production, cette méthode ne fait rien
   */
  async resetToMockData(): Promise<void> {
    // En production, ne jamais reset avec des données mock
    if (isProduction || !allowMockData) {
      console.warn('[PROD] resetToMockData() ignoré en production');
      return;
    }
    
    try {
      const initialMockData = await getMockCreditContracts();
      if (initialMockData.length === 0) {
        console.log('[DEV] Pas de données mock disponibles pour le reset');
        return;
      }
      
      // Obtenons l'ID du portfolio actuel depuis l'URL
      const currentUrl = window.location.pathname;
      const portfolioIdMatch = currentUrl.match(/\/portfolio\/traditional\/([^/]+)/);
      const currentPortfolioId = portfolioIdMatch ? portfolioIdMatch[1] : 'qf3081zdd';
      
      console.log('[DEV] Resetting credit contracts with portfolioId:', currentPortfolioId);
      
      // Récupérer tous les portfolios traditionnels du localStorage
      const storedPortfolios = localStorage.getItem('portfolios');
      const portfolios = storedPortfolios ? JSON.parse(storedPortfolios) : [];
      const traditionalPortfolios = portfolios.filter((p: { type: string }) => p.type === 'traditional');
      
      console.log('[DEV] Available traditional portfolios:', traditionalPortfolios.map((p: { id: string }) => p.id));
      
      // Créer une répartition des contrats pour chaque portfolio
      const updatedMockData: CreditContract[] = [];
      
      if (traditionalPortfolios.length > 0) {
        // Répartir les contrats entre les portfolios
        const contractsPerPortfolio = Math.ceil(initialMockData.length / traditionalPortfolios.length);
        
        for (let i = 0; i < traditionalPortfolios.length; i++) {
          const portfolioId = traditionalPortfolios[i].id;
          const startIdx = i * contractsPerPortfolio;
          const endIdx = Math.min(startIdx + contractsPerPortfolio, initialMockData.length);
          
          for (let j = startIdx; j < endIdx; j++) {
            if (j < initialMockData.length) {
              updatedMockData.push({
                ...initialMockData[j],
                portfolioId: portfolioId
              });
            }
          }
        }
        
        console.log(`[DEV] Created ${updatedMockData.length} contracts distributed across ${traditionalPortfolios.length} portfolios`);
      } else {
        // Si aucun portfolio traditionnel n'existe, utiliser l'ID de l'URL actuelle
        updatedMockData.push(...initialMockData.map(contract => ({
          ...contract,
          portfolioId: currentPortfolioId
        })));
        
        console.log(`[DEV] Created ${updatedMockData.length} contracts for portfolioId: ${currentPortfolioId}`);
      }
      
      localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(updatedMockData));
      console.log('[DEV] Reset completed with', updatedMockData.length, 'contracts');
    } catch (error) {
      console.error('Error resetting credit contracts to mock data:', error);
      throw error;
    }
  }
};
