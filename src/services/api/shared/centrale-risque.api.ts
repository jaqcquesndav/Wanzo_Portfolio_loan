// src/services/api/shared/centrale-risque.api.ts
import { apiClient } from '../base.api';

/**
 * API pour la centrale de risque
 */
export const centraleRisqueApi = {
  /**
   * Recherche des informations de risque pour une entreprise
   */
  getCompanyRiskProfile: (companyId: string) => {
    return apiClient.get<{
      companyId: string;
      companyName: string;
      creditScore: number;
      riskCategory: 'low' | 'medium' | 'high' | 'very_high';
      financialHealth: {
        solvabilite: number;
        liquidite: number;
        rentabilite: number;
        endettement: number;
        scoreGlobal: number;
      };
      creditHistory: {
        encoursTotalActuel: number;
        encoursTotalHistorique: number;
        repartitionParType: {
          creditsBancaires: number;
          creditsBail: number;
          lignesDeCredit: number;
          autres: number;
        };
        incidents: {
          total: number;
          cheques: number;
          effets: number;
          retards: number;
        };
      };
      defaultProbability: number;
      recommendedActions: string[];
      lastUpdate: string;
    }>(`/risk/central/company/${companyId}`);
  },

  /**
   * Récupère les incidents de paiement pour une entreprise
   */
  getCompanyPaymentIncidents: (companyId: string, period?: string) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);

    return apiClient.get<{
      companyId: string;
      companyName: string;
      incidents: Array<{
        id: string;
        type: 'cheque' | 'effet' | 'retard' | 'defaut';
        date: string;
        amount: number;
        days?: number;
        institution: string;
        description: string;
        status: 'ouvert' | 'régularisé';
        regularisationDate?: string;
      }>;
      summary: {
        totalIncidents: number;
        totalAmount: number;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        averageDaysLate: number;
      };
    }>(`/risk/central/company/${companyId}/incidents?${params.toString()}`);
  },

  /**
   * Récupère les engagements d'une entreprise
   */
  getCompanyEngagements: (companyId: string) => {
    return apiClient.get<{
      companyId: string;
      companyName: string;
      totalEngagement: number;
      engagements: Array<{
        id: string;
        institution: string;
        type: 'credit' | 'leasing' | 'ligne_credit' | 'garantie' | 'autre';
        startDate: string;
        endDate?: string;
        initialAmount: number;
        currentAmount: number;
        currency: string;
        status: 'actif' | 'cloture' | 'en_defaut';
        paymentStatus: 'normal' | 'retard' | 'defaut';
        daysLate?: number;
      }>;
      summary: {
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        byPaymentStatus: Record<string, number>;
      };
    }>(`/risk/central/company/${companyId}/engagements`);
  },

  /**
   * Ajoute une entrée de risque pour une entreprise
   */
  addRiskEntry: (entry: {
    companyId: string;
    type: 'incident_paiement' | 'credit' | 'defaut' | 'alerte' | 'autre';
    date: string;
    amount?: number;
    description: string;
    severity: 'low' | 'medium' | 'high';
    source: string;
    attachmentUrls?: string[];
  }) => {
    return apiClient.post<{
      id: string;
      companyId: string;
      type: 'incident_paiement' | 'credit' | 'defaut' | 'alerte' | 'autre';
      date: string;
      amount?: number;
      description: string;
      severity: 'low' | 'medium' | 'high';
      source: string;
      attachmentUrls?: string[];
      created_at: string;
    }>('/risk/central/entries', entry);
  },

  /**
   * Met à jour une entrée de risque
   */
  updateRiskEntry: (id: string, updates: {
    type?: 'incident_paiement' | 'credit' | 'defaut' | 'alerte' | 'autre';
    date?: string;
    amount?: number;
    description?: string;
    severity?: 'low' | 'medium' | 'high';
    status?: 'active' | 'resolved' | 'false_positive';
    resolution?: string;
    attachmentUrls?: string[];
  }) => {
    return apiClient.put<{
      id: string;
      companyId: string;
      type: 'incident_paiement' | 'credit' | 'defaut' | 'alerte' | 'autre';
      date: string;
      amount?: number;
      description: string;
      severity: 'low' | 'medium' | 'high';
      status: 'active' | 'resolved' | 'false_positive';
      resolution?: string;
      source: string;
      attachmentUrls?: string[];
      created_at: string;
      updated_at: string;
    }>(`/risk/central/entries/${id}`, updates);
  },

  /**
   * Récupère les alertes de risque actives
   */
  getActiveRiskAlerts: (filters?: {
    severity?: 'low' | 'medium' | 'high';
    type?: 'market' | 'credit' | 'operational' | 'compliance' | 'liquidity';
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient.get<{
      data: Array<{
        id: string;
        type: 'market' | 'credit' | 'operational' | 'compliance' | 'liquidity';
        severity: 'low' | 'medium' | 'high';
        title: string;
        description: string;
        affectedEntities: Array<{
          id: string;
          type: 'company' | 'portfolio' | 'sector' | 'region';
          name: string;
        }>;
        createdAt: string;
        status: 'new' | 'acknowledged' | 'in_progress' | 'resolved';
      }>;
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/risk/central/alerts?${params.toString()}`);
  },

  /**
   * Récupère les statistiques de risque
   */
  getRiskStatistics: () => {
    return apiClient.get<{
      totalCompanies: number;
      riskDistribution: {
        low: number;
        medium: number;
        high: number;
        very_high: number;
      };
      sectorRiskHeatmap: Array<{
        sector: string;
        riskScore: number;
        exposure: number;
        companies: number;
      }>;
      defaultRates: {
        overall: number;
        byCompanySize: Record<string, number>;
        bySector: Record<string, number>;
      };
      trends: {
        period: string;
        defaultRate: Array<{ date: string; value: number }>;
        riskDistribution: Array<{ date: string; low: number; medium: number; high: number; very_high: number }>;
      };
    }>('/risk/central/statistics');
  },

  /**
   * Récupère le rapport de risque complet
   */
  getFullRiskReport: (companyId: string) => {
    return apiClient.get<{
      companyId: string;
      companyName: string;
      generateDate: string;
      creditScore: number;
      riskCategory: 'low' | 'medium' | 'high' | 'very_high';
      financialAnalysis: {
        balanceSheet: Record<string, number>;
        incomeStatement: Record<string, number>;
        cashFlow: Record<string, number>;
        keyRatios: Record<string, number>;
        trends: Record<string, Array<{ year: string; value: number }>>;
      };
      creditHistory: {
        engagements: Array<{
          institution: string;
          type: string;
          amount: number;
          startDate: string;
          status: string;
        }>;
        incidents: Array<{
          type: string;
          date: string;
          amount: number;
          status: string;
        }>;
      };
      marketAnalysis: {
        sectorRisk: number;
        sectorTrend: string;
        competitivePosition: string;
        marketShareTrend: string;
      };
      managementAssessment: {
        experienceScore: number;
        stabilityScore: number;
        complianceScore: number;
        observations: string[];
      };
      recommendation: {
        maxExposure: number;
        suggestedCollateral: string[];
        monitoringFrequency: string;
        additionalConditions: string[];
      };
    }>(`/risk/central/company/${companyId}/full-report`);
  },

  /**
   * Récupère l'historique des risques
   */
  getRiskHistory: (companyId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return apiClient.get<{
      companyId: string;
      companyName: string;
      history: Array<{
        date: string;
        creditScore: number;
        riskCategory: 'low' | 'medium' | 'high' | 'very_high';
        significantChanges?: {
          type: string;
          description: string;
          impact: 'positive' | 'negative' | 'neutral';
        }[];
      }>;
      trend: 'improving' | 'stable' | 'deteriorating';
      volatility: number;
    }>(`/risk/central/company/${companyId}/history?${params.toString()}`);
  }
};

// ============================================================================
// API CONFORME À LA DOCUMENTATION - /centrale-risque
// ============================================================================

import type { 
  RiskEntry, 
  Incident, 
  Alert, 
  CentraleRisqueStats, 
  EntityRiskSummary,
  RiskType,
  RiskEntryStatus,
  IncidentType,
  IncidentStatus,
  Severity
} from '../../../types/centrale-risque';

/**
 * API de la Centrale des Risques - Conforme à la documentation officielle
 * Base URL: /centrale-risque
 */
export const centraleRisqueApiV2 = {
  // ============================================================================
  // 1. ENTRÉES DE RISQUE (Risk Entries)
  // ============================================================================

  /**
   * Liste des entrées de risque
   * GET /centrale-risque/risk-entries
   */
  getRiskEntries: (filters?: {
    companyId?: string;
    institutionId?: string;
    riskType?: RiskType;
    status?: RiskEntryStatus;
    minCreditScore?: number;
    maxCreditScore?: number;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.institutionId) params.append('institutionId', filters.institutionId);
    if (filters?.riskType) params.append('riskType', filters.riskType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.minCreditScore) params.append('minCreditScore', filters.minCreditScore.toString());
    if (filters?.maxCreditScore) params.append('maxCreditScore', filters.maxCreditScore.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient.get<{
      data: RiskEntry[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/centrale-risque/risk-entries?${params.toString()}`);
  },

  /**
   * Détail d'une entrée de risque
   * GET /centrale-risque/risk-entries/:id
   */
  getRiskEntryById: (id: string) => {
    return apiClient.get<RiskEntry>(`/centrale-risque/risk-entries/${id}`);
  },

  /**
   * Créer une entrée de risque
   * POST /centrale-risque/risk-entries
   */
  createRiskEntry: (data: Omit<RiskEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiClient.post<RiskEntry>('/centrale-risque/risk-entries', data);
  },

  /**
   * Mettre à jour une entrée de risque
   * PUT /centrale-risque/risk-entries/:id
   */
  updateRiskEntry: (id: string, data: Partial<RiskEntry>) => {
    return apiClient.put<RiskEntry>(`/centrale-risque/risk-entries/${id}`, data);
  },

  /**
   * Supprimer une entrée de risque
   * DELETE /centrale-risque/risk-entries/:id
   */
  deleteRiskEntry: (id: string) => {
    return apiClient.delete(`/centrale-risque/risk-entries/${id}`);
  },

  // ============================================================================
  // 2. INCIDENTS DE PAIEMENT
  // ============================================================================

  /**
   * Liste des incidents
   * GET /centrale-risque/incidents
   */
  getIncidents: (filters?: {
    companyId?: string;
    type?: IncidentType;
    status?: IncidentStatus;
    severity?: Severity;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient.get<{
      data: Incident[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/centrale-risque/incidents?${params.toString()}`);
  },

  /**
   * Détail d'un incident
   * GET /centrale-risque/incidents/:id
   */
  getIncidentById: (id: string) => {
    return apiClient.get<Incident>(`/centrale-risque/incidents/${id}`);
  },

  /**
   * Créer un incident
   * POST /centrale-risque/incidents
   */
  createIncident: (data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiClient.post<Incident>('/centrale-risque/incidents', data);
  },

  /**
   * Mettre à jour un incident
   * PUT /centrale-risque/incidents/:id
   */
  updateIncident: (id: string, data: Partial<Incident>) => {
    return apiClient.put<Incident>(`/centrale-risque/incidents/${id}`, data);
  },

  /**
   * Supprimer un incident
   * DELETE /centrale-risque/incidents/:id
   */
  deleteIncident: (id: string) => {
    return apiClient.delete(`/centrale-risque/incidents/${id}`);
  },

  // ============================================================================
  // 3. ALERTES DE RISQUE
  // ============================================================================

  /**
   * Liste des alertes
   * GET /centrale-risque/alerts
   */
  getAlerts: (filters?: {
    companyId?: string;
    type?: string;
    severity?: Severity;
    isAcknowledged?: boolean;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.isAcknowledged !== undefined) params.append('isAcknowledged', filters.isAcknowledged.toString());
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient.get<{
      data: Alert[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/centrale-risque/alerts?${params.toString()}`);
  },

  /**
   * Détail d'une alerte
   * GET /centrale-risque/alerts/:id
   */
  getAlertById: (id: string) => {
    return apiClient.get<Alert>(`/centrale-risque/alerts/${id}`);
  },

  /**
   * Créer une alerte
   * POST /centrale-risque/alerts
   */
  createAlert: (data: Omit<Alert, 'id' | 'createdAt' | 'triggeredAt'>) => {
    return apiClient.post<Alert>('/centrale-risque/alerts', data);
  },

  /**
   * Mettre à jour une alerte
   * PUT /centrale-risque/alerts/:id
   */
  updateAlert: (id: string, data: Partial<Alert>) => {
    return apiClient.put<Alert>(`/centrale-risque/alerts/${id}`, data);
  },

  /**
   * Acquitter une alerte
   * PUT /centrale-risque/alerts/:id/acknowledge
   */
  acknowledgeAlert: (id: string, notes?: string) => {
    return apiClient.put<Alert>(`/centrale-risque/alerts/${id}/acknowledge`, { notes });
  },

  /**
   * Rejeter/Ignorer une alerte
   * PUT /centrale-risque/alerts/:id/dismiss
   */
  dismissAlert: (id: string, reason?: string) => {
    return apiClient.put<Alert>(`/centrale-risque/alerts/${id}/dismiss`, { reason });
  },

  /**
   * Supprimer une alerte
   * DELETE /centrale-risque/alerts/:id
   */
  deleteAlert: (id: string) => {
    return apiClient.delete(`/centrale-risque/alerts/${id}`);
  },

  // ============================================================================
  // 4. RAPPORTS ET STATISTIQUES
  // ============================================================================

  /**
   * Statistiques globales
   * GET /centrale-risque/stats
   */
  getStats: () => {
    return apiClient.get<CentraleRisqueStats>('/centrale-risque/stats');
  },

  /**
   * Résumé de risque d'une entité
   * GET /centrale-risque/entity/:entityId/summary
   */
  getEntitySummary: (entityId: string, entityType: 'company' | 'portfolio' = 'company') => {
    return apiClient.get<EntityRiskSummary>(`/centrale-risque/entity/${entityId}/summary?type=${entityType}`);
  },

  /**
   * Générer un rapport de risque
   * POST /centrale-risque/reports
   */
  generateReport: (data: {
    entityId: string;
    reportType: 'full' | 'summary' | 'incidents' | 'trends';
    periodStart?: string;
    periodEnd?: string;
    format?: 'pdf' | 'excel' | 'json';
  }) => {
    return apiClient.post<{ reportId: string; url?: string; status: string }>('/centrale-risque/reports', data);
  },

  // ============================================================================
  // 5. ENDPOINTS LEGACY (Compatibilité)
  // ============================================================================

  /**
   * GET /centrale-risque/credit-risks
   */
  getCreditRisks: () => {
    return apiClient.get<RiskEntry[]>('/centrale-risque/credit-risks');
  },

  /**
   * GET /centrale-risque/payment-incidents
   */
  getPaymentIncidents: () => {
    return apiClient.get<Incident[]>('/centrale-risque/payment-incidents');
  },

  /**
   * GET /centrale-risque/risk-summary?companyId={companyId}
   */
  getRiskSummary: (companyId: string) => {
    return apiClient.get<EntityRiskSummary>(`/centrale-risque/risk-summary?companyId=${companyId}`);
  }
};
