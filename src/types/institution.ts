export type InstitutionType = 'bank' | 'microfinance' | 'cooperative';
export type InstitutionStatus = 'pending' | 'active' | 'suspended' | 'revoked';

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  status: InstitutionStatus;
  license_number: string;
  license_type: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  legal_representative: string;
  tax_id: string;
  regulatory_status: string;
  documents?: {
    name: string;
    type: string;
    url: string;
  }[];
  created_at: string;
  updated_at: string;
}


export interface InstitutionManager {
  id: string;
  institution_id: string;
  user_id: string;
  role: 'admin' | 'manager';
  created_at: string;
}