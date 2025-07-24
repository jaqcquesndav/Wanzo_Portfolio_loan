import type { PortfolioWithType } from './portfolioWithType';
import type { LeasingRequest } from './leasing-request';
import type { MaintenanceOption, InsuranceOption } from './leasing-settings';
import type { Incident, Maintenance } from './leasing-asset';
import type { LeasingPayment } from './leasing-payment';

export interface LeasingPortfolio extends PortfolioWithType {
  equipment_catalog: Equipment[];
  leasing_requests: LeasingRequest[];
  contracts: LeasingContract[];
  incidents: Incident[];
  maintenances: Maintenance[];
  payments: LeasingPayment[];
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
  maintenance_options?: MaintenanceOption[];
  insurance_options?: InsuranceOption[];
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
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type MaintenanceStatus = 'ok' | 'requires_attention' | 'under_maintenance';

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
  last_payment_date?: string; // Ajout de cette propriété
  amortization_schedule?: {
    date: string;
    amount: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
  // Propriétés pour les paiements
  payments?: {
    id: string;
    amount: number;
    date: string;
    status: PaymentStatus;
  }[];
  // Propriétés pour la maintenance
  maintenance_status?: MaintenanceStatus;
  maintenance_notes?: string;
  maintenance_last_updated?: string;
}
