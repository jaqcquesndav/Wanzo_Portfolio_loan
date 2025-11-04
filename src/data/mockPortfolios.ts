import type { Portfolio } from '../types/portfolio';

export const mockPortfolios: Portfolio[] = [
  {
    id: 'trad-1',
    name: 'Portefeuille PME Nord-Kivu',
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
      // Indicateurs crédit
      balance_AGE: {
        total: 120000000,
        echeance_0_30: 70000000,
        echeance_31_60: 30000000,
        echeance_61_90: 15000000,
        echeance_91_plus: 5000000
      },
      taux_impayes: 2.1,
      taux_couverture: 98.5
    },
    created_at: '2024-01-01',
    updated_at: '2024-03-15'
  },
  {
    id: 'trad-2',
    name: 'Portefeuille Microfinance Kinshasa',
    type: 'traditional',
    status: 'active',
    target_amount: 200000000,
    target_return: 15,
    target_sectors: ['Commerce', 'Artisanat', 'Agriculture'],
    risk_profile: 'moderate',
    products: [],
    metrics: {
      net_value: 180000000,
      average_return: 13.5,
      risk_portfolio: 10,
      sharpe_ratio: 1.5,
      volatility: 14,
      alpha: 3.0,
      beta: 0.9,
      asset_allocation: [
        { type: 'Microfinance', percentage: 70 },
        { type: 'Trésorerie', percentage: 30 }
      ],
      // Indicateurs crédit
      balance_AGE: {
        total: 60000000,
        echeance_0_30: 40000000,
        echeance_31_60: 12000000,
        echeance_61_90: 6000000,
        echeance_91_plus: 2000000
      },
      taux_impayes: 1.2,
      taux_couverture: 99.2
    },
    created_at: '2024-02-01',
    updated_at: '2024-03-15'
  }
];

// Note: Les portefeuilles investment et leasing ont été supprimés de l'application
// L'application se concentre maintenant uniquement sur les portefeuilles traditionnels