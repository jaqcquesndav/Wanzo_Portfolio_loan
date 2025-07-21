// src/data/mockCreditManagers.ts
export interface CreditManager {
  id: string;
  name: string;
}

export const mockCreditManagers: CreditManager[] = [
  { id: 'mgr-001', name: 'Jean Dupont' },
  { id: 'mgr-002', name: 'Marie Laurent' },
  { id: 'mgr-003', name: 'Ahmed Moussaoui' },
];

export default mockCreditManagers;
