// src/types/centrale-risque.ts
// Types pour la Centrale de Risque conformes à l'API backend

/**
 * Profil de risque d'une entreprise
 * Correspond à l'endpoint GET /risk/central/company/${companyId}
 */
export interface CompanyRiskProfile {
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
}

/**
 * Incidents de paiement d'une entreprise
 * Correspond à l'endpoint GET /risk/central/company/${companyId}/incidents
 */
export interface PaymentIncident {
  id: string;
  companyId: string;
  type: 'cheque' | 'effet' | 'retard' | 'autre';
  amount: number;
  date: string;
  status: 'pending' | 'resolved' | 'escalated';
  description: string;
  institution: string;
  resolution?: {
    date: string;
    method: string;
    notes: string;
  };
}

/**
 * Entrée de risque dans la centrale
 * Correspond aux endpoints POST/PUT /risk/central/entries
 */
export interface CentralRiskEntry {
  id: string;
  companyId: string;
  companyName: string;
  institution: string;
  sector: string;
  riskType: 'credit' | 'leasing' | 'investment';
  amount: number;
  currency: string;
  status: 'active' | 'closed' | 'defaulted' | 'restructured';
  startDate: string;
  endDate?: string;
  creditScore: number;
  collateral?: {
    type: string;
    value: number;
    description: string;
  };
  guarantees?: Array<{
    type: string;
    amount: number;
    provider: string;
  }>;
  paymentHistory: Array<{
    date: string;
    amount: number;
    status: 'paid' | 'late' | 'missed';
    daysLate?: number;
  }>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastModifiedBy: string;
  };
}

/**
 * Statistiques de la centrale de risque
 * Correspond à l'endpoint GET /risk/central/statistics
 */
export interface CentralRiskStatistics {
  totalEntries: number;
  activeEntries: number;
  defaultedEntries: number;
  totalExposure: number;
  averageCreditScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    very_high: number;
  };
  sectorDistribution: Array<{
    sector: string;
    count: number;
    exposure: number;
    averageScore: number;
  }>;
  institutionDistribution: Array<{
    institution: string;
    count: number;
    exposure: number;
    averageScore: number;
  }>;
  trends: {
    period: string;
    newEntries: number;
    closedEntries: number;
    defaultRate: number;
    recoveryRate: number;
  };
}

/**
 * Paramètres pour la recherche d'entreprises à risque
 */
export interface RiskSearchParams {
  query?: string;
  riskCategory?: 'low' | 'medium' | 'high' | 'very_high';
  sector?: string;
  institution?: string;
  minCreditScore?: number;
  maxCreditScore?: number;
  minExposure?: number;
  maxExposure?: number;
  status?: 'active' | 'closed' | 'defaulted' | 'restructured';
  page?: number;
  limit?: number;
  sortBy?: 'creditScore' | 'exposure' | 'lastUpdate' | 'companyName';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Réponse paginée pour les recherches
 */
export interface RiskSearchResponse {
  data: CompanyRiskProfile[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Types d'alertes de risque - Conformes à la documentation API (8 valeurs)
 * Voir: API DOCUMENTATION/centrale-risque/README.md
 */
export type AlertType = 
  | 'credit_score_drop'      // Baisse du score de crédit
  | 'payment_delay'          // Retard de paiement
  | 'exposure_limit'         // Limite d'exposition atteinte
  | 'new_incident'           // Nouvel incident de paiement
  | 'risk_increase'          // Augmentation du niveau de risque
  | 'classification_change'  // Changement de classification OHADA/BCC
  | 'payment_missed'         // Échéance manquée
  | 'provisioning_required'; // Provisionnement requis

/**
 * Statuts d'alerte - Conformes à la documentation API
 */
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';

export interface RiskAlert {
  id: string;
  companyId: string;
  companyName?: string;
  type: AlertType;
  severity: Severity;
  message: string;
  status?: AlertStatus;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  isAcknowledged?: boolean;
  riskEntryId?: string;
  metadata?: {
    previousValue?: number | string;
    currentValue?: number | string;
    threshold?: number;
    details?: Record<string, unknown>;
    resolution?: string;
    daysOverdue?: number;
    amount?: number;
    currency?: string;
  };
  recommendations?: string[];
}

/**
 * Configuration des seuils de risque
 */
export interface RiskThresholds {
  creditScore: {
    low: number;
    medium: number;
    high: number;
  };
  exposureLimit: number;
  paymentDelayDays: number;
  defaultProbability: number;
}

// ============================================================================
// TYPES CONFORMES À LA DOCUMENTATION API /centrale-risque
// ============================================================================

/**
 * Types de risque
 */
export type RiskType = 'credit' | 'leasing' | 'investment';

/**
 * Statuts d'entrée de risque
 */
export type RiskEntryStatus = 'active' | 'closed' | 'defaulted' | 'restructured';

/**
 * Types d'incident
 */
export type IncidentType = 'cheque' | 'effet' | 'retard' | 'autre';

/**
 * Statuts d'incident
 */
export type IncidentStatus = 'pending' | 'resolved' | 'escalated';

/**
 * Sévérité
 */
export type Severity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Entrée de risque conforme à la documentation API
 * GET /centrale-risque/risk-entries
 */
export interface RiskEntry {
  id: string;
  companyId: string;
  companyName: string;
  institutionId: string;
  institutionName: string;
  riskType: RiskType;
  amount: number;
  currency: string;
  outstandingAmount: number;
  startDate: string;
  endDate?: string;
  status: RiskEntryStatus;
  creditScore: number;
  riskCategory: 'low' | 'medium' | 'high' | 'very_high';
  guarantees?: Array<{
    type: string;
    value: number;
    description: string;
  }>;
  paymentHistory?: Array<{
    date: string;
    amount: number;
    status: 'paid' | 'late' | 'missed';
    daysLate?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Incident de paiement conforme à la documentation API
 * GET /centrale-risque/incidents
 */
export interface Incident {
  id: string;
  companyId: string;
  companyName: string;
  institutionId: string;
  institutionName: string;
  type: IncidentType;
  amount: number;
  currency: string;
  date: string;
  status: IncidentStatus;
  severity: Severity;
  description: string;
  reportedBy: string;
  resolution?: {
    date: string;
    method: string;
    notes: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Alerte conforme à la documentation API
 * GET /centrale-risque/alerts
 */
export interface Alert {
  id: string;
  companyId: string;
  companyName: string;
  type: AlertType;
  severity: Severity;
  title: string;
  message: string;
  status?: AlertStatus;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  acknowledgedNotes?: string;
  riskEntryId?: string;
  recommendations?: string[];
  triggeredAt: string;
  createdAt: string;
  metadata?: {
    previousValue?: number | string;
    currentValue?: number | string;
    threshold?: number;
    details?: Record<string, unknown>;
    resolution?: string;
    daysOverdue?: number;
    amount?: number;
    currency?: string;
  };
}

/**
 * Statistiques globales de la centrale de risque
 * GET /centrale-risque/stats
 */
export interface CentraleRisqueStats {
  totalRiskEntries: number;
  activeRiskEntries: number;
  closedRiskEntries: number;
  defaultedRiskEntries: number;
  totalExposure: number;
  averageCreditScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    veryHigh: number;
  };
  incidentsSummary: {
    total: number;
    pending: number;
    resolved: number;
    escalated: number;
  };
  alertsSummary: {
    total: number;
    unacknowledged: number;
    acknowledged: number;
  };
  sectorDistribution: Array<{
    sector: string;
    count: number;
    exposure: number;
  }>;
  lastUpdated: string;
}

/**
 * Résumé de risque d'une entité
 * GET /centrale-risque/entity/:entityId/summary
 */
export interface EntityRiskSummary {
  entityId: string;
  entityName: string;
  entityType: 'company' | 'institution';
  creditScore: number;
  riskCategory: 'low' | 'medium' | 'high' | 'very_high';
  totalExposure: number;
  activeLoans: number;
  defaultedLoans: number;
  incidentsCount: number;
  alertsCount: number;
  financialHealth: {
    solvabilite: number;
    liquidite: number;
    rentabilite: number;
    endettement: number;
  };
  lastUpdate: string;
}