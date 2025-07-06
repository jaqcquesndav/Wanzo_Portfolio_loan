import { Disbursement } from '../components/portfolio/traditional/DisbursementsTable';

export const mockDisbursements: Disbursement[] = [
  {
    id: 'disb-1',
    company: 'PME Agro Sarl',
    product: 'Crédit PME 12 mois',
    amount: 15000000,
    status: 'en attente',
    date: '2025-07-02T11:00:00Z',
  },
  {
    id: 'disb-2',
    company: 'TransLogistics',
    product: 'Crédit Trésorerie',
    amount: 8000000,
    status: 'effectué',
    date: '2025-06-29T09:00:00Z',
  },
];
