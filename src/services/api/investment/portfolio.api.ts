// src/services/api/investment/portfolio.api.ts
import { apiClient } from '../base.api';
import type { InvestmentPortfolio } from '../../../types/investment-portfolio';
import { investmentDataService } from './dataService';

// Type pour les performances de portefeuille (pour le typage correct)
interface PortfolioPerformance {
  ytd: number;
  one_month: number;
  three_months: number;
  six_months: number;
  one_year: number;
  three_years?: number;
  five_years?: number;
  since_inception: number;
}

// Extension du type InvestmentPortfolio pour inclure les performances
interface ExtendedInvestmentPortfolio extends InvestmentPortfolio {
  performance?: PortfolioPerformance;
  asset_type?: 'equity' | 'fixed_income' | 'mixed' | 'alternative';
}

// Type pour le statut du portefeuille d'investissement
type InvestmentPortfolioStatus = 'active' | 'closed' | 'suspended' | 'inactive' | 'pending' | 'archived';

/**
 * API pour les portefeuilles d'investissement
 */
export const portfolioApi = {
  /**
   * Récupère tous les portefeuilles d'investissement
   */
  getAllPortfolios: async (filters?: {
    status?: InvestmentPortfolioStatus;
    type?: 'equity' | 'fixed_income' | 'mixed' | 'alternative';
    manager_id?: string;
  }) => {
    try {
      // Version API
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.manager_id) params.append('manager_id', filters.manager_id);

      return await apiClient.get<InvestmentPortfolio[]>(`/portfolios/investment?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for investment portfolios', error);
      let portfolios = investmentDataService.getInvestmentPortfolios();
      
      // Appliquer les filtres
      if (filters?.status) {
        portfolios = portfolios.filter(p => p.status === filters.status);
      }
      if (filters?.type) {
        // Correction du filtre pour le type
        const assetType = filters.type;
        portfolios = portfolios.filter(p => {
          // Vérifier si le portfolio a une propriété asset_type qui correspond
          return (p as ExtendedInvestmentPortfolio).asset_type === assetType;
        });
      }
      if (filters?.manager_id) {
        portfolios = portfolios.filter(p => p.manager_id === filters.manager_id);
      }
      
      return portfolios;
    }
  },

  /**
   * Récupère un portefeuille d'investissement par son ID
   */
  getPortfolioById: async (id: string) => {
    try {
      return await apiClient.get<InvestmentPortfolio>(`/portfolios/investment/${id}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for investment portfolio ${id}`, error);
      const portfolio = investmentDataService.getInvestmentPortfolioById(id);
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${id} not found`);
      }
      return portfolio;
    }
  },

  /**
   * Crée un nouveau portefeuille d'investissement
   */
  createPortfolio: async (portfolio: Omit<InvestmentPortfolio, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      return await apiClient.post<InvestmentPortfolio>('/portfolios/investment', portfolio);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for creating investment portfolio', error);
      const newPortfolio = {
        ...portfolio,
        id: investmentDataService.generatePortfolioId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as InvestmentPortfolio;
      
      investmentDataService.addInvestmentPortfolio(newPortfolio);
      return newPortfolio;
    }
  },

  /**
   * Met à jour un portefeuille d'investissement
   */
  updatePortfolio: async (id: string, updates: Partial<InvestmentPortfolio>) => {
    try {
      return await apiClient.put<InvestmentPortfolio>(`/portfolios/investment/${id}`, updates);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating investment portfolio ${id}`, error);
      const portfolio = investmentDataService.getInvestmentPortfolioById(id);
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${id} not found`);
      }
      
      const updatedPortfolio = {
        ...portfolio,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      investmentDataService.updateInvestmentPortfolio(updatedPortfolio);
      return updatedPortfolio;
    }
  },

  /**
   * Ferme un portefeuille d'investissement
   */
  closePortfolio: async (id: string, reason: string) => {
    try {
      return await apiClient.post<InvestmentPortfolio>(`/portfolios/investment/${id}/close`, { reason });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for closing investment portfolio ${id}`, error);
      const portfolio = investmentDataService.getInvestmentPortfolioById(id);
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${id} not found`);
      }
      
      // Utiliser un cast pour traiter les types incompatibles
      const updatedPortfolio = {
        ...portfolio,
        status: 'inactive' as const, // Utiliser un statut valide de PortfolioStatus
        closure_reason: reason,
        closure_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as InvestmentPortfolio;
      
      investmentDataService.updateInvestmentPortfolio(updatedPortfolio);
      return updatedPortfolio;
    }
  },

  /**
   * Suspend un portefeuille d'investissement
   */
  suspendPortfolio: async (id: string, reason: string) => {
    try {
      return await apiClient.post<InvestmentPortfolio>(`/portfolios/investment/${id}/suspend`, { reason });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for suspending investment portfolio ${id}`, error);
      const portfolio = investmentDataService.getInvestmentPortfolioById(id);
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${id} not found`);
      }
      
      // Utiliser un cast pour traiter les types incompatibles
      const updatedPortfolio = {
        ...portfolio,
        status: 'inactive' as const, // Utiliser un statut valide de PortfolioStatus
        suspension_reason: reason,
        suspension_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as InvestmentPortfolio;
      
      investmentDataService.updateInvestmentPortfolio(updatedPortfolio);
      return updatedPortfolio;
    }
  },

  /**
   * Réactive un portefeuille d'investissement suspendu
   */
  reactivatePortfolio: async (id: string) => {
    try {
      return await apiClient.post<InvestmentPortfolio>(`/portfolios/investment/${id}/reactivate`, {});
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for reactivating investment portfolio ${id}`, error);
      const portfolio = investmentDataService.getInvestmentPortfolioById(id);
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${id} not found`);
      }
      
      // Vérifier si le portfolio est "inactif" (l'équivalent de "suspended")
      if (portfolio.status !== 'inactive') {
        throw new Error(`Portfolio with ID ${id} is not suspended`);
      }
      
      const updatedPortfolio = {
        ...portfolio,
        status: 'active' as const,
        suspension_reason: undefined,
        suspension_date: undefined,
        updated_at: new Date().toISOString()
      } as InvestmentPortfolio;
      
      investmentDataService.updateInvestmentPortfolio(updatedPortfolio);
      return updatedPortfolio;
    }
  },

  /**
   * Obtient les performances d'un portefeuille
   */
  getPortfolioPerformance: async (id: string, period?: 'ytd' | '1m' | '3m' | '6m' | '1y' | '3y' | '5y' | 'si') => {
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      
      return await apiClient.get<{
        period: string;
        return_value: number;
        benchmark_return?: number;
        risk_metrics?: {
          volatility: number;
          sharpe_ratio: number;
          max_drawdown: number;
        };
      }>(`/portfolios/investment/${id}/performance?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for investment portfolio ${id} performance`, error);
      const portfolio = investmentDataService.getInvestmentPortfolioById(id);
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${id} not found`);
      }
      
      // Récupérer les performances avec un cast de type sécurisé
      const extendedPortfolio = portfolio as ExtendedInvestmentPortfolio;
      const performanceData: PortfolioPerformance = extendedPortfolio.performance || {
        ytd: 0,
        one_month: 0,
        three_months: 0,
        six_months: 0,
        one_year: 0,
        three_years: 0,
        five_years: 0,
        since_inception: 0
      };
      
      // Fallback simplifié retournant les performances du portefeuille
      let returnValue = 0;
      switch (period) {
        case 'ytd':
          returnValue = performanceData.ytd;
          break;
        case '1m':
          returnValue = performanceData.one_month;
          break;
        case '3m':
          returnValue = performanceData.three_months;
          break;
        case '6m':
          returnValue = performanceData.six_months;
          break;
        case '1y':
          returnValue = performanceData.one_year;
          break;
        case '3y':
          returnValue = performanceData.three_years || 0;
          break;
        case '5y':
          returnValue = performanceData.five_years || 0;
          break;
        case 'si':
        default:
          returnValue = performanceData.since_inception;
      }
      
      return {
        period: period || 'si',
        return_value: returnValue,
        risk_metrics: {
          volatility: 0.12, // Valeur fictive
          sharpe_ratio: 1.2, // Valeur fictive
          max_drawdown: -0.15 // Valeur fictive
        }
      };
    }
  }
};
