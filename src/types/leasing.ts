import type { PortfolioWithType } from './portfolio';
import type { LeasingRequest } from './leasing-request';

export interface LeasingPortfolio extends PortfolioWithType {
  equipment_catalog: Equipment[];
  leasing_requests: LeasingRequest[];
  contracts: LeasingContract[];
  incidents: import('./leasing-asset').Incident[];
  maintenances: import('./leasing-asset').Maintenance[];
  payments: import('./leasing-payment').LeasingPayment[];
  leasing_terms: {
    min_duration: number;
    max_duration: number;
    interest_rate_range: {
      min: number;
      max: number;
    };
    maintenance_included: boolean;
    insurance_required: boolean;
  };
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  manufacturer: string;
  model: string;
  year: number;
  price: number;
  condition: 'new' | 'used';
  specifications: Record<string, string | number>;
  availability: boolean;
  maintenanceIncluded?: boolean;
  warrantyDuration?: number;
  deliveryTime?: number;
  imageUrl: string;
}

export type LeasingContractStatus = 'draft' | 'pending' | 'active' | 'completed' | 'terminated';

export interface LeasingContract {
  id: string;
  equipment_id: string;
  client_id: string;
  client_name: string;
  request_id?: string; // ID de la demande associée
  start_date: string;
  end_date: string;
  monthly_payment: number;
  interest_rate: number;
  maintenance_included: boolean;
  insurance_included: boolean;
  status: LeasingContractStatus;
  activationDate?: string;
  terminationDate?: string;
  terminationReason?: string;
  nextInvoiceDate?: string;
  amortization_schedule?: {
    date: string;
    amount: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}
