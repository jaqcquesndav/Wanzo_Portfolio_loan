// src/services/api/traditional/portfolio.api.ts
import { apiClient } from '../base.api';
import type { TraditionalPortfolio } from '../../../types/traditional-portfolio';
import { traditionalDataService } from './dataService';

/**
 * API pour les portefeuilles traditionnels
 */
export const traditionalPortfolioApi = {
  /**
   * Récupère tous les portefeuilles traditionnels
   */
  getAllPortfolios: async (filters?: {
    status?: 'active' | 'inactive' | 'pending' | 'archived';
    riskProfile?: 'conservative' | 'moderate' | 'aggressive';
    minAmount?: number;
    sector?: string;
  }) => {
    try {
      // Version API
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.riskProfile) params.append('riskProfile', filters.riskProfile);
      if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
      if (filters?.sector) params.append('sector', filters.sector);

      return await apiClient.get<TraditionalPortfolio[]>(`/portfolios/traditional?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for traditional portfolios', error);
      let portfolios = traditionalDataService.getTraditionalPortfolios();
      
      // Appliquer les filtres
      if (filters?.status) {
        portfolios = portfolios.filter(p => p.status === filters.status);
      }
      if (filters?.riskProfile) {
        portfolios = portfolios.filter(p => p.risk_profile === filters.riskProfile);
      }
      if (filters?.minAmount !== undefined) {
        const minAmount = filters.minAmount;
        portfolios = portfolios.filter(p => p.target_amount >= minAmount);
      }
      if (filters?.sector !== undefined) {
        const sector = filters.sector;
        portfolios = portfolios.filter(p => p.target_sectors?.some(s => s === sector));
      }
      
      return portfolios;
    }
  },

  /**
   * Récupère un portefeuille traditionnel par son ID
   */
  getPortfolioById: async (id: string) => {
    try {
      return await apiClient.get<TraditionalPortfolio>(`/portfolios/traditional/${id}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for traditional portfolio ${id}`, error);
      const portfolio = traditionalDataService.getTraditionalPortfolioById(id);
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${id} not found`);
      }
      return portfolio;
    }
  },

  /**
   * Crée un nouveau portefeuille traditionnel
   */
  createPortfolio: async (portfolio: Omit<TraditionalPortfolio, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      return await apiClient.post<TraditionalPortfolio>('/portfolios/traditional', portfolio);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for creating traditional portfolio', error);
      const newPortfolio: TraditionalPortfolio = {
        ...portfolio,
        id: traditionalDataService.generatePortfolioId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      traditionalDataService.addTraditionalPortfolio(newPortfolio);
      return newPortfolio;
    }
  },

  /**
   * Met à jour un portefeuille traditionnel
   */
  updatePortfolio: async (id: string, updates: Partial<TraditionalPortfolio>) => {
    try {
      return await apiClient.put<TraditionalPortfolio>(`/portfolios/traditional/${id}`, updates);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating traditional portfolio ${id}`, error);
      const portfolio = traditionalDataService.getTraditionalPortfolioById(id);
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${id} not found`);
      }
      
      const updatedPortfolio = {
        ...portfolio,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateTraditionalPortfolio(updatedPortfolio);
      return updatedPortfolio;
    }
  },

  /**
   * Change le statut d'un portefeuille traditionnel
   */
  changeStatus: async (id: string, status: 'active' | 'inactive' | 'pending' | 'archived') => {
    try {
      return await apiClient.post<TraditionalPortfolio>(`/portfolios/traditional/${id}/status`, { status });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for changing status of traditional portfolio ${id}`, error);
      const portfolio = traditionalDataService.getTraditionalPortfolioById(id);
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${id} not found`);
      }
      
      const updatedPortfolio = {
        ...portfolio,
        status,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateTraditionalPortfolio(updatedPortfolio);
      return updatedPortfolio;
    }
  },

  /**
   * Supprime un portefeuille traditionnel
   */
  deletePortfolio: async (id: string) => {
    try {
      return await apiClient.delete(`/portfolios/traditional/${id}`);
    } catch (error) {
      // Pas de fallback pour la suppression
      console.error(`Error deleting traditional portfolio ${id}`, error);
      throw error;
    }
  },

  /**
   * Récupère les performances d'un portefeuille traditionnel
   */
  getPortfolioPerformance: async (id: string, period: 'monthly' | 'quarterly' | 'yearly') => {
    try {
      return await apiClient.get(`/portfolios/traditional/${id}/performance?period=${period}`);
    } catch (error) {
      // Pas de fallback pour les performances
      console.error(`Error getting performance for traditional portfolio ${id}`, error);
      throw error;
    }
  },

  /**
   * Récupère l'historique des activités d'un portefeuille traditionnel
   */
  getActivityHistory: async (id: string, page = 1, limit = 10) => {
    try {
      return await apiClient.get(`/portfolios/traditional/${id}/activities?page=${page}&limit=${limit}`);
    } catch (error) {
      // Pas de fallback pour l'historique
      console.error(`Error getting activity history for traditional portfolio ${id}`, error);
      throw error;
    }
  }
};
