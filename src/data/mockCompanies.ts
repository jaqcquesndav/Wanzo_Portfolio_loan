import type { Company } from '../types/company';

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechInnovate Sénégal',
    sector: 'Technologies',
    size: 'small',
    annual_revenue: 150000000,
    employee_count: 25,
    website_url: 'https://techinnovate.sn',
    pitch_deck_url: 'https://example.com/pitch.pdf',
    status: 'active',
    financial_metrics: {
      revenue_growth: 25.5,
      profit_margin: 15.2,
      cash_flow: 45000000,
      debt_ratio: 0.3,
      working_capital: 35000000,
      credit_score: 85,
      financial_rating: 'A'
    },
    esg_metrics: {
      carbon_footprint: 12.5,
      environmental_rating: 'B',
      social_rating: 'A',
      governance_rating: 'B',
      gender_ratio: {
        male: 60,
        female: 40
      }
    },
    created_at: '2024-01-01',
    updated_at: '2024-03-15'
  },
  {
    id: '2',
    name: 'Green Energy Solutions',
    sector: 'Industrie',
    size: 'medium',
    annual_revenue: 350000000,
    employee_count: 75,
    website_url: 'https://greenenergy.sn',
    status: 'active',
    financial_metrics: {
      revenue_growth: 18.3,
      profit_margin: 12.8,
      cash_flow: 85000000,
      debt_ratio: 0.4,
      working_capital: 65000000,
      credit_score: 78,
      financial_rating: 'B'
    },
    esg_metrics: {
      carbon_footprint: 8.2,
      environmental_rating: 'A',
      social_rating: 'B',
      governance_rating: 'B'
    },
    created_at: '2024-01-15',
    updated_at: '2024-03-15'
  },
  {
    id: '3',
    name: 'AgroTech Africa',
    sector: 'Agriculture',
    size: 'medium',
    annual_revenue: 250000000,
    employee_count: 120,
    website_url: 'https://agrotech.africa',
    status: 'active',
    financial_metrics: {
      revenue_growth: 22.1,
      profit_margin: 14.5,
      cash_flow: 55000000,
      debt_ratio: 0.35,
      working_capital: 45000000,
      credit_score: 82,
      financial_rating: 'A'
    },
    esg_metrics: {
      carbon_footprint: 15.8,
      environmental_rating: 'B',
      social_rating: 'A',
      governance_rating: 'A'
    },
    created_at: '2024-02-01',
    updated_at: '2024-03-15'
  }
];