// src/services/storage/localStorage.ts
import type { PortfolioWithType } from '../../types/portfolioWithType';

// Normalization helpers for all portfolio types
function normalizeLeasingPortfolio(portfolio: PortfolioWithType): PortfolioWithType {
  return {
    ...portfolio,
    equipment_catalog: Array.isArray(portfolio.equipment_catalog) ? portfolio.equipment_catalog : [],
    contracts: Array.isArray(portfolio.contracts) ? portfolio.contracts : [],
    incidents: Array.isArray(portfolio.incidents) ? portfolio.incidents : [],
    maintenances: Array.isArray(portfolio.maintenances) ? portfolio.maintenances : [],
    payments: Array.isArray(portfolio.payments) ? portfolio.payments : [],
    reports: Array.isArray(portfolio.reports) ? portfolio.reports : [],
    // Ensure all required base fields are present
    id: portfolio.id,
    type: portfolio.type,
    status: portfolio.status,
    products: portfolio.products,
    metrics: portfolio.metrics,
    target_amount: portfolio.target_amount,
    target_return: portfolio.target_return,
    target_sectors: portfolio.target_sectors,
    risk_profile: portfolio.risk_profile,
  };
}

function normalizeInvestmentPortfolio(portfolio: PortfolioWithType): PortfolioWithType {
  return {
    ...portfolio,
    assets: Array.isArray(portfolio.assets) ? portfolio.assets : [],
    subscriptions: Array.isArray(portfolio.subscriptions) ? portfolio.subscriptions : [],
    valuations: Array.isArray(portfolio.valuations) ? portfolio.valuations : [],
    requests: Array.isArray(portfolio.requests) ? portfolio.requests : [],
    transactions: Array.isArray(portfolio.transactions) ? portfolio.transactions : [],
    reports: Array.isArray(portfolio.reports) ? portfolio.reports : [],
    exitEvents: Array.isArray(portfolio.exitEvents) ? portfolio.exitEvents : [],
    // Ensure all required base fields are present
    id: portfolio.id,
    type: portfolio.type,
    status: portfolio.status,
    products: portfolio.products,
    metrics: portfolio.metrics,
    target_amount: portfolio.target_amount,
    target_return: portfolio.target_return,
    target_sectors: portfolio.target_sectors,
    risk_profile: portfolio.risk_profile,
  };
}

function normalizeTraditionalPortfolio(portfolio: PortfolioWithType): PortfolioWithType {
  return {
    ...portfolio,
    products: Array.isArray(portfolio['products']) ? portfolio['products'] : [],
    requests: Array.isArray(portfolio['requests']) ? portfolio['requests'] : [],
    disbursements: Array.isArray(portfolio['disbursements']) ? portfolio['disbursements'] : [],
    repayments: Array.isArray(portfolio['repayments']) ? portfolio['repayments'] : [],
    guarantees: Array.isArray(portfolio['guarantees']) ? portfolio['guarantees'] : [],
    reporting: Array.isArray(portfolio['reporting']) ? portfolio['reporting'] : [],
  };
}

function normalizePortfolio(portfolio: PortfolioWithType): PortfolioWithType {
  if (!portfolio || typeof portfolio !== 'object' || !('type' in portfolio)) return portfolio;
  switch (portfolio.type) {
    case 'leasing':
      return normalizeLeasingPortfolio(portfolio);
    case 'investment':
      return normalizeInvestmentPortfolio(portfolio);
    case 'traditional':
      return normalizeTraditionalPortfolio(portfolio);
    default:
      return portfolio;
  }
}

const STORAGE_KEYS = {
  PORTFOLIOS: 'portfolios'
};

export const portfolioStorageService = {
  async getPortfolio(id: string): Promise<PortfolioWithType | undefined> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
      const portfolios: PortfolioWithType[] = stored ? JSON.parse(stored) : [];
      const portfolio = portfolios.find(p => p.id === id);
      return portfolio ? normalizePortfolio(portfolio) : undefined;
    } catch (error) {
      console.error('Error getting portfolio from localStorage:', error);
      return undefined;
    }
  },
  
  async getPortfoliosByType(type: string): Promise<PortfolioWithType[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
      const portfolios: PortfolioWithType[] = stored ? JSON.parse(stored) : [];
      const filteredPortfolios = portfolios.filter(p => p.type === type);
      return filteredPortfolios.map(normalizePortfolio);
    } catch (error) {
      console.error('Error getting portfolios by type from localStorage:', error);
      return [];
    }
  },
  
  /**
   * Ajoute ou met à jour un portefeuille dans le stockage local
   * @template T Type de portefeuille étendu de PortfolioWithType
   * @param portfolio Le portefeuille à ajouter ou mettre à jour
   * @returns Promise<void>
   */
  async addOrUpdatePortfolio<T extends PortfolioWithType>(portfolio: T): Promise<void> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
      const portfolios: PortfolioWithType[] = stored ? JSON.parse(stored) : [];
      const index = portfolios.findIndex(p => p.id === portfolio.id);
      
      if (index !== -1) {
        // Update existing portfolio
        portfolios[index] = { 
          ...portfolio, 
          updated_at: new Date().toISOString() 
        };
      } else {
        // Add new portfolio
        portfolios.push({
          ...portfolio,
          updated_at: new Date().toISOString()
        });
      }
      
      localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
    } catch (error) {
      console.error('Error updating portfolio in localStorage:', error);
      throw error;
    }
  },
  
  async deletePortfolio(id: string): Promise<void> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
      const portfolios: PortfolioWithType[] = stored ? JSON.parse(stored) : [];
      const updatedPortfolios = portfolios.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(updatedPortfolios));
    } catch (error) {
      console.error('Error deleting portfolio from localStorage:', error);
      throw error;
    }
  },
  
  async getAllPortfolios(): Promise<PortfolioWithType[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
      const portfolios: PortfolioWithType[] = stored ? JSON.parse(stored) : [];
      return portfolios.map(normalizePortfolio);
    } catch (error) {
      console.error('Error getting all portfolios from localStorage:', error);
      return [];
    }
  }
};
