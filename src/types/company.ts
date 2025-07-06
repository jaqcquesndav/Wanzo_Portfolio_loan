export type CompanySize = 'micro' | 'small' | 'medium' | 'large';
export type CompanyStatus = 'active' | 'pending' | 'rejected' | 'funded';

export interface Company {
  id: string;
  name: string;
  sector: string;
  size: CompanySize;
  annual_revenue: number;
  employee_count: number;
  website_url?: string;
  pitch_deck_url?: string;
  status: CompanyStatus;
  financial_metrics: {
    revenue_growth: number;
    profit_margin: number;
    cash_flow: number;
    debt_ratio: number;
    working_capital: number;
    credit_score: number; // Score de crédit sur 100
    financial_rating: 'A' | 'B' | 'C' | 'D'; // Note financière
    ebitda?: number;
  };
  esg_metrics: {
    esg_rating?: string;
    carbon_footprint: number; // en tonnes de CO2
    environmental_rating: 'A' | 'B' | 'C' | 'D';
    social_rating: 'A' | 'B' | 'C' | 'D';
    governance_rating: 'A' | 'B' | 'C' | 'D';
  };
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  company_id: string;
  portfolio_manager_id: string;
  meeting_date: string;
  meeting_type: 'physical' | 'virtual';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface SecurityOpportunity {
  type: 'bond' | 'share';
  details: {
    totalAmount: number;
    unitPrice: number;
    quantity: number;
    maturityDate?: string; // Pour les obligations
    interestRate?: number; // Pour les obligations
    dividendYield?: number; // Pour les actions
    minimumInvestment: number;
    status: 'upcoming' | 'active' | 'closed';
  };
  documents: CompanyDocument[];
}

export interface CompanyDocument {
  id: string;
  type: 'financial_report' | 'audit_report' | 'annual_report' | 'prospectus';
  title: string;
  date: string;
  url: string;
  size: string;
}