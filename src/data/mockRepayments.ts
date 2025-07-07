import { Repayment } from '../components/portfolio/traditional/RepaymentsTable';

export const mockRepayments: Repayment[] = [
  {
    id: 'REPAY-TRAD-20250801-0001',
    company: 'PME Agro Sarl',
    product: 'Crédit PME 12 mois',
    dueDate: '2025-08-01T00:00:00Z',
    amount: 1250000,
    status: 'à venir',
    requestId: 'REQ-TRAD-20250701-0001',
    portfolioId: 'qf3081zdd',
  },
  {
    id: 'REPAY-TRAD-20250715-0002',
    company: 'TransLogistics',
    product: 'Crédit Trésorerie',
    dueDate: '2025-07-15T00:00:00Z',
    amount: 800000,
    status: 'payé',
    requestId: 'REQ-TRAD-20250628-0002',
    portfolioId: 'qf3081zdd',
  },
  {
    id: 'REPAY-TRAD-20250710-0003',
    company: 'BTP Services',
    product: 'Crédit Equipement',
    dueDate: '2025-07-10T00:00:00Z',
    amount: 2100000,
    status: 'retard',
    requestId: 'REQ-TRAD-20250620-0003',
    portfolioId: 'qf3081zdd',
  },
];
