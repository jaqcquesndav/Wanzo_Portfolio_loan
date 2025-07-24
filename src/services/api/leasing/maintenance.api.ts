// src/services/api/leasing/maintenance.api.ts
import { apiClient } from '../base.api';

/**
 * API pour la maintenance des équipements de leasing
 */
export const leasingMaintenanceApi = {
  /**
   * Récupère toutes les maintenances pour un équipement ou un portefeuille
   */
  getAllMaintenance: async (filters: {
    portfolioId?: string;
    equipmentId?: string;
    status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    type?: 'routine' | 'repair' | 'emergency';
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters.portfolioId) params.append('portfolioId', filters.portfolioId);
    if (filters.equipmentId) params.append('equipmentId', filters.equipmentId);
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    return apiClient.get(`/portfolios/leasing/maintenance?${params.toString()}`);
  },

  /**
   * Récupère une maintenance par son ID
   */
  getMaintenanceById: async (id: string) => {
    return apiClient.get(`/portfolios/leasing/maintenance/${id}`);
  },

  /**
   * Planifie une nouvelle maintenance
   */
  scheduleMaintenance: async (maintenance: {
    equipmentId: string;
    type: 'routine' | 'repair' | 'emergency';
    scheduledDate: string;
    estimatedDuration: number; // en heures
    description: string;
    technicianId?: string;
    technicianName?: string;
    cost?: number;
  }) => {
    return apiClient.post('/portfolios/leasing/maintenance', maintenance);
  },

  /**
   * Met à jour une maintenance
   */
  updateMaintenance: async (id: string, updates: {
    status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    actualDuration?: number;
    actualCost?: number;
    notes?: string;
    scheduledDate?: string;
    technicianId?: string;
    technicianName?: string;
  }) => {
    return apiClient.put(`/portfolios/leasing/maintenance/${id}`, updates);
  },

  /**
   * Démarre une maintenance
   */
  startMaintenance: async (id: string) => {
    return apiClient.post(`/portfolios/leasing/maintenance/${id}/start`, {});
  },

  /**
   * Termine une maintenance
   */
  completeMaintenance: async (id: string, details: {
    actualDuration: number;
    actualCost: number;
    notes: string;
    repairDetails?: string;
    partsReplaced?: string[];
  }) => {
    return apiClient.post(`/portfolios/leasing/maintenance/${id}/complete`, details);
  },

  /**
   * Annule une maintenance
   */
  cancelMaintenance: async (id: string, reason: string) => {
    return apiClient.post(`/portfolios/leasing/maintenance/${id}/cancel`, { reason });
  },

  /**
   * Récupère le calendrier de maintenance
   */
  getMaintenanceSchedule: async (equipmentId?: string, month?: string) => {
    const params = new URLSearchParams();
    if (equipmentId) params.append('equipmentId', equipmentId);
    if (month) params.append('month', month);

    return apiClient.get(`/portfolios/leasing/maintenance/schedule?${params.toString()}`);
  }
};
