// src/services/api/shared/dashboard-ohada.api.ts
// Service API Dashboard conforme à la documentation OHADA

import { apiClient } from '../base.api';
import { ApiError } from '../base.api';
import { API_ENDPOINTS } from '../endpoints';

/**
 * Types conformes à la documentation dashboard/traditional/types.md
 */
export interface BalanceAGE {
  current: number; // 0-30 jours (%)
  days30: number; // 31-60 jours (%)
  days60: number; // 61-90 jours (%)
  days90Plus: number; // 90+ jours (%)
}

export interface RegulatoryCompliance {
  bceaoCompliant: boolean; // Conformité BCEAO (NPL < 5%)
  ohadaProvisionCompliant: boolean; // Conformité OHADA provisions
  riskRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
}

export interface OHADAMetrics {
  id: string;
  name: string;
  sector: string;
  
  // Métriques financières de base
  totalAmount: number;
  activeContracts: number;
  avgLoanSize: number;
  
  // Ratios OHADA critiques
  nplRatio: number; // NPL ratio (%)
  provisionRate: number; // Taux de provisionnement (%)
  collectionEfficiency: number; // Efficacité de recouvrement (%)
  
  // Balance âgée conforme OHADA
  balanceAGE: BalanceAGE;
  
  // Ratios de performance
  roa: number; // Return on Assets (%)
  portfolioYield: number; // Rendement du portefeuille (%)
  /** Accepte valeurs backend 'LOW'|'MEDIUM'|'HIGH' et labels FR 'Faible'|'Moyen'|'Élevé' */
  riskLevel: 'Faible' | 'Moyen' | 'Élevé' | 'LOW' | 'MEDIUM' | 'HIGH';
  growthRate: number; // Taux de croissance (%)
  
  // Données temporelles
  monthlyPerformance: number[];
  lastActivity: string;
  
  // Conformité réglementaire
  regulatoryCompliance?: RegulatoryCompliance;
}

/** Normalise une entrée OHADAMetrics brute venant du backend */
function normalizeMetrics(raw: OHADAMetrics): OHADAMetrics {
  const riskMap: Record<string, 'Faible' | 'Moyen' | 'Élevé'> = {
    LOW: 'Faible', MEDIUM: 'Moyen', HIGH: 'Élevé',
    Faible: 'Faible', Moyen: 'Moyen', 'Élevé': 'Élevé'
  };
  return {
    ...raw,
    totalAmount: typeof raw.totalAmount === 'string' ? parseFloat(raw.totalAmount) || 0 : raw.totalAmount,
    avgLoanSize: typeof raw.avgLoanSize === 'string' ? parseFloat(raw.avgLoanSize as unknown as string) || 0 : raw.avgLoanSize,
    nplRatio: typeof raw.nplRatio === 'string' ? parseFloat(raw.nplRatio as unknown as string) || 0 : raw.nplRatio,
    provisionRate: typeof raw.provisionRate === 'string' ? parseFloat(raw.provisionRate as unknown as string) || 0 : raw.provisionRate,
    collectionEfficiency: typeof raw.collectionEfficiency === 'string' ? parseFloat(raw.collectionEfficiency as unknown as string) || 0 : raw.collectionEfficiency,
    roa: typeof raw.roa === 'string' ? parseFloat(raw.roa as unknown as string) || 0 : raw.roa,
    portfolioYield: typeof raw.portfolioYield === 'string' ? parseFloat(raw.portfolioYield as unknown as string) || 0 : raw.portfolioYield,
    growthRate: typeof raw.growthRate === 'string' ? parseFloat(raw.growthRate as unknown as string) || 0 : raw.growthRate,
    riskLevel: riskMap[raw.riskLevel as string] ?? 'Faible',
  };
}

export interface OHADAMetricsResponse {
  success: boolean;
  data: OHADAMetrics[];
  metadata: {
    totalPortfolios: number;
    calculationDate: string;
    regulatoryFramework: 'OHADA' | 'BCEAO';
    complianceStatus: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
  };
  benchmarks: {
    avgNplRatio: number; // Seuil BCEAO: 5%
    avgProvisionRate: number; // Norme OHADA: 3-5%
    avgROA: number; // Marché CEMAC: 3.2%
    avgYield: number; // Marché: 14.5%
    collectionEfficiency: number; // Standard: 90%
  };
}

export interface ComplianceSummary {
  status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
  riskLevel: 'Faible' | 'Moyen' | 'Élevé';
  totalPortfolios: number;
  nonCompliantCount: number;
  complianceRate: string;
  details: {
    bceaoCompliance: {
      threshold: number;
      currentAvg: number;
      compliantCount: number;
      status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
    };
    ohadaProvisionCompliance: {
      minThreshold: number;
      maxThreshold: number;
      currentAvg: number;
      compliantCount: number;
      status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
    };
  };
}

export enum WidgetType {
  // KPI Widgets
  OVERVIEW_METRICS = 'overview_metrics',
  PORTFOLIO_PERFORMANCE = 'portfolio_performance',
  RISK_INDICATORS = 'risk_indicators',
  
  // Analysis Widgets
  BALANCE_AGE_ANALYSIS = 'balance_age_analysis',
  SECTOR_DISTRIBUTION = 'sector_distribution',
  GEOGRAPHIC_DISTRIBUTION = 'geographic_distribution',
  PERFORMANCE_TRENDS = 'performance_trends',
  
  // Compliance Widgets
  REGULATORY_COMPLIANCE = 'regulatory_compliance',
  RISK_ASSESSMENT = 'risk_assessment',
  
  // Activity Widgets
  RECENT_ACTIVITIES = 'recent_activities',
  PORTFOLIO_HEALTH = 'portfolio_health',
  CLIENT_DISTRIBUTION = 'client_distribution'
}

export interface DashboardPreferences {
  userId: string;
  widgets: Record<WidgetType, {
    visible: boolean;
    position: number;
    config?: Record<string, unknown>;
  }>;
  selectorPosition?: {
    x: number;
    y: number;
    minimized: boolean;
  };
  lastUpdated: string;
}

/**
 * Données mockées conformes aux standards OHADA
 */
const mockOHADAData: OHADAMetrics[] = [
  {
    id: "port-001",
    name: "PME Cameroun",
    sector: "PME",
    totalAmount: 2500000000,
    activeContracts: 156,
    avgLoanSize: 16025641,
    nplRatio: 3.2,
    provisionRate: 4.1,
    collectionEfficiency: 92.3,
    balanceAGE: {
      current: 72.5,
      days30: 18.3,
      days60: 6.1,
      days90Plus: 3.1
    },
    roa: 3.8,
    portfolioYield: 15.2,
    riskLevel: "Faible",
    growthRate: 8.5,
    monthlyPerformance: [12.1, 13.2, 14.5, 15.1, 15.8, 16.2, 15.9, 16.1, 15.7, 16.3, 16.8, 17.2],
    lastActivity: "2025-11-04T10:30:00Z",
    regulatoryCompliance: {
      bceaoCompliant: true,
      ohadaProvisionCompliant: true,
      riskRating: "A"
    }
  }
];

const mockComplianceSummary: ComplianceSummary = {
  status: "COMPLIANT",
  riskLevel: "Faible",
  totalPortfolios: 8,
  nonCompliantCount: 0,
  complianceRate: "100.0",
  details: {
    bceaoCompliance: {
      threshold: 5.0,
      currentAvg: 4.1,
      compliantCount: 8,
      status: "COMPLIANT"
    },
    ohadaProvisionCompliance: {
      minThreshold: 3.0,
      maxThreshold: 5.0,
      currentAvg: 3.9,
      compliantCount: 8,
      status: "COMPLIANT"
    }
  }
};

/**
 * API Dashboard OHADA conforme à la documentation
 */
export const dashboardOHADAApi = {
  /**
   * GET /metrics/ohada
   * Récupère toutes les métriques OHADA des portefeuilles traditionnels
   */
  async getOHADAMetrics(): Promise<OHADAMetricsResponse> {
    try {
      console.log('🔄 Récupération métriques OHADA...');
      const response = await apiClient.get<OHADAMetricsResponse>(API_ENDPOINTS.dashboard.metrics.ohada);
      console.log('✅ Métriques OHADA récupérées avec succès');
      return {
        ...response,
        data: response.data.map(normalizeMetrics)
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        console.warn('⚠️ Endpoint OHADA non disponible, utilisation des données mockées conformes');
        return {
          success: true,
          data: mockOHADAData,
          metadata: {
            totalPortfolios: 8,
            calculationDate: new Date().toISOString(),
            regulatoryFramework: 'OHADA',
            complianceStatus: 'COMPLIANT'
          },
          benchmarks: {
            avgNplRatio: 4.2,
            avgProvisionRate: 3.8,
            avgROA: 3.2,
            avgYield: 14.5,
            collectionEfficiency: 90.0
          }
        };
      }
      throw error;
    }
  },

  /**
   * GET /metrics/portfolio/{portfolioId}
   * Récupère les métriques OHADA pour un portefeuille spécifique
   */
  async getPortfolioMetrics(portfolioId: string): Promise<{ success: boolean; data: OHADAMetrics }> {
    try {
      console.log(`🔄 Récupération métriques portefeuille ${portfolioId}...`);
      const response = await apiClient.get<{ success: boolean; data: OHADAMetrics }>(
        API_ENDPOINTS.dashboard.metrics.portfolio(portfolioId)
      );
      console.log('✅ Métriques portefeuille récupérées avec succès');
      return { ...response, data: normalizeMetrics(response.data) };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        console.warn(`⚠️ Endpoint portefeuille ${portfolioId} non disponible, utilisation des données mockées`);
        return {
          success: true,
          data: { ...mockOHADAData[0], id: portfolioId }
        };
      }
      throw error;
    }
  },

  /**
   * GET /metrics/global
   * Récupère les métriques globales agrégées de tous les portefeuilles
   */
  async getGlobalMetrics(): Promise<{ success: boolean; data: OHADAMetrics }> {
    try {
      console.log('🔄 Récupération métriques globales...');
      const response = await apiClient.get<{ success: boolean; data: OHADAMetrics }>(
        API_ENDPOINTS.dashboard.metrics.global
      );
      console.log('✅ Métriques globales récupérées avec succès');
      return { ...response, data: normalizeMetrics(response.data) };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        console.warn('⚠️ Endpoint métriques globales non disponible, utilisation des données mockées');
        return {
          success: true,
          data: {
            id: "global",
            name: "Vue Globale",
            sector: "Tous Secteurs",
            totalAmount: 18750000000,
            activeContracts: 1248,
            avgLoanSize: 15024038,
            nplRatio: 4.1,
            provisionRate: 3.9,
            collectionEfficiency: 91.2,
            balanceAGE: {
              current: 69.8,
              days30: 19.1,
              days60: 7.3,
              days90Plus: 3.8
            },
            roa: 3.5,
            portfolioYield: 14.8,
            riskLevel: "Faible",
            growthRate: 7.2,
            monthlyPerformance: [11.8, 12.9, 13.7, 14.2, 14.9, 15.3, 15.1, 15.4, 15.0, 15.6, 16.1, 16.5],
            lastActivity: new Date().toISOString(),
            regulatoryCompliance: {
              bceaoCompliant: true,
              ohadaProvisionCompliant: true,
              riskRating: "A"
            }
          }
        };
      }
      throw error;
    }
  },

  /**
   * GET /compliance/summary
   * Récupère un résumé de la conformité réglementaire
   */
  async getComplianceSummary(): Promise<{ success: boolean; data: ComplianceSummary }> {
    try {
      console.log('🔄 Récupération résumé conformité...');
      const response = await apiClient.get<{ success: boolean; data: ComplianceSummary }>(
        API_ENDPOINTS.dashboard.compliance.summary
      );
      console.log('✅ Résumé conformité récupéré avec succès');
      return response;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        console.warn('⚠️ Endpoint conformité non disponible, utilisation des données mockées');
        return {
          success: true,
          data: mockComplianceSummary
        };
      }
      throw error;
    }
  },



  /**
   * GET /preferences/{userId}
   * Récupère les préférences de customisation du dashboard pour un utilisateur
   */
  async getUserPreferences(userId: string): Promise<{ success: boolean; data: DashboardPreferences }> {
    try {
      console.log(`🔄 Récupération préférences utilisateur ${userId}...`);
      const response = await apiClient.get<{ success: boolean; data: DashboardPreferences }>(
        API_ENDPOINTS.dashboard.preferences.get(userId)
      );
      console.log('✅ Préférences utilisateur récupérées avec succès');
      return response;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        console.warn(`⚠️ Endpoint préférences utilisateur ${userId} non disponible, utilisation des données par défaut`);
        return {
          success: true,
          data: {
            userId,
            widgets: {
              [WidgetType.OVERVIEW_METRICS]: { visible: true, position: 0 },
              [WidgetType.PORTFOLIO_PERFORMANCE]: { visible: true, position: 1 },
              [WidgetType.RISK_INDICATORS]: { visible: true, position: 2 },
              [WidgetType.BALANCE_AGE_ANALYSIS]: { visible: true, position: 3 },
              [WidgetType.SECTOR_DISTRIBUTION]: { visible: true, position: 4 },
              [WidgetType.GEOGRAPHIC_DISTRIBUTION]: { visible: false, position: 5 },
              [WidgetType.PERFORMANCE_TRENDS]: { visible: true, position: 6 },
              [WidgetType.REGULATORY_COMPLIANCE]: { visible: true, position: 7 },
              [WidgetType.RISK_ASSESSMENT]: { visible: false, position: 8 },
              [WidgetType.RECENT_ACTIVITIES]: { visible: true, position: 9 },
              [WidgetType.PORTFOLIO_HEALTH]: { visible: false, position: 10 },
              [WidgetType.CLIENT_DISTRIBUTION]: { visible: false, position: 11 }
            },
            selectorPosition: { x: 20, y: 20, minimized: false },
            lastUpdated: new Date().toISOString()
          }
        };
      }
      throw error;
    }
  },

  /**
   * PUT /preferences/{userId}/widget/{widgetId}
   * Met à jour la visibilité d'un widget spécifique
   */
  async updateWidgetPreference(
    userId: string, 
    widgetId: WidgetType, 
    update: { visible: boolean; position: number }
  ): Promise<{ success: boolean; message: string; data: { userId: string; widgetId: string; visible: boolean; position: number; updatedAt: string } }> {
    try {
      console.log(`🔄 Mise à jour widget ${widgetId} pour utilisateur ${userId}...`);
      const response = await apiClient.put<{ success: boolean; message: string; data: { userId: string; widgetId: string; visible: boolean; position: number; updatedAt: string } }>(
        API_ENDPOINTS.dashboard.preferences.updateWidget(userId, widgetId),
        update
      );
      console.log('✅ Widget mis à jour avec succès');
      return response;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        console.warn(`⚠️ Endpoint mise à jour widget non disponible, simulation de la mise à jour`);
        return {
          success: true,
          message: "Widget mis à jour avec succès (mode simulation)",
          data: {
            userId,
            widgetId,
            visible: update.visible,
            position: update.position,
            updatedAt: new Date().toISOString()
          }
        };
      }
      throw error;
    }
  },

  /**
   * POST /preferences/{userId}/reset
   * Remet les préférences aux valeurs par défaut
   */
  async resetUserPreferences(userId: string): Promise<{ success: boolean; message: string; data: { userId: string; resetAt: string; widgetsCount: number } }> {
    try {
      console.log(`🔄 Remise à zéro des préférences utilisateur ${userId}...`);
      const response = await apiClient.post<{ success: boolean; message: string; data: { userId: string; resetAt: string; widgetsCount: number } }>(
        API_ENDPOINTS.dashboard.preferences.reset(userId)
      );
      console.log('✅ Préférences remises à zéro avec succès');
      return response;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        console.warn(`⚠️ Endpoint reset préférences non disponible, simulation de la remise à zéro`);
        return {
          success: true,
          message: "Préférences remises à zéro (mode simulation)",
          data: {
            userId,
            resetAt: new Date().toISOString(),
            widgetsCount: 12
          }
        };
      }
      throw error;
    }
  }
};