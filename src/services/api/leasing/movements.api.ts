// src/services/api/leasing/movements.api.ts
import { apiClient } from '../base.api';
import type { Reservation, Incident, Maintenance } from '../../../types/leasing-asset';

/**
 * API pour les mouvements de leasing (réservations, incidents, maintenance)
 */
export const leasingMovementsApi = {
  /**
   * Récupère toutes les réservations de leasing
   */
  getAllReservations: (filters?: {
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    portfolioId?: string;
    companyId?: string;
    equipmentId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.portfolioId) params.append('portfolioId', filters.portfolioId);
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.equipmentId) params.append('equipmentId', filters.equipmentId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return apiClient.get<Reservation[]>(`/leasing/reservations?${params.toString()}`);
  },

  /**
   * Récupère une réservation de leasing par son ID
   */
  getReservationById: (id: string) => {
    return apiClient.get<Reservation>(`/leasing/reservations/${id}`);
  },

  /**
   * Crée une nouvelle réservation de leasing
   */
  createReservation: (reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<Reservation>('/leasing/reservations', reservation);
  },

  /**
   * Met à jour une réservation de leasing
   */
  updateReservation: (id: string, updates: Partial<Reservation>) => {
    return apiClient.put<Reservation>(`/leasing/reservations/${id}`, updates);
  },

  /**
   * Change le statut d'une réservation de leasing
   */
  updateReservationStatus: (id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    return apiClient.put<Reservation>(`/leasing/reservations/${id}/status`, { status });
  },

  /**
   * Récupère tous les incidents de leasing
   */
  getAllIncidents: (filters?: {
    status?: 'open' | 'in-progress' | 'resolved' | 'closed';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    portfolioId?: string;
    contractId?: string;
    equipmentId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.portfolioId) params.append('portfolioId', filters.portfolioId);
    if (filters?.contractId) params.append('contractId', filters.contractId);
    if (filters?.equipmentId) params.append('equipmentId', filters.equipmentId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return apiClient.get<Incident[]>(`/leasing/incidents?${params.toString()}`);
  },

  /**
   * Récupère un incident de leasing par son ID
   */
  getIncidentById: (id: string) => {
    return apiClient.get<Incident>(`/leasing/incidents/${id}`);
  },

  /**
   * Crée un nouvel incident de leasing
   */
  createIncident: (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<Incident>('/leasing/incidents', incident);
  },

  /**
   * Met à jour un incident de leasing
   */
  updateIncident: (id: string, updates: Partial<Incident>) => {
    return apiClient.put<Incident>(`/leasing/incidents/${id}`, updates);
  },

  /**
   * Change le statut d'un incident de leasing
   */
  updateIncidentStatus: (id: string, status: 'open' | 'in-progress' | 'resolved' | 'closed') => {
    return apiClient.put<Incident>(`/leasing/incidents/${id}/status`, { status });
  },

  /**
   * Récupère toutes les maintenances de leasing
   */
  getAllMaintenances: (filters?: {
    status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    type?: 'preventive' | 'corrective' | 'predictive';
    portfolioId?: string;
    contractId?: string;
    equipmentId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.portfolioId) params.append('portfolioId', filters.portfolioId);
    if (filters?.contractId) params.append('contractId', filters.contractId);
    if (filters?.equipmentId) params.append('equipmentId', filters.equipmentId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return apiClient.get<Maintenance[]>(`/leasing/maintenances?${params.toString()}`);
  },

  /**
   * Récupère une maintenance de leasing par son ID
   */
  getMaintenanceById: (id: string) => {
    return apiClient.get<Maintenance>(`/leasing/maintenances/${id}`);
  },

  /**
   * Crée une nouvelle maintenance de leasing
   */
  createMaintenance: (maintenance: Omit<Maintenance, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<Maintenance>('/leasing/maintenances', maintenance);
  },

  /**
   * Met à jour une maintenance de leasing
   */
  updateMaintenance: (id: string, updates: Partial<Maintenance>) => {
    return apiClient.put<Maintenance>(`/leasing/maintenances/${id}`, updates);
  },

  /**
   * Change le statut d'une maintenance de leasing
   */
  updateMaintenanceStatus: (id: string, status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled') => {
    return apiClient.put<Maintenance>(`/leasing/maintenances/${id}/status`, { status });
  },
};
