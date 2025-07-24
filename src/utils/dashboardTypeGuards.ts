// src/utils/dashboardTypeGuards.ts
import {
  DashboardMetrics,
  TraditionalDashboardMetrics,
  InvestmentDashboardMetrics,
  LeasingDashboardMetrics
} from '../types/dashboard';

/**
 * Type guard pour identifier les métriques du portefeuille traditionnel
 */
export function isTraditionalMetrics(metrics: DashboardMetrics): metrics is TraditionalDashboardMetrics {
  return (
    'assets' in metrics &&
    'distribution' in metrics.assets &&
    'credit' in metrics.assets.distribution &&
    'creditUtilization' in metrics.assets
  );
}

/**
 * Type guard pour identifier les métriques du portefeuille d'investissement
 */
export function isInvestmentMetrics(metrics: DashboardMetrics): metrics is InvestmentDashboardMetrics {
  return (
    'assets' in metrics &&
    'distribution' in metrics.assets &&
    'equities' in metrics.assets.distribution &&
    'liquidity' in metrics.assets
  );
}

/**
 * Type guard pour identifier les métriques du portefeuille de leasing
 */
export function isLeasingMetrics(metrics: DashboardMetrics): metrics is LeasingDashboardMetrics {
  return (
    'assets' in metrics &&
    'distribution' in metrics.assets &&
    'vehicles' in metrics.assets.distribution &&
    'residualValue' in metrics.assets
  );
}

/**
 * Récupère le nom du type de portefeuille à partir des métriques
 */
export function getMetricsTypeName(metrics: DashboardMetrics): 'traditional' | 'investment' | 'leasing' {
  if (isTraditionalMetrics(metrics)) return 'traditional';
  if (isInvestmentMetrics(metrics)) return 'investment';
  if (isLeasingMetrics(metrics)) return 'leasing';
  
  // Fallback au cas où la détection échoue
  console.warn('Type de métriques non reconnu, utilisation du type par défaut (traditional)');
  return 'traditional';
}

/**
 * Récupère le label du type de portefeuille à partir des métriques
 */
export function getMetricsTypeLabel(metrics: DashboardMetrics): string {
  const type = getMetricsTypeName(metrics);
  
  const labels = {
    traditional: 'Portefeuille traditionnel',
    investment: 'Portefeuille d\'investissement',
    leasing: 'Portefeuille de leasing'
  };
  
  return labels[type];
}
