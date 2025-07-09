// src/hooks/useLeasingPortfolios.ts
import { useState, useMemo } from 'react';
import { usePortfolios } from './usePortfolios';
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
  // Utilise le hook générique qui gère le chargement automatique depuis IndexedDB
  // et la seed automatique (voir correction dans initializeMockData)
  // On ne garde que les portefeuilles de type leasing (sécurité typage)
  const { portfolios: allPortfolios, loading, refresh } = usePortfolios('leasing');
  const portfolios = allPortfolios.filter((p): p is LeasingPortfolio => p.type === 'leasing');
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
      equipment_catalog: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await indexedDbPortfolioService.addOrUpdatePortfolio(newPortfolio);
    refresh(); // Rafraîchit la liste après création
    return newPortfolio;
  };

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

