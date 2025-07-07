import type { LeasingTransaction } from '../types/leasing-transaction';

export const mockLeasingTransactions: LeasingTransaction[] = [
  {
    id: 'LEASETRX-20250701-0001',
    equipmentId: 'EQ-001',
    type: 'Location',
    amount: 1000000,
    date: '2025-07-01T10:00:00Z',
    status: 'en cours',
    portfolioId: 'lease-1',
  },
  {
    id: 'LEASETRX-20250701-0002',
    equipmentId: 'EQ-002',
    type: 'Retour',
    amount: 0,
    date: '2025-07-05T10:00:00Z',
    status: 'effectué',
    portfolioId: 'lease-1',
  }
];
