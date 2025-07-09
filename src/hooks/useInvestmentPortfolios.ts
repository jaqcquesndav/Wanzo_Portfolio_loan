import { useState, useMemo } from 'react';
import { usePortfolios } from './usePortfolios';
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
  // Utilise le hook générique qui gère le chargement automatique depuis IndexedDB
  const { portfolios: allPortfolios, loading, refresh } = usePortfolios('investment');
  const portfolios = allPortfolios.filter((p): p is InvestmentPortfolio => p.type === 'investment');
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
      assets: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await indexedDbPortfolioService.addOrUpdatePortfolio(newPortfolio);
    refresh(); // Rafraîchit la liste après création
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
    loading,
    filters,
    setFilters,
    filteredPortfolios,
    createPortfolio
  };
}

