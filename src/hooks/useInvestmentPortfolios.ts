import { useState, useMemo, useEffect } from 'react';
import { indexedDbPortfolioService } from '../lib/indexedDbPortfolioService';
import type { InvestmentPortfolio } from '../lib/indexedDbPortfolioService';

interface Filters {
  status: string;
  riskProfile: string;
  sector: string;
  minAmount: string;
  investmentStage: string;
}

export function useInvestmentPortfolios() {
  const [portfolios, setPortfolios] = useState<InvestmentPortfolio[]>([]);
  // Charger depuis IndexedDB au montage, fallback sur les mocks si vide
  useEffect(() => {
    indexedDbPortfolioService.getPortfoliosByType('investment').then((result) => {
      if (result && result.length > 0) {
        setPortfolios(result as InvestmentPortfolio[]);
      } else {
        // fallback dev: charger les mocks si la base est vide
        import('../data/mockPortfolios').then(mod => {
          setPortfolios((mod.mockInvestmentPortfolios || []) as InvestmentPortfolio[]);
        });
      }
    });
  }, []);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    riskProfile: '',
    sector: '',
    minAmount: '',
    investmentStage: ''
  });

  const createPortfolio = async (data: Omit<InvestmentPortfolio, 'id' | 'type' | 'status' | 'assets' | 'created_at' | 'updated_at'>): Promise<InvestmentPortfolio> => {
    const newPortfolio: InvestmentPortfolio = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      type: 'investment',
      status: 'active',
      assets: [], // Toujours initialisé
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // assets est toujours présent (typé)
    await indexedDbPortfolioService.addOrUpdatePortfolio(newPortfolio);
    setPortfolios(prev => [...prev, newPortfolio]);
    return newPortfolio;
  };

  const filteredPortfolios = useMemo(() => {
    return portfolios.filter(portfolio => {
      if (filters.status && portfolio.status !== filters.status) return false;
      if (filters.riskProfile && portfolio.risk_profile !== filters.riskProfile) return false;
      if (filters.sector && !portfolio.target_sectors.includes(filters.sector)) return false;
      if (filters.minAmount && portfolio.target_amount < parseInt(filters.minAmount)) return false;
      if (filters.investmentStage && portfolio.investment_stage !== filters.investmentStage) return false;
      return true;
    });
  }, [portfolios, filters]);

  return {
    portfolios,
    filters,
    setFilters,
    filteredPortfolios,
    createPortfolio
  };
}