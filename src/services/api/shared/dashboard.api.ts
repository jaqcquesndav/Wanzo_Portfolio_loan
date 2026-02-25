// src/services/api/shared/dashboard.api.ts
// Service API Dashboard - Version actualisée conforme à la documentation

import { dashboardOHADAApi, type OHADAMetricsResponse, type OHADAMetrics } from './dashboard-ohada.api';

/**
 * Interface de compatibilité pour l'ancien format dashboard
 * Mapping vers les nouvelles structures OHADA
 */
interface LegacyDashboardData {
  portfolioSummary: {
    traditional: { count: number; totalValue: number; avgRiskScore: number };
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    portfolioId?: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'risk' | 'payment' | 'compliance' | 'opportunity';
    level: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    timestamp: string;
  }>;
  kpis: {
    totalPortfolios: number;
    activePortfolios: number;
    totalValue: number;
    portfolioGrowth: number;
    pendingRequests: number;
    completedRequests: number;
    totalUsers: number;
    activeUsers: number;
  };
  metrics: {
    creditVolume: number;
    paymentRate: number;
    riskExposure: number;
    riskGrowth: number;
    portfolioPerformance: number;
    complianceScore: number;
  };
  charts: {
    portfolioGrowth: unknown[];
    riskDistribution: unknown[];
    paymentTrends: unknown[];
  };
}

/**
 * Convertit les données OHADA vers le format legacy pour compatibilité
 */
function convertOHADAToLegacy(ohadaResponse: OHADAMetricsResponse): LegacyDashboardData {
  const portfolios = ohadaResponse.data;
  const metadata = ohadaResponse.metadata;

  // Tous les portefeuilles sont des portefeuilles traditionnels (crédit/microfinance)
  const traditionalPortfolios = portfolios;
  const totalTraditionalValue = traditionalPortfolios.reduce((sum, p) => sum + p.totalAmount, 0);
  const count = traditionalPortfolios.length || 1;
  const avgTraditionalRisk = traditionalPortfolios.reduce((sum, p) => sum + p.nplRatio, 0) / count;

  // Générer des activités récentes basées sur les données OHADA
  const recentActivity = portfolios.slice(0, 5).map((portfolio, index) => ({
    id: `activity-${index}`,
    type: 'portfolio_update',
    description: `Mise à jour des métriques pour ${portfolio.name}`,
    timestamp: portfolio.lastActivity,
    portfolioId: portfolio.id
  }));

  // Générer des alertes basées sur la conformité
  const alerts = portfolios
    .filter(p => p.nplRatio > 4.0 || !p.regulatoryCompliance?.bceaoCompliant)
    .map((portfolio, index) => ({
      id: `alert-${index}`,
      type: 'compliance' as const,
      level: portfolio.nplRatio > 5.0 ? 'critical' as const : 'warning' as const,
      title: `Alerte conformité - ${portfolio.name}`,
      description: `NPL Ratio: ${portfolio.nplRatio}% (Seuil BCC: 5%)`,
      timestamp: new Date().toISOString()
    }));

  return {
    portfolioSummary: {
      traditional: {
        count: traditionalPortfolios.length,
        totalValue: totalTraditionalValue,
        avgRiskScore: avgTraditionalRisk
      }
    },
    recentActivity,
    alerts,
    kpis: {
      totalPortfolios: metadata.totalPortfolios,
      activePortfolios: portfolios.filter(p => p.activeContracts > 0).length,
      totalValue: portfolios.reduce((sum, p) => sum + p.totalAmount, 0),
      portfolioGrowth: portfolios.reduce((sum, p) => sum + p.growthRate, 0) / portfolios.length,
      pendingRequests: 0, // Non disponible dans OHADA
      completedRequests: portfolios.reduce((sum, p) => sum + p.activeContracts, 0),
      totalUsers: 0, // Non disponible dans OHADA
      activeUsers: 0 // Non disponible dans OHADA
    },
    metrics: {
      creditVolume: portfolios.reduce((sum, p) => sum + p.totalAmount, 0),
      paymentRate: portfolios.reduce((sum, p) => sum + p.collectionEfficiency, 0) / portfolios.length,
      riskExposure: portfolios.reduce((sum, p) => sum + p.nplRatio, 0) / portfolios.length,
      riskGrowth: 0, // Calculé différemment
      portfolioPerformance: portfolios.reduce((sum, p) => sum + p.roa, 0) / portfolios.length,
      complianceScore: metadata.complianceStatus === 'COMPLIANT' ? 100 : 
                      metadata.complianceStatus === 'WARNING' ? 75 : 50
    },
    charts: {
      portfolioGrowth: portfolios.map(p => ({ name: p.name, value: p.growthRate })),
      riskDistribution: portfolios.map(p => ({ name: p.name, npl: p.nplRatio })),
      paymentTrends: portfolios.map(p => ({ 
        name: p.name, 
        efficiency: p.collectionEfficiency,
        monthlyData: p.monthlyPerformance
      }))
    }
  };
}

/**
 * API Dashboard avec compatibilité legacy et nouvelles fonctionnalités OHADA
 */
export const dashboardApi = {
  /**
   * Récupère les données dashboard (format legacy pour compatibilité)
   * Utilise en arrière-plan les endpoints OHADA conformes à la documentation
   */
  async getDashboardData(): Promise<LegacyDashboardData> {
    try {
      console.log('🔄 Récupération données dashboard via API OHADA conforme...');
      
      // Utiliser la nouvelle API OHADA conforme à la documentation
      const ohadaResponse = await dashboardOHADAApi.getOHADAMetrics();
      
      // Convertir vers le format legacy pour compatibilité
      const legacyData = convertOHADAToLegacy(ohadaResponse);
      
      console.log('✅ Données dashboard converties avec succès');
      return legacyData;
      
    } catch {
      console.warn('⚠️ Erreur lors de la récupération des données OHADA, utilisation du fallback');
      
      // Données mockées de base en cas d'erreur
      return {
        portfolioSummary: {
          traditional: { count: 0, totalValue: 0, avgRiskScore: 0 }
        },
        recentActivity: [],
        alerts: [],
        kpis: {
          totalPortfolios: 0,
          activePortfolios: 0,
          totalValue: 0,
          portfolioGrowth: 0,
          pendingRequests: 0,
          completedRequests: 0,
          totalUsers: 0,
          activeUsers: 0
        },
        metrics: {
          creditVolume: 0,
          paymentRate: 0,
          riskExposure: 0,
          riskGrowth: 0,
          portfolioPerformance: 0,
          complianceScore: 0
        },
        charts: {
          portfolioGrowth: [],
          riskDistribution: [],
          paymentTrends: []
        }
      };
    }
  },

  /**
   * Récupère les alertes de risque (format legacy)
   * Utilise les données de conformité OHADA
   */
  async getRiskAlerts() {
    try {
      const dashboardData = await this.getDashboardData();
      return dashboardData.alerts;
    } catch {
      return [];
    }
  },

  /**
   * Nouvelles méthodes conformes à la documentation OHADA
   */
  
  /**
   * Récupère les métriques OHADA (nouveau format conforme)
   */
  async getOHADAMetrics(): Promise<OHADAMetricsResponse> {
    return await dashboardOHADAApi.getOHADAMetrics();
  },

  /**
   * Récupère les métriques pour un portefeuille spécifique
   */
  async getPortfolioMetrics(portfolioId: string): Promise<{ success: boolean; data: OHADAMetrics }> {
    return await dashboardOHADAApi.getPortfolioMetrics(portfolioId);
  },

  /**
   * Récupère les métriques globales
   */
  async getGlobalMetrics(): Promise<{ success: boolean; data: OHADAMetrics }> {
    return await dashboardOHADAApi.getGlobalMetrics();
  },

  /**
   * Récupère le résumé de conformité réglementaire
   */
  async getComplianceSummary() {
    return await dashboardOHADAApi.getComplianceSummary();
  }
};
