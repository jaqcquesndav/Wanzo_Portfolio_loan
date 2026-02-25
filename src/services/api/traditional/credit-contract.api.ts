// src/services/api/traditional/credit-contract.api.ts
// ⚠️ REWRITTEN — aligns with backend doc: response envelope unwrap, field normalization, correct payloads
import { apiClient } from '../base.api';
import type {
  CreditContract,
  CreateContractPayload,
  PaymentScheduleItem,
  RestructuringEntry,
} from '../../../types/credit-contract';
import { traditionalDataService } from './dataService';

// ─── Response envelope helpers ────────────────────────────────────────────────

type ApiEnvelope<T> = { success: boolean; data: T } | T;

function unwrap<T>(response: ApiEnvelope<T>): T {
  if (response && typeof response === 'object' && 'data' in (response as object)) {
    return (response as { success: boolean; data: T }).data;
  }
  return response as T;
}

function toNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  const n = typeof val === 'string' ? parseFloat(val) : Number(val);
  return isNaN(n) ? 0 : n;
}

function toOptNumber(val: unknown): number | undefined {
  if (val === null || val === undefined) return undefined;
  const n = typeof val === 'string' ? parseFloat(val) : Number(val);
  return isNaN(n) ? undefined : n;
}

// ─── Normalizer: API raw → CreditContract ─────────────────────────────────────
// Handles: snake_case → camelCase aliases, string amounts → numbers,
// portfolio_id / portfolioId, principal_amount / amount, amortization_type / amortization_method

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeScheduleItem(raw: Record<string, any>): PaymentScheduleItem {
  return {
    id: raw.id as string,
    installment_number: raw.installment_number as number,
    due_date: raw.due_date as string,
    principal_amount: toNumber(raw.principal_amount),
    interest_amount: toNumber(raw.interest_amount),
    total_amount: toNumber(raw.total_amount),
    status: raw.status as PaymentScheduleItem['status'],
    paid_amount: toOptNumber(raw.paid_amount),
    remaining_amount: toOptNumber(raw.remaining_amount),
    payment_date: raw.payment_date as string | undefined,
    late_fee_amount: toOptNumber(raw.late_fee_amount),
    payment_amount: toOptNumber(raw.payment_amount),
    payment_reference: raw.payment_reference as string | undefined,
    transaction_reference: raw.transaction_reference as string | undefined,
    remaining_percentage: raw.remaining_percentage as number | undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeContract(raw: Record<string, any>): CreditContract {
  const portfolioId = (raw.portfolio_id ?? raw.portfolioId ?? '') as string;
  const principalAmount = toNumber(raw.principal_amount ?? raw.amount ?? 0);
  const schedules = raw.payment_schedules ?? raw.payment_schedule ?? undefined;
  const normalizedSchedules = Array.isArray(schedules)
    ? schedules.map(normalizeScheduleItem)
    : undefined;

  return {
    // Identity
    id: raw.id as string,
    contract_number: (raw.contract_number ?? '') as string,
    portfolio_id: portfolioId,
    portfolioId,
    funding_request_id: raw.funding_request_id ?? raw.creditRequestId ?? undefined,
    creditRequestId: raw.funding_request_id ?? raw.creditRequestId ?? undefined,
    // Parties
    client_id: (raw.client_id ?? raw.memberId ?? '') as string,
    memberId: raw.client_id ?? raw.memberId ?? undefined,
    company_name: (raw.company_name ?? '') as string,
    // Product
    product_type: (raw.product_type ?? raw.productId ?? '') as string,
    productId: raw.product_type ?? raw.productId ?? undefined,
    // Financials
    principal_amount: principalAmount,
    amount: principalAmount,
    interest_rate: toNumber(raw.interest_rate),
    outstanding_balance: toOptNumber(raw.outstanding_balance),
    disbursed_amount: toOptNumber(raw.disbursed_amount ?? raw.disbursedAmount),
    disbursedAmount: toOptNumber(raw.disbursed_amount ?? raw.disbursedAmount),
    total_paid_amount: toOptNumber(raw.total_paid_amount),
    total_interest_due: toOptNumber(raw.total_interest_due),
    remainingAmount: toOptNumber(raw.remaining_amount ?? raw.remainingAmount),
    // Schedule params
    amortization_type: (raw.amortization_type ?? raw.amortization_method) as CreditContract['amortization_type'],
    amortization_method: (raw.amortization_method ?? raw.amortization_type) as CreditContract['amortization_method'],
    payment_frequency: raw.payment_frequency as string | undefined,
    terms: (raw.terms ?? '') as string,
    grace_period: raw.grace_period as number | undefined,
    // Dates
    start_date: (raw.start_date ?? raw.startDate ?? '') as string,
    end_date: (raw.end_date ?? raw.endDate ?? '') as string,
    startDate: raw.start_date ?? raw.startDate ?? undefined,
    endDate: raw.end_date ?? raw.endDate ?? undefined,
    lastPaymentDate: raw.lastPaymentDate ?? raw.last_payment_date ?? undefined,
    nextPaymentDate: raw.nextPaymentDate ?? raw.next_payment_date ?? undefined,
    // Status & Risk
    status: raw.status as CreditContract['status'],
    riskClass: raw.riskClass as CreditContract['riskClass'],
    delinquencyDays: raw.delinquencyDays as number | undefined,
    // Lifecycle
    suspension_reason: raw.suspension_reason as string | undefined,
    suspension_date: raw.suspension_date as string | undefined,
    default_date: raw.default_date as string | undefined,
    default_reason: raw.default_reason as string | undefined,
    completion_date: raw.completion_date as string | undefined,
    litigation_date: raw.litigation_date as string | undefined,
    litigation_reason: raw.litigation_reason as string | undefined,
    // Relations
    payment_schedules: normalizedSchedules,
    payment_schedule: normalizedSchedules,
    guarantees: raw.guarantees ?? undefined,
    disbursements: raw.disbursements ?? undefined,
    restructuring_history: raw.restructuring_history as RestructuringEntry[] | undefined,
    documents: raw.documents ?? undefined,
    documentUrl: raw.documentUrl as string | undefined,
    // Meta
    created_by: raw.created_by as string | undefined,
    created_at: (raw.created_at ?? '') as string,
    updated_at: (raw.updated_at ?? '') as string,
  };
}

// ─── API service ─────────────────────────────────────────────────────────────

export const creditContractApi = {
  /**
   * Lister les contrats de crédit
   * GET /portfolios/traditional/credit-contracts
   */
  getAllContracts: async (
    portfolioId?: string,
    filters?: {
      status?: string;
      clientId?: string;
      productType?: string;
      riskClass?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<CreditContract[]> => {
    try {
      const params = new URLSearchParams();
      if (portfolioId) params.append('portfolioId', portfolioId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.clientId) params.append('clientId', filters.clientId);
      if (filters?.productType) params.append('productType', filters.productType);
      if (filters?.riskClass) params.append('riskClass', filters.riskClass);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.page !== undefined) params.append('page', String(filters.page));
      if (filters?.limit !== undefined) params.append('limit', String(filters.limit));
      const qs = params.toString();
      const raw = await apiClient.get<ApiEnvelope<unknown[]>>(
        `/portfolios/traditional/credit-contracts${qs ? `?${qs}` : ''}`
      );
      const list = unwrap(raw);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Array.isArray(list) ? list.map((c: Record<string, any>) => normalizeContract(c)) : [];
    } catch (error) {
      console.warn('[creditContractApi] getAllContracts fallback localStorage', error);
      let contracts = traditionalDataService.getCreditContracts();
      if (portfolioId) contracts = contracts.filter(c => (c.portfolio_id ?? c.portfolioId) === portfolioId);
      if (filters?.status) contracts = contracts.filter(c => c.status === filters.status);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (contracts as Record<string, any>[]).map(normalizeContract);
    }
  },

  /**
   * Détail d'un contrat
   * GET /portfolios/traditional/credit-contracts/:id
   */
  getContractById: async (id: string): Promise<CreditContract> => {
    try {
      const raw = await apiClient.get<ApiEnvelope<unknown>>(
        `/portfolios/traditional/credit-contracts/${id}`
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return normalizeContract(unwrap(raw) as Record<string, any>);
    } catch (error) {
      console.warn(`[creditContractApi] getContractById fallback localStorage: ${id}`, error);
      const contract = traditionalDataService.getCreditContractById(id);
      if (!contract) throw new Error(`Contract with ID ${id} not found`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return normalizeContract(contract as Record<string, any>);
    }
  },

  /**
   * Créer un contrat depuis une demande approuvée
   * POST /portfolios/traditional/credit-contracts/from-request
   * Payload: CreateContractPayload
   * Champs ignorés par le backend: status, created_at, updated_at, memberId, memberName, productId, productName, disbursedAmount, remainingAmount, duration
   */
  createContract: async (payload: CreateContractPayload): Promise<CreditContract> => {
    try {
      const raw = await apiClient.post<ApiEnvelope<unknown>>(
        `/portfolios/traditional/credit-contracts/from-request`,
        payload
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return normalizeContract(unwrap(raw) as Record<string, any>);
    } catch (error) {
      console.warn('[creditContractApi] createContract fallback localStorage', error);
      const localContract = {
        ...payload,
        id: traditionalDataService.generateCreditContractId(),
        portfolio_id: payload.portfolioId,
        funding_request_id: payload.creditRequestId,
        principal_amount: payload.amount,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalized = normalizeContract(localContract as Record<string, any>);
      traditionalDataService.addCreditContract(normalized);
      return normalized;
    }
  },

  /**
   * Mettre à jour un contrat
   * PUT /portfolios/traditional/credit-contracts/:id
   */
  updateContract: async (id: string, updates: Partial<CreditContract>): Promise<CreditContract> => {
    try {
      const raw = await apiClient.put<ApiEnvelope<unknown>>(
        `/portfolios/traditional/credit-contracts/${id}`,
        updates
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return normalizeContract(unwrap(raw) as Record<string, any>);
    } catch (error) {
      console.warn(`[creditContractApi] updateContract fallback localStorage: ${id}`, error);
      const contract = traditionalDataService.getCreditContractById(id);
      if (!contract) throw new Error(`Contract with ID ${id} not found`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = { ...(contract as Record<string, any>), ...updates, updated_at: new Date().toISOString() };
      const normalized = normalizeContract(updated);
      traditionalDataService.updateCreditContract(normalized);
      return normalized;
    }
  },

  /**
   * Activer un contrat (draft → active)
   * POST /portfolios/traditional/credit-contracts/:id/activate
   * Body: {} — le backend ne prend AUCUN payload
   */
  activateContract: async (contractId: string): Promise<CreditContract> => {
    try {
      const raw = await apiClient.post<ApiEnvelope<unknown>>(
        `/portfolios/traditional/credit-contracts/${contractId}/activate`,
        {}
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return normalizeContract(unwrap(raw) as Record<string, any>);
    } catch (error) {
      console.warn(`[creditContractApi] activateContract fallback localStorage: ${contractId}`, error);
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) throw new Error(`Contract with ID ${contractId} not found`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = { ...(contract as Record<string, any>), status: 'active', updated_at: new Date().toISOString() };
      const normalized = normalizeContract(updated);
      traditionalDataService.updateCreditContract(normalized);
      return normalized;
    }
  },

  /**
   * Suspendre un contrat (active → suspended)
   * POST /portfolios/traditional/credit-contracts/:id/suspend
   * Body: { reason: string }
   */
  suspendContract: async (contractId: string, payload: { reason: string }): Promise<CreditContract> => {
    try {
      const raw = await apiClient.post<ApiEnvelope<unknown>>(
        `/portfolios/traditional/credit-contracts/${contractId}/suspend`,
        { reason: payload.reason }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return normalizeContract(unwrap(raw) as Record<string, any>);
    } catch (error) {
      console.warn(`[creditContractApi] suspendContract fallback localStorage: ${contractId}`, error);
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) throw new Error(`Contract with ID ${contractId} not found`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = { ...(contract as Record<string, any>), status: 'suspended', suspension_reason: payload.reason, suspension_date: new Date().toISOString(), updated_at: new Date().toISOString() };
      const normalized = normalizeContract(updated);
      traditionalDataService.updateCreditContract(normalized);
      return normalized;
    }
  },

  /**
   * Annuler un contrat (draft → canceled UNIQUEMENT)
   * POST /portfolios/traditional/credit-contracts/:id/cancel
   * Body: { reason: string }
   */
  cancelContract: async (contractId: string, payload: { reason: string }): Promise<CreditContract> => {
    try {
      const raw = await apiClient.post<ApiEnvelope<unknown>>(
        `/portfolios/traditional/credit-contracts/${contractId}/cancel`,
        { reason: payload.reason }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return normalizeContract(unwrap(raw) as Record<string, any>);
    } catch (error) {
      console.warn(`[creditContractApi] cancelContract fallback localStorage: ${contractId}`, error);
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) throw new Error(`Contract with ID ${contractId} not found`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = { ...(contract as Record<string, any>), status: 'canceled', updated_at: new Date().toISOString() };
      const normalized = normalizeContract(updated);
      traditionalDataService.updateCreditContract(normalized);
      return normalized;
    }
  },

  /**
   * Marquer en défaut (active → defaulted)
   * POST /portfolios/traditional/credit-contracts/:id/default
   * Body: { reason: string, default_date: string }
   */
  markAsDefaulted: async (contractId: string, reason: string, default_date?: string): Promise<CreditContract> => {
    try {
      const raw = await apiClient.post<ApiEnvelope<unknown>>(
        `/portfolios/traditional/credit-contracts/${contractId}/default`,
        { reason, default_date: default_date ?? new Date().toISOString() }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return normalizeContract(unwrap(raw) as Record<string, any>);
    } catch (error) {
      console.warn(`[creditContractApi] markAsDefaulted fallback localStorage: ${contractId}`, error);
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) throw new Error(`Contract with ID ${contractId} not found`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = { ...(contract as Record<string, any>), status: 'defaulted', default_reason: reason, default_date: default_date ?? new Date().toISOString(), updated_at: new Date().toISOString() };
      const normalized = normalizeContract(updated);
      traditionalDataService.updateCreditContract(normalized);
      return normalized;
    }
  },

  /**
   * Restructurer un contrat (active | defaulted → restructured)
   * POST /portfolios/traditional/credit-contracts/:id/restructure
   * Body: { new_terms, new_interest_rate, new_end_date, reason }
   */
  restructureContract: async (
    contractId: string,
    payload: { new_terms: string; new_interest_rate: number; new_end_date: string; reason: string }
  ): Promise<CreditContract> => {
    try {
      const raw = await apiClient.post<ApiEnvelope<unknown>>(
        `/portfolios/traditional/credit-contracts/${contractId}/restructure`,
        payload
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return normalizeContract(unwrap(raw) as Record<string, any>);
    } catch (error) {
      console.warn(`[creditContractApi] restructureContract fallback localStorage: ${contractId}`, error);
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) throw new Error(`Contract with ID ${contractId} not found`);
      const entry: RestructuringEntry = { date: new Date().toISOString(), reason: payload.reason, previous_terms: contract.terms, previous_rate: contract.interest_rate, previous_end_date: contract.end_date };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = { ...(contract as Record<string, any>), status: 'restructured', terms: payload.new_terms, interest_rate: payload.new_interest_rate, end_date: payload.new_end_date, restructuring_history: [...(contract.restructuring_history ?? []), entry], updated_at: new Date().toISOString() };
      const normalized = normalizeContract(updated);
      traditionalDataService.updateCreditContract(normalized);
      return normalized;
    }
  },

  /**
   * Passer en contentieux (defaulted → litigation | in_litigation)
   * POST /portfolios/traditional/credit-contracts/:id/litigation
   * Body: { litigation_date: string (REQUIS), litigation_reason: string (REQUIS) }
   */
  putInLitigation: async (
    contractId: string,
    payload: { litigation_reason: string; litigation_date: string }
  ): Promise<CreditContract> => {
    try {
      const raw = await apiClient.post<ApiEnvelope<unknown>>(
        `/portfolios/traditional/credit-contracts/${contractId}/litigation`,
        payload
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return normalizeContract(unwrap(raw) as Record<string, any>);
    } catch (error) {
      console.warn(`[creditContractApi] putInLitigation fallback localStorage: ${contractId}`, error);
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) throw new Error(`Contract with ID ${contractId} not found`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = { ...(contract as Record<string, any>), status: 'litigation', litigation_date: payload.litigation_date, litigation_reason: payload.litigation_reason, updated_at: new Date().toISOString() };
      const normalized = normalizeContract(updated);
      traditionalDataService.updateCreditContract(normalized);
      return normalized;
    }
  },

  /**
   * Clôturer un contrat (toutes les échéances doivent être "paid")
   * POST /portfolios/traditional/credit-contracts/:id/complete
   * Body: {} (vide)
   */
  completeContract: async (contractId: string): Promise<CreditContract> => {
    try {
      const raw = await apiClient.post<ApiEnvelope<unknown>>(
        `/portfolios/traditional/credit-contracts/${contractId}/complete`,
        {}
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return normalizeContract(unwrap(raw) as Record<string, any>);
    } catch (error) {
      console.warn(`[creditContractApi] completeContract fallback localStorage: ${contractId}`, error);
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) throw new Error(`Contract with ID ${contractId} not found`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = { ...(contract as Record<string, any>), status: 'completed', completion_date: new Date().toISOString(), updated_at: new Date().toISOString() };
      const normalized = normalizeContract(updated);
      traditionalDataService.updateCreditContract(normalized);
      return normalized;
    }
  },

  /**
   * Obtenir l'échéancier de paiement
   * GET /portfolios/traditional/credit-contracts/:id/schedule
   * Réponse: { success: true, data: PaymentScheduleItem[] }
   */
  getPaymentSchedule: async (contractId: string): Promise<PaymentScheduleItem[]> => {
    try {
      const raw = await apiClient.get<ApiEnvelope<unknown>>(
        `/portfolios/traditional/credit-contracts/${contractId}/schedule`
      );
      const list = unwrap(raw);
      if (Array.isArray(list)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return list.map((item: Record<string, any>) => normalizeScheduleItem(item));
      }
      return [];
    } catch (error) {
      console.warn(`[creditContractApi] getPaymentSchedule fallback localStorage: ${contractId}`, error);
      const contract = traditionalDataService.getCreditContractById(contractId);
      if (!contract) throw new Error(`Contract with ID ${contractId} not found`);
      const principal = (contract as CreditContract).principal_amount ?? (contract as CreditContract).amount ?? 0;
      return Array.from({ length: 4 }, (_, i) => ({
        id: `local-${contractId}-${i + 1}`,
        installment_number: i + 1,
        due_date: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        principal_amount: principal / 4,
        interest_amount: 0,
        total_amount: principal / 4,
        status: 'pending' as const,
      }));
    }
  },

  /**
   * Générer le document PDF du contrat
   * POST /portfolios/traditional/credit-contracts/:id/generate-document
   */
  generateContractDocument: async (id: string): Promise<{ documentUrl: string }> => {
    try {
      return await apiClient.post<{ documentUrl: string }>(
        `/portfolios/traditional/credit-contracts/${id}/generate-document`,
        {}
      );
    } catch (error) {
      console.warn(`[creditContractApi] generateContractDocument fallback: ${id}`, error);
      return { documentUrl: `https://example.com/contract-documents/${id}.pdf` };
    }
  },
};
