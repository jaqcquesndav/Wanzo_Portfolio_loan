// src/services/api/leasing/contract.api.ts
import { apiClient } from '../base.api';
import type { LeasingContract, Equipment } from '../../../types/leasing';

/**
 * API pour les contrats de leasing
 */
export const leasingContractApi = {
  /**
   * Récupère tous les contrats de leasing
   */
  getAllContracts: (filters?: {
    status?: 'active' | 'terminated' | 'expired' | 'defaulted';
    portfolioId?: string;
    companyId?: string;
    minAmount?: number;
    maxAmount?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.portfolioId) params.append('portfolioId', filters.portfolioId);
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
    if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());

    return apiClient.get<LeasingContract[]>(`/leasing/contracts?${params.toString()}`);
  },

  /**
   * Récupère un contrat de leasing par son ID
   */
  getContractById: (id: string) => {
    return apiClient.get<LeasingContract>(`/leasing/contracts/${id}`);
  },

  /**
   * Crée un nouveau contrat de leasing
   */
  createContract: (contract: Omit<LeasingContract, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<LeasingContract>('/leasing/contracts', contract);
  },

  /**
   * Met à jour un contrat de leasing
   */
  updateContract: (id: string, updates: Partial<LeasingContract>) => {
    return apiClient.put<LeasingContract>(`/leasing/contracts/${id}`, updates);
  },

  /**
   * Change le statut d'un contrat de leasing
   */
  updateContractStatus: (id: string, status: 'active' | 'terminated' | 'expired' | 'defaulted') => {
    return apiClient.put<LeasingContract>(`/leasing/contracts/${id}/status`, { status });
  },

  /**
   * Récupère les équipements pour un contrat de leasing
   */
  getContractEquipments: (contractId: string) => {
    return apiClient.get<Equipment[]>(`/leasing/contracts/${contractId}/equipments`);
  },

  /**
   * Ajoute un équipement à un contrat de leasing
   */
  addContractEquipment: (contractId: string, equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<Equipment>(`/leasing/contracts/${contractId}/equipments`, equipment);
  },

  /**
   * Met à jour un équipement d'un contrat de leasing
   */
  updateContractEquipment: (contractId: string, equipmentId: string, updates: Partial<Equipment>) => {
    return apiClient.put<Equipment>(`/leasing/contracts/${contractId}/equipments/${equipmentId}`, updates);
  },

  /**
   * Supprime un équipement d'un contrat de leasing
   */
  deleteContractEquipment: (contractId: string, equipmentId: string) => {
    return apiClient.delete(`/leasing/contracts/${contractId}/equipments/${equipmentId}`);
  },

  /**
   * Récupère le calendrier des paiements pour un contrat de leasing
   */
  getPaymentSchedule: (contractId: string) => {
    return apiClient.get<Array<{
      id: string;
      contractId: string;
      dueDate: string;
      amount: number;
      principal: number;
      interest: number;
      status: 'pending' | 'paid' | 'overdue' | 'cancelled';
      paidDate?: string;
      paidAmount?: number;
    }>>(`/leasing/contracts/${contractId}/payment-schedule`);
  },

  /**
   * Enregistre un paiement pour un contrat de leasing
   */
  recordPayment: (contractId: string, payment: {
    scheduleId: string;
    paidDate: string;
    paidAmount: number;
    paymentMethod: string;
    reference?: string;
  }) => {
    return apiClient.post<{
      id: string;
      contractId: string;
      scheduleId: string;
      paidDate: string;
      paidAmount: number;
      paymentMethod: string;
      reference?: string;
      created_at: string;
    }>(`/leasing/contracts/${contractId}/payments`, payment);
  },

  /**
   * Récupère les documents associés à un contrat de leasing
   */
  getContractDocuments: (contractId: string) => {
    return apiClient.get<Array<{
      id: string;
      contractId: string;
      name: string;
      type: string;
      fileUrl: string;
      uploadedAt: string;
      uploadedBy: string;
    }>>(`/leasing/contracts/${contractId}/documents`);
  },

  /**
   * Ajoute un document à un contrat de leasing
   */
  addContractDocument: (contractId: string, document: {
    name: string;
    type: string;
    fileUrl: string;
    uploadedBy: string;
  }) => {
    return apiClient.post<{
      id: string;
      contractId: string;
      name: string;
      type: string;
      fileUrl: string;
      uploadedAt: string;
      uploadedBy: string;
    }>(`/leasing/contracts/${contractId}/documents`, document);
  },

  /**
   * Supprime un document d'un contrat de leasing
   */
  deleteContractDocument: (contractId: string, documentId: string) => {
    return apiClient.delete(`/leasing/contracts/${contractId}/documents/${documentId}`);
  },
};
