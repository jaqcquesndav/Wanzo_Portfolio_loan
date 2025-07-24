// src/components/dashboard/DashboardByType.tsx
import React from 'react';
import { TraditionalDashboard } from './traditional/TraditionalDashboard';
import { InvestmentDashboard } from './investment/InvestmentDashboard';
import { LeasingDashboard } from './leasing/LeasingDashboard';
import { DashboardMetrics } from '../../types/dashboard';
import { isTraditionalMetrics, isInvestmentMetrics, isLeasingMetrics } from '../../utils/dashboardTypeGuards';

interface DashboardByTypeProps {
  portfolioType: 'traditional' | 'investment' | 'leasing' | null | undefined;
  metrics: DashboardMetrics | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Composant qui affiche le dashboard spécifique en fonction du type de portefeuille
 */
export const DashboardByType: React.FC<DashboardByTypeProps> = ({ 
  portfolioType, 
  metrics, 
  loading, 
  error 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
        <p className="text-red-700 dark:text-red-400">
          Erreur lors du chargement des métriques: {error.message}
        </p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 my-4">
        <p className="text-yellow-700 dark:text-yellow-400">
          Aucune métrique disponible pour ce type de portefeuille.
        </p>
      </div>
    );
  }

  // Afficher le dashboard approprié en fonction du type détecté dans les métriques
  if (isTraditionalMetrics(metrics)) {
    return <TraditionalDashboard metrics={metrics} />;
  }
  
  if (isInvestmentMetrics(metrics)) {
    return <InvestmentDashboard metrics={metrics} />;
  }
  
  if (isLeasingMetrics(metrics)) {
    return <LeasingDashboard metrics={metrics} />;
  }

  // Fallback au cas où aucun type ne correspond
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 my-4">
      <p className="text-yellow-700 dark:text-yellow-400">
        Type de dashboard non reconnu pour le portefeuille {portfolioType}.
      </p>
    </div>
  );
};
