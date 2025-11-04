// src/hooks/dashboard/useOHADAMetrics.ts
import { useState } from 'react';
import { ohadaMetricsService, type OHADAMetricsResponse } from '../../services/api/dashboard/ohadaMetrics.api';
import type { OHADAMetrics } from '../../types/dashboard/ohada';

/**
 * Hook simplifié pour gérer les métriques OHADA
 */
export const useOHADAMetrics = () => {
  const [metrics, setMetrics] = useState<OHADAMetrics[]>([]);
  const [globalMetrics, setGlobalMetrics] = useState<OHADAMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  /**
   * Calcule les métriques globales
   */
  const calculateGlobalMetrics = (portfolioMetrics: OHADAMetrics[]): OHADAMetrics => {
    if (portfolioMetrics.length === 0) {
      return {
        id: 'global',
        name: 'Vue Globale',
        sector: 'Tous Secteurs',
        totalAmount: 0,
        activeContracts: 0,
        avgLoanSize: 0,
        nplRatio: 0,
        provisionRate: 0,
        collectionEfficiency: 0,
        balanceAGE: { current: 0, days30: 0, days60: 0, days90Plus: 0 },
        roa: 0,
        portfolioYield: 0,
        riskLevel: 'Faible',
        growthRate: 0,
        monthlyPerformance: Array(12).fill(0),
        lastActivity: new Date().toISOString()
      };
    }

    const totalAmount = portfolioMetrics.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalContracts = portfolioMetrics.reduce((sum, p) => sum + p.activeContracts, 0);

    const weightedNPL = portfolioMetrics.reduce((sum, p) => 
      sum + (p.nplRatio * p.totalAmount), 0) / totalAmount;
    
    const weightedProvision = portfolioMetrics.reduce((sum, p) => 
      sum + (p.provisionRate * p.totalAmount), 0) / totalAmount;
    
    const weightedROA = portfolioMetrics.reduce((sum, p) => 
      sum + (p.roa * p.totalAmount), 0) / totalAmount;
    
    const weightedYield = portfolioMetrics.reduce((sum, p) => 
      sum + (p.portfolioYield * p.totalAmount), 0) / totalAmount;

    const weightedCollectionEfficiency = portfolioMetrics.reduce((sum, p) => 
      sum + (p.collectionEfficiency * p.totalAmount), 0) / totalAmount;

    const weightedBalanceAGE = {
      current: portfolioMetrics.reduce((sum, p) => 
        sum + (p.balanceAGE.current * p.totalAmount), 0) / totalAmount,
      days30: portfolioMetrics.reduce((sum, p) => 
        sum + (p.balanceAGE.days30 * p.totalAmount), 0) / totalAmount,
      days60: portfolioMetrics.reduce((sum, p) => 
        sum + (p.balanceAGE.days60 * p.totalAmount), 0) / totalAmount,
      days90Plus: portfolioMetrics.reduce((sum, p) => 
        sum + (p.balanceAGE.days90Plus * p.totalAmount), 0) / totalAmount
    };

    const globalRiskLevel = weightedNPL < 3 ? 'Faible' : 
                           weightedNPL < 6 ? 'Moyen' : 'Élevé';

    const monthlyPerformance = Array.from({ length: 12 }, (_, month) => {
      return portfolioMetrics.reduce((sum, p) => 
        sum + (p.monthlyPerformance[month] || 0), 0) / portfolioMetrics.length;
    });

    const avgGrowthRate = portfolioMetrics.reduce((sum, p) => 
      sum + p.growthRate, 0) / portfolioMetrics.length;

    return {
      id: 'global',
      name: 'Vue Globale',
      sector: 'Tous Secteurs',
      totalAmount: Number(totalAmount.toFixed(0)),
      activeContracts: totalContracts,
      avgLoanSize: Number((totalAmount / totalContracts).toFixed(0)),
      nplRatio: Number(weightedNPL.toFixed(2)),
      provisionRate: Number(weightedProvision.toFixed(2)),
      collectionEfficiency: Number(weightedCollectionEfficiency.toFixed(1)),
      balanceAGE: {
        current: Number(weightedBalanceAGE.current.toFixed(1)),
        days30: Number(weightedBalanceAGE.days30.toFixed(1)),
        days60: Number(weightedBalanceAGE.days60.toFixed(1)),
        days90Plus: Number(weightedBalanceAGE.days90Plus.toFixed(1))
      },
      roa: Number(weightedROA.toFixed(2)),
      portfolioYield: Number(weightedYield.toFixed(1)),
      riskLevel: globalRiskLevel,
      growthRate: Number(avgGrowthRate.toFixed(1)),
      monthlyPerformance,
      lastActivity: new Date().toISOString(),
      regulatoryCompliance: {
        bceaoCompliant: weightedNPL <= 5,
        ohadaProvisionCompliant: weightedProvision >= 3 && weightedProvision <= 5,
        riskRating: 'A' // Simplifié pour l'instant
      }
    };
  };

  /**
   * Charge les métriques OHADA
   */
  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: OHADAMetricsResponse = await ohadaMetricsService.getOHADAMetrics();
      
      if (response.success) {
        setMetrics(response.data);
        
        // Calcul des métriques globales
        const global = calculateGlobalMetrics(response.data);
        setGlobalMetrics(global);
        
        setLastUpdate(new Date());
      } else {
        throw new Error('Échec du chargement des métriques OHADA');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors du chargement des métriques OHADA:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Récupère les métriques pour un portefeuille spécifique
   */
  const getPortfolioMetrics = (portfolioId: string): OHADAMetrics | null => {
    return metrics.find(m => m.id === portfolioId) || null;
  };

  /**
   * Obtient un résumé de conformité
   */
  const getComplianceSummary = () => {
    const nonCompliantPortfolios = metrics.filter(m => 
      !m.regulatoryCompliance?.bceaoCompliant || 
      !m.regulatoryCompliance?.ohadaProvisionCompliant
    );

    const complianceStatus = nonCompliantPortfolios.length === 0 ? 'COMPLIANT' :
                            nonCompliantPortfolios.length / metrics.length <= 0.2 ? 'WARNING' : 'NON_COMPLIANT';

    return {
      status: complianceStatus,
      riskLevel: complianceStatus === 'COMPLIANT' ? 'Faible' :
                complianceStatus === 'WARNING' ? 'Moyen' : 'Élevé',
      totalPortfolios: metrics.length,
      nonCompliantCount: nonCompliantPortfolios.length,
      complianceRate: metrics.length > 0 ? 
        ((metrics.length - nonCompliantPortfolios.length) / metrics.length * 100).toFixed(1) : '0'
    };
  };

  return {
    // Données
    metrics,
    globalMetrics,
    
    // États
    loading,
    error,
    lastUpdate,
    
    // Actions
    loadMetrics,
    getPortfolioMetrics,
    getComplianceSummary
  };
};
