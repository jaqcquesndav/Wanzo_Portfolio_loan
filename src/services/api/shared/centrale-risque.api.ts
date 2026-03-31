// src/services/api/shared/centrale-risque.api.ts
import { apiClient } from '../base.api';
import type {
  RiskEntry,
  RiskDashboardSummary,
  Incident,
  Alert,
  CentraleRisqueStats,
  EntityRiskSummary,
  RiskReport,
  PortfolioStats,
  ContractClassification,
  RegulatoryThresholds,
  BCCConfiguration,
  CentraleRisquePaginatedResponse,
  RiskCategory,
  RiskEntityType,
  RiskEntryStatus,
  IncidentType,
  IncidentStatus,
  AlertType,
  AlertStatus,
  Severity,
} from '../../../types/centrale-risque';

// ============================================================================
// 1. VUE RAPIDE DASHBOARD + STATISTIQUES RÉGLEMENTAIRES + BCC
//    Préfixes : /risk  |  /risk-statistics  |  /bcc
// ============================================================================
export const centraleRisqueApi = {
  /** GET /risk/summary — résumé dashboard consolidé (entrées, alertes, défauts récents) */
  getDashboardSummary: () =>
    apiClient.get<RiskDashboardSummary>('/risk/summary'),

  /** GET /risk?companyId=... — liste crédit / leasing / investissement */
  getRisksByCompany: (companyId?: string) => {
    const qs = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return apiClient.get<{
      creditRisks: RiskEntry[];
      leasingRisks: RiskEntry[];
      investmentRisks: RiskEntry[];
    }>(`/risk${qs}`);
  },

  /** GET /risk/:id — entrée de risque par UUID */
  getRiskById: (id: string) =>
    apiClient.get<RiskEntry>(`/risk/${id}`),

  /** GET /risk/credit/:companyId */
  getCreditRiskByCompany: (companyId: string) =>
    apiClient.get<{ companyId: string; creditRisks: RiskEntry[]; totalCount: number }>(
      `/risk/credit/${companyId}`
    ),

  /** GET /risk/leasing/:companyId */
  getLeasingRiskByCompany: (companyId: string) =>
    apiClient.get<{ companyId: string; leasingRisks: RiskEntry[]; totalCount: number }>(
      `/risk/leasing/${companyId}`
    ),

  // ── Statistiques réglementaires ─────────────────────────────────────────

  /** GET /risk-statistics/portfolio — PAR30, PAR90, NPL, provisions OHADA */
  getPortfolioStats: (institutionId?: string) => {
    const qs = institutionId ? `?institutionId=${encodeURIComponent(institutionId)}` : '';
    return apiClient.get<PortfolioStats>(`/risk-statistics/portfolio${qs}`);
  },

  /** GET /risk-statistics/contract/:contractId/days-overdue */
  getContractDaysOverdue: (contractId: string) =>
    apiClient.get<{ contractId: string; daysOverdue: number; calculatedAt: string }>(
      `/risk-statistics/contract/${contractId}/days-overdue`
    ),

  /** POST /risk-statistics/contract/:contractId/update-classification */
  updateContractClassification: (contractId: string, daysOverdue?: number) =>
    apiClient.post<ContractClassification>(
      `/risk-statistics/contract/${contractId}/update-classification`,
      daysOverdue !== undefined ? { daysOverdue } : {}
    ),

  /** POST /risk-statistics/update-all-classifications — recalcule toutes les classifications */
  updateAllClassifications: () =>
    apiClient.post<{ message: string; triggeredAt: string }>(
      '/risk-statistics/update-all-classifications',
      {}
    ),

  /** GET /risk-statistics/regulatory-thresholds */
  getRegulatoryThresholds: () =>
    apiClient.get<RegulatoryThresholds>('/risk-statistics/regulatory-thresholds'),

  // ── Configuration BCC/OHADA ───────────────────────────────────────────────

  /** GET /bcc/configuration/:institutionId */
  getBCCConfiguration: (institutionId: string) =>
    apiClient.get<BCCConfiguration>(`/bcc/configuration/${institutionId}`),
};

// ============================================================================
// 2. CRUD COMPLET — /centrale-risque
//    Entrées de risque | Incidents | Alertes | Rapports & stats
// ============================================================================
export const centraleRisqueApiV2 = {
  // ── Entrées de risque ────────────────────────────────────────────────────

  /** GET /centrale-risque/risk-entries */
  getRiskEntries: (filters?: {
    entityId?: string;
    sector?: string;
    category?: RiskCategory;
    riskType?: RiskEntityType;
    status?: RiskEntryStatus;
    reportingInstitutionId?: string;
    minAmount?: number;
    maxAmount?: number;
    startDateFrom?: string;
    startDateTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const p = new URLSearchParams();
    if (filters?.entityId) p.append('entityId', filters.entityId);
    if (filters?.sector) p.append('sector', filters.sector);
    if (filters?.category) p.append('category', filters.category);
    if (filters?.riskType) p.append('riskType', filters.riskType);
    if (filters?.status) p.append('status', filters.status);
    if (filters?.reportingInstitutionId) p.append('reportingInstitutionId', filters.reportingInstitutionId);
    if (filters?.minAmount !== undefined) p.append('minAmount', String(filters.minAmount));
    if (filters?.maxAmount !== undefined) p.append('maxAmount', String(filters.maxAmount));
    if (filters?.startDateFrom) p.append('startDateFrom', filters.startDateFrom);
    if (filters?.startDateTo) p.append('startDateTo', filters.startDateTo);
    if (filters?.page) p.append('page', String(filters.page));
    if (filters?.limit) p.append('limit', String(filters.limit));
    const qs = p.toString();
    return apiClient.get<CentraleRisquePaginatedResponse<RiskEntry>>(
      `/centrale-risque/risk-entries${qs ? `?${qs}` : ''}`
    );
  },

  /** GET /centrale-risque/risk-entries/:id */
  getRiskEntryById: (id: string) =>
    apiClient.get<RiskEntry>(`/centrale-risque/risk-entries/${id}`),

  /** POST /centrale-risque/risk-entries */
  createRiskEntry: (data: Omit<RiskEntry, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<RiskEntry>('/centrale-risque/risk-entries', data),

  /** PUT /centrale-risque/risk-entries/:id */
  updateRiskEntry: (id: string, data: Partial<RiskEntry>) =>
    apiClient.put<RiskEntry>(`/centrale-risque/risk-entries/${id}`, data),

  /** DELETE /centrale-risque/risk-entries/:id */
  deleteRiskEntry: (id: string) =>
    apiClient.delete(`/centrale-risque/risk-entries/${id}`),

  // ── Incidents de paiement ────────────────────────────────────────────────

  /** GET /centrale-risque/incidents */
  getIncidents: (filters?: {
    riskEntryId?: string;
    type?: IncidentType;
    status?: IncidentStatus;
    minSeverity?: number;
    maxSeverity?: number;
    incidentDateFrom?: string;
    incidentDateTo?: string;
    minAmount?: number;
    page?: number;
    limit?: number;
  }) => {
    const p = new URLSearchParams();
    if (filters?.riskEntryId) p.append('riskEntryId', filters.riskEntryId);
    if (filters?.type) p.append('type', filters.type);
    if (filters?.status) p.append('status', filters.status);
    if (filters?.minSeverity !== undefined) p.append('minSeverity', String(filters.minSeverity));
    if (filters?.maxSeverity !== undefined) p.append('maxSeverity', String(filters.maxSeverity));
    if (filters?.incidentDateFrom) p.append('incidentDateFrom', filters.incidentDateFrom);
    if (filters?.incidentDateTo) p.append('incidentDateTo', filters.incidentDateTo);
    if (filters?.minAmount !== undefined) p.append('minAmount', String(filters.minAmount));
    if (filters?.page) p.append('page', String(filters.page));
    if (filters?.limit) p.append('limit', String(filters.limit));
    const qs = p.toString();
    return apiClient.get<CentraleRisquePaginatedResponse<Incident>>(
      `/centrale-risque/incidents${qs ? `?${qs}` : ''}`
    );
  },

  /** GET /centrale-risque/incidents/:id */
  getIncidentById: (id: string) =>
    apiClient.get<Incident>(`/centrale-risque/incidents/${id}`),

  /** POST /centrale-risque/incidents */
  createIncident: (data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<Incident>('/centrale-risque/incidents', data),

  /** PUT /centrale-risque/incidents/:id */
  updateIncident: (id: string, data: Partial<Incident>) =>
    apiClient.put<Incident>(`/centrale-risque/incidents/${id}`, data),

  /** DELETE /centrale-risque/incidents/:id */
  deleteIncident: (id: string) =>
    apiClient.delete(`/centrale-risque/incidents/${id}`),

  // ── Alertes de risque ────────────────────────────────────────────────────

  /** GET /centrale-risque/alerts */
  getAlerts: (filters?: {
    riskEntryId?: string;
    type?: AlertType;
    severity?: Severity;
    status?: AlertStatus;
    unacknowledged?: boolean;
    triggeredFrom?: string;
    triggeredTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const p = new URLSearchParams();
    if (filters?.riskEntryId) p.append('riskEntryId', filters.riskEntryId);
    if (filters?.type) p.append('type', filters.type);
    if (filters?.severity) p.append('severity', filters.severity);
    if (filters?.status) p.append('status', filters.status);
    if (filters?.unacknowledged !== undefined) p.append('unacknowledged', String(filters.unacknowledged));
    if (filters?.triggeredFrom) p.append('triggeredFrom', filters.triggeredFrom);
    if (filters?.triggeredTo) p.append('triggeredTo', filters.triggeredTo);
    if (filters?.page) p.append('page', String(filters.page));
    if (filters?.limit) p.append('limit', String(filters.limit));
    const qs = p.toString();
    return apiClient.get<CentraleRisquePaginatedResponse<Alert>>(
      `/centrale-risque/alerts${qs ? `?${qs}` : ''}`
    );
  },

  /** GET /centrale-risque/alerts/:id */
  getAlertById: (id: string) =>
    apiClient.get<Alert>(`/centrale-risque/alerts/${id}`),

  /** POST /centrale-risque/alerts */
  createAlert: (data: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'triggeredAt'>) =>
    apiClient.post<Alert>('/centrale-risque/alerts', data),

  /** PUT /centrale-risque/alerts/:id */
  updateAlert: (id: string, data: Partial<Alert>) =>
    apiClient.put<Alert>(`/centrale-risque/alerts/${id}`, data),

  /**
   * PUT /centrale-risque/alerts/:id/acknowledge
   * Body: { userId, notes? } — userId = gestionnaire qui acquitte
   */
  acknowledgeAlert: (id: string, userId: string, notes?: string) =>
    apiClient.put<Alert>(`/centrale-risque/alerts/${id}/acknowledge`, { userId, notes }),

  /** DELETE /centrale-risque/alerts/:id */
  deleteAlert: (id: string) =>
    apiClient.delete(`/centrale-risque/alerts/${id}`),

  // ── Rapports & statistiques globales ────────────────────────────────────

  /** GET /centrale-risque/stats */
  getStats: () =>
    apiClient.get<CentraleRisqueStats>('/centrale-risque/stats'),

  /**
   * GET /centrale-risque/entity/:entityId/summary
   * Résumé allégé pour une entité (company / portfolio)
   */
  getEntitySummary: (entityId: string) =>
    apiClient.get<EntityRiskSummary>(`/centrale-risque/entity/${entityId}/summary`),

  /** POST /centrale-risque/reports */
  generateReport: (data: {
    entityId: string;
    entityType?: string;
    reportType: 'summary' | 'detailed' | 'credit_history' | 'incidents' | 'exposure' | 'bcc_report';
    format?: 'json' | 'pdf' | 'excel' | 'csv';
    startDate?: string;
    endDate?: string;
    includeClosedCredits?: boolean;
    includeIncidents?: boolean;
  }) =>
    apiClient.post<RiskReport>('/centrale-risque/reports', data),

  // ── Legacy endpoints (rétrocompatibilité) ───────────────────────────────

  /** GET /centrale-risque/credit-risks */
  getCreditRisks: (companyId?: string, institutionId?: string) => {
    const p = new URLSearchParams();
    if (companyId) p.append('companyId', companyId);
    if (institutionId) p.append('institutionId', institutionId);
    const qs = p.toString();
    return apiClient.get<RiskEntry[]>(`/centrale-risque/credit-risks${qs ? `?${qs}` : ''}`);
  },

  /** GET /centrale-risque/payment-incidents */
  getPaymentIncidents: (companyId?: string, institutionId?: string) => {
    const p = new URLSearchParams();
    if (companyId) p.append('companyId', companyId);
    if (institutionId) p.append('institutionId', institutionId);
    const qs = p.toString();
    return apiClient.get<Incident[]>(`/centrale-risque/payment-incidents${qs ? `?${qs}` : ''}`);
  },

  /** GET /centrale-risque/risk-summary?companyId=uuid */
  getRiskSummary: (companyId: string) =>
    apiClient.get<EntityRiskSummary>(`/centrale-risque/risk-summary?companyId=${companyId}`),
};
