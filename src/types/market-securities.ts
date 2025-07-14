// src/types/market-securities.ts

export type InvestmentEntryType = 
  | 'ipo' 
  | 'private_equity'
  | 'venture_capital'
  | 'seed'
  | 'series_a'
  | 'series_b'
  | 'series_c'
  | 'growth'
  | 'mezzanine'
  | 'lbo'
  | 'other';

export type SecuritiesType = 'actions' | 'obligations' | 'parts_sociales' | 'autre';

export interface MarketSecurity {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  type: SecuritiesType;
  investmentEntryType?: InvestmentEntryType; // Pour les entreprises non-cotées
  unitPrice: number;
  availableUnits: number;
  totalValue: number;
  currency: string;
  sector: string;
  country: string;
  reference?: string; // Référence unique pour le titre
  issuer?: string; // Émetteur du titre
  listed: boolean;
  marketCap?: number; // Pour les entreprises cotées
  enterpriseValue?: number; // Valeur de l'entreprise
  creationDate?: string; // Date de création de l'entreprise
  description?: string;
  lastValuationDate?: string;
  risk: 'faible' | 'modéré' | 'élevé';
  expectedReturn?: number; // Rendement attendu en %
  valuation?: {
    ebitdaMultiple?: number;
    peRatio?: number; // Pour les actions cotées
    priceToBookRatio?: number;
  };
  financialMetrics?: {
    revenue?: number; // Chiffre d'affaires
    ebitda?: number; 
    netIncome?: number; // Résultat net
    debt?: number; // Dette
    cash?: number; // Trésorerie
    growth?: number; // Croissance annuelle en %
  };
  created_at: string;
  updated_at: string;
}

export interface SecurityPurchase {
  id: string;
  securityId: string;
  portfolioId: string;
  purchaseDate: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  fees?: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}
