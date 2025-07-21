// src/services/storage/creditContractsStorage.ts
import { CreditContract } from '../../types/credit';
import { mockCreditContracts as initialMockData } from '../../data';

const STORAGE_KEYS = {
  CREDIT_CONTRACTS: 'credit_contracts'
};

/**
 * Service de gestion des contrats de crédit dans le localStorage
 */
export const creditContractsStorageService = {
  /**
   * Initialise les données dans le localStorage si elles n'existent pas déjà
   */
  init(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CREDIT_CONTRACTS);
      if (!stored) {
        // Récupérer tous les portfolios traditionnels du localStorage
        const storedPortfolios = localStorage.getItem('portfolios');
        const portfolios = storedPortfolios ? JSON.parse(storedPortfolios) : [];
        const traditionalPortfolios = portfolios.filter((p: { type: string }) => p.type === 'traditional');
        
        // Obtenir l'ID du portfolio actuel depuis l'URL (pour le fallback)
        const currentUrl = window.location.pathname;
        const portfolioIdMatch = currentUrl.match(/\/portfolio\/traditional\/([^/]+)/);
        const currentPortfolioId = portfolioIdMatch ? portfolioIdMatch[1] : 'qf3081zdd';
        
        console.log('[DEBUG] Initializing credit contracts');
        console.log('[DEBUG] Available traditional portfolios:', traditionalPortfolios.map((p: { id: string }) => p.id));
        
        let updatedMockData = [];
        
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
          
          console.log(`[DEBUG] Created ${updatedMockData.length} contracts distributed across ${traditionalPortfolios.length} portfolios`);
        } else {
          // Si aucun portfolio traditionnel n'existe, utiliser l'ID de l'URL actuelle
          updatedMockData = initialMockData.map(contract => ({
            ...contract,
            portfolioId: currentPortfolioId
          }));
          
          console.log(`[DEBUG] Created ${updatedMockData.length} contracts for portfolioId: ${currentPortfolioId}`);
        }
        
        localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(updatedMockData));
        console.log('[DEBUG] Credit contracts initialized in localStorage with', updatedMockData.length, 'items');
      } else {
        console.log('[DEBUG] Credit contracts already exist in localStorage');
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
      this.init(); // S'assurer que les données sont initialisées
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
          updatedAt: new Date().toISOString() 
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
   */
  async resetToMockData(): Promise<void> {
    try {
      // Obtenons l'ID du portfolio actuel depuis l'URL
      const currentUrl = window.location.pathname;
      const portfolioIdMatch = currentUrl.match(/\/portfolio\/traditional\/([^/]+)/);
      const currentPortfolioId = portfolioIdMatch ? portfolioIdMatch[1] : 'qf3081zdd';
      
      console.log('[DEBUG] Resetting credit contracts with portfolioId:', currentPortfolioId);
      
      // Récupérer tous les portfolios traditionnels du localStorage
      const storedPortfolios = localStorage.getItem('portfolios');
      const portfolios = storedPortfolios ? JSON.parse(storedPortfolios) : [];
      const traditionalPortfolios = portfolios.filter((p: { type: string }) => p.type === 'traditional');
      
      console.log('[DEBUG] Available traditional portfolios:', traditionalPortfolios.map((p: { id: string }) => p.id));
      
      // Créer une répartition des contrats pour chaque portfolio
      const updatedMockData = [];
      
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
        
        console.log(`[DEBUG] Created ${updatedMockData.length} contracts distributed across ${traditionalPortfolios.length} portfolios`);
      } else {
        // Si aucun portfolio traditionnel n'existe, utiliser l'ID de l'URL actuelle
        updatedMockData.push(...initialMockData.map(contract => ({
          ...contract,
          portfolioId: currentPortfolioId
        })));
        
        console.log(`[DEBUG] Created ${updatedMockData.length} contracts for portfolioId: ${currentPortfolioId}`);
      }
      
      localStorage.setItem(STORAGE_KEYS.CREDIT_CONTRACTS, JSON.stringify(updatedMockData));
      console.log('Reset completed with', updatedMockData.length, 'contracts');
    } catch (error) {
      console.error('Error resetting credit contracts to mock data:', error);
      throw error;
    }
  }
};
