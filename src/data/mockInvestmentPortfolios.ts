import type { InvestmentPortfolio } from '../lib/indexedDbPortfolioService';

export const mockInvestmentPortfolios: InvestmentPortfolio[] = [
  {
    id: 'invest-1',
    name: 'Portefeuille VC Afrique',
    type: 'investment',
    status: 'active',
    target_amount: 1000000000,
    target_return: 18,
    target_sectors: ['Tech', 'Agro', 'Finance'],
    risk_profile: 'aggressive',
    products: [],
    assets: [],
    metrics: {
      net_value: 850000000,
      average_return: 16.2,
      risk_portfolio: 14,
      sharpe_ratio: 2.1,
      volatility: 18,
      alpha: 4.2,
      beta: 1.1,
      asset_allocation: [
        { type: 'Venture', percentage: 60 },
        { type: 'Private Equity', percentage: 30 },
        { type: 'Trésorerie', percentage: 10 }
      ],
      performance_curve: [100, 120, 140, 135, 160, 170, 180],
      returns: [2.5, 3.1, 2.8, 4.2, 3.7, 4.5, 5.0],
      benchmark: [2.0, 2.8, 2.5, 3.5, 3.2, 3.8, 4.0],
      // --- Métriques métier investissement ---
      nb_requests: 2,
      nb_transactions: 2,
      total_invested: 7000000,
      total_exited: 2000000,
      irr: 15.5,
      multiple: 1.8,
      avg_ticket: 3500000,
      nb_companies: 2
    },
    created_at: '2024-01-01',
    updated_at: '2025-07-01',
    requests: [],
    transactions: [],
    reports: [],
    exitEvents: []
  }
];
