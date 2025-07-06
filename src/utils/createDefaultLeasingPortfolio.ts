import type { LeasingPortfolioFull } from '../types/leasing-portfolio-full';

export function createDefaultLeasingPortfolio(data: {
  name: string;
  target_amount: number;
  target_return: number;
  target_sectors: string[];
  risk_profile: 'conservative' | 'moderate' | 'aggressive';
}): LeasingPortfolioFull {
  return {
    id: Date.now().toString(),
    name: data.name,
    type: 'leasing',
    status: 'active',
    target_amount: data.target_amount,
    target_return: data.target_return,
    target_sectors: data.target_sectors,
    risk_profile: data.risk_profile,
    equipment_catalog: [],
    leasing_terms: {
      min_duration: 12,
      max_duration: 60,
      interest_rate_range: { min: 3, max: 10 },
      maintenance_included: false,
      insurance_required: false,
    },
    metrics: {
      totalLeased: 0,
      utilizationRate: 0,
      defaultRate: 0,
      totalRevenue: 0,
      totalIncidents: 0,
      totalMaintenance: 0,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
