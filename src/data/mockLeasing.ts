import { Reservation, Maintenance, Incident, EquipmentMovement } from '../types/leasing-asset';

export const mockLeasingReservations: Reservation[] = [
  {
    id: 'res1',
    equipment_id: 'eq1',
    user_id: 'user1',
    start_date: '2025-07-10T09:00:00Z',
    end_date: '2025-07-12T18:00:00Z',
    status: 'confirmed',
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2025-07-01T10:00:00Z',
    notes: 'Réservation pour chantier A'
  },
  {
    id: 'res2',
    equipment_id: 'eq2',
    user_id: 'user2',
    start_date: '2025-07-15T08:00:00Z',
    end_date: '2025-07-20T17:00:00Z',
    status: 'pending',
    created_at: '2025-07-02T11:00:00Z',
    updated_at: '2025-07-02T11:00:00Z',
    notes: 'Réservation prévisionnelle'
  }
];

export const mockLeasingMaintenances: Maintenance[] = [
  {
    id: 'mnt1',
    equipment_id: 'eq1',
    type: 'preventive',
    description: 'Révision annuelle',
    scheduled_date: '2025-07-13T09:00:00Z',
    completed_date: undefined,
    status: 'scheduled',
    cost: 200,
    provider: 'TechMaint',
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2025-07-01T10:00:00Z'
  },
  {
    id: 'mnt2',
    equipment_id: 'eq2',
    type: 'curative',
    description: 'Réparation fuite hydraulique',
    scheduled_date: '2025-07-05T14:00:00Z',
    completed_date: '2025-07-06T16:00:00Z',
    status: 'completed',
    cost: 350,
    provider: 'HydroFix',
    created_at: '2025-07-02T11:00:00Z',
    updated_at: '2025-07-06T16:00:00Z'
  }
];

export const mockLeasingIncidents: Incident[] = [
  {
    id: 'inc1',
    equipment_id: 'eq1',
    reported_by: 'user1',
    date_reported: '2025-07-11T15:00:00Z',
    description: 'Panne moteur',
    status: 'open',
    resolution_notes: undefined,
    created_at: '2025-07-11T15:00:00Z',
    updated_at: '2025-07-11T15:00:00Z'
  },
  {
    id: 'inc2',
    equipment_id: 'eq2',
    reported_by: 'user2',
    date_reported: '2025-07-16T10:00:00Z',
    description: 'Casse rétroviseur',
    status: 'resolved',
    resolution_notes: 'Remplacement effectué',
    created_at: '2025-07-16T10:00:00Z',
    updated_at: '2025-07-17T09:00:00Z'
  }
];

export const mockLeasingMovements: EquipmentMovement[] = [
  {
    id: 'mov1',
    equipment_id: 'eq1',
    type: 'out',
    date: '2025-07-10T09:00:00Z',
    from_location: 'Dépôt central',
    to_location: 'Chantier A',
    user_id: 'user1',
    notes: 'Sortie pour location',
    created_at: '2025-07-10T09:00:00Z',
    updated_at: '2025-07-10T09:00:00Z'
  },
  {
    id: 'mov2',
    equipment_id: 'eq2',
    type: 'return',
    date: '2025-07-20T18:00:00Z',
    from_location: 'Chantier B',
    to_location: 'Dépôt central',
    user_id: 'user2',
    notes: 'Retour après location',
    created_at: '2025-07-20T18:00:00Z',
    updated_at: '2025-07-20T18:00:00Z'
  }
];
