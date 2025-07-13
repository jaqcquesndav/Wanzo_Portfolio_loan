import type { Equipment } from './leasing';

export type LeasingRequestStatus = 'pending' | 'approved' | 'rejected';

export interface LeasingRequest {
  id: string; // Format WL-XXXXXXXX
  equipment_id: string;
  client_id: string;
  client_name: string;
  request_date: string;
  requested_duration: number; // en mois
  contract_type: 'standard' | 'premium' | 'flex';
  monthly_budget: number;
  maintenance_included: boolean;
  insurance_included: boolean;
  status: LeasingRequestStatus;
  status_date: string;
  notes?: string;
  technical_sheet_url?: string;
  transaction_id?: string; // Numéro de transaction financière
}

export interface LeasingRequestWithEquipment extends LeasingRequest {
  equipment: Equipment;
}
