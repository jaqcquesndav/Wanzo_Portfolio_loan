import type { InvestmentRequest, DueDiligenceReport, InvestmentDecision, InvestmentTransaction, PortfolioCompanyReport, ExitEvent } from '../types/investment-portfolio';

export const mockInvestmentRequests: InvestmentRequest[] = [
  {
    id: 'INVEST-REQ-20250707-0001',
    portfolioId: 'invest-1',
    companyId: '1',
    stage: 'amorcage',
    amountRequested: 50000000,
    status: 'en instruction',
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2025-07-01T10:00:00Z',
  },
  {
    id: 'INVEST-REQ-20250707-0002',
    portfolioId: 'invest-1',
    companyId: '2',
    stage: 'developpement',
    amountRequested: 120000000,
    status: 'acceptée',
    created_at: '2025-06-15T09:00:00Z',
    updated_at: '2025-06-20T10:00:00Z',
  }
];

export const mockDueDiligenceReports: DueDiligenceReport[] = [
  {
    id: 'DD-20250707-0001',
    portfolioId: 'invest-1',
    investmentRequestId: 'INVEST-REQ-20250707-0001',
    reportUrl: 'https://example.com/dd1.pdf',
    completed: true,
    created_at: '2025-07-02T10:00:00Z',
    updated_at: '2025-07-02T10:00:00Z',
  }
];

export const mockInvestmentDecisions: InvestmentDecision[] = [
  {
    id: 'DEC-20250707-0001',
    portfolioId: 'invest-1',
    investmentRequestId: 'INVEST-REQ-20250707-0002',
    decision: 'go',
    committeeDate: '2025-06-20',
    notes: 'Décision favorable',
    created_at: '2025-06-20T12:00:00Z',
    updated_at: '2025-06-20T12:00:00Z',
  }
];

export const mockInvestmentTransactions: InvestmentTransaction[] = [
  {
    id: 'INVEST-TRX-20250707-0001',
    portfolioId: 'invest-1',
    companyId: '1',
    investmentRequestId: 'INVEST-REQ-20250707-0001',
    amount: 50000000,
    date: '2025-07-05',
    type: 'prise de participation',
    status: 'effectué',
    created_at: '2025-07-05T10:00:00Z',
    updated_at: '2025-07-05T10:00:00Z',
  }
];

export const mockPortfolioCompanyReports: PortfolioCompanyReport[] = [
  {
    id: 'PCR-20250707-0001',
    portfolioId: 'invest-1',
    companyId: '1',
    period: '2025-Q2',
    kpis: { ca: 120000000, ebitda: 18000000, effectif: 25 },
    reportUrl: 'https://example.com/report1.pdf',
    created_at: '2025-07-06T10:00:00Z',
    updated_at: '2025-07-06T10:00:00Z',
  }
];

export const mockExitEvents: ExitEvent[] = [
  {
    id: 'EXIT-20250707-0001',
    portfolioId: 'invest-1',
    companyId: '1',
    type: 'cession',
    date: '2027-12-31',
    amount: 90000000,
    performance: { tri: 18.5, multiple: 1.8 },
    notes: 'Sortie par cession industrielle',
    created_at: '2027-12-31T10:00:00Z',
    updated_at: '2027-12-31T10:00:00Z',
  }
];
