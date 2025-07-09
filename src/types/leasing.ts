import type { Portfolio } from './portfolio';

export interface LeasingPortfolio extends Portfolio {
  equipment_catalog: Equipment[];
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

export interface LeasingContract {
  id: string;
  equipment_id: string;
  client_id: string;
  start_date: string;
  end_date: string;
  monthly_payment: number;
  interest_rate: number;
  maintenance_included: boolean;
  insurance_included: boolean;
  status: 'active' | 'pending' | 'completed';
}
