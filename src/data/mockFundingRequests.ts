import { FundingRequest } from '../components/portfolio/traditional/FundingRequestsTable';

export const mockFundingRequests: FundingRequest[] = [
  {
    id: 'req-1',
    company: 'PME Agro Sarl',
    product: 'Crédit PME 12 mois',
    amount: 15000000,
    status: 'en attente',
    created_at: '2025-07-01T10:00:00Z',
  },
  {
    id: 'req-2',
    company: 'TransLogistics',
    product: 'Crédit Trésorerie',
    amount: 8000000,
    status: 'validée',
    created_at: '2025-06-28T14:30:00Z',
  },
  {
    id: 'req-3',
    company: 'BTP Services',
    product: 'Crédit Equipement',
    amount: 25000000,
    status: 'décaissée',
    created_at: '2025-06-20T09:15:00Z',
  },
];
