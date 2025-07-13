import type { PortfolioWithType } from './portfolio';

export interface InvestmentAsset {
  id: string;
  name: string;
  companyId: string;
  type: 'share' | 'bond' | 'other';
  acquiredDate: string;
  initialValue: number;
  currentValue?: number;
  status: 'active' | 'exited' | 'written-off';
  created_at: string;
  updated_at: string;
}

// If you have a specific type for assets, import and use it here, otherwise use unknown[]
export interface InvestmentPortfolio extends PortfolioWithType {
  type: 'investment';
  assets?: InvestmentAsset[];
}
// Types métier pour le portefeuille Capital Investissement

export type InvestmentStage = 'amorcage' | 'developpement' | 'transmission' | 'reprise';
export type InvestmentRequestStatus = 'en instruction' | 'acceptée' | 'refusée' | 'abandonnée';

export interface InvestmentRequest {
  id: string; // INVEST-REQ-YYYYMMDD-XXXX
  portfolioId: string;
  companyId: string;
  stage: InvestmentStage;
  amountRequested: number;
  status: InvestmentRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface DueDiligenceReport {
  id: string;
  portfolioId: string;
  investmentRequestId: string;
  reportUrl: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestmentDecision {
  id: string;
  portfolioId: string;
  investmentRequestId: string;
  decision: 'go' | 'no go' | 'ajourné';
  committeeDate: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentTransaction {
  id: string; // INVEST-TRX-YYYYMMDD-XXXX
  portfolioId: string;
  companyId: string;
  investmentRequestId: string;
  amount: number;
  date: string;
  type: 'prise de participation' | 'complément' | 'dividende' | 'cession';
  status: 'effectué' | 'prévu' | 'annulé';
  created_at: string;
  updated_at: string;
}

export interface PortfolioCompanyReport {
  id: string;
  portfolioId: string;
  companyId: string;
  period: string; // ex: '2025-Q2'
  kpis: Record<string, number | string>;
  reportUrl?: string;
  created_at: string;
  updated_at: string;
}

export interface ExitEvent {
  id: string;
  portfolioId: string;
  companyId: string;
  type: 'cession' | 'IPO' | 'rachat' | 'transmission';
  date: string;
  amount: number;
  performance: {
    tri: number;
    multiple: number;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}
