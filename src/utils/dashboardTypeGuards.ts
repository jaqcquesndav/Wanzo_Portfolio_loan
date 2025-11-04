// src/utils/dashboardTypeGuards.ts
import {
  DashboardMetrics,
  TraditionalDashboardMetrics
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
 * Récupère le nom du type de portefeuille à partir des métriques
 */
export function getMetricsTypeName(metrics: DashboardMetrics): 'traditional' {
  if (isTraditionalMetrics(metrics)) return 'traditional';
  
  // Fallback au cas où la détection échoue
  console.warn('Type de métriques non reconnu, utilisation du type par défaut (traditional)');
  return 'traditional';
}

/**
 * Récupère le label du type de portefeuille (traditionnels uniquement)
 */
export function getMetricsTypeLabel(): string {
  return 'Portefeuille traditionnel';
}
