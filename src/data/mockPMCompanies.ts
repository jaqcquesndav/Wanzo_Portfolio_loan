import type { Company } from '../types/company';

export const mockPMCompanies: Company[] = [
  {
    id: 'COMP-2024-001',
    name: 'AgroTech Africa',
    sector: 'Agro',
    size: 'medium',
    status: 'active',
    employee_count: 50,
    annual_revenue: 120000000,
    financial_metrics: {
      revenue_growth: 18,
      profit_margin: 12,
      cash_flow: 15000000,
      debt_ratio: 0.25,
      working_capital: 8000000,
      credit_score: 88,
      financial_rating: 'A',
      ebitda: 18000000,
    },
    esg_metrics: {
      esg_rating: 'AA',
      carbon_footprint: 10,
      environmental_rating: 'A',
      social_rating: 'A',
      governance_rating: 'A'
    },
    created_at: '2024-01-01',
    updated_at: '2025-07-01'
  },
  {
    id: 'COMP-2024-002',
    name: 'FinTech RDC',
    sector: 'Finance',
    size: 'small',
    status: 'active',
    employee_count: 30,
    annual_revenue: 90000000,
    financial_metrics: {
      revenue_growth: 22,
      profit_margin: 15,
      cash_flow: 9000000,
      debt_ratio: 0.18,
      working_capital: 6000000,
      credit_score: 75,
      financial_rating: 'B',
      ebitda: 12000000,
    },
    esg_metrics: {
      esg_rating: 'A',
      carbon_footprint: 7,
      environmental_rating: 'B',
      social_rating: 'A',
      governance_rating: 'B'
    },
    created_at: '2024-01-01',
    updated_at: '2025-07-01'
  }
];
