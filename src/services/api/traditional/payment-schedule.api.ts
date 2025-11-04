// src/services/api/traditional/payment-schedule.api.ts
import { apiClient } from '../base.api';
import { PaymentSchedule, PaymentScheduleDetails } from '../../../types/payment-schedule';

/**
 * API pour les échéanciers de paiement
 */
export const paymentScheduleApi = {
  /**
   * Récupère tous les échéanciers de paiement
   */
  getAllPaymentSchedules: async (filters?: {
    portfolioId?: string;
    contractId?: string;
    status?: 'pending' | 'paid' | 'overdue' | 'partial';
    dueDateFrom?: string;
    dueDateTo?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.portfolioId) params.append('portfolioId', filters.portfolioId);
      if (filters?.contractId) params.append('contractId', filters.contractId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dueDateFrom) params.append('dueDateFrom', filters.dueDateFrom);
      if (filters?.dueDateTo) params.append('dueDateTo', filters.dueDateTo);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      return await apiClient.get<{
        data: PaymentSchedule[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/portfolios/traditional/payment-schedules?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données mockées si l'API échoue
      console.warn('Fallback to mock data for payment schedules', error);
      
      // Génération de données d'échéancier mockées
      const mockSchedules: PaymentSchedule[] = Array.from({ length: 12 }, (_, index) => ({
        id: `ps-${index + 1}`,
        contract_id: filters?.contractId || 'contract-001',
        installment_number: index + 1,
        due_date: new Date(Date.now() + (index + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        principal_amount: 41666.67,
        interest_amount: 8333.33,
        total_amount: 50000,
        status: index < 3 ? 'paid' : index === 3 ? 'overdue' : 'pending',
        payment_date: index < 3 ? new Date(Date.now() - (12 - index) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
        remaining_balance: 500000 - ((index + 1) * 41666.67),
        late_fees: index === 3 ? 2500 : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      return {
        data: mockSchedules,
        meta: {
          total: 12,
          page: 1,
          limit: 50,
          totalPages: 1
        }
      };
    }
  },

  /**
   * Récupère un échéancier de paiement par son ID
   */
  getPaymentScheduleById: async (id: string): Promise<PaymentSchedule> => {
    try {
      return await apiClient.get<PaymentSchedule>(`/portfolios/traditional/payment-schedules/${id}`);
    } catch (error) {
      // Fallback sur les données mockées si l'API échoue
      console.warn(`Fallback to mock data for payment schedule ${id}`, error);
      
      return {
        id,
        contract_id: 'contract-001',
        installment_number: 1,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        principal_amount: 41666.67,
        interest_amount: 8333.33,
        total_amount: 50000,
        status: 'pending',
        remaining_balance: 500000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  },

  /**
   * Récupère l'échéancier de paiement d'un contrat
   */
  getPaymentScheduleByContract: async (contractId: string): Promise<PaymentScheduleDetails> => {
    try {
      return await apiClient.get<PaymentScheduleDetails>(`/portfolios/traditional/payment-schedules/by-contract/${contractId}`);
    } catch (error) {
      // Fallback sur les données mockées si l'API échoue
      console.warn(`Fallback to mock data for payment schedule of contract ${contractId}`, error);
      
      const mockSchedules: PaymentSchedule[] = Array.from({ length: 12 }, (_, index) => ({
        id: `ps-${contractId}-${index + 1}`,
        contract_id: contractId,
        installment_number: index + 1,
        due_date: new Date(Date.now() + (index + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        principal_amount: 41666.67,
        interest_amount: 8333.33,
        total_amount: 50000,
        status: index < 3 ? 'paid' : index === 3 ? 'overdue' : 'pending',
        payment_date: index < 3 ? new Date(Date.now() - (12 - index) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
        remaining_balance: 500000 - ((index + 1) * 41666.67),
        late_fees: index === 3 ? 2500 : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const totalPaid = mockSchedules.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.total_amount, 0);
      const overdueSchedules = mockSchedules.filter(s => s.status === 'overdue');
      const nextPending = mockSchedules.find(s => s.status === 'pending');

      return {
        contract_id: contractId,
        contract_number: `CNT-${contractId}`,
        client_name: 'Entreprise Client Test',
        total_amount: 600000,
        total_installments: 12,
        frequency: 'monthly',
        start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        interest_rate: 15.5,
        schedule: mockSchedules,
        summary: {
          total_paid: totalPaid,
          remaining_amount: 600000 - totalPaid,
          next_payment_date: nextPending?.due_date || '',
          overdue_count: overdueSchedules.length,
          overdue_amount: overdueSchedules.reduce((sum, s) => sum + s.total_amount + (s.late_fees || 0), 0)
        }
      };
    }
  },

  /**
   * Met à jour le statut d'un échéancier de paiement
   */
  updatePaymentScheduleStatus: async (id: string, updates: {
    status: 'pending' | 'paid' | 'overdue' | 'partial';
    payment_date?: string;
    amount_paid?: number;
    payment_method?: string;
    transaction_reference?: string;
    notes?: string;
  }): Promise<PaymentSchedule> => {
    try {
      return await apiClient.put<PaymentSchedule>(`/portfolios/traditional/payment-schedules/${id}`, updates);
    } catch (error) {
      // Fallback sur les données mockées si l'API échoue
      console.warn(`Fallback to mock data for updating payment schedule ${id}`, error);
      
      const currentSchedule = await paymentScheduleApi.getPaymentScheduleById(id);
      
      return {
        ...currentSchedule,
        status: updates.status,
        payment_date: updates.payment_date,
        updated_at: new Date().toISOString()
      };
    }
  },

  /**
   * Génère un nouvel échéancier pour un contrat
   */
  generatePaymentSchedule: async (contractId: string, parameters: {
    total_amount: number;
    installments_count: number;
    frequency: 'monthly' | 'quarterly' | 'weekly' | 'biweekly';
    interest_rate: number;
    start_date: string;
    grace_period_days?: number;
  }): Promise<PaymentScheduleDetails> => {
    try {
      return await apiClient.post<PaymentScheduleDetails>(`/portfolios/traditional/payment-schedules/generate`, {
        contract_id: contractId,
        ...parameters
      });
    } catch (error) {
      // Fallback sur la génération locale si l'API échoue
      console.warn(`Fallback to local generation for payment schedule of contract ${contractId}`, error);
      
      const interestRate = parameters.interest_rate / 100 / 12; // Taux mensuel
      
      // Calcul avec intérêts composés
      const monthlyPaymentWithInterest = (parameters.total_amount * interestRate * Math.pow(1 + interestRate, parameters.installments_count)) / 
                                        (Math.pow(1 + interestRate, parameters.installments_count) - 1);
      
      let remainingBalance = parameters.total_amount;
      const schedule: PaymentSchedule[] = [];
      
      for (let i = 0; i < parameters.installments_count; i++) {
        const interestAmount = remainingBalance * interestRate;
        const principalAmount = monthlyPaymentWithInterest - interestAmount;
        remainingBalance -= principalAmount;
        
        const daysToAdd = parameters.frequency === 'monthly' ? 30 * (i + 1) :
                         parameters.frequency === 'quarterly' ? 90 * (i + 1) :
                         parameters.frequency === 'weekly' ? 7 * (i + 1) :
                         14 * (i + 1); // biweekly
        
        schedule.push({
          id: `gen-${contractId}-${i + 1}`,
          contract_id: contractId,
          installment_number: i + 1,
          due_date: new Date(new Date(parameters.start_date).getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          principal_amount: principalAmount,
          interest_amount: interestAmount,
          total_amount: monthlyPaymentWithInterest,
          status: 'pending',
          remaining_balance: Math.max(0, remainingBalance),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      return {
        contract_id: contractId,
        contract_number: `CNT-${contractId}`,
        client_name: 'Client Généré',
        total_amount: parameters.total_amount,
        total_installments: parameters.installments_count,
        frequency: parameters.frequency,
        start_date: parameters.start_date,
        end_date: schedule[schedule.length - 1].due_date,
        interest_rate: parameters.interest_rate,
        schedule,
        summary: {
          total_paid: 0,
          remaining_amount: parameters.total_amount,
          next_payment_date: schedule[0].due_date,
          overdue_count: 0,
          overdue_amount: 0
        }
      };
    }
  }
};