// src/services/api/shared/risk-statistics.api.ts
// API pour les statistiques de risque OHADA/BCC
// Conforme à la documentation: API DOCUMENTATION/centrale-risque/risk-statistics.md

import { apiClient } from '../base.api';
import type { RiskClass } from '../../../types/credit-contract';
import type { AlertType, Severity, AlertStatus } from '../../../types/centrale-risque';

// ============================================================================
// TYPES - Classifications de Risque OHADA/BCC
// ============================================================================

/**
 * Classification de risque avec détails
 */
export interface RiskClassificationDetail {
  count: number;
  amount: number;
  provisionRate: number;
  provisionAmount: number;
}

/**
 * Statistiques de risque du portefeuille
 * GET /risk-statistics/portfolio
 */
export interface PortfolioRiskStats {
  par30: number;                    // Portfolio at Risk > 30 jours (%)
  par90: number;                    // Portfolio at Risk > 90 jours (%)
  nplRatio: number;                 // Ratio de créances non-performantes (%)
  provisionRequired: number;        // Provision totale requise
  totalContracts: number;           // Nombre total de contrats
  totalAmount: number;              // Montant total de l'encours
  byClassification: {
    STANDARD: RiskClassificationDetail;
    WATCH: RiskClassificationDetail;
    SUBSTANDARD: RiskClassificationDetail;
    DOUBTFUL: RiskClassificationDetail;
    LOSS: RiskClassificationDetail;
  };
  calculatedAt: string;             // ISO 8601
}

/**
 * Jours de retard d'un contrat
 * GET /risk-statistics/contract/:contractId/days-overdue
 */
export interface ContractDaysOverdue {
  contractId: string;
  daysOverdue: number;
  calculatedAt: string;
}

/**
 * Résultat de mise à jour de classification
 * POST /risk-statistics/contract/:contractId/update-classification
 */
export interface ContractClassificationUpdate {
  contractId: string;
  contractNumber: string;
  riskClass: RiskClass;
  delinquencyDays: number;
  provisionRate: string;
  updatedAt: string;
}

/**
 * Seuils réglementaires OHADA/BCC
 * GET /risk-statistics/regulatory-thresholds
 */
export interface RegulatoryThresholds {
  norm: string;
  classification: {
    standard: {
      description: string;
      daysOverdue: string;
      provisionRate: string;
    };
    watch: {
      description: string;
      daysOverdue: string;
      provisionRate: string;
    };
    substandard: {
      description: string;
      daysOverdue: string;
      provisionRate: string;
    };
    doubtful: {
      description: string;
      daysOverdue: string;
      provisionRate: string;
    };
    loss: {
      description: string;
      daysOverdue: string;
      provisionRate: string;
    };
  };
  provisionRates: {
    standard: number;
    watch: number;
    substandard: number;
    doubtful: number;
    loss: number;
  };
}

/**
 * Alerte de risque active
 * GET /risk-statistics/alerts/active
 */
export interface ActiveRiskAlert {
  id: string;
  companyId: string;
  companyName: string;
  type: AlertType;
  severity: Severity;
  message: string;
  status: AlertStatus;
  triggeredAt: string;
  riskEntryId?: string;
  metadata?: {
    previousValue?: number | string;
    currentValue?: number | string;
    threshold?: number;
    resolution?: string | null;
    daysOverdue?: number;
    amount?: number;
    currency?: string;
  };
}

// ============================================================================
// API ENDPOINTS - Risk Statistics
// ============================================================================

/**
 * API des Statistiques de Risque - Conforme à la documentation OHADA/BCC
 * Base URL: /risk-statistics
 */
export const riskStatisticsApi = {
  /**
   * Récupère les statistiques globales de risque du portefeuille
   * GET /risk-statistics/portfolio
   * 
   * Inclut PAR30, PAR90, ratio NPL et provisions requises
   */
  getPortfolioStats: (institutionId?: string) => {
    const params = new URLSearchParams();
    if (institutionId) params.append('institutionId', institutionId);
    
    return apiClient.get<PortfolioRiskStats>(
      `/risk-statistics/portfolio${params.toString() ? `?${params.toString()}` : ''}`
    );
  },

  /**
   * Calcule le nombre de jours de retard pour un contrat
   * GET /risk-statistics/contract/:contractId/days-overdue
   */
  getContractDaysOverdue: (contractId: string) => {
    return apiClient.get<ContractDaysOverdue>(
      `/risk-statistics/contract/${contractId}/days-overdue`
    );
  },

  /**
   * Met à jour la classification de risque d'un contrat
   * POST /risk-statistics/contract/:contractId/update-classification
   */
  updateContractClassification: (contractId: string, daysOverdue?: number) => {
    return apiClient.post<ContractClassificationUpdate>(
      `/risk-statistics/contract/${contractId}/update-classification`,
      daysOverdue !== undefined ? { daysOverdue } : {}
    );
  },

  /**
   * Met à jour toutes les classifications de risque
   * POST /risk-statistics/update-all-classifications
   * 
   * ATTENTION: Opération lourde - utiliser avec précaution
   */
  updateAllClassifications: () => {
    return apiClient.post<{ message: string; triggeredAt: string }>(
      '/risk-statistics/update-all-classifications'
    );
  },

  /**
   * Récupère les seuils réglementaires OHADA/BCC
   * GET /risk-statistics/regulatory-thresholds
   */
  getRegulatoryThresholds: () => {
    return apiClient.get<RegulatoryThresholds>(
      '/risk-statistics/regulatory-thresholds'
    );
  },

  /**
   * Récupère les alertes de risque actives
   * GET /risk-statistics/alerts/active
   */
  getActiveAlerts: (filters?: {
    companyId?: string;
    severity?: Severity;
    type?: AlertType;
  }) => {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.type) params.append('type', filters.type);

    return apiClient.get<{ data: ActiveRiskAlert[]; total: number }>(
      `/risk-statistics/alerts/active${params.toString() ? `?${params.toString()}` : ''}`
    );
  }
};

// ============================================================================
// CONSTANTES - Classifications OHADA/BCC
// ============================================================================

/**
 * Taux de provision par classification (normes BCC)
 */
export const PROVISION_RATES = {
  STANDARD: 1,      // 1%
  WATCH: 5,         // 5%
  SUBSTANDARD: 25,  // 25%
  DOUBTFUL: 50,     // 50%
  LOSS: 100         // 100%
} as const;

/**
 * Seuils de jours de retard par classification
 */
export const DAYS_OVERDUE_THRESHOLDS = {
  STANDARD: 0,      // 0 jours
  WATCH: 1,         // 1-30 jours
  SUBSTANDARD: 31,  // 31-90 jours
  DOUBTFUL: 91,     // 91-180 jours
  LOSS: 181         // +180 jours
} as const;

/**
 * Détermine la classification de risque basée sur les jours de retard
 */
export function getRiskClassFromDaysOverdue(daysOverdue: number): RiskClass {
  if (daysOverdue >= 181) return 'loss';
  if (daysOverdue >= 91) return 'doubtful';
  if (daysOverdue >= 31) return 'substandard';
  if (daysOverdue >= 1) return 'watch';
  return 'standard';
}

/**
 * Obtient le taux de provision pour une classification
 */
export function getProvisionRate(riskClass: RiskClass): number {
  const rates: Record<RiskClass, number> = {
    standard: 1,
    watch: 5,
    substandard: 25,
    doubtful: 50,
    loss: 100
  };
  return rates[riskClass];
}
