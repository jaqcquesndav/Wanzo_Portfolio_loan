import type { Portfolio } from '../types/portfolio';
import type { LeasingPortfolioFull } from '../types/leasing-portfolio-full';

const STORAGE_KEYS = {
  PORTFOLIOS: 'portfolios'
} as const;

export const storage = {
  getPortfolios(): (Portfolio | LeasingPortfolioFull)[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
      console.log('[DEBUG][storage.getPortfolios] Valeur brute localStorage:', stored);
      const portfolios = stored ? JSON.parse(stored) : [];
      console.log('[DEBUG][storage.getPortfolios] Après parse:', portfolios);
      // S'assurer que tous les portfolios ont un tableau products
      // On retourne tel quel, chaque type a ses propres propriétés
      return portfolios;
    } catch (error) {
      console.error('Error getting portfolios:', error);
      return [];
    }
  },

  savePortfolio(portfolio: Portfolio | LeasingPortfolioFull) {
    try {
      const portfolios = this.getPortfolios();
      portfolios.push(portfolio);
      localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
    } catch (error) {
      console.error('Error saving portfolio:', error);
      throw error;
    }
  },

  updatePortfolio(updatedPortfolio: Portfolio | LeasingPortfolioFull) {
    try {
      const portfolios = this.getPortfolios();
      const index = portfolios.findIndex(p => p.id === updatedPortfolio.id);
      if (index !== -1) {
        portfolios[index] = updatedPortfolio;
        localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
      }
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  }
};