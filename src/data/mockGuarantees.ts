import { Guarantee } from '../components/portfolio/traditional/GuaranteesTable';

export const mockGuarantees: Guarantee[] = [
  {
    id: 'g-1',
    company: 'PME Agro Sarl',
    type: 'Hypothèque',
    value: 20000000,
    status: 'active',
    created_at: '2025-07-01T10:00:00Z',
  },
  {
    id: 'g-2',
    company: 'TransLogistics',
    type: 'Caution bancaire',
    value: 5000000,
    status: 'libérée',
    created_at: '2025-06-28T14:30:00Z',
  },
  {
    id: 'g-3',
    company: 'BTP Services',
    type: 'Dépôt espèces',
    value: 2500000,
    status: 'saisie',
    created_at: '2025-06-20T09:15:00Z',
  },
];
