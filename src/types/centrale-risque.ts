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
 * Types d'alertes de risque
 */
export interface RiskAlert {
  id: string;
  companyId: string;
  companyName: string;
  type: 'credit_score_drop' | 'payment_delay' | 'exposure_limit' | 'new_incident';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  metadata: {
    previousValue?: number;
    currentValue?: number;
    threshold?: number;
    details?: Record<string, unknown>;
  };
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