// src/services/api/investment/valuation.api.ts
import { apiClient } from '../base.api';
import { investmentDataService } from './dataService';

/**
 * Interface pour les évaluations d'actifs
 */
interface AssetValuation {
  id: string;
  asset_id: string;
  portfolio_id: string;
  valuation_date: string;
  previous_value: number;
  current_value: number;
  change_percentage: number;
  valuation_method: string;
  valuation_notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface pour les évaluations de portefeuille
 */
interface PortfolioValuation {
  id: string;
  portfolio_id: string;
  valuation_date: string;
  previous_value: number;
  current_value: number;
  change_percentage: number;
  nav_per_unit?: number;
  asset_valuations: AssetValuation[];
  created_at: string;
  updated_at: string;
}

/**
 * API pour les évaluations d'actifs et de portefeuilles
 */
export const valuationApi = {
  /**
   * Récupère l'historique des évaluations d'un portefeuille
   */
  getPortfolioValuationHistory: async (portfolioId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) => {
    try {
      // Version API
      const params = new URLSearchParams();
      params.append('portfolioId', portfolioId);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      return await apiClient.get<PortfolioValuation[]>(`/portfolios/investment/${portfolioId}/valuations?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for valuation history of portfolio ${portfolioId}`, error);
      // Note: Cette partie nécessiterait une implémentation dans dataService.ts
      return [];
    }
  },

  /**
   * Récupère une évaluation de portefeuille spécifique par son ID
   */
  getPortfolioValuationById: async (portfolioId: string, valuationId: string) => {
    try {
      return await apiClient.get<PortfolioValuation>(`/portfolios/investment/${portfolioId}/valuations/${valuationId}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for valuation ${valuationId} of portfolio ${portfolioId}`, error);
      // Note: Cette partie nécessiterait une implémentation dans dataService.ts
      throw new Error(`Valuation with ID ${valuationId} not found`);
    }
  },

  /**
   * Crée une nouvelle évaluation de portefeuille
   */
  createPortfolioValuation: async (portfolioId: string, valuation: {
    valuation_date: string;
    current_value: number;
    nav_per_unit?: number;
    asset_valuations: Array<{
      asset_id: string;
      current_value: number;
      valuation_method: string;
      valuation_notes?: string;
    }>;
  }) => {
    try {
      return await apiClient.post<PortfolioValuation>(`/portfolios/investment/${portfolioId}/valuations`, valuation);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for creating valuation for portfolio ${portfolioId}`, error);
      // Note: Cette partie nécessiterait une implémentation dans dataService.ts
      
      // Simulation d'une réponse
      const portfolio = investmentDataService.getInvestmentPortfolioById(portfolioId);
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${portfolioId} not found`);
      }
      
      // Cast portfolio pour accéder à current_value de manière sûre
      const typedPortfolio = portfolio as unknown as { current_value: number };
      const previousValue = typedPortfolio.current_value || 0;
      
      const newValuation = {
        id: `VAL-${Date.now()}`,
        portfolio_id: portfolioId,
        valuation_date: valuation.valuation_date,
        previous_value: previousValue,
        current_value: valuation.current_value,
        change_percentage: previousValue > 0 ? ((valuation.current_value - previousValue) / previousValue) * 100 : 0,
        nav_per_unit: valuation.nav_per_unit,
        asset_valuations: valuation.asset_valuations.map(av => ({
          id: `AVAL-${Date.now()}-${av.asset_id}`,
          asset_id: av.asset_id,
          portfolio_id: portfolioId,
          valuation_date: valuation.valuation_date,
          previous_value: 0, // Idéalement, récupérer la valeur précédente
          current_value: av.current_value,
          change_percentage: 0, // À calculer avec la valeur précédente
          valuation_method: av.valuation_method,
          valuation_notes: av.valuation_notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as PortfolioValuation;
      
      // Mise à jour de la valeur du portefeuille
      portfolio.current_value = valuation.current_value;
      portfolio.last_valuation_date = valuation.valuation_date;
      investmentDataService.updateInvestmentPortfolio(portfolio);
      
      return newValuation;
    }
  },

  /**
   * Récupère l'historique des évaluations d'un actif
   */
  getAssetValuationHistory: async (assetId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) => {
    try {
      // Version API
      const params = new URLSearchParams();
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      return await apiClient.get<AssetValuation[]>(`/portfolios/investment/assets/${assetId}/valuations?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for valuation history of asset ${assetId}`, error);
      // Note: Cette partie nécessiterait une implémentation dans dataService.ts
      return [];
    }
  },

  /**
   * Récupère la dernière évaluation d'un actif
   */
  getLatestAssetValuation: async (assetId: string) => {
    try {
      return await apiClient.get<AssetValuation>(`/portfolios/investment/assets/${assetId}/valuations/latest`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for latest valuation of asset ${assetId}`, error);
      // Note: Cette partie nécessiterait une implémentation dans dataService.ts
      
      // Simulation d'une réponse
      const asset = investmentDataService.getAssetById(assetId);
      if (!asset) {
        throw new Error(`Asset with ID ${assetId} not found`);
      }
      
      return {
        id: `AVAL-latest-${assetId}`,
        asset_id: assetId,
        portfolio_id: asset.companyId, // Utiliser companyId au lieu de portfolioId
        valuation_date: new Date().toISOString(),
        previous_value: asset.initialValue,
        current_value: asset.currentValue || asset.initialValue,
        change_percentage: (((asset.currentValue || asset.initialValue) - asset.initialValue) / asset.initialValue) * 100,
        valuation_method: 'mark-to-market',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as AssetValuation;
    }
  }
};
