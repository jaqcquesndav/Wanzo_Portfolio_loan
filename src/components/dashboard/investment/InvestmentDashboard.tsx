// src/components/dashboard/investment/InvestmentDashboard.tsx
import React from 'react';
import { PortfolioPerformanceChart } from '../PortfolioPerformanceChart';
import { PerformanceIndicatorCard } from '../PerformanceIndicatorCard';
import { PerformanceComparisonScroller } from '../PerformanceComparisonScroller';
import { InvestmentDashboardMetrics } from '../../../types/dashboard';

interface InvestmentDashboardProps {
  metrics: InvestmentDashboardMetrics;
}

export const InvestmentDashboard: React.FC<InvestmentDashboardProps> = ({ metrics }) => {
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
          label="Volatilité"
          value={`${metrics.risk.volatility}%`}
          trend="neutral"
        />
        <PerformanceIndicatorCard
          label="Ratio de Sharpe"
          value={metrics.risk.sharpeRatio}
          trend="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioPerformanceChart 
            data={metrics.performance.monthly.map(item => item.value)}
            labels={metrics.performance.monthly.map(item => item.month)}
            color="#6366f1" // Couleur pour l'investissement
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
                  equities: 'Actions',
                  bonds: 'Obligations',
                  alternatives: 'Alternatifs',
                  cash: 'Liquidités'
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

      {/* Statistiques spécifiques au portefeuille d'investissement */}
      {metrics.benchmarkComparison && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Comparaison avec les benchmarks
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <div className="text-indigo-600 dark:text-indigo-400 font-medium">YTD</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.benchmarkComparison.ytd}%</div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <div className="text-indigo-600 dark:text-indigo-400 font-medium">1 an</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.benchmarkComparison.oneYear}%</div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <div className="text-indigo-600 dark:text-indigo-400 font-medium">3 ans</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.benchmarkComparison.threeYears}%</div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <div className="text-indigo-600 dark:text-indigo-400 font-medium">5 ans</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.benchmarkComparison.fiveYears}%</div>
            </div>
          </div>
        </div>
      )}

      <PerformanceComparisonScroller portfolioType="investment" performanceType="performance_curve" />
    </div>
  );
};

// Fonction utilitaire pour obtenir une couleur par catégorie
function getColorForCategory(category: string): string {
  const colorMap: Record<string, string> = {
    equities: 'purple-500',
    bonds: 'indigo-500',
    alternatives: 'pink-500',
    cash: 'cyan-500'
  };
  
  return colorMap[category] || 'primary';
}
