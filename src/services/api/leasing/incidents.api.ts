// src/services/api/leasing/incidents.api.ts
import { apiClient } from '../base.api';

/**
 * API pour les incidents de leasing
 */
export const leasingIncidentsApi = {
  /**
   * Récupère tous les incidents pour un contrat ou un portefeuille
   */
  getAllIncidents: async (filters: {
    portfolioId?: string;
    contractId?: string;
    equipmentId?: string;
    status?: 'open' | 'closed' | 'in_progress';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters.portfolioId) params.append('portfolioId', filters.portfolioId);
    if (filters.contractId) params.append('contractId', filters.contractId);
    if (filters.equipmentId) params.append('equipmentId', filters.equipmentId);
    if (filters.status) params.append('status', filters.status);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    return apiClient.get(`/portfolios/leasing/incidents?${params.toString()}`);
  },

  /**
   * Récupère un incident par son ID
   */
  getIncidentById: async (id: string) => {
    return apiClient.get(`/portfolios/leasing/incidents/${id}`);
  },

  /**
   * Crée un nouvel incident
   */
  createIncident: async (incident: {
    contractId: string;
    equipmentId: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    reportedBy: string;
  }) => {
    return apiClient.post('/portfolios/leasing/incidents', incident);
  },

  /**
   * Met à jour un incident
   */
  updateIncident: async (id: string, updates: {
    status?: 'open' | 'closed' | 'in_progress';
    resolution?: string;
    assignedTo?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }) => {
    return apiClient.put(`/portfolios/leasing/incidents/${id}`, updates);
  },

  /**
   * Résoud un incident
   */
  resolveIncident: async (id: string, resolution: string) => {
    return apiClient.put(`/portfolios/leasing/incidents/${id}/resolve`, { resolution });
  },

  /**
   * Ajoute un commentaire à un incident
   */
  addComment: async (id: string, comment: {
    text: string;
    authorId: string;
    authorName: string;
  }) => {
    return apiClient.post(`/portfolios/leasing/incidents/${id}/comments`, comment);
  },

  /**
   * Récupère les commentaires d'un incident
   */
  getComments: async (id: string) => {
    return apiClient.get(`/portfolios/leasing/incidents/${id}/comments`);
  }
};
