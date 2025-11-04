import { useState, useCallback } from 'react';
import { paymentScheduleApi } from '../services/api/traditional/payment-schedule.api';
import { PaymentSchedule, PaymentScheduleDetails } from '../types/payment-schedule';
import { useApiManager } from './useApiManager';

const usePaymentSchedule = () => {
  const { callApi } = useApiManager();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSchedule = useCallback(async (contractId: string, parameters: {
    total_amount: number;
    installments_count: number;
    frequency: 'monthly' | 'quarterly' | 'weekly' | 'biweekly';
    interest_rate: number;
    start_date: string;
    grace_period_days?: number;
  }): Promise<PaymentScheduleDetails | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await callApi(
        `generateSchedule-${contractId}`,
        () => paymentScheduleApi.generatePaymentSchedule(contractId, parameters),
        `schedule-generate-${contractId}`
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  const getSchedulesByContract = useCallback(async (contractId: string): Promise<PaymentScheduleDetails | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await callApi(
        `getScheduleByContract-${contractId}`,
        () => paymentScheduleApi.getPaymentScheduleByContract(contractId),
        `schedule-contract-${contractId}`
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  const updateScheduleStatus = useCallback(async (
    scheduleId: string, 
    updates: {
      status: 'pending' | 'paid' | 'overdue' | 'partial';
      payment_date?: string;
      amount_paid?: number;
      payment_method?: string;
      transaction_reference?: string;
      notes?: string;
    }
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await callApi(
        `updateSchedule-${scheduleId}`,
        () => paymentScheduleApi.updatePaymentScheduleStatus(scheduleId, updates)
      );

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  const getScheduleById = useCallback(async (scheduleId: string): Promise<PaymentSchedule | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await callApi(
        `getSchedule-${scheduleId}`,
        () => paymentScheduleApi.getPaymentScheduleById(scheduleId),
        `schedule-${scheduleId}`
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  const getAllSchedules = useCallback(async (filters?: {
    portfolioId?: string;
    contractId?: string;
    status?: 'pending' | 'paid' | 'overdue' | 'partial';
    dueDateFrom?: string;
    dueDateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: PaymentSchedule[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  } | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await callApi(
        `getAllSchedules-${JSON.stringify(filters)}`,
        () => paymentScheduleApi.getAllPaymentSchedules(filters),
        `schedules-${filters?.contractId || 'all'}`
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  return {
    // States
    loading,
    error,
    
    // Actions
    generateSchedule,
    getSchedulesByContract,
    updateScheduleStatus,
    getScheduleById,
    getAllSchedules,
    
    // Utils
    clearError: () => setError(null)
  };
};

export default usePaymentSchedule;