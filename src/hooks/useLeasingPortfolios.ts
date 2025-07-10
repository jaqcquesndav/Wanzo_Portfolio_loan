// Helper to provide a fully-typed default metrics object
import type { Portfolio } from '../types/portfolio';
function getDefaultMetrics(): Portfolio['metrics'] {
  return {
    net_value: 0,
    average_return: 0,
    risk_portfolio: 0,
    sharpe_ratio: 0,
    volatility: 0,
    alpha: 0,
    beta: 0,
    asset_allocation: [],
    // Optionals for all portfolio types
    performance_curve: [],
    returns: [],
    benchmark: [],
    balance_AGE: undefined,
    taux_impayes: undefined,
    taux_couverture: undefined,
    nb_credits: undefined,
    total_credits: undefined,
    avg_credit: undefined,
    nb_clients: undefined,
    taux_rotation: undefined,
    taux_provision: undefined,
    taux_recouvrement: undefined,
    asset_utilization_rate: undefined,
    average_residual_value: undefined,
    default_rate: undefined,
    avg_contract_duration_months: undefined,
    assets_under_management: undefined,
    contract_renewal_rate: undefined,
    total_rent_billed: undefined,
    collection_rate: undefined,
    nb_requests: undefined,
    nb_transactions: undefined,
    total_invested: undefined,
    total_exited: undefined,
    irr: undefined,
    multiple: undefined,
    avg_ticket: undefined,
    nb_companies: undefined,
  };
}
// src/hooks/useLeasingPortfolios.ts
import { useState, useMemo } from 'react';
import { usePortfolios } from './usePortfolios';

import type { LeasingPortfolio } from '../types/leasing';





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
    const now = new Date().toISOString();
    const newPortfolio: LeasingPortfolio = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      name: typeof data.name === 'string' ? data.name : 'Nouveau portefeuille',
      type: 'leasing',
      status: 'active',
      products: Array.isArray(data.products) ? data.products : [],
      metrics: typeof data.metrics === 'object' && data.metrics !== null && 'net_value' in data.metrics ? data.metrics as Portfolio['metrics'] : getDefaultMetrics(),
      target_amount: typeof data.target_amount === 'number' ? data.target_amount : 0,
      target_return: typeof data.target_return === 'number' ? data.target_return : 0,
      target_sectors: Array.isArray(data.target_sectors) ? data.target_sectors : [],
      risk_profile: data.risk_profile === 'conservative' || data.risk_profile === 'moderate' || data.risk_profile === 'aggressive' ? data.risk_profile : 'moderate',
      equipment_catalog: [],
      contracts: [],
      incidents: [],
      maintenances: [],
      payments: [],
      leasing_terms: {
        min_duration: 12,
        max_duration: 60,
        interest_rate_range: { min: 3, max: 10 },
        maintenance_included: false,
        insurance_required: false,
      },
      created_at: now,
      updated_at: now,
    };
    const { portfolioDbService } = await import('../services/db/indexedDB');
    await portfolioDbService.addOrUpdatePortfolio(newPortfolio as unknown as import('../types/portfolio').PortfolioWithType);
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

