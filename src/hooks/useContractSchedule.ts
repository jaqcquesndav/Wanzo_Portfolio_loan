// src/hooks/useContractSchedule.ts
import { useState, useEffect, useCallback } from 'react';
import { creditContractApi } from '../services/api/traditional/credit-contract.api';
import { paymentApi } from '../services/api/traditional/payment.api';
import { Repayment } from '../components/portfolio/traditional/RepaymentsTable';
import { CreditContract } from '../types/credit-contract';

// Type pour les données de l'échéance brutes venant de l'API
interface ScheduleItemData {
  id: string;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  status: string;
  payment_date?: string;
  payment_amount?: number;
  payment_reference?: string;
  transaction_reference?: string;
  remaining_amount?: number;
  remaining_percentage?: number;
  associated_payments?: string[];
  slippage?: number;
}

// Type pour les données de paiement brutes venant de l'API
interface PaymentData {
  id: string;
  contract_id: string;
  portfolioId: string;
  client_id?: string;
  due_date?: string;
  payment_date?: string;
  amount: number;
  status: string;
  payment_method?: string;
  payment_reference?: string;
  transaction_reference?: string;
  scheduled_payment_id?: string;
  installment_number?: number;
  total_installments?: number;
  payment_details?: {
    principal_amount?: number;
    interest_amount?: number;
    penalty_amount?: number;
  };
  receipt_url?: string;
  remaining_amount?: number;
  remaining_percentage?: number;
  slippage?: number;
}

// Type pour représenter une échéance enrichie
interface EnrichedScheduleItem {
  id: string;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'partial' | 'late' | 'defaulted';
  payment_date?: string;
  payment_amount?: number;
  payment_reference?: string;
  transaction_reference?: string;
  remaining_amount: number;
  remaining_percentage: number;
  associated_payments: string[];
  slippage?: number;
}

// Type pour le retour du hook
interface ContractScheduleData {
  contract: CreditContract | null;
  schedule: EnrichedScheduleItem[];
  repayments: Repayment[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  associatePaymentWithSchedule: (paymentId: string, installmentNumber: number) => Promise<boolean>;
  recordPaymentForInstallment: (
    installmentNumber: number, 
    paymentData: {
      amount: number;
      payment_date: string;
      payment_method: string;
      payment_reference: string;
      transaction_reference?: string;
      receipt?: File;
    }
  ) => Promise<boolean>;
}

/**
 * Hook pour gérer les échéances d'un contrat et les remboursements associés
 */
export function useContractSchedule(contractId: string): ContractScheduleData {
  const [contract, setContract] = useState<CreditContract | null>(null);
  const [schedule, setSchedule] = useState<EnrichedScheduleItem[]>([]);
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les données du contrat et des échéances
  const loadContractData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Récupérer le contrat et son échéancier depuis le vrai backend
      const [contractData, scheduleItems, payments] = await Promise.all([
        creditContractApi.getContractById(contractId),
        creditContractApi.getPaymentSchedule(contractId).catch(() => [] as ScheduleItemData[]),
        paymentApi.getPaymentsByContract(contractId).catch(() => [] as PaymentData[])
      ]);

      setContract(contractData as CreditContract);

      // Préparer les échéances enrichies
      const enrichedSchedule = (scheduleItems as ScheduleItemData[]).map((item) => ({
        ...item,
        remaining_amount: item.remaining_amount ?? 0,
        remaining_percentage: item.remaining_percentage ?? 0,
        associated_payments: item.associated_payments ?? [],
        status: (item.status as 'pending' | 'paid' | 'partial' | 'late' | 'defaulted') || 'pending'
      }));
      setSchedule(enrichedSchedule as EnrichedScheduleItem[]);

      // Convertir les paiements en format Repayment pour l'affichage
      const formattedRepayments = (payments as PaymentData[]).map((payment) => ({
        id: payment.id,
        company: contractData.company_name ?? '',
        product: contractData.product_type ?? '',
        dueDate: payment.due_date || payment.payment_date || '',
        amount: payment.amount,
        status: payment.status === 'pending' ? 'à venir' :
               payment.status === 'completed' ? 'payé' :
               'retard' as 'à venir' | 'payé' | 'retard',
        requestId: payment.scheduled_payment_id,
        portfolioId: payment.portfolioId,
        contractReference: payment.contract_id,
        transactionReference: payment.transaction_reference,
        paymentDate: payment.payment_date,
        paymentMethod: (payment.payment_method || 'virement') as 'virement' | 'transfert' | 'chèque' | 'espèces',
        paymentReference: payment.payment_reference,
        installmentNumber: payment.installment_number,
        totalInstallments: payment.total_installments || (contractData.payment_schedules?.length ?? contractData.payment_schedule?.length),
        principal: payment.payment_details?.principal_amount,
        interest: payment.payment_details?.interest_amount,
        penalties: payment.payment_details?.penalty_amount,
        receiptUrl: payment.receipt_url,
        remainingAmount: payment.remaining_amount,
        remainingPercentage: payment.remaining_percentage,
        slippage: payment.slippage
      })) as Repayment[];
      setRepayments(formattedRepayments);

    } catch (err) {
      console.error('Erreur lors du chargement des données du contrat:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    loadContractData();
  }, [loadContractData]);

  // Fonction pour associer un paiement à une échéance spécifique
  // NOTE: No dedicated backend endpoint for this — refresh data after manual reconciliation
  const associatePaymentWithSchedule = useCallback(async (
    _paymentId: string,
    _installmentNumber: number
  ): Promise<boolean> => {
    await loadContractData();
    return true;
  }, [loadContractData]);

  // Fonction pour enregistrer un paiement pour une échéance spécifique
  const recordPaymentForInstallment = useCallback(async (
    installmentNumber: number,
    paymentData: {
      amount: number;
      payment_date: string;
      payment_method: string;
      payment_reference: string;
      transaction_reference?: string;
      receipt?: File;
    }
  ): Promise<boolean> => {
    try {
      // Trouver l'échéance correspondante
      const scheduleItem = schedule.find(item => item.installment_number === installmentNumber);
      if (!scheduleItem) {
        throw new Error(`Échéance numéro ${installmentNumber} non trouvée`);
      }

      // Créer le paiement
      const paymentToCreate = {
        contract_id: contractId,
        portfolioId: contract?.portfolio_id || '',
        client_id: contract?.client_id || '',
        payment_date: paymentData.payment_date,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        payment_reference: paymentData.payment_reference,
        transaction_reference: paymentData.transaction_reference,
        status: 'completed' as const,
        payment_type: 'mixed' as const,
        payment_details: {
          principal_amount: scheduleItem.principal_amount * (paymentData.amount / scheduleItem.total_amount),
          interest_amount: scheduleItem.interest_amount * (paymentData.amount / scheduleItem.total_amount),
          penalty_amount: 0
        },
        scheduled_payment_id: scheduleItem.id,
        installment_number: installmentNumber,
        total_installments: schedule.length,
        due_date: scheduleItem.due_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Enregistrer le paiement
      const createdPayment = await paymentApi.recordPayment(paymentToCreate);

      // Si un justificatif est fourni, le télécharger
      if (paymentData.receipt && createdPayment) {
        await paymentApi.uploadPaymentReceipt(createdPayment.id, paymentData.receipt);
      }

      // Associer le paiement à l'échéance
      if (createdPayment) {
        await associatePaymentWithSchedule(createdPayment.id, installmentNumber);
      }

      // Rafraîchir les données
      await loadContractData();
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du paiement:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  }, [contractId, contract, schedule, associatePaymentWithSchedule, loadContractData]);

  return {
    contract,
    schedule,
    repayments,
    isLoading,
    error,
    refresh: loadContractData,
    associatePaymentWithSchedule,
    recordPaymentForInstallment
  };
}
