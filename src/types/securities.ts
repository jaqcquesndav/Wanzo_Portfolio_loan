export type SecurityType = 'bond' | 'share';

export interface SecurityOffer {
  id: string;
  type: SecurityType;
  companyId: string;
  title: string;
  description: string;
  amount: number;
  unitPrice: number;
  quantity: number;
  maturityDate?: string; // Pour les obligations
  interestRate?: number; // Pour les obligations
  dividendYield?: number; // Pour les actions
  minInvestment: number;
  status: 'draft' | 'pending' | 'active' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface CompanyValuation {
  id: string;
  companyId: string;
  totalValue: number;
  sharePrice: number;
  evaluationDate: string;
  method: 'DCF' | 'Multiple' | 'Asset';
  details: {
    revenueMultiple?: number;
    ebitdaMultiple?: number;
    discountRate?: number;
    terminalGrowthRate?: number;
  };
  created_at: string;
}

export interface SecuritySubscription {
  id: string;
  offerId: string;
  investorId: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}