// mockInvestmentData.ts

// Export country and region data
export const countries = [
  'Cameroun',
  'Gabon',
  'République Démocratique du Congo',
  'République du Congo',
  'Sénégal',
  'Côte d\'Ivoire',
  'Ghana',
  'Nigeria',
  'Mali',
  'Tchad'
];

export const regions = [
  'Afrique Centrale',
  'Afrique de l\'Ouest',
  'CEMAC',
  'UEMOA'
];

// Export sector data
export const sectors = [
  'Technologie',
  'Santé',
  'Éducation',
  'Agroalimentaire',
  'Énergie',
  'Finance',
  'Industrie manufacturière',
  'Transport et logistique',
  'Télécommunications',
  'Services B2B'
];

// Export investment stages
export const stages = [
  'Amorçage',
  'Démarrage',
  'Développement',
  'Expansion',
  'Maturité',
  'Restructuration'
];

// Define the type for investment report data
export interface InvestmentReportData {
  id: string;
  companyName: string;
  sector: string;
  country: string;
  region: string;
  stage: string;
  investmentDate: string;
  investmentAmount: number;
  currentValuation: number;
  return: number;
  multiple: number;
  status: string;
  exitDate?: string;
  exitValue?: number;
  irr?: number;
  impactScore?: number;
  esgRating?: string;
  portfolioContribution?: number;
  riskRating?: string;
}

// Create mock data for investment reports
export const mockInvestments: InvestmentReportData[] = [
  {
    id: 'INV-001',
    companyName: 'TechSolutions Afrique',
    sector: 'Technologie',
    country: 'Cameroun',
    region: 'Afrique Centrale',
    stage: 'Développement',
    investmentDate: '2023-06-15',
    investmentAmount: 120000000,
    currentValuation: 180000000,
    return: 50.0,
    multiple: 1.5,
    status: 'Active',
    impactScore: 8.5,
    esgRating: 'A',
    portfolioContribution: 15.2,
    riskRating: 'Modéré'
  },
  {
    id: 'INV-002',
    companyName: 'GreenEnergy Gabon',
    sector: 'Énergie',
    country: 'Gabon',
    region: 'Afrique Centrale',
    stage: 'Expansion',
    investmentDate: '2022-11-30',
    investmentAmount: 250000000,
    currentValuation: 300000000,
    return: 20.0,
    multiple: 1.2,
    status: 'Active',
    impactScore: 9.2,
    esgRating: 'A+',
    portfolioContribution: 25.5,
    riskRating: 'Faible'
  },
  {
    id: 'INV-003',
    companyName: 'SantéPlus RDC',
    sector: 'Santé',
    country: 'République Démocratique du Congo',
    region: 'Afrique Centrale',
    stage: 'Démarrage',
    investmentDate: '2024-02-10',
    investmentAmount: 80000000,
    currentValuation: 70000000,
    return: -12.5,
    multiple: 0.875,
    status: 'En cours de cession',
    impactScore: 7.8,
    esgRating: 'B+',
    portfolioContribution: 6.0,
    riskRating: 'Élevé'
  },
  {
    id: 'INV-004',
    companyName: 'AgroTech Sénégal',
    sector: 'Agroalimentaire',
    country: 'Sénégal',
    region: 'Afrique de l\'Ouest',
    stage: 'Maturité',
    investmentDate: '2021-05-20',
    investmentAmount: 350000000,
    currentValuation: 500000000,
    return: 42.86,
    multiple: 1.43,
    status: 'Cédée',
    exitDate: '2025-01-15',
    exitValue: 500000000,
    irr: 15.2,
    impactScore: 8.9,
    esgRating: 'A',
    portfolioContribution: 0,
    riskRating: 'N/A'
  },
  {
    id: 'INV-005',
    companyName: 'EduTech Côte d\'Ivoire',
    sector: 'Éducation',
    country: 'Côte d\'Ivoire',
    region: 'Afrique de l\'Ouest',
    stage: 'Développement',
    investmentDate: '2023-09-05',
    investmentAmount: 150000000,
    currentValuation: 200000000,
    return: 33.33,
    multiple: 1.33,
    status: 'Active',
    impactScore: 9.5,
    esgRating: 'A',
    portfolioContribution: 17.0,
    riskRating: 'Modéré'
  }
];

// Export default for easier imports
export default {
  mockInvestments,
  countries,
  regions,
  sectors,
  stages
};
