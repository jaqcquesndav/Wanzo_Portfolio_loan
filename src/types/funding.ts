export type FundingType = 'equity' | 'credit' | 'leasing' | 'grant';

export interface FundingOffer {
  id: string;
  type: FundingType;
  title: string;
  provider: string;
  description: string;
  amount: {
    min: number;
    max: number;
  };
  duration: {
    min: number;
    max: number;
  };
  interestRate?: number;
  requirements: string[];
}

export interface FundingApplication {
  id: string;
  offerId: string;
  amount: number;
  duration: number;
  projectDescription: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  documents: {
    businessPlan?: File;
    financialStatements?: File;
  };
}