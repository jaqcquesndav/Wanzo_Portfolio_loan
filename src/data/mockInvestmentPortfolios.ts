import type { InvestmentPortfolio } from '../types/investment-portfolio';

export const mockInvestmentPortfolios: InvestmentPortfolio[] = [
  {
    id: 'invest-1',
    name: 'Portefeuille VC Afrique',
    type: 'investment',
    status: 'active',
    // Essayez aussi d'autres statuts pour tester l'UI et la logique métier :
    // status: 'pending',
    // status: 'archived',
    target_amount: 1000000000,
    target_return: 18,
    target_sectors: ['Tech', 'Agro', 'Finance'],
    risk_profile: 'aggressive',
    products: [],
    assets: [
      {
        id: 'asset-1',
        name: 'Startup FinTech Africa',
        type: 'Venture',
        value: 3500000,
        currency: 'FCFA',
        created_at: '2024-01-10',
        // updated_at: '2025-07-01'
      },
      {
        id: 'asset-2',
        name: 'AgroTech Côte d’Ivoire',
        type: 'Private Equity',
        value: 5000000,
        currency: 'FCFA',
        created_at: '2024-02-15',
        // updated_at: '2025-07-01'
      }
    ],
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
    subscriptions: [
      {
        id: 'sub-1',
        offerId: 'offer-1',
        investorId: 'investor-1',
        quantity: 100,
        amount: 2000000,
        status: 'approved',
        created_at: '2024-03-01'
      },
      {
        id: 'sub-2',
        offerId: 'offer-2',
        investorId: 'investor-2',
        quantity: 150,
        amount: 3000000,
        status: 'pending',
        created_at: '2024-04-01'
      }
    ],
    valuations: [
      {
        id: 'val-1',
        companyId: 'COMP-2024-001',
        totalValue: 3700000,
        sharePrice: 100000,
        evaluationDate: '2025-06-01',
        method: 'DCF',
        details: { revenueMultiple: 2.5 },
        created_at: '2025-06-01'
      },
      {
        id: 'val-2',
        companyId: 'COMP-2024-002',
        totalValue: 5200000,
        sharePrice: 120000,
        evaluationDate: '2025-06-01',
        method: 'Multiple',
        details: { ebitdaMultiple: 3.1 },
        created_at: '2025-06-01'
      }
    ],
    requests: [],
    transactions: [],
    reports: [
      {
        id: 'report-1',
        portfolioId: 'invest-1',
        companyId: 'COMP-2024-001',
        period: '2025-Q2',
        kpis: { croissance: 12, marge: 18 },
        created_at: '2025-06-30',
        updated_at: '2025-06-30'
      }
    ],
    exitEvents: []
  },
  {
    id: 'invest-2',
    name: 'Portefeuille PE Afrique',
    type: 'investment',
    status: 'pending',
    target_amount: 500000000,
    target_return: 12,
    target_sectors: ['Industrie', 'Services'],
    risk_profile: 'moderate',
    products: [],
    assets: [],
    metrics: {
      net_value: 0,
      average_return: 0,
      risk_portfolio: 0,
      sharpe_ratio: 0,
      volatility: 0,
      alpha: 0,
      beta: 0,
      asset_allocation: [],
      performance_curve: [],
      returns: [],
      benchmark: [],
      nb_requests: 0,
      nb_transactions: 0,
      total_invested: 0,
      total_exited: 0,
      irr: 0,
      multiple: 0,
      avg_ticket: 0,
      nb_companies: 0
    },
    created_at: '2024-06-01',
    updated_at: '2025-07-01',
    subscriptions: [],
    valuations: [],
    requests: [],
    transactions: [],
    reports: [],
    exitEvents: []
  },
  {
    id: 'invest-3',
    name: 'Portefeuille VC Archivé',
    type: 'investment',
    status: 'archived',
    target_amount: 200000000,
    target_return: 10,
    target_sectors: ['Tech'],
    risk_profile: 'conservative',
    products: [],
    assets: [],
    metrics: {
      net_value: 0,
      average_return: 0,
      risk_portfolio: 0,
      sharpe_ratio: 0,
      volatility: 0,
      alpha: 0,
      beta: 0,
      asset_allocation: [],
      performance_curve: [],
      returns: [],
      benchmark: [],
      nb_requests: 0,
      nb_transactions: 0,
      total_invested: 0,
      total_exited: 0,
      irr: 0,
      multiple: 0,
      avg_ticket: 0,
      nb_companies: 0
    },
    created_at: '2023-01-01',
    updated_at: '2024-01-01',
    subscriptions: [],
    valuations: [],
    requests: [],
    transactions: [],
    reports: [],
    exitEvents: []
  }
];
