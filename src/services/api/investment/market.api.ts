// src/services/api/investment/market.api.ts
import { apiClient } from '../base.api';
import { MarketSecurity } from '../../../types/market-securities';
import { investmentDataService } from './dataService';

/**
 * API pour le marché d'investissement
 */
export const marketApi = {
  /**
   * Récupère la liste des titres disponibles sur le marché
   */
  getSecurities: async (filters?: {
    type?: string;
    sector?: string;
    country?: string;
    risk?: 'faible' | 'modéré' | 'élevé';
    listed?: boolean;
    search?: string;
  }) => {
    try {
      // Construire les paramètres de requête
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.sector) params.append('sector', filters.sector);
      if (filters?.country) params.append('country', filters.country);
      if (filters?.risk) params.append('risk', filters.risk);
      if (filters?.listed !== undefined) params.append('listed', filters.listed.toString());
      if (filters?.search) params.append('search', filters.search);

      return await apiClient.get<MarketSecurity[]>(`/portfolios/investment/market/securities?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for market securities', error);
      
      // Implémentation fictive pour le développement local
      let securities = investmentDataService.getMarketSecurities();
      
      // Appliquer les filtres
      if (filters?.type) {
        securities = securities.filter(s => s.type === filters.type);
      }
      if (filters?.sector) {
        securities = securities.filter(s => s.sector === filters.sector);
      }
      if (filters?.country) {
        securities = securities.filter(s => s.country === filters.country);
      }
      if (filters?.risk) {
        securities = securities.filter(s => s.risk === filters.risk);
      }
      if (filters?.listed !== undefined) {
        securities = securities.filter(s => s.listed === filters.listed);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        securities = securities.filter(s => 
          s.name.toLowerCase().includes(searchLower) || 
          s.companyName.toLowerCase().includes(searchLower) ||
          (s.description && s.description.toLowerCase().includes(searchLower))
        );
      }
      
      return securities;
    }
  },

  /**
   * Récupère un titre spécifique par son ID
   */
  getSecurityById: async (id: string) => {
    try {
      return await apiClient.get<MarketSecurity>(`/portfolios/investment/market/securities/${id}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for market security ${id}`, error);
      const security = investmentDataService.getMarketSecurityById(id);
      if (!security) {
        throw new Error(`Security with ID ${id} not found`);
      }
      return security;
    }
  },

  /**
   * Récupère les titres par entreprise
   */
  getSecuritiesByCompany: async (companyId: string) => {
    try {
      return await apiClient.get<MarketSecurity[]>(`/portfolios/investment/market/companies/${companyId}/securities`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for securities of company ${companyId}`, error);
      return investmentDataService.getMarketSecuritiesByCompany(companyId);
    }
  },

  /**
   * Ajoute un nouveau titre au marché
   */
  createSecurity: async (security: Omit<MarketSecurity, 'id'>) => {
    try {
      return await apiClient.post<MarketSecurity>('/portfolios/investment/market/securities', security);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for creating market security', error);
      const newSecurity = {
        ...security,
        id: investmentDataService.generateMarketSecurityId()
      } as MarketSecurity;
      
      investmentDataService.addMarketSecurity(newSecurity);
      return newSecurity;
    }
  },

  /**
   * Met à jour un titre existant
   */
  updateSecurity: async (id: string, updates: Partial<MarketSecurity>) => {
    try {
      return await apiClient.put<MarketSecurity>(`/portfolios/investment/market/securities/${id}`, updates);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating market security ${id}`, error);
      const security = investmentDataService.getMarketSecurityById(id);
      if (!security) {
        throw new Error(`Security with ID ${id} not found`);
      }
      
      const updatedSecurity = {
        ...security,
        ...updates
      };
      
      investmentDataService.updateMarketSecurity(id, updatedSecurity);
      return updatedSecurity;
    }
  },

  /**
   * Supprime un titre du marché
   */
  deleteSecurity: async (id: string) => {
    try {
      await apiClient.delete(`/portfolios/investment/market/securities/${id}`);
      return true;
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for deleting market security ${id}`, error);
      investmentDataService.deleteMarketSecurity(id);
      return true;
    }
  },

  /**
   * Récupère les secteurs disponibles
   */
  getSectors: async () => {
    try {
      return await apiClient.get<string[]>('/portfolios/investment/market/sectors');
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for market sectors', error);
      return investmentDataService.getUniqueSectors();
    }
  },

  /**
   * Récupère les pays disponibles
   */
  getCountries: async () => {
    try {
      return await apiClient.get<string[]>('/portfolios/investment/market/countries');
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for market countries', error);
      return investmentDataService.getUniqueCountries();
    }
  }
};
