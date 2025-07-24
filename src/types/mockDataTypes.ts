// Type définitions pour les données mock
export interface Disbursement {
  id: string;
  amount: number;
  date: string;
  status: string;
  portfolioId: string;
  portfolioName?: string;
  clientName: string;
  contractId?: string;
  requestId?: string;
  description?: string;
}

export interface Repayment {
  id: string;
  amount: number;
  date: string;
  status: string;
  portfolioId: string;
  portfolioName?: string;
  clientName: string;
  contractId?: string;
  description?: string;
}

export interface FundingRequest {
  id: string;
  amount: number;
  date?: string;
  createdAt: string;
  status: string;
  portfolioId: string;
  portfolioName?: string;
  clientName: string;
  currency: string;
}

export interface CreditContract {
  id: string;
  amount: number;
  startDate: string;
  status: string;
  portfolioId: string;
  portfolioName?: string;
  clientName: string;
  term: number;
  interestRate: number;
}

export interface Guarantee {
  id: string;
  value: number;
  registrationDate: string;
  status: string;
  portfolioId: string;
  portfolioName?: string;
  clientName: string;
  contractId: string;
  type: string;
}

export interface LeasingTransaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: string;
  portfolioId: string;
  equipmentId: string;
}

export interface LeasingContract {
  id: string;
  monthlyPayment: number;
  startDate: string;
  status: string;
  portfolioId: string;
  portfolioName?: string;
  clientName: string;
  equipmentId: string;
  equipmentName?: string;
  term: number;
}

export interface Incident {
  id: string;
  cost?: number;
  date: string;
  status: string;
  portfolioId: string;
  portfolioName?: string;
  clientName: string;
  equipmentId: string;
  equipmentName?: string;
  description: string;
}

export interface LeasingMovement {
  id: string;
  type: string;
  date: string;
  portfolioId?: string;
  clientName?: string;
  equipmentId: string;
  equipmentName?: string;
}

export interface LeasingPayment {
  id: string;
  amount: number;
  date: string;
  status: string;
  portfolioId: string;
  portfolioName?: string;
  clientName: string;
  equipmentId: string;
  equipmentName?: string;
  paymentMethod: string;
}

export interface InvestmentTransaction {
  id: string;
  amount: number;
  date: string;
  status: string;
  portfolioId: string;
  companyId: string;
  type: string;
}

export interface Asset {
  id: string;
  currentValue: number;
  acquisitionDate: string;
  portfolioId: string;
  portfolioName?: string;
  name: string;
  type: string;
}

export interface Subscription {
  id: string;
  type: 'subscription' | 'redemption';
  amount: number;
  date: string;
  status: string;
  portfolioId: string;
  portfolioName?: string;
  assetName: string;
  assetId: string;
  units: number;
}

export interface Valuation {
  id: string;
  value: number;
  date: string;
  portfolioId: string;
  portfolioName?: string;
  assetName: string;
  assetId: string;
  change: number;
}
