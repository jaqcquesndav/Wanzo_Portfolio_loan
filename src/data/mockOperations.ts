import type { Operation } from '../types/operations';

export const mockOperations: Operation[] = [
  {
    id: 'OP001',
    type: 'credit',
    amount: 50000000,
    status: 'active',
    startDate: '2024-03-01',
    duration: 24,
    interestRate: 8.5,
    description: 'Crédit d\'investissement pour l\'expansion',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z'
  },
  {
    id: 'OP002',
    type: 'leasing',
    amount: 25000000,
    status: 'pending',
    startDate: '2024-03-14',
    duration: 36,
    interestRate: 10,
    description: 'Leasing équipement industriel',
    created_at: '2024-03-14T15:30:00Z',
    updated_at: '2024-03-14T15:30:00Z'
  },
  {
    id: 'OP003',
    type: 'investment',
    amount: 200000000,
    status: 'active',
    startDate: '2024-02-28',
    duration: 60,
    description: 'Investissement en capital série A',
    created_at: '2024-02-28T09:00:00Z',
    updated_at: '2024-02-28T09:00:00Z'
  }
];