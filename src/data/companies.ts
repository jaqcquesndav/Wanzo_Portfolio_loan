export interface CompanyData {
  id: string;
  name: string;
  sector: string;
  size: string;
  annual_revenue: number;
  employee_count: number;
  status: string;
  financial_metrics?: {
    revenue_growth?: number;
    profit_margin?: number;
    debt_ratio?: number;
  };
  financialHighlights?: {
    operatingMargin?: number;
    ebitda?: number;
    totalAssets?: number;
  };
  socialMedia?: {
    website?: string;
  };
  creditRating?: string;
  pitch_deck_url?: string;
}

export const mockCompanies: CompanyData[] = [
  {
    id: 'COMP-0001',
    name: 'PME Agro Sarl',
    sector: 'Agriculture',
    size: 'medium',
    annual_revenue: 750000000,
    employee_count: 45,
    status: 'active',
    financial_metrics: {
      revenue_growth: 15.2,
      profit_margin: 8.5,
      debt_ratio: 0.35
    },
    financialHighlights: {
      operatingMargin: 8.5,
      ebitda: 120000000,
      totalAssets: 850000000
    },
    socialMedia: {
      website: 'https://pmeagro.example.com'
    },
    creditRating: 'A'
  },
  {
    id: 'COMP-0002',
    name: 'TransLogistics',
    sector: 'Transport',
    size: 'large',
    annual_revenue: 1500000000,
    employee_count: 120,
    status: 'active',
    financial_metrics: {
      revenue_growth: 12.8,
      profit_margin: 10.2,
      debt_ratio: 0.42
    },
    financialHighlights: {
      operatingMargin: 10.2,
      ebitda: 250000000,
      totalAssets: 1800000000
    },
    socialMedia: {
      website: 'https://translogistics.example.com'
    },
    creditRating: 'B'
  },
  {
    id: 'COMP-0003',
    name: 'BTP Services',
    sector: 'Construction',
    size: 'medium',
    annual_revenue: 850000000,
    employee_count: 75,
    status: 'active',
    financial_metrics: {
      revenue_growth: 8.5,
      profit_margin: 7.8,
      debt_ratio: 0.48
    },
    financialHighlights: {
      operatingMargin: 7.8,
      ebitda: 150000000,
      totalAssets: 950000000
    },
    socialMedia: {
      website: 'https://btpservices.example.com'
    },
    creditRating: 'B'
  },
  {
    id: 'COMP-0004',
    name: 'InnoBiotech',
    sector: 'Santé',
    size: 'small',
    annual_revenue: 350000000,
    employee_count: 30,
    status: 'active',
    financial_metrics: {
      revenue_growth: 22.5,
      profit_margin: 12.3,
      debt_ratio: 0.28
    },
    financialHighlights: {
      operatingMargin: 12.3,
      ebitda: 85000000,
      totalAssets: 420000000
    },
    socialMedia: {
      website: 'https://innobiotech.example.com'
    },
    creditRating: 'A'
  },
  {
    id: 'COMP-0005',
    name: 'Digital Solutions SARL',
    sector: 'Technologie',
    size: 'small',
    annual_revenue: 280000000,
    employee_count: 25,
    status: 'active',
    financial_metrics: {
      revenue_growth: 18.7,
      profit_margin: 14.5,
      debt_ratio: 0.22
    },
    financialHighlights: {
      operatingMargin: 14.5,
      ebitda: 68000000,
      totalAssets: 320000000
    },
    socialMedia: {
      website: 'https://digitalsolutions.example.com'
    },
    creditRating: 'A'
  },
  {
    id: 'COMP-0006',
    name: 'Eco-Construct SA',
    sector: 'Construction',
    size: 'large',
    annual_revenue: 1850000000,
    employee_count: 150,
    status: 'active',
    financial_metrics: {
      revenue_growth: 9.8,
      profit_margin: 8.2,
      debt_ratio: 0.45
    },
    financialHighlights: {
      operatingMargin: 8.2,
      ebitda: 280000000,
      totalAssets: 2100000000
    },
    socialMedia: {
      website: 'https://ecoconstruct.example.com'
    },
    creditRating: 'B'
  },
  {
    id: 'COMP-0007',
    name: 'AgroTech Innovations',
    sector: 'Agriculture',
    size: 'medium',
    annual_revenue: 620000000,
    employee_count: 55,
    status: 'active',
    financial_metrics: {
      revenue_growth: 14.3,
      profit_margin: 9.1,
      debt_ratio: 0.38
    },
    financialHighlights: {
      operatingMargin: 9.1,
      ebitda: 95000000,
      totalAssets: 720000000
    },
    socialMedia: {
      website: 'https://agrotech-innovations.example.com'
    },
    creditRating: 'B'
  },
  {
    id: 'COMP-0008',
    name: 'MediHealth Plus',
    sector: 'Santé',
    size: 'medium',
    annual_revenue: 780000000,
    employee_count: 65,
    status: 'active',
    financial_metrics: {
      revenue_growth: 16.8,
      profit_margin: 11.5,
      debt_ratio: 0.32
    },
    financialHighlights: {
      operatingMargin: 11.5,
      ebitda: 135000000,
      totalAssets: 890000000
    },
    socialMedia: {
      website: 'https://medihealthplus.example.com'
    },
    creditRating: 'A'
  }
];