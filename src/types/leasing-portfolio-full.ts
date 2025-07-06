import type { Equipment, LeasingContract } from './leasing';
import type { Reservation, Maintenance, Incident, EquipmentMovement } from './leasing-asset';

export interface EquipmentFull extends Equipment {
  reservations: Reservation[];
  maintenances: Maintenance[];
  incidents: Incident[];
  movements: EquipmentMovement[];
  leasing_contracts: LeasingContract[];
}

export interface LeasingPortfolioMetrics {
  totalLeased: number;
  utilizationRate: number;
  defaultRate: number;
  totalRevenue: number;
  totalIncidents: number;
  totalMaintenance: number;
  [key: string]: number;
}

export interface LeasingPortfolioFull {
  id: string;
  name: string;
  type: 'leasing';
  status: 'active' | 'inactive';
  target_amount: number;
  target_return: number;
  target_sectors: string[];
  risk_profile: 'conservative' | 'moderate' | 'aggressive';
  equipment_catalog: EquipmentFull[];
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
  metrics: LeasingPortfolioMetrics;
  created_at: string;
  updated_at: string;
}
