import type { TraditionalPortfolio } from '../lib/indexedDbPortfolioService';

export const mockTraditionalPortfolios: TraditionalPortfolio[] = [
  {
    id: 'trad-1',
    name: 'Portefeuille PME',
    type: 'traditional',
    status: 'active',
    target_amount: 500000000,
    target_return: 12,
    target_sectors: ['Commerce', 'Services', 'Agriculture'],
    risk_profile: 'moderate',
    products: [],
    metrics: {
      net_value: 450000000,
      average_return: 10.5,
      risk_portfolio: 8,
      sharpe_ratio: 1.8,
      volatility: 12,
      alpha: 2.5,
      beta: 0.85,
      asset_allocation: [
        { type: 'Crédit PME', percentage: 45 },
        { type: 'Microfinance', percentage: 30 },
        { type: 'Trésorerie', percentage: 25 }
      ],
      performance_curve: [100, 110, 120, 115, 130, 128, 140],
      balance_AGE: {
        total: 120000000,
        echeance_0_30: 70000000,
        echeance_31_60: 30000000,
        echeance_61_90: 15000000,
        echeance_91_plus: 5000000
      },
      taux_impayes: 2.1,
      taux_couverture: 98.5,
      // --- Métriques métier crédit/traditionnel ---
      nb_credits: 24,
      total_credits: 320000000,
      avg_credit: 13333333,
      nb_clients: 18,
      taux_rotation: 18.5,
      taux_provision: 3.2,
      taux_recouvrement: 97.2
    },
    created_at: '2024-01-01',
    updated_at: '2024-03-15',
    description: 'Portefeuille PME',
    manager_id: 'user-1',
    institution_id: 'inst-1'
  }
];
