// src/types/centrale-risque.ts
// Types pour la Centrale de Risque — conformes à l'API backend (pas de wrapper success/data)

// ============================================================================
// ENUMS (valeurs exactes retournées par le backend)
// ============================================================================

/** Catégorie de risque — champ `category` dans RiskEntry */
export type RiskCategory =
  | 'CREDIT' | 'LEASING' | 'INVESTMENT'
  | 'MARKET' | 'OPERATIONAL' | 'LIQUIDITY' | 'COUNTRY';

/** Type d'entité risque — champ `riskType` dans RiskEntry */
export type RiskEntityType = 'BUSINESS' | 'INDIVIDUAL' | 'SYSTEMIC' | 'CONCENTRATION';

/** Statut d'une entrée de risque */
export type RiskEntryStatus =
  | 'active' | 'defaulted' | 'completed'
  | 'in_litigation' | 'written_off' | 'restructured';

/** Type d'incident — valeurs exactes backend */
export type IncidentType =
  | 'LATE_PAYMENT' | 'MISSED_PAYMENT' | 'PARTIAL_PAYMENT'
  | 'DEFAULT' | 'LITIGATION' | 'WRITTEN_OFF';

/** Statut d'incident */
export type IncidentStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED';

/** Type d'alerte */
export type AlertType =
  | 'OVERDUE' | 'DEFAULT_RISK' | 'CONCENTRATION'
  | 'REGULATORY' | 'LIQUIDITY' | 'FRAUD';

/** Statut d'alerte */
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'EXPIRED' | 'PENDING';

/** Sévérité */
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/** Classification de risque OHADA/BCC */
export type RiskClass = 'STANDARD' | 'WATCH' | 'SUBSTANDARD' | 'DOUBTFUL' | 'LOSS';

// ============================================================================
// OBJETS PRINCIPAUX (retournés directement, sans wrapper)
// ============================================================================

/**
 * Entrée de risque — GET /centrale-risque/risk-entries/:id
 * Créée automatiquement lors des transitions DEFAULTED/IN_LITIGATION/WRITTEN_OFF
 */
export interface RiskEntry {
  id: string;
  companyId: string;
  companyName: string;
  institution: string;
  portfolioId: string;
  entityId: string;
  entityType: 'corporate' | 'individual';
  entityName: string;
  sector: string;
  reportingInstitutionId: string;
  creditId: string;
  category: RiskCategory;
  riskType: RiskEntityType;
  amount: number;
  currency: string;
  outstandingAmount: number;
  creditScore: number;
  status: RiskEntryStatus;
  startDate: string;
  endDate?: string;
  collateral?: Array<{ type: string; value: number; description: string }>;
  guarantees?: Array<{ type: string; provider: string; amount: number }>;
  paymentHistory?: Array<{
    date: string;
    amount: number;
    status: 'paid' | 'missed' | 'late';
    daysLate?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Incident de paiement — GET /centrale-risque/incidents/:id
 * Créé automatiquement lors des transitions de contrat
 */
export interface Incident {
  id: string;
  riskEntryId: string;
  type: IncidentType;
  description: string;
  amount: number;
  daysOverdue: number;
  incidentDate: string;
  severity: number; // 1-10
  status: IncidentStatus;
  resolvedDate?: string | null;
  resolution?: { date: string; method: string; notes: string } | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Alerte de risque — GET /centrale-risque/alerts/:id
 * Créée automatiquement selon les transitions de contrat
 */
export interface Alert {
  id: string;
  riskEntryId: string;
  type: AlertType;
  severity: Severity;
  message: string;
  status: AlertStatus;
  triggeredAt: string;
  acknowledgedAt?: string | null;
  acknowledgedBy?: string | null;
  metadata?: {
    threshold?: number;
    currentValue?: number;
    previousValue?: number;
    period?: string;
    affectedEntities?: string[];
    recommendedActions?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Statistiques globales — GET /centrale-risque/stats
 */
export interface CentraleRisqueStats {
  date: string;
  totalEntries: number;
  activeEntries: number;
  uniqueEntities: number;
  totalExposure: number;
  totalOutstanding: number;
  activeIncidents: number;
  activeAlerts: number;
  byCategory: Record<string, number>;
  bySector: Record<string, number>;
  currency: string;
}

/**
 * Résumé de risque d'une entité — GET /centrale-risque/entity/:entityId/summary
 */
export interface EntityRiskSummary {
  entityId: string;
  entityName: string;
  entityType: string;
  sector: string;
  creditScore: number;
  totalCredits: number;
  activeCredits: number;
  totalExposure: number;
  totalOutstanding: number;
  currency: string;
  totalIncidents: number;
  activeIncidents: number;
  activeAlerts: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastUpdated: string;
}

/**
 * Vue rapide dashboard — GET /risk/summary
 */
export interface RiskDashboardSummary {
  entries: {
    total: number;
    active: number;
    defaulted: number;
    inLitigation: number;
    writtenOff: number;
  };
  alerts: {
    total: number;
    critical: number;
    high: number;
    pending: number;
  };
  recentDefaulted: Array<{
    id: string;
    companyId: string;
    companyName: string;
    institution: string;
    amount: number;
    currency: string;
    updatedAt: string;
  }>;
  recentLitigation: Array<{
    id: string;
    companyId: string;
    companyName: string;
    institution: string;
    amount: number;
    currency: string;
    updatedAt: string;
  }>;
}

/**
 * Rapport de risque — réponse POST /centrale-risque/reports
 */
export interface RiskReport {
  reportId: string;
  generatedAt: string;
  reportType: string;
  period: { start: string; end: string };
  summary: EntityRiskSummary & { totalCredits: number; latePayments?: number };
  creditHistory?: Array<{
    creditId: string;
    institution: string;
    creditType: string;
    originalAmount: number;
    outstandingAmount: number;
    startDate: string;
    endDate: string;
    status: string;
    paymentPerformance: number;
    latePayments: number;
  }>;
  incidents?: Incident[];
  alerts?: Alert[];
  recommendations?: string[];
}

/** Alias pour rétrocompatibilité — RiskType = RiskEntityType */
export type RiskType = RiskEntityType;

/**
 * Réponse paginée plate (pas de wrapper meta) — utilisée par
 * /centrale-risque/risk-entries, /incidents, /alerts
 */
export interface CentraleRisquePaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Statistiques PAR/NPL portefeuille — GET /risk-statistics/portfolio
 */
export interface PortfolioStats {
  par30: number;
  par90: number;
  nplRatio: number;
  provisionRequired: number;
  totalContracts: number;
  totalAmount: number;
  byClassification: Partial<Record<RiskClass, { count: number; amount: number; provisionRate: number }>>;
}

/**
 * Résultat de mise à jour de classification — POST /risk-statistics/contract/:id/update-classification
 */
export interface ContractClassification {
  contractId: string;
  contractNumber: string;
  riskClass: RiskClass;
  delinquencyDays: number;
  provisionRate: string;
  updatedAt: string;
}

/**
 * Seuils réglementaires BCC/OHADA — GET /risk-statistics/regulatory-thresholds
 */
export interface RegulatoryThresholds {
  classification: Record<string, string>;
  provisionRates: Record<string, number>;
}

/**
 * Configuration BCC/OHADA par institution — GET /bcc/configuration/:institutionId
 */
export interface BCCConfiguration {
  institutionId: string;
  norm: string;
  regulatoryBody: string;
  classificationThresholds: {
    watchDays: number;
    substandardDays: number;
    doubtfulDays: number;
    lossDays: number;
  };
  provisionRates: Record<string, number>;
  classificationLabels: Partial<Record<RiskClass, string>>;
}

// ============================================================================
// LEGACY — conservés pour compatibilité avec composants non encore migrés
// ============================================================================

/**
 * @deprecated Utiliser RiskEntry à la place
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

// === end of centrale-risque types ===
// The old PaymentIncident, CentralRiskEntry, CentralRiskStatistics, RiskSearchParams,
// AlertType, AlertStatus, RiskAlert, RiskThresholds, RiskType, RiskEntryStatus,
// IncidentType, IncidentStatus, Severity, RiskEntry, Incident, Alert,

