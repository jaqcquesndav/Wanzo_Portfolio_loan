// src/hooks/useTraditionalPortfolios.ts
import { useState, useMemo } from 'react';
import { usePortfolios } from './usePortfolios';
import type { TraditionalPortfolio } from '../types/traditional-portfolio';
import { portfolioDbService } from '../services/db/indexedDB';

interface Filters {
  status: string;
  riskProfile: string;
  sector: string;
  minAmount: string;
}

export function useTraditionalPortfolios() {
  const { portfolios: allPortfolios, loading, refresh } = usePortfolios('traditional');
  const portfolios = allPortfolios.filter((p): p is TraditionalPortfolio => p.type === 'traditional');
  const [filters, setFilters] = useState<Filters>({
    status: '',
    riskProfile: '',
    sector: '',
    minAmount: ''
  });

  const createPortfolio = async (data: Omit<TraditionalPortfolio, 'id' | 'type' | 'status' | 'products' | 'metrics' | 'created_at' | 'updated_at'>): Promise<TraditionalPortfolio> => {
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
    await portfolioDbService.addOrUpdatePortfolio(newPortfolio as unknown as import('../types/portfolio').PortfolioWithType);
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
