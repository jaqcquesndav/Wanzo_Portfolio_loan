import type { LeasingTransaction } from '../types/leasing-transaction';

export const mockLeasingTransactions: LeasingTransaction[] = [
  {
    id: 'LEASETRX-20250701-0001',
    equipmentId: 'WL-00000001',
    type: 'Location',
    amount: 1000000,
    date: '2025-07-01T10:00:00Z',
    status: 'en cours',
    portfolioId: 'lease-1',
  },
  {
    id: 'LEASETRX-20250701-0002',
    equipmentId: 'WL-00000002',
    type: 'Retour',
    amount: 0,
    date: '2025-07-05T10:00:00Z',
    status: 'effectué',
    portfolioId: 'lease-1',
  },
  {
    id: 'LEASETRX-20250708-0003',
    equipmentId: 'WL-00000003',
    type: 'Location',
    amount: 1250000,
    date: '2025-07-08T09:30:00Z',
    status: 'en cours',
    portfolioId: 'lease-1',
  },
  {
    id: 'LEASETRX-20250710-0004',
    equipmentId: 'WL-00000001',
    type: 'Maintenance',
    amount: 150000,
    date: '2025-07-10T14:15:00Z',
    status: 'planifié',
    portfolioId: 'lease-1',
  },
  {
    id: 'LEASETRX-20250715-0005',
    equipmentId: 'WL-00000001',
    type: 'Paiement',
    amount: 250000,
    date: '2025-07-15T11:00:00Z',
    status: 'complété',
    portfolioId: 'lease-1',
  }
];
