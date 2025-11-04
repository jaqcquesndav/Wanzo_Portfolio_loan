import type { Portfolio } from '../types/portfolio';

export function createDefaultPortfolio(
  data: Partial<Portfolio> & {
    name: string;
    description: string;
    target_amount: number;
    target_return: number;
    risk_profile: 'conservative' | 'moderate' | 'aggressive';
    target_sectors: string[];
    type: 'traditional';
  }
): Portfolio {
  return {
    ...data,
    id: Date.now().toString(),
    name: data.name,
    type: data.type,
    target_amount: data.target_amount,
    target_return: data.target_return,
    risk_profile: data.risk_profile,
    target_sectors: data.target_sectors,
    status: 'active',
    products: [],
    metrics: {
      net_value: data.target_amount,
      average_return: 0,
      risk_portfolio: 0,
      sharpe_ratio: 0,
      volatility: 0,
      alpha: 0,
      beta: 0,
      asset_allocation: [],
      taux_couverture: 0,
      taux_impayes: 0,
      // Ne pas inclure taux_recouvrement si non présent dans le type Portfolio
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
