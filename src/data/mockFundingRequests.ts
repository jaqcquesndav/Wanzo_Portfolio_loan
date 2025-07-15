import { FundingRequest } from '../components/portfolio/traditional/FundingRequestsTable';

export const mockFundingRequests: FundingRequest[] = [
  {
    id: 'REQ-TRAD-20250701-0001', // Financial data engineering style
    company: 'Agro Kivu SARL',
    product: 'Crédit PME 12 mois',
    amount: 15000000,
    status: 'en attente',
    created_at: '2025-07-01T10:00:00Z',
    portfolioId: 'qf3081zdd',
  },
  {
    id: 'REQ-TRAD-20250628-0002',
    company: 'TransLogistics Lubumbashi',
    product: 'Crédit Trésorerie',
    amount: 8000000,
    status: 'validée',
    created_at: '2025-06-28T14:30:00Z',
    portfolioId: 'qf3081zdd',
  },
  {
    id: 'REQ-TRAD-20250620-0003',
    company: 'BTP Goma Services',
    product: 'Crédit Equipement',
    amount: 25000000,
    status: 'décaissée',
    created_at: '2025-06-20T09:15:00Z',
    portfolioId: 'qf3081zdd',
  },
];
