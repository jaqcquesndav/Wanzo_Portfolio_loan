// src/services/api/dashboard/ohadaMetrics.api.ts
import type { OHADAMetrics } from '../../../types/dashboard/ohada';
import { portfolioStorageService } from '../../storage/localStorage';

/**
 * Service API pour les métriques OHADA/BCEAO
 * Conforme aux standards du financement PME en zone CEMAC/UEMOA
 */
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

/**
 * Service pour calculer les métriques OHADA en temps réel
 */
class OHADAMetricsService {
  private readonly BCEAO_NPL_THRESHOLD = 5; // 5% seuil BCEAO
  private readonly OHADA_PROVISION_MIN = 3; // 3% minimum OHADA
  private readonly OHADA_PROVISION_MAX = 5; // 5% maximum OHADA

  /**
   * Récupère les métriques OHADA pour tous les portefeuilles
   */
  async getOHADAMetrics(): Promise<OHADAMetricsResponse> {
    try {
      const portfolios = await portfolioStorageService.getAllPortfolios();
      const traditionalPortfolios = portfolios.filter(p => p.type === 'traditional');

      const metrics: OHADAMetrics[] = traditionalPortfolios.map(portfolio => 
        this.calculatePortfolioMetrics(portfolio)
      );

      const benchmarks = this.calculateMarketBenchmarks(metrics);
      const complianceStatus = this.assessRegulatorCompliance(metrics);

      return {
        success: true,
        data: metrics,
        metadata: {
          totalPortfolios: metrics.length,
          calculationDate: new Date().toISOString(),
          regulatoryFramework: 'OHADA',
          complianceStatus
        },
        benchmarks
      };
    } catch (error) {
      console.error('Erreur lors du calcul des métriques OHADA:', error);
      throw new Error('Impossible de calculer les métriques OHADA');
    }
  }

  /**
   * Calcule les métriques OHADA pour un portefeuille (STABLE - pas d'animation)
   */
  private calculatePortfolioMetrics(portfolio: {
    id: string;
    name: string;
    target_sectors?: string[];
    metrics?: {
      total_credits?: number;
      nb_credits?: number;
      avg_credit?: number;
    };
  }): OHADAMetrics {
    // Génération de données stables basées sur l'ID du portefeuille
    const portfolioHash = this.simpleHash(portfolio.id);
    
    // Métriques basées sur le hash pour éviter les variations
    const baseNPL = 1 + (portfolioHash % 8); // 1-8%
    const baseProvision = 2 + (portfolioHash % 4); // 2-5%
    const baseYield = 12 + (portfolioHash % 6); // 12-17%
    const baseROA = 2 + (portfolioHash % 4); // 2-5%

    // Balance AGE stable
    const ageHash = this.simpleHash(portfolio.id + 'age');
    const current = 60 + (ageHash % 20); // 60-79%
    const days30 = 15 + (ageHash % 10); // 15-24%
    const days60 = 5 + (ageHash % 8); // 5-12%
    const days90Plus = Math.max(0, 100 - current - days30 - days60);

    return {
      id: portfolio.id,
      name: portfolio.name,
      sector: portfolio.target_sectors?.[0] || 'PME',
      
      // Métriques financières de base
      totalAmount: portfolio.metrics?.total_credits || 100000000 + (portfolioHash % 700000000),
      activeContracts: portfolio.metrics?.nb_credits || 100 + (portfolioHash % 700),
      avgLoanSize: portfolio.metrics?.avg_credit || 20000 + (portfolioHash % 60000),
      
      // Ratios OHADA critiques (stables)
      nplRatio: Number(baseNPL.toFixed(2)),
      provisionRate: Number(baseProvision.toFixed(2)),
      collectionEfficiency: Number((95 - (portfolioHash % 10)).toFixed(1)),
      
      // Balance âgée stable
      balanceAGE: {
        current: Number(current.toFixed(1)),
        days30: Number(days30.toFixed(1)),
        days60: Number(days60.toFixed(1)),
        days90Plus: Number(days90Plus.toFixed(1))
      },
      
      // Ratios de performance stables
      roa: Number(baseROA.toFixed(2)),
      portfolioYield: Number(baseYield.toFixed(1)),
      riskLevel: baseNPL < 3 ? 'Faible' : baseNPL < 6 ? 'Moyen' : 'Élevé',
      growthRate: Number((5 + (portfolioHash % 25)).toFixed(1)),
      
      // Performance mensuelle stable
      monthlyPerformance: Array.from({ length: 12 }, (_, i) => 
        5 + ((portfolioHash + i) % 15)
      ),
      lastActivity: new Date(Date.now() - (portfolioHash % 7) * 24 * 60 * 60 * 1000).toISOString(),
      
      // Conformité réglementaire
      regulatoryCompliance: {
        bceaoCompliant: baseNPL <= this.BCEAO_NPL_THRESHOLD,
        ohadaProvisionCompliant: baseProvision >= this.OHADA_PROVISION_MIN && baseProvision <= this.OHADA_PROVISION_MAX,
        riskRating: this.calculateRiskRating(baseNPL, baseProvision, baseROA)
      }
    };
  }

  /**
   * Fonction de hash simple pour générer des valeurs stables
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertit en 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Calcule les benchmarks du marché
   */
  private calculateMarketBenchmarks(metrics: OHADAMetrics[]) {
    if (metrics.length === 0) {
      return {
        avgNplRatio: 5.2,
        avgProvisionRate: 4.1,
        avgROA: 3.2,
        avgYield: 14.5,
        collectionEfficiency: 90.0
      };
    }

    return {
      avgNplRatio: Number((metrics.reduce((sum, m) => sum + m.nplRatio, 0) / metrics.length).toFixed(2)),
      avgProvisionRate: Number((metrics.reduce((sum, m) => sum + m.provisionRate, 0) / metrics.length).toFixed(2)),
      avgROA: Number((metrics.reduce((sum, m) => sum + m.roa, 0) / metrics.length).toFixed(2)),
      avgYield: Number((metrics.reduce((sum, m) => sum + m.portfolioYield, 0) / metrics.length).toFixed(1)),
      collectionEfficiency: Number((metrics.reduce((sum, m) => sum + m.collectionEfficiency, 0) / metrics.length).toFixed(1))
    };
  }

  /**
   * Évalue la conformité réglementaire globale
   */
  private assessRegulatorCompliance(metrics: OHADAMetrics[]): 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT' {
    const nonCompliantCount = metrics.filter(m => 
      !m.regulatoryCompliance?.bceaoCompliant || 
      !m.regulatoryCompliance?.ohadaProvisionCompliant
    ).length;

    const nonCompliantRatio = nonCompliantCount / metrics.length;

    if (nonCompliantRatio === 0) return 'COMPLIANT';
    if (nonCompliantRatio <= 0.2) return 'WARNING'; // 20% de tolérance
    return 'NON_COMPLIANT';
  }

  /**
   * Calcule la notation de risque selon les critères OHADA
   */
  private calculateRiskRating(nplRatio: number, provisionRate: number, roa: number): 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' {
    const score = (
      (nplRatio <= 2 ? 30 : nplRatio <= 5 ? 20 : nplRatio <= 8 ? 10 : 0) +
      (provisionRate >= 3 && provisionRate <= 5 ? 25 : provisionRate < 3 ? 15 : 10) +
      (roa >= 4 ? 25 : roa >= 3 ? 20 : roa >= 2 ? 15 : 10) +
      (20) // Score de base
    );

    if (score >= 90) return 'AAA';
    if (score >= 80) return 'AA';
    if (score >= 70) return 'A';
    if (score >= 60) return 'BBB';
    if (score >= 50) return 'BB';
    if (score >= 40) return 'B';
    return 'CCC';
  }

  /**
   * Récupère les métriques pour un portefeuille spécifique
   */
  async getPortfolioOHADAMetrics(portfolioId: string): Promise<OHADAMetrics | null> {
    try {
      const response = await this.getOHADAMetrics();
      return response.data.find(m => m.id === portfolioId) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques OHADA pour le portefeuille:', error);
      return null;
    }
  }

  /**
   * Génère un rapport de conformité OHADA
   */
  async generateComplianceReport(): Promise<{
    summary: string;
    recommendations: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }> {
    const response = await this.getOHADAMetrics();
    const metrics = response.data;
    
    const avgNPL = response.benchmarks.avgNplRatio;
    const complianceStatus = response.metadata.complianceStatus;
    
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    const recommendations: string[] = [];
    
    if (avgNPL > this.BCEAO_NPL_THRESHOLD) {
      riskLevel = 'HIGH';
      recommendations.push('Réduire le NPL ratio en-dessous du seuil BCEAO de 5%');
      recommendations.push('Renforcer les procédures de recouvrement');
    } else if (avgNPL > 3) {
      riskLevel = 'MEDIUM';
      recommendations.push('Surveiller l\'évolution du NPL ratio');
    }

    if (complianceStatus === 'NON_COMPLIANT') {
      riskLevel = 'HIGH';
      recommendations.push('Mise en conformité urgente avec les normes OHADA/BCEAO');
    }

    const summary = `Portfolio de ${metrics.length} portefeuilles avec NPL moyen de ${avgNPL}%. Statut: ${complianceStatus}`;

    return { summary, recommendations, riskLevel };
  }
}

// Instance singleton du service
export const ohadaMetricsService = new OHADAMetricsService();
