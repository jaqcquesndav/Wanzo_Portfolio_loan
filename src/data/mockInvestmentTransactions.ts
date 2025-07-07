import type { InvestmentTransaction } from '../types/investment-portfolio';

export const mockInvestmentTransactions: InvestmentTransaction[] = [
  {
    id: 'INVTRX-20250701-0001',
    companyId: 'COMP-2024-001',
    investmentRequestId: 'INVREQ-20250701-0001',
    type: 'prise de participation',
    amount: 5000000,
    date: '2025-07-03T10:00:00Z',
    status: 'effectué',
    portfolioId: 'invest-1',
    created_at: '2025-07-03T10:00:00Z',
    updated_at: '2025-07-03T10:00:00Z',
  },
  {
    id: 'INVTRX-20250701-0002',
    companyId: 'COMP-2024-002',
    investmentRequestId: 'INVREQ-20250701-0002',
    type: 'cession',
    amount: 2000000,
    date: '2025-07-04T10:00:00Z',
    status: 'prévu',
    portfolioId: 'invest-1',
    created_at: '2025-07-04T10:00:00Z',
    updated_at: '2025-07-04T10:00:00Z',
  }
];
