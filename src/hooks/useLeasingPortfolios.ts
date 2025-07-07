// src/hooks/useLeasingPortfolios.ts
import { useState, useMemo, useEffect } from 'react';
import { indexedDbPortfolioService } from '../lib/indexedDbPortfolioService';

import type { LeasingPortfolio } from '../lib/indexedDbPortfolioService';



interface Filters {
  status: string;
  riskProfile: string;
  sector: string;
  minAmount: string;
  equipmentType?: string;
}

export function useLeasingPortfolios() {


  const [portfolios, setPortfolios] = useState<LeasingPortfolio[]>([]);
  // Charger depuis IndexedDB au montage
  useEffect(() => {
    // Injecte les mocks si besoin puis charge les portefeuilles leasing
    import('../lib/indexedDbPortfolioService').then(({ seedMockLeasingPortfoliosIfNeeded, indexedDbPortfolioService }) => {
      seedMockLeasingPortfoliosIfNeeded().then(() => {
        indexedDbPortfolioService.getPortfoliosByType('leasing').then((result) => {
          setPortfolios(result as LeasingPortfolio[]);
        });
      });
    });
  }, []);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    riskProfile: '',
    sector: '',
    minAmount: '',
    equipmentType: ''
  });

  const filteredPortfolios = useMemo(() => {
    return portfolios.filter((portfolio) => {
      if (filters.status && portfolio.status !== filters.status) return false;
      if (filters.riskProfile && portfolio.risk_profile !== undefined && portfolio.risk_profile !== filters.riskProfile) return false;
      if (filters.sector && Array.isArray(portfolio.target_sectors) && !portfolio.target_sectors.includes(filters.sector)) return false;
      if (filters.minAmount && typeof portfolio.target_amount === 'number' && portfolio.target_amount < parseInt(filters.minAmount)) return false;
      return true;
    });
  }, [portfolios, filters]);

  const createPortfolio = async (
    data: Omit<LeasingPortfolio, 'id' | 'type' | 'status' | 'equipment_catalog' | 'created_at' | 'updated_at'>
  ): Promise<LeasingPortfolio> => {
    const newPortfolio: LeasingPortfolio = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      type: 'leasing',
      status: 'active',
      equipment_catalog: [], // Toujours initialisé
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Ajout d'equipment_catalog vide si non présent (plus besoin, typé)
    await indexedDbPortfolioService.addOrUpdatePortfolio(newPortfolio);
    setPortfolios(prev => [...prev, newPortfolio]);
    return newPortfolio;
  };

  return {
    portfolios,
    filters,
    setFilters,
    filteredPortfolios,
    createPortfolio
  };
}
