// src/services/api/leasing/equipment.api.ts
import { apiClient } from '../base.api';
import type { Equipment } from '../../../types/leasing';
import { leasingDataService } from './dataService';

// Type étendu avec les propriétés utilisées dans l'API mais non définies dans le type Equipment
interface ExtendedEquipment extends Equipment {
  status?: 'available' | 'leased' | 'maintenance' | 'retired';
}

/**
 * API pour les équipements de leasing
 */
export const leasingEquipmentApi = {
  /**
   * Récupère tous les équipements
   */
  getAllEquipment: async (filters?: {
    category?: string;
    status?: 'available' | 'leased' | 'maintenance' | 'retired';
    minValue?: number;
    maxValue?: number;
  }) => {
    try {
      // Version API
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.minValue) params.append('minValue', filters.minValue.toString());
      if (filters?.maxValue) params.append('maxValue', filters.maxValue.toString());

      return await apiClient.get<Equipment[]>(`/portfolios/leasing/equipment?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for equipment', error);
      let equipment = leasingDataService.getEquipments();
      
      // Appliquer les filtres
      if (filters?.category) {
        equipment = equipment.filter(e => e.category === filters.category);
      }
      if (filters?.status) {
        // Utiliser le cast pour accéder à la propriété status
        equipment = equipment.filter(e => (e as ExtendedEquipment).status === filters.status);
      }
      if (filters?.minValue && typeof filters.minValue === 'number') {
        // Utiliser price comme équivalent de value
        equipment = equipment.filter(e => e.price >= filters.minValue!);
      }
      if (filters?.maxValue && typeof filters.maxValue === 'number') {
        // Utiliser price comme équivalent de value
        equipment = equipment.filter(e => e.price <= filters.maxValue!);
      }
      
      return equipment;
    }
  },

  /**
   * Récupère un équipement par son ID
   */
  getEquipmentById: async (id: string) => {
    try {
      return await apiClient.get<Equipment>(`/portfolios/leasing/equipment/${id}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for equipment ${id}`, error);
      const equipment = leasingDataService.getEquipmentById(id);
      if (!equipment) {
        throw new Error(`Equipment with ID ${id} not found`);
      }
      return equipment;
    }
  },

  /**
   * Récupère les équipements disponibles pour un portefeuille
   */
  getAvailableEquipment: async (portfolioId: string) => {
    try {
      return await apiClient.get<Equipment[]>(`/portfolios/leasing/${portfolioId}/available-equipment`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for available equipment in portfolio ${portfolioId}`, error);
      // Filtrer les équipements disponibles en utilisant la propriété availability
      const equipment = leasingDataService.getEquipments().filter(e => e.availability === true);
      return equipment;
    }
  },

  /**
   * Récupère l'historique de maintenance d'un équipement
   */
  getMaintenanceHistory: async (equipmentId: string) => {
    try {
      return await apiClient.get(`/portfolios/leasing/equipment/${equipmentId}/maintenance-history`);
    } catch (error) {
      // Pas de fallback pour l'historique de maintenance
      console.error(`Error getting maintenance history for equipment ${equipmentId}`, error);
      throw error;
    }
  },

  /**
   * Récupère l'historique des contrats d'un équipement
   */
  getContractHistory: async (equipmentId: string) => {
    try {
      return await apiClient.get(`/portfolios/leasing/equipment/${equipmentId}/contract-history`);
    } catch (error) {
      // Pas de fallback pour l'historique des contrats
      console.error(`Error getting contract history for equipment ${equipmentId}`, error);
      throw error;
    }
  },

  /**
   * Récupère les incidents liés à un équipement
   */
  getIncidents: async (equipmentId: string) => {
    try {
      return await apiClient.get(`/portfolios/leasing/equipment/${equipmentId}/incidents`);
    } catch (error) {
      // Pas de fallback pour les incidents
      console.error(`Error getting incidents for equipment ${equipmentId}`, error);
      throw error;
    }
  }
};
