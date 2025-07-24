// src/components/dashboard/traditional/TraditionalDashboard.tsx
import React from 'react';
import { PortfolioPerformanceChart } from '../PortfolioPerformanceChart';
import { PerformanceIndicatorCard } from '../PerformanceIndicatorCard';
import { PerformanceComparisonScroller } from '../PerformanceComparisonScroller';
import { TraditionalDashboardMetrics } from '../../../types/dashboard';

interface TraditionalDashboardProps {
  metrics: TraditionalDashboardMetrics;
}

export const TraditionalDashboard: React.FC<TraditionalDashboardProps> = ({ metrics }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PerformanceIndicatorCard
          label="Actifs sous gestion"
          value={metrics.assets.total}
          trend={metrics.assets.change > 0 ? 'up' : metrics.assets.change < 0 ? 'down' : 'neutral'}
          tag={`${metrics.assets.change > 0 ? '+' : ''}${metrics.assets.change}%`}
        />
        <PerformanceIndicatorCard
          label="Performance globale"
          value={`${metrics.performance.global}%`}
          trend={metrics.performance.change > 0 ? 'up' : metrics.performance.change < 0 ? 'down' : 'neutral'}
          tag={`${metrics.performance.change > 0 ? '+' : ''}${metrics.performance.change}%`}
        />
        <PerformanceIndicatorCard
          label="Clients actifs"
          value={metrics.clients.active}
          trend={metrics.clients.change > 0 ? 'up' : metrics.clients.change < 0 ? 'down' : 'neutral'}
          tag={`${metrics.clients.change > 0 ? '+' : ''}${metrics.clients.change}%`}
        />
        <PerformanceIndicatorCard
          label="Taux d'utilisation crédit"
          value={`${metrics.assets.creditUtilization}%`}
          trend="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioPerformanceChart 
            data={metrics.performance.monthly.map(item => item.value)}
            labels={metrics.performance.monthly.map(item => item.month)}
            color="#3b82f6" // Couleur pour le portefeuille traditionnel
          />
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Répartition des actifs
            </h3>
            
            <div className="space-y-2">
              {Object.entries(metrics.assets.distribution).map(([key, value]) => {
                if (value === 0) return null;
                
                const labels: Record<string, string> = {
                  credit: 'Crédit',
                  microfinance: 'Microfinance',
                  treasury: 'Trésorerie'
                };
                
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full bg-${getColorForCategory(key)}`}></div>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">
                        {labels[key as keyof typeof labels] || key}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {value}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques spécifiques au portefeuille traditionnel */}
      {metrics.paymentStatus && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Statut des paiements
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-green-600 dark:text-green-400 font-medium">À jour</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.paymentStatus.onTime}%</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <div className="text-yellow-600 dark:text-yellow-400 font-medium">Retard 1-30j</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.paymentStatus.late30Days}%</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
              <div className="text-orange-600 dark:text-orange-400 font-medium">Retard 31-60j</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.paymentStatus.late60Days}%</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <div className="text-red-600 dark:text-red-400 font-medium">Retard {'>'}60j</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.paymentStatus.late90Days}%</div>
            </div>
          </div>
        </div>
      )}

      <PerformanceComparisonScroller portfolioType="traditional" performanceType="performance_curve" />
    </div>
  );
};

// Fonction utilitaire pour obtenir une couleur par catégorie
function getColorForCategory(category: string): string {
  const colorMap: Record<string, string> = {
    credit: 'blue-500',
    microfinance: 'green-500',
    treasury: 'gray-500'
  };
  
  return colorMap[category] || 'primary';
}
