import { Repayment } from '../components/portfolio/traditional/RepaymentsTable';

export const mockRepayments: Repayment[] = [
  {
    id: 'rep-1',
    company: 'PME Agro Sarl',
    product: 'Crédit PME 12 mois',
    dueDate: '2025-08-01T00:00:00Z',
    amount: 1250000,
    status: 'à venir',
  },
  {
    id: 'rep-2',
    company: 'TransLogistics',
    product: 'Crédit Trésorerie',
    dueDate: '2025-07-15T00:00:00Z',
    amount: 800000,
    status: 'payé',
  },
  {
    id: 'rep-3',
    company: 'BTP Services',
    product: 'Crédit Equipement',
    dueDate: '2025-07-10T00:00:00Z',
    amount: 2100000,
    status: 'retard',
  },
];
