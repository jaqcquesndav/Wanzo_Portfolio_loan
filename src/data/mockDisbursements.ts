import { Disbursement } from '../components/portfolio/traditional/DisbursementsTable';

export const mockDisbursements: Disbursement[] = [
  {
    id: 'DISB-TRAD-20250702-0001',
    company: 'PME Agro Sarl',
    product: 'Crédit PME 12 mois',
    amount: 15000000,
    status: 'en attente',
    date: '2025-07-02T11:00:00Z',
    requestId: 'REQ-TRAD-20250701-0001',
    portfolioId: 'qf3081zdd',
  },
  {
    id: 'DISB-TRAD-20250629-0002',
    company: 'TransLogistics',
    product: 'Crédit Trésorerie',
    amount: 8000000,
    status: 'effectué',
    date: '2025-06-29T09:00:00Z',
    requestId: 'REQ-TRAD-20250628-0002',
    portfolioId: 'qf3081zdd',
  },
];
