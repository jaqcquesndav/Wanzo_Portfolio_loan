// Helper to provide a fully-typed default metrics object
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
import { useState, useMemo } from 'react';
import { usePortfolios } from './usePortfolios';
import type { InvestmentPortfolio } from '../types/investment-portfolio';
import type { PortfolioWithType, Portfolio } from '../types/portfolio';
import { portfolioStorageService } from '../services/storage/localStorage';


interface Filters {
  status: string;
  riskProfile: string;
  sector: string;
  minAmount: string;
  investmentStage: string;
}

export function useInvestmentPortfolios() {
  // Utilise le hook générique qui gère le chargement automatique depuis localStorage
  const { portfolios: allPortfolios, loading, refresh } = usePortfolios('investment');
  // Cast allPortfolios to PortfolioWithType[] for type-safe filtering
  const portfolios = (allPortfolios as PortfolioWithType[]).filter((p): p is InvestmentPortfolio => p.type === 'investment');
  const [filters, setFilters] = useState<Filters>({
    status: '',
    riskProfile: '',
    sector: '',
    minAmount: '',
    investmentStage: ''
  });

  const createPortfolio = async (data: Omit<PortfolioWithType, 'id' | 'type' | 'status' | 'assets' | 'created_at' | 'updated_at'>): Promise<InvestmentPortfolio> => {
    const now = new Date().toISOString();
    // Utiliser un ID unique pour le nouveau portefeuille
    const portfolioId = Math.random().toString(36).substr(2, 9);
    
    // Importer les données mockées SPÉCIFIQUES au type INVESTMENT
    const { mockInvestmentPortfolios } = await import('../data/mockInvestmentPortfolios');
    const mockPortfolio = mockInvestmentPortfolios[0]; // Prendre le premier comme template
    
    // Créer le nouveau portefeuille en combinant les données du formulaire avec les données mockées
    const newPortfolio: InvestmentPortfolio = {
      ...data,
      id: portfolioId,
      name: typeof data.name === 'string' ? data.name : 'Nouveau portefeuille',
      type: 'investment',
      status: 'active',
      products: Array.isArray(data.products) ? data.products : [],
      metrics: typeof data.metrics === 'object' && data.metrics !== null && 'net_value' in data.metrics 
        ? data.metrics as Portfolio['metrics'] 
        : getDefaultMetrics(),
      target_amount: typeof data.target_amount === 'number' ? data.target_amount : 0,
      target_return: typeof data.target_return === 'number' ? data.target_return : 0,
      target_sectors: Array.isArray(data.target_sectors) ? data.target_sectors : [],
      risk_profile: data.risk_profile === 'conservative' || data.risk_profile === 'moderate' || data.risk_profile === 'aggressive' 
        ? data.risk_profile 
        : 'moderate',
      // Hériter des données mockées d'investissement pour faciliter le déploiement
      assets: mockPortfolio?.assets?.map(item => ({
        ...item,
        id: `asset-${portfolioId.substring(0, 5)}-${Math.floor(Math.random() * 1000)}`
      })) || [],
      subscriptions: mockPortfolio?.subscriptions?.map(item => ({
        ...item,
        id: `sub-${portfolioId.substring(0, 5)}-${Math.floor(Math.random() * 1000)}`
      })) || [],
      valuations: mockPortfolio?.valuations?.map(item => ({
        ...item,
        id: `val-${portfolioId.substring(0, 5)}-${Math.floor(Math.random() * 1000)}`
      })) || [],
      requests: mockPortfolio?.requests?.map(item => ({
        ...item,
        id: `req-${portfolioId.substring(0, 5)}-${Math.floor(Math.random() * 1000)}`
      })) || [],
      transactions: mockPortfolio?.transactions?.map(item => ({
        ...item,
        id: `tx-${portfolioId.substring(0, 5)}-${Math.floor(Math.random() * 1000)}`
      })) || [],
      reports: mockPortfolio?.reports?.map(item => ({
        ...item,
        id: `rep-${portfolioId.substring(0, 5)}-${Math.floor(Math.random() * 1000)}`
      })) || [],
      exitEvents: mockPortfolio?.exitEvents?.map(item => ({
        ...item,
        id: `exit-${portfolioId.substring(0, 5)}-${Math.floor(Math.random() * 1000)}`
      })) || [],
      created_at: now,
      updated_at: now,
    };
    
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
    createPortfolio,
    refresh
  };
}

