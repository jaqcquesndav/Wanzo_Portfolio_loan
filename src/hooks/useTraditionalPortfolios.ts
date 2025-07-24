// src/hooks/useTraditionalPortfolios.ts
import { useState, useMemo } from 'react';
import { usePortfolios } from './usePortfolios';
import type { TraditionalPortfolio } from '../types/traditional-portfolio';
import type { PortfolioWithType } from '../types/portfolioWithType';
import { portfolioStorageService } from '../services/storage/localStorage';
import { validateTraditionalPortfolio } from '../utils/validation';

interface Filters {
  status: string;
  riskProfile: string;
  sector: string;
  minAmount: string;
}

/**
 * Hook pour gérer les portefeuilles traditionnels
 * @returns {Object} Méthodes et données pour les portefeuilles traditionnels
 * @property {TraditionalPortfolio[]} portfolios - Liste de tous les portefeuilles traditionnels
 * @property {TraditionalPortfolio[]} filteredPortfolios - Liste filtrée des portefeuilles
 * @property {Filters} filters - Filtres actuellement appliqués
 * @property {Function} setFilters - Fonction pour mettre à jour les filtres
 * @property {Function} createPortfolio - Fonction pour créer un nouveau portefeuille
 */
export function useTraditionalPortfolios() {
  const { portfolios: allPortfolios, loading, refresh } = usePortfolios('traditional');
  const portfolios = allPortfolios.filter((p): p is TraditionalPortfolio => p.type === 'traditional');
  const [filters, setFilters] = useState<Filters>({
    status: '',
    riskProfile: '',
    sector: '',
    minAmount: ''
  });

  /**
   * Crée un nouveau portefeuille traditionnel
   * @param {Omit<TraditionalPortfolio, 'id' | 'type' | 'status' | 'products' | 'metrics' | 'created_at' | 'updated_at'>} data
   *        Données du portefeuille à créer (sans les champs générés automatiquement)
   * @returns {Promise<TraditionalPortfolio>} Le portefeuille créé avec tous les champs
   * @throws {Error} Si les données sont invalides ou si la création échoue
   */
  const createPortfolio = async (data: Omit<TraditionalPortfolio, 'id' | 'type' | 'status' | 'products' | 'metrics' | 'created_at' | 'updated_at'>): Promise<TraditionalPortfolio> => {
    // Valider les données avant de créer le portefeuille
    const validation = validateTraditionalPortfolio(data);
    if (!validation.isValid) {
      throw new Error(`Données de portefeuille invalides: ${JSON.stringify(validation.errors)}`);
    }
    
    const newPortfolio: TraditionalPortfolio = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      type: 'traditional',
      status: 'active',
      products: [],
      metrics: {
        net_value: data.target_amount,
        average_return: 0,
        risk_portfolio: 0,
        sharpe_ratio: 0,
        volatility: 0,
        alpha: 0,
        beta: 0,
        asset_allocation: []
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    // Le portfolioStorageService attend un PortfolioWithType qui inclut une signature d'index
    // TraditionalPortfolio est compatible mais manque cette signature, donc le cast est nécessaire
    await portfolioStorageService.addOrUpdatePortfolio(newPortfolio as unknown as PortfolioWithType);
    refresh(); // Rafraîchit la liste après création
    return newPortfolio;
  };

  const filteredPortfolios = useMemo(() => {
    return portfolios.filter(portfolio => {
      if (filters.status && portfolio.status !== filters.status) return false;
      if (filters.riskProfile && portfolio.risk_profile !== filters.riskProfile) return false;
      if (filters.sector && !portfolio.target_sectors.includes(filters.sector)) return false;
      if (filters.minAmount && portfolio.target_amount < parseInt(filters.minAmount)) return false;
      return true;
    });
  }, [portfolios, filters]);

  return {
    portfolios,
    loading,
    filters,
    setFilters,
    filteredPortfolios,
    createPortfolio,
    refresh,
  };
}
