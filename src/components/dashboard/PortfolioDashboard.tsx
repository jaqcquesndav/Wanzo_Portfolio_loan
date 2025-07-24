import { useState, useEffect } from 'react';
import { usePortfolioType } from '../../hooks/usePortfolioType';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart';
import { PerformanceIndicatorCard } from './PerformanceIndicatorCard';
import { PerformanceComparisonScroller } from './PerformanceComparisonScroller';
import type { Portfolio } from '../../types/portfolio';
import { portfolioStorageService } from '../../services/storage/localStorage';

// Indicateur type
export type Indicator = {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  tag?: string;
  color?: string;
};

const PortfolioDashboard = () => {
  const portfolioType = usePortfolioType();
  const { metrics, loading, error } = useDashboardMetrics(portfolioType as string | undefined);
  const [, setPortfolios] = useState<Portfolio[]>([]);

  useEffect(() => {
    // Seed et charge dynamiquement selon le type courant
    if (!portfolioType) {
      console.log('PortfolioDashboard: Type de portefeuille non défini, réinitialisation des portfolios');
      return setPortfolios([]);
    }
    
    console.log(`PortfolioDashboard: Changement du type de portefeuille à ${portfolioType}`);
    
    portfolioStorageService.getPortfoliosByType(portfolioType).then((data) => {
      // Filtrer strictement pour ne garder que les portefeuilles du type actuel
      const filtered = data.filter(p => p.type === portfolioType);
      console.log(`PortfolioDashboard: ${filtered.length} portfolios chargés de type ${portfolioType}`);
      setPortfolios(filtered);
    });
  }, [portfolioType]);

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
          label="Niveau de risque"
          value={metrics.risk.level}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioPerformanceChart 
            data={metrics.performance.monthly.map(item => item.value)} 
            labels={metrics.performance.monthly.map(item => item.month)}
            color={portfolioType === 'investment' ? '#6366f1' : portfolioType === 'leasing' ? '#f59e0b' : '#3b82f6'}
          />
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Répartition des actifs
            </h3>
            
            <div className="space-y-2">
              {/* Affichage spécifique en fonction du type de portefeuille */}
              {portfolioType === 'traditional' && 'distribution' in metrics.assets && 
                Object.entries(metrics.assets.distribution).map(([key, value]) => {
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
                })
              }
              
              {portfolioType === 'investment' && 'distribution' in metrics.assets && 
                Object.entries(metrics.assets.distribution).map(([key, value]) => {
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
                })
              }
              
              {portfolioType === 'leasing' && 'distribution' in metrics.assets && 
                Object.entries(metrics.assets.distribution).map(([key, value]) => {
                  if (value === 0) return null;
                  
                  const labels: Record<string, string> = {
                    vehicles: 'Véhicules',
                    machinery: 'Machines',
                    it: 'Informatique',
                    office: 'Bureautique'
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
                })
              }
            </div>
          </div>
        </div>
      </div>

      <PerformanceComparisonScroller portfolioType={portfolioType || 'traditional'} />
    </div>
  );
};

// Fonction utilitaire pour obtenir une couleur par catégorie
function getColorForCategory(category: string): string {
  const colorMap: Record<string, string> = {
    // Traditional
    credit: 'blue-500',
    microfinance: 'green-500',
    treasury: 'gray-500',
    
    // Investment
    equities: 'purple-500',
    bonds: 'indigo-500',
    alternatives: 'pink-500',
    cash: 'cyan-500',
    
    // Leasing
    vehicles: 'yellow-500',
    machinery: 'orange-500',
    it: 'emerald-500',
    office: 'amber-500'
  };
  
  return colorMap[category] || 'primary';
}

export default PortfolioDashboard;
