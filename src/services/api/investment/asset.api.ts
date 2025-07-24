// src/services/api/investment/asset.api.ts
import { apiClient } from '../base.api';
import type { InvestmentAsset, InvestmentTransaction } from '../../../types/investment-portfolio';

/**
 * API pour les actifs d'investissement
 */
export const investmentAssetApi = {
  /**
   * Récupère tous les actifs d'investissement
   */
  getAllAssets: (filters?: {
    type?: 'share' | 'bond' | 'etf' | 'fund' | 'commodity' | 'crypto' | 'real_estate' | 'other';
    sector?: string;
    minValue?: number;
    maxValue?: number;
    status?: 'active' | 'inactive' | 'pending' | 'completed';
  }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.sector) params.append('sector', filters.sector);
    if (filters?.minValue) params.append('minValue', filters.minValue.toString());
    if (filters?.maxValue) params.append('maxValue', filters.maxValue.toString());
    if (filters?.status) params.append('status', filters.status);

    return apiClient.get<InvestmentAsset[]>(`/assets/investment?${params.toString()}`);
  },

  /**
   * Récupère un actif d'investissement par son ID
   */
  getAssetById: (id: string) => {
    return apiClient.get<InvestmentAsset>(`/assets/investment/${id}`);
  },

  /**
   * Crée un nouvel actif d'investissement
   */
  createAsset: (asset: Omit<InvestmentAsset, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<InvestmentAsset>('/assets/investment', asset);
  },

  /**
   * Met à jour un actif d'investissement
   */
  updateAsset: (id: string, updates: Partial<InvestmentAsset>) => {
    return apiClient.put<InvestmentAsset>(`/assets/investment/${id}`, updates);
  },

  /**
   * Change le statut d'un actif d'investissement
   */
  updateAssetStatus: (id: string, status: 'active' | 'inactive' | 'pending' | 'completed') => {
    return apiClient.put<InvestmentAsset>(`/assets/investment/${id}/status`, { status });
  },

  /**
   * Récupère l'historique des transactions pour un actif d'investissement
   */
  getAssetTransactions: (assetId: string) => {
    return apiClient.get<InvestmentTransaction[]>(`/assets/investment/${assetId}/transactions`);
  },

  /**
   * Ajoute une transaction à un actif d'investissement
   */
  addAssetTransaction: (assetId: string, transaction: Omit<InvestmentTransaction, 'id' | 'created_at'>) => {
    return apiClient.post<InvestmentTransaction>(`/assets/investment/${assetId}/transactions`, transaction);
  },

  /**
   * Met à jour une transaction d'un actif d'investissement
   */
  updateAssetTransaction: (assetId: string, transactionId: string, updates: Partial<InvestmentTransaction>) => {
    return apiClient.put<InvestmentTransaction>(`/assets/investment/${assetId}/transactions/${transactionId}`, updates);
  },

  /**
   * Supprime une transaction d'un actif d'investissement
   */
  deleteAssetTransaction: (assetId: string, transactionId: string) => {
    return apiClient.delete(`/assets/investment/${assetId}/transactions/${transactionId}`);
  },

  /**
   * Récupère les métriques détaillées pour un actif d'investissement
   */
  getAssetMetrics: (assetId: string) => {
    return apiClient.get<{
      performance: {
        current: number;
        daily: number;
        weekly: number;
        monthly: number;
        yearly: number;
        historical: Array<{ date: string; value: number }>;
      };
      risk: {
        volatility: number;
        beta: number;
        alpha: number;
        sharpeRatio: number;
      };
      valuation: {
        currentValue: number;
        acquisitionValue: number;
        profitLoss: number;
        profitLossPercentage: number;
      };
      dividend: {
        yield: number;
        lastPayment: { date: string; amount: number };
        nextPayment: { date: string; amount: number };
        history: Array<{ date: string; amount: number }>;
      };
    }>(`/assets/investment/${assetId}/metrics`);
  },

  /**
   * Récupère les données de marché pour un actif d'investissement
   */
  getMarketData: (assetId: string) => {
    return apiClient.get<{
      currentPrice: number;
      priceChange: number;
      priceChangePercentage: number;
      high52Week: number;
      low52Week: number;
      marketCap: number;
      volume: number;
      averageVolume: number;
      peRatio: number;
      dividendYield: number;
      beta: number;
      priceHistory: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>;
    }>(`/assets/investment/${assetId}/market-data`);
  },
};
