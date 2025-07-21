// src/data/mockCreditProducts.ts
export interface CreditProduct {
  id: string;
  name: string;
  description: string;
  interestRate: number;
  maxAmount: number;
  minAmount: number;
  defaultTerm: number;
}

export const mockCreditProducts: CreditProduct[] = [
  { 
    id: 'prod-001', 
    name: 'Crédit PME', 
    description: 'Financement pour petites et moyennes entreprises',
    interestRate: 8.5,
    maxAmount: 100000,
    minAmount: 10000,
    defaultTerm: 12
  },
  { 
    id: 'prod-002', 
    name: 'Crédit Équipement', 
    description: 'Financement pour l\'achat d\'équipements',
    interestRate: 7.25,
    maxAmount: 200000,
    minAmount: 20000,
    defaultTerm: 24
  },
  { 
    id: 'prod-003', 
    name: 'Crédit Innovation', 
    description: 'Financement pour projets innovants',
    interestRate: 6.75,
    maxAmount: 300000,
    minAmount: 50000,
    defaultTerm: 36
  },
  { 
    id: 'prod-004', 
    name: 'Crédit Agricole', 
    description: 'Financement pour projets agricoles',
    interestRate: 7,
    maxAmount: 150000,
    minAmount: 5000,
    defaultTerm: 18
  },
  { 
    id: 'prod-005', 
    name: 'Crédit Transport', 
    description: 'Financement pour le secteur des transports',
    interestRate: 7.5,
    maxAmount: 200000,
    minAmount: 15000,
    defaultTerm: 24
  },
  { 
    id: 'prod-006', 
    name: 'Crédit Éducation', 
    description: 'Financement pour les projets éducatifs',
    interestRate: 6.5,
    maxAmount: 80000,
    minAmount: 5000,
    defaultTerm: 12
  },
];

export default mockCreditProducts;
