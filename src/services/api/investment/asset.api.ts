// src/services/api/investment/asset.api.ts
import { apiClient } from '../base.api';
import type { InvestmentAsset } from '../../../types/investment-portfolio';
import { investmentDataService } from './dataService';

/**
 * API pour les actifs d'investissement
 */
export const assetApi = {
  /**
   * Récupère tous les actifs d'un portefeuille
   */
  getAssetsByPortfolio: async (portfolioId: string, filters?: {
    type?: 'share' | 'bond' | 'other';
    status?: 'active' | 'exited' | 'written-off';
  }) => {
    try {
      // Version API
      const params = new URLSearchParams();
      params.append('portfolioId', portfolioId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);

      return await apiClient.get<InvestmentAsset[]>(`/portfolios/investment/assets?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for assets of portfolio ${portfolioId}`, error);
      let assets = investmentDataService.getAssetsByPortfolioId(portfolioId);
      
      // Appliquer les filtres
      if (filters?.type) {
        assets = assets.filter(a => a.type === filters.type);
      }
      if (filters?.status) {
        assets = assets.filter(a => a.status === filters.status);
      }
      
      return assets;
    }
  },

  /**
   * Récupère un actif par son ID
   */
  getAssetById: async (id: string) => {
    try {
      return await apiClient.get<InvestmentAsset>(`/portfolios/investment/assets/${id}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for asset ${id}`, error);
      const asset = investmentDataService.getAssetById(id);
      if (!asset) {
        throw new Error(`Asset with ID ${id} not found`);
      }
      return asset;
    }
  },

  /**
   * Ajoute un nouvel actif à un portefeuille
   */
  addAsset: async (asset: Omit<InvestmentAsset, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      return await apiClient.post<InvestmentAsset>('/portfolios/investment/assets', asset);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for adding asset', error);
      const newAsset = {
        ...asset,
        id: investmentDataService.generateAssetId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as InvestmentAsset;
      
      investmentDataService.addAsset(newAsset);
      return newAsset;
    }
  },

  /**
   * Met à jour un actif
   */
  updateAsset: async (id: string, updates: Partial<InvestmentAsset>) => {
    try {
      return await apiClient.put<InvestmentAsset>(`/portfolios/investment/assets/${id}`, updates);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating asset ${id}`, error);
      const asset = investmentDataService.getAssetById(id);
      if (!asset) {
        throw new Error(`Asset with ID ${id} not found`);
      }
      
      const updatedAsset = {
        ...asset,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      investmentDataService.updateAsset(updatedAsset);
      return updatedAsset;
    }
  },

  /**
   * Marque un actif comme cédé (exited)
   */
  exitAsset: async (id: string, exitDetails: {
    exitDate: string;
    exitValue: number;
    exitReason: string;
    exitROI?: number;
  }) => {
    try {
      return await apiClient.post<InvestmentAsset>(`/portfolios/investment/assets/${id}/exit`, exitDetails);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for exiting asset ${id}`, error);
      const asset = investmentDataService.getAssetById(id);
      if (!asset) {
        throw new Error(`Asset with ID ${id} not found`);
      }
      
      const updatedAsset = {
        ...asset,
        status: 'exited' as const,
        exitDate: exitDetails.exitDate,
        exitValue: exitDetails.exitValue,
        exitReason: exitDetails.exitReason,
        exitROI: exitDetails.exitROI,
        currentValue: exitDetails.exitValue,
        updated_at: new Date().toISOString()
      };
      
      investmentDataService.updateAsset(updatedAsset);
      return updatedAsset;
    }
  },

  /**
   * Marque un actif comme passé en perte (written-off)
   */
  writeOffAsset: async (id: string, reason: string) => {
    try {
      return await apiClient.post<InvestmentAsset>(`/portfolios/investment/assets/${id}/write-off`, { reason });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for writing off asset ${id}`, error);
      const asset = investmentDataService.getAssetById(id);
      if (!asset) {
        throw new Error(`Asset with ID ${id} not found`);
      }
      
      const updatedAsset = {
        ...asset,
        status: 'written-off' as const,
        writeOffDate: new Date().toISOString(),
        writeOffReason: reason,
        currentValue: 0, // La valeur est mise à zéro
        updated_at: new Date().toISOString()
      };
      
      investmentDataService.updateAsset(updatedAsset);
      return updatedAsset;
    }
  },

  /**
   * Met à jour la valeur actuelle d'un actif
   */
  updateAssetValue: async (id: string, currentValue: number, valuationDate: string, notes?: string) => {
    try {
      return await apiClient.post<InvestmentAsset>(`/portfolios/investment/assets/${id}/value`, {
        currentValue,
        valuationDate,
        notes
      });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating value of asset ${id}`, error);
      const asset = investmentDataService.getAssetById(id);
      if (!asset) {
        throw new Error(`Asset with ID ${id} not found`);
      }
      
      const updatedAsset = {
        ...asset,
        currentValue,
        lastValuationDate: valuationDate,
        valuationNotes: notes,
        updated_at: new Date().toISOString()
      };
      
      investmentDataService.updateAsset(updatedAsset);
      return updatedAsset;
    }
  }
};
