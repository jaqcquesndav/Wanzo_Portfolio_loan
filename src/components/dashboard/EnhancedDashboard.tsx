// src/components/dashboard/EnhancedDashboard.tsx
import React from 'react';
import { DashboardMetrics } from '../../types/dashboard';
import EnhancedPortfolioDashboard from './EnhancedPortfolioDashboard';
import { Spinner } from '../ui/Spinner';

interface EnhancedDashboardProps {
  portfolioType: 'traditional' | 'investment' | 'leasing' | null | undefined;
  metrics: DashboardMetrics | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Composant qui encapsule le tableau de bord amélioré et gère les états de chargement et d'erreur
 */
export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ 
  portfolioType, 
  metrics, 
  loading, 
  error 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <Spinner size="md" />
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

  // Afficher le tableau de bord amélioré avec le type de portefeuille
  return <EnhancedPortfolioDashboard portfolioTypeFromProps={portfolioType} metrics={metrics} />;
};
