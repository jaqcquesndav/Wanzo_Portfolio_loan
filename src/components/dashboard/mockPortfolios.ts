// src/components/dashboard/mockPortfolios.ts
import { Portfolio } from '../../types/portfolio';

export const mockInvestmentPortfolios: Portfolio[] = [
  {
    id: 'inv-1',
    name: 'Portefeuille tech',
    type: 'investment',
    status: 'active',
    target_amount: 8000000,
    target_return: 12,
    target_sectors: ['Technology', 'Fintech'],
    risk_profile: 'aggressive',
    products: [],
    metrics: {
      net_value: 8500000,
      average_return: 14.2,
      risk_portfolio: 0.8,
      sharpe_ratio: 1.5,
      volatility: 18.2,
      alpha: 2.5,
      beta: 1.2,
      asset_allocation: [
        { type: 'equities', percentage: 75 },
        { type: 'bonds', percentage: 15 },
        { type: 'cash', percentage: 10 }
      ],
      performance_curve: [12, 15, 18, 22, 25, 22, 24],
      returns: [1.2, 1.8, 2.1, 2.3, 2.0, 1.9, 2.2],
      benchmark: [1.0, 1.5, 1.7, 1.6, 1.9, 1.7, 1.8]
    },
    created_at: '2023-05-12T10:30:00Z',
    updated_at: '2025-07-21T14:20:00Z'
  },
  {
    id: 'inv-2',
    name: 'Portefeuille diversifié',
    type: 'investment',
    status: 'active',
    target_amount: 10000000,
    target_return: 8,
    target_sectors: ['Consumer', 'Healthcare', 'Energy'],
    risk_profile: 'moderate',
    products: [],
    metrics: {
      net_value: 11200000,
      average_return: 9.5,
      risk_portfolio: 0.6,
      sharpe_ratio: 1.3,
      volatility: 12.5,
      alpha: 1.2,
      beta: 0.9,
      asset_allocation: [
        { type: 'equities', percentage: 50 },
        { type: 'bonds', percentage: 35 },
        { type: 'cash', percentage: 15 }
      ],
      performance_curve: [8, 10, 12, 13, 15, 14, 16],
      returns: [0.8, 1.1, 1.3, 1.2, 1.4, 1.3, 1.5],
      benchmark: [0.7, 1.0, 1.1, 1.0, 1.2, 1.1, 1.3]
    },
    created_at: '2023-08-05T08:45:00Z',
    updated_at: '2025-07-20T11:15:00Z'
  },
  {
    id: 'inv-3',
    name: 'Portefeuille croissance',
    type: 'investment',
    status: 'active',
    target_amount: 12000000,
    target_return: 10,
    target_sectors: ['Technology', 'Healthcare', 'Financial Services'],
    risk_profile: 'aggressive',
    products: [],
    metrics: {
      net_value: 13800000,
      average_return: 12.2,
      risk_portfolio: 0.75,
      sharpe_ratio: 1.4,
      volatility: 16.8,
      alpha: 2.1,
      beta: 1.1,
      asset_allocation: [
        { type: 'equities', percentage: 65 },
        { type: 'bonds', percentage: 25 },
        { type: 'cash', percentage: 10 }
      ],
      performance_curve: [10, 13, 15, 18, 17, 19, 21],
      returns: [1.0, 1.4, 1.6, 1.8, 1.7, 1.9, 2.1],
      benchmark: [0.9, 1.2, 1.4, 1.5, 1.4, 1.6, 1.7]
    },
    created_at: '2023-06-20T14:10:00Z',
    updated_at: '2025-07-19T16:30:00Z'
  }
];

export const mockTraditionalPortfolios: Portfolio[] = [
  {
    id: 'trad-1',
    name: 'Portefeuille PME',
    type: 'traditional',
    status: 'active',
    target_amount: 5000000,
    target_return: 7,
    target_sectors: ['Retail', 'Services'],
    risk_profile: 'moderate',
    products: [],
    metrics: {
      net_value: 5200000,
      average_return: 7.8,
      risk_portfolio: 0.5,
      sharpe_ratio: 1.2,
      volatility: 9.5,
      alpha: 0.8,
      beta: 0.7,
      asset_allocation: [
        { type: 'credit', percentage: 70 },
        { type: 'microfinance', percentage: 20 },
        { type: 'treasury', percentage: 10 }
      ],
      performance_curve: [7, 8, 9, 8.5, 9.2, 9.5, 10],
      returns: [0.7, 0.8, 0.9, 0.85, 0.92, 0.95, 1.0],
      benchmark: [0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95]
    },
    created_at: '2023-04-15T09:20:00Z',
    updated_at: '2025-07-18T10:45:00Z'
  },
  {
    id: 'trad-2',
    name: 'Portefeuille commercial',
    type: 'traditional',
    status: 'active',
    target_amount: 7000000,
    target_return: 6,
    target_sectors: ['Manufacturing', 'Transportation'],
    risk_profile: 'conservative',
    products: [],
    metrics: {
      net_value: 7300000,
      average_return: 6.5,
      risk_portfolio: 0.4,
      sharpe_ratio: 1.0,
      volatility: 8.2,
      alpha: 0.6,
      beta: 0.6,
      asset_allocation: [
        { type: 'credit', percentage: 80 },
        { type: 'treasury', percentage: 20 }
      ],
      performance_curve: [6, 6.5, 7, 7.2, 7.5, 7.8, 8],
      returns: [0.6, 0.65, 0.7, 0.72, 0.75, 0.78, 0.8],
      benchmark: [0.55, 0.6, 0.65, 0.67, 0.7, 0.72, 0.75]
    },
    created_at: '2023-05-22T11:30:00Z',
    updated_at: '2025-07-17T13:25:00Z'
  }
];

export const mockLeasingPortfolios: Portfolio[] = [
  {
    id: 'lease-1',
    name: 'Portefeuille véhicules',
    type: 'leasing',
    status: 'active',
    target_amount: 15000000,
    target_return: 9,
    target_sectors: ['Transportation'],
    risk_profile: 'moderate',
    products: [],
    metrics: {
      net_value: 16200000,
      average_return: 9.8,
      risk_portfolio: 0.6,
      sharpe_ratio: 1.3,
      volatility: 11.5,
      alpha: 1.0,
      beta: 0.8,
      asset_allocation: [
        { type: 'vehicles', percentage: 100 }
      ],
      performance_curve: [9, 10, 10.5, 11, 10.8, 11.2, 11.5],
      returns: [0.9, 1.0, 1.05, 1.1, 1.08, 1.12, 1.15],
      benchmark: [0.8, 0.9, 0.95, 1.0, 0.98, 1.02, 1.05]
    },
    created_at: '2023-03-10T08:15:00Z',
    updated_at: '2025-07-16T09:30:00Z'
  },
  {
    id: 'lease-2',
    name: 'Portefeuille équipements',
    type: 'leasing',
    status: 'active',
    target_amount: 12000000,
    target_return: 8,
    target_sectors: ['Manufacturing', 'Construction'],
    risk_profile: 'moderate',
    products: [],
    metrics: {
      net_value: 12800000,
      average_return: 8.5,
      risk_portfolio: 0.55,
      sharpe_ratio: 1.2,
      volatility: 10.8,
      alpha: 0.9,
      beta: 0.75,
      asset_allocation: [
        { type: 'machinery', percentage: 70 },
        { type: 'it', percentage: 30 }
      ],
      performance_curve: [8, 8.5, 9, 9.2, 9.5, 9.3, 9.7],
      returns: [0.8, 0.85, 0.9, 0.92, 0.95, 0.93, 0.97],
      benchmark: [0.7, 0.75, 0.8, 0.82, 0.85, 0.83, 0.87]
    },
    created_at: '2023-06-05T13:45:00Z',
    updated_at: '2025-07-15T15:20:00Z'
  }
];

export const getMockPortfoliosByType = (type: 'traditional' | 'investment' | 'leasing'): Portfolio[] => {
  switch (type) {
    case 'traditional':
      return mockTraditionalPortfolios;
    case 'investment':
      return mockInvestmentPortfolios;
    case 'leasing':
      return mockLeasingPortfolios;
    default:
      return [];
  }
};

// Mock portfolio actuel pour démonstration
export const getCurrentPortfolio = (type: 'traditional' | 'investment' | 'leasing'): Portfolio => {
  const portfolios = getMockPortfoliosByType(type);
  return portfolios[0]; // Utilise le premier portfolio du type comme exemple
};
