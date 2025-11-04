// Types simplifiés pour les données mock - Focus sur Traditional uniquement// Type définitions pour les données mock

// Note: Types Investment et Leasing supprimés suite à la simplification architecturaleexport interface Disbursement {

  id: string;

export interface CreditManager {  amount: number;

  id: string;  date: string;

  name: string;  status: string;

  role: string;  portfolioId: string;

  phone: string;  portfolioName?: string;

  email: string;  clientName: string;

  portfolioIds: string[];  contractId?: string;

  isActive: boolean;  requestId?: string;

}  description?: string;

}

export interface CreditProduct {

  id: string;export interface Repayment {

  name: string;  id: string;

  type: 'loan' | 'line_of_credit' | 'term_loan';  amount: number;

  minAmount: number;  date: string;

  maxAmount: number;  status: string;

  interestRate: number;  portfolioId: string;

  term: number;  portfolioName?: string;

  description: string;  clientName: string;

  requirements: string[];  contractId?: string;

  portfolioId: string;  description?: string;

}}



export interface FundingRequest {export interface FundingRequest {

  id: string;  id: string;

  amount: number;  amount: number;

  date?: string;  date?: string;

  createdAt: string;  createdAt: string;

  status: string;  status: string;

  portfolioId: string;  portfolioId: string;

  portfolioName?: string;  portfolioName?: string;

  clientName: string;  clientName: string;

  currency: string;  currency: string;

}}



export interface CreditContract {export interface CreditContract {

  id: string;  id: string;

  amount: number;  amount: number;

  startDate: string;  startDate: string;

  status: string;  status: string;

  portfolioId: string;  portfolioId: string;

  portfolioName?: string;  portfolioName?: string;

  clientName: string;  clientName: string;

  term: number;  term: number;

  interestRate: number;  interestRate: number;

}}



export interface Guarantee {export interface Guarantee {

  id: string;  id: string;

  value: number;  value: number;

  registrationDate: string;  registrationDate: string;

  status: string;  status: string;

  portfolioId: string;  portfolioId: string;

  portfolioName?: string;  portfolioName?: string;

  clientName: string;  clientName: string;

  contractId: string;  contractId: string;

  type: string;  type: string;

}}



// Types pour la centrale des risquesexport interface LeasingTransaction {

export interface CentralBankData {  id: string;

  companyId: string;  type: string;

  companyName: string;  amount: number;

  riskRating: string;  date: string;

  totalExposure: number;  status: string;

  incidentCount: number;  portfolioId: string;

  lastUpdate: string;  equipmentId: string;

}}



// Types pour les membres (utilisateurs internes)export interface LeasingContract {

export interface Member {  id: string;

  id: string;  monthlyPayment: number;

  firstName: string;  startDate: string;

  lastName: string;  status: string;

  email: string;  portfolioId: string;

  role: 'admin' | 'manager' | 'analyst' | 'viewer';  portfolioName?: string;

  portfolioAccess: string[];  clientName: string;

  isActive: boolean;  equipmentId: string;

  lastLogin?: string;  equipmentName?: string;

  createdAt: string;  term: number;

}}

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
