// src/types/amortization.ts
// Types centralisés pour les échéanciers d'amortissement

/**
 * Représente un élément d'échéancier d'amortissement.
 */
export interface AmortizationScheduleItem {
  id: string;
  contractId: string;
  number: number;           // Numéro de l'échéance
  dueDate: string;          // Date d'échéance
  principal: number;        // Montant du principal
  interest: number;         // Montant des intérêts
  totalPayment: number;     // Paiement total (principal + intérêt)
  remainingBalance: number; // Solde restant après paiement
  status: AmortizationScheduleStatus;
  paymentDate?: string;     // Date de paiement effective (si payé)
  paymentAmount?: number;   // Montant payé effectif (si différent du totalPayment)
  comments?: string;        // Commentaires éventuels
}

/**
 * Statuts possibles pour un élément d'échéancier
 */
export type AmortizationScheduleStatus = 'paid' | 'due' | 'overdue' | 'pending' | 'rescheduled';

/**
 * Représente un échéancier d'amortissement complet
 */
export interface AmortizationSchedule {
  id: string;
  contractId: string;
  items: AmortizationScheduleItem[];
  totalInterest: number;    // Somme totale des intérêts
  totalPrincipal: number;   // Somme totale du principal
  totalAmount: number;      // Montant total (intérêts + principal)
  generatedAt: string;      // Date de génération
  modifiedAt?: string;      // Date de dernière modification
  isManual: boolean;        // Indique si l'échéancier a été créé manuellement
  isRescheduled: boolean;   // Indique si l'échéancier a été rééchelonné
  rescheduledFrom?: string; // ID de l'échéancier d'origine si rééchelonné
}

/**
 * Props pour le composant EditableAmortizationSchedule
 */
export interface EditableAmortizationScheduleProps {
  contractId: string;
  amount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  onEditSchedule?: (updatedSchedule: AmortizationScheduleItem[]) => Promise<void>;
}

/**
 * Options pour le hook useAmortizationSchedules
 */
export interface UseAmortizationSchedulesOptions {
  contractId: string;
  amount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  page?: number;
  pageSize?: number;
  filter?: string;
}

/**
 * État retourné par le hook useAmortizationSchedules
 */
export interface AmortizationSchedulesState {
  items: AmortizationScheduleItem[];
  isLoading: boolean;
  error: Error | null;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  paidItems: number;
  dueItems: number;
  overdueItems: number;
  pendingItems: number;
  rescheduledItems: number;
  updateScheduleItem: (item: AmortizationScheduleItem) => Promise<boolean>;
  deleteScheduleItem: (itemId: string) => Promise<boolean>;
  addScheduleItem: (item: Partial<AmortizationScheduleItem>) => Promise<boolean>;
}
