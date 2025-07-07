import type { InvestmentRequest } from '../types/investment-portfolio';

export const mockInvestmentRequests: InvestmentRequest[] = [
  {
    id: 'INVREQ-20250701-0001',
    companyId: 'COMP-2024-001',
    stage: 'amorcage',
    amountRequested: 5000000,
    status: 'en instruction',
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2025-07-01T10:00:00Z',
    portfolioId: 'invest-1',
  },
  {
    id: 'INVREQ-20250701-0002',
    companyId: 'COMP-2024-002',
    stage: 'developpement',
    amountRequested: 12000000,
    status: 'acceptée',
    created_at: '2025-07-02T11:00:00Z',
    updated_at: '2025-07-02T11:00:00Z',
    portfolioId: 'invest-1',
  }
];
