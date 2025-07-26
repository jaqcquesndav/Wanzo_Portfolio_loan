// src/services/api/traditional/credit.api.ts
import { apiClient } from '../base.api';
import { CreditContract } from '../../../types/credit-contract';
import { traditionalDataService } from './dataService';

// Type pour les données d'échéancier
export interface ScheduleItem {
  id: string;
  contract_id: string;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'partial' | 'late' | 'defaulted';
  actual_payment_date?: string;
  actual_payment_amount?: number;
  created_at: string;
  updated_at?: string;
}

/**
 * API pour les contrats de crédit
 */
export const creditApi = {
  /**
   * Récupère un contrat de crédit par son ID
   */
  getContractById: async (id: string): Promise<CreditContract> => {
    try {
      return await apiClient.get<CreditContract>(`/portfolios/traditional/contracts/${id}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for contract ${id}`, error);
      const contract = traditionalDataService.getCreditContractById(id);
      if (!contract) {
        throw new Error(`Contract with ID ${id} not found`);
      }
      return contract;
    }
  },

  /**
   * Récupère l'échéancier d'un contrat de crédit
   */
  getContractSchedule: async (contractId: string): Promise<ScheduleItem[]> => {
    try {
      return await apiClient.get<ScheduleItem[]>(`/portfolios/traditional/contracts/${contractId}/schedule`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for contract schedule ${contractId}`, error);
      
      // Dans cet exemple, on simule un échéancier avec des données mockées
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) {
        throw new Error(`Contract with ID ${contractId} not found`);
      }
      
      // Créer un échéancier fictif basé sur les informations du contrat
      const now = new Date();
      const startDate = new Date(contract.start_date);
      const endDate = new Date(contract.end_date);
      const months = Math.ceil((endDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
      
      const schedule: ScheduleItem[] = [];
      const monthlyAmount = contract.amount / months;
      const monthlyPrincipal = monthlyAmount * 0.85; // 85% du montant mensuel est du principal
      const monthlyInterest = monthlyAmount * 0.15; // 15% du montant mensuel est de l'intérêt
      
      for (let i = 0; i < months; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        let status: 'pending' | 'paid' | 'partial' | 'late' | 'defaulted' = 'pending';
        let actualPaymentDate: string | undefined = undefined;
        
        // Déterminer le statut en fonction de la date d'échéance
        if (dueDate < now) {
          if (Math.random() > 0.3) {
            status = 'paid';
            const paymentDate = new Date(dueDate);
            paymentDate.setDate(dueDate.getDate() - Math.floor(Math.random() * 5)); // Paiement jusqu'à 5 jours avant échéance
            actualPaymentDate = paymentDate.toISOString();
          } else {
            status = Math.random() > 0.5 ? 'late' : 'defaulted';
          }
        }
        
        schedule.push({
          id: `SCH-${contractId}-${i + 1}`,
          contract_id: contractId,
          due_date: dueDate.toISOString(),
          principal_amount: monthlyPrincipal,
          interest_amount: monthlyInterest,
          total_amount: monthlyAmount,
          status,
          actual_payment_date: actualPaymentDate,
          actual_payment_amount: status === 'paid' ? monthlyAmount : undefined,
          created_at: contract.created_at,
          updated_at: contract.updated_at
        });
      }
      
      return schedule;
    }
  }
};
