// src/hooks/useTraditionalPortfolios.ts
import { useState, useEffect } from 'react';
import { indexedDbPortfolioService } from '../lib/indexedDbPortfolioService';

import type { TraditionalPortfolio } from '../lib/indexedDbPortfolioService';

interface Filters {
  status: string;
  riskProfile: string;
  sector: string;
  minAmount: string;
}

export function useTraditionalPortfolios() {
  const [portfolios, setPortfolios] = useState<TraditionalPortfolio[]>([]);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    riskProfile: '',
    sector: '',
    minAmount: ''
  });

  useEffect(() => {
    // Injecte les mocks si besoin puis charge les portefeuilles traditionnels
    import('../lib/indexedDbPortfolioService').then(({ seedMockTraditionalPortfoliosIfNeeded, indexedDbPortfolioService }) => {
      seedMockTraditionalPortfoliosIfNeeded().then(() => {
        indexedDbPortfolioService.getPortfoliosByType('traditional').then((result) => {
          setPortfolios(result as TraditionalPortfolio[]);
        });
      });
    });
  }, []);

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
    await indexedDbPortfolioService.addOrUpdatePortfolio(newPortfolio);
    setPortfolios(prev => [...prev, newPortfolio]);
    return newPortfolio;
  };

  const filteredPortfolios = portfolios.filter(portfolio => {
    if (filters.status && portfolio.status !== filters.status) return false;
    if (filters.riskProfile && portfolio.risk_profile !== filters.riskProfile) return false;
    if (filters.sector && !portfolio.target_sectors.includes(filters.sector)) return false;
    if (filters.minAmount && portfolio.target_amount < parseInt(filters.minAmount)) return false;
    return true;
  });

  return {
    portfolios,
    filters,
    setFilters,
    filteredPortfolios,
    createPortfolio
  };
}
