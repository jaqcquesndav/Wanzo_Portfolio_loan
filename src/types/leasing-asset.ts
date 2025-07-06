export interface Reservation {
  id: string;
  equipment_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'conflict';
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface Maintenance {
  id: string;
  equipment_id: string;
  type: 'preventive' | 'curative';
  description: string;
  scheduled_date: string;
  completed_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  cost?: number;
  provider?: string;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  equipment_id: string;
  reported_by: string;
  date_reported: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentMovement {
  id: string;
  equipment_id: string;
  type: 'out' | 'return' | 'transfer' | 'disposal' | 'sale';
  date: string;
  from_location?: string;
  to_location?: string;
  user_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
