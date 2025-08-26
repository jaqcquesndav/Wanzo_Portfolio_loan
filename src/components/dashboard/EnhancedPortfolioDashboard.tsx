import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Calendar, Filter, HelpCircle, RefreshCw, BarChart3, X } from 'lucide-react';
import { usePortfolioType } from '../../hooks/usePortfolioType';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { PerformanceIndicatorCard } from './PerformanceIndicatorCard';
import { Button } from '../ui/Button';
import { RecentOperationsTable } from './RecentOperationsTable';
import EnhancedPerformanceChart from './EnhancedPerformanceChart';
import { DashboardMetrics } from '../../types/dashboard';
import { PortfolioType } from '../../types/portfolio';
import { useOperations } from '../../hooks/useOperations';
import { useConnectivity } from '../../hooks/useConnectivity';
import { usePortfolioSectors } from '../../hooks/usePortfolioSectors';
import { formatCurrency } from '../../utils/formatters';
import { MultiSegmentSpinner } from '../ui/MultiSegmentSpinner';

interface EnhancedPortfolioDashboardProps {
  portfolioTypeFromProps?: 'traditional' | 'investment' | 'leasing' | null | undefined;
  metrics?: DashboardMetrics;
}

const portfolioTypeColors = {
  traditional: {
    primary: '#3b82f6',
    secondary: '#93c5fd',
    gradient: 'from-blue-500/20 to-transparent',
    accent: '#1d4ed8'
  },
  leasing: {
    primary: '#f59e0b',
    secondary: '#fcd34d',
    gradient: 'from-amber-500/20 to-transparent',
    accent: '#d97706'
  },
  investment: {
    primary: '#6366f1',
    secondary: '#a5b4fc',
    gradient: 'from-indigo-500/20 to-transparent',
    accent: '#4f46e5'
  }
};

interface TimeRangeOption {
  label: string;
  value: string;
  days: number;
}

const timeRangeOptions: TimeRangeOption[] = [
  { label: '7J', value: '7d', days: 7 },
  { label: '1M', value: '1m', days: 30 },
  { label: '3M', value: '3m', days: 90 },
  { label: '6M', value: '6m', days: 180 },
  { label: 'YTD', value: 'ytd', days: 0 }, // Calculé dynamiquement
  { label: '1A', value: '1y', days: 365 },
  { label: 'Max', value: 'max', days: 0 } // Tout l'historique
];

const EnhancedPortfolioDashboard: React.FC<EnhancedPortfolioDashboardProps> = ({
  portfolioTypeFromProps,
  metrics: metricsFromProps
}) => {
  const navigate = useNavigate();
  // Utiliser portfolioTypeFromProps s'il est fourni, sinon utiliser le hook
  const portfolioTypeFromHook = usePortfolioType();
  const portfolioType = portfolioTypeFromProps || portfolioTypeFromHook;
  
  // Utiliser metricsFromProps si fourni, sinon utiliser le hook
  const { metrics: metricsFromHook, loading, error } = useDashboardMetrics(
    portfolioTypeFromProps ? undefined : portfolioType as string | undefined
  );
  const metrics = metricsFromProps || metricsFromHook;
  
  // Utiliser le hook useOperations pour charger les opérations
  const { 
    operations, 
    loading: operationsLoading, 
    error: operationsError,
    refreshOperations
  } = useOperations(portfolioType as PortfolioType);
  
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1m');
  const [showBenchmark, setShowBenchmark] = useState(true);
  const [showPortfolioSelector, setShowPortfolioSelector] = useState(false);
  const [showSectorModal, setShowSectorModal] = useState(false);
  const { isOnline } = useConnectivity();
  
  // Récupérer les données de répartition sectorielle
  const { sectorDistribution, loading: sectorLoading } = usePortfolioSectors(portfolioType as PortfolioType);

  // Couleurs en fonction du type de portefeuille
  const colors = portfolioType ? portfolioTypeColors[portfolioType] : portfolioTypeColors.traditional;

  // Affichage pendant le chargement des métriques
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-24 animate-pulse">
              <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-96 animate-pulse">
          <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm h-80 animate-pulse">
            <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-80 animate-pulse">
            <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="text-center">
          <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            Impossible de charger les données du tableau de bord
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Une erreur s'est produite lors du chargement des métriques.
            {!isOnline && " Vous êtes actuellement hors ligne. Veuillez vérifier votre connexion Internet."}
          </p>
          <div className="mt-6">
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Données de performance pour le graphique
  const performanceData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    data: metrics.performance.monthly?.map(item => item.value) || Array(12).fill(0).map(() => Math.random() * 5 - 1),
    benchmark: metrics.performance.monthly?.map(item => item.benchmark) || Array(12).fill(0).map(() => Math.random() * 2 + 0.5)
  };
  
  // Options du graphique
  const chartOptions = {
    color: colors.primary,
    secondaryColor: colors.secondary,
    showGrid: true,
    showBenchmark: showBenchmark
  };

  return (
    <div className="space-y-6">
      {/* Metrics row with horizontal scrolling */}
      <div className="relative overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex space-x-4 min-w-max sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:space-x-0">
        <PerformanceIndicatorCard
          label="Actifs sous gestion"
          value={metrics.assets.total}
          trend={metrics.assets.change > 0 ? 'up' : metrics.assets.change < 0 ? 'down' : 'neutral'}
          tag={`${metrics.assets.change > 0 ? '+' : ''}${metrics.assets.change}%`}
          color={colors.primary}
        />
        <PerformanceIndicatorCard
          label="Performance globale"
          value={`${metrics.performance.global}%`}
          trend={metrics.performance.change > 0 ? 'up' : metrics.performance.change < 0 ? 'down' : 'neutral'}
          tag={`${metrics.performance.change > 0 ? '+' : ''}${metrics.performance.change}%`}
          color={colors.primary}
        />
        <PerformanceIndicatorCard
          label={portfolioType === 'traditional' ? 'Maturité moyenne' : 
                 portfolioType === 'investment' ? 'Rendement dividendes' : 
                 'Taux d\'utilisation'}
          value={portfolioType === 'traditional' ? `36 mois` : 
                 portfolioType === 'investment' ? `4.2%` : 
                 portfolioType === 'leasing' && 'utilizationRate' in metrics.assets ? `${metrics.assets.utilizationRate}%` : `87%`}
          trend="neutral"
          color={colors.primary}
        />
        <PerformanceIndicatorCard
          label={portfolioType === 'traditional' ? 'Taux d\'intérêt moyen' : 
                 portfolioType === 'investment' ? 'Volatilité' : 
                 'Revenus mensuels'}
          value={portfolioType === 'traditional' ? `8.5%` : 
                 portfolioType === 'investment' && 'volatility' in metrics.risk ? `${metrics.risk.volatility}%` : 
                 formatCurrency(250000)}
          trend="neutral"
          tag={undefined}
          color={colors.primary}
        />
      </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {portfolioType === 'traditional'
                ? 'Rendement du portefeuille de crédits'
                : portfolioType === 'investment'
                ? 'Rendement des investissements'
                : 'Rendement des opérations de leasing'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
            <div className="flex items-center mr-4">
              <input
                type="checkbox"
                id="benchmark-toggle"
                checked={showBenchmark}
                onChange={(e) => setShowBenchmark(e.target.checked)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="benchmark-toggle" className="text-sm text-gray-600 dark:text-gray-400">
                Indice de référence
              </label>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  className={`px-3 py-1.5 text-xs font-medium ${
                    selectedTimeRange === option.value
                      ? 'bg-primary text-white'
                      : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedTimeRange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              className="ml-1"
              onClick={() => setShowPortfolioSelector(!showPortfolioSelector)}
            >
              <Filter className="h-4 w-4 mr-1" />
              <span>Filtres</span>
            </Button>
          </div>
        </div>
        
        {showPortfolioSelector && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Période</label>
              <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">{
                  selectedTimeRange === '7d' ? '7 derniers jours' :
                  selectedTimeRange === '1m' ? '30 derniers jours' :
                  selectedTimeRange === '3m' ? '3 derniers mois' :
                  selectedTimeRange === '6m' ? '6 derniers mois' :
                  selectedTimeRange === 'ytd' ? 'Depuis le début de l\'année' :
                  selectedTimeRange === '1y' ? '12 derniers mois' : 'Tout l\'historique'
                }</span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Portefeuille</label>
              <select 
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm"
                onChange={(e) => console.log('Portefeuille sélectionné:', e.target.value)}
              >
                <option value="all">Tous les portefeuilles</option>
                {portfolioType === 'traditional' && (
                  <>
                    <option value="credit">Crédit</option>
                    <option value="microfinance">Microfinance</option>
                  </>
                )}
                {portfolioType === 'investment' && (
                  <>
                    <option value="equities">Actions</option>
                    <option value="bonds">Obligations</option>
                  </>
                )}
                {portfolioType === 'leasing' && (
                  <>
                    <option value="vehicles">Véhicules</option>
                    <option value="machinery">Machines</option>
                  </>
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Comparaison</label>
              <select className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm">
                <option value="benchmark">Indice de référence</option>
                {portfolioType === 'traditional' && (
                  <>
                    <option value="credit">Crédit</option>
                    <option value="microfinance">Microfinance</option>
                  </>
                )}
                {portfolioType === 'investment' && (
                  <>
                    <option value="equities">Actions</option>
                    <option value="bonds">Obligations</option>
                  </>
                )}
                {portfolioType === 'leasing' && (
                  <>
                    <option value="vehicles">Véhicules</option>
                    <option value="machinery">Machines</option>
                  </>
                )}
              </select>
            </div>
          </div>
        )}
        
        <div className="p-4">
          <div className="h-[400px]">
            <EnhancedPerformanceChart
              data={performanceData.data}
              labels={performanceData.labels}
              benchmark={performanceData.benchmark}
              options={chartOptions}
            />
          </div>
        </div>
      </div>
      
      {/* Section Tableau des opérations récentes - Pleine largeur */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Opérations récentes
          </h3>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="hidden sm:flex"
              onClick={() => setShowSectorModal(true)}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              <span>Analyse sectorielle</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="hidden sm:flex"
              onClick={() => refreshOperations()}
              disabled={!isOnline}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              <span>Actualiser</span>
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="flex items-center"
              onClick={() => navigate(`/portfolio/${portfolioType}/operations`)}
            >
              <span>Détails</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {operationsError && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm">
            <p>
              Une erreur s'est produite lors du chargement des opérations.
              {!isOnline && " Vous êtes actuellement hors ligne. Les données affichées peuvent ne pas être à jour."}
            </p>
          </div>
        )}
        
        <RecentOperationsTable
          operations={operations}
          portfolioType={portfolioType as PortfolioType}
          isLoading={operationsLoading}
          limit={8}
        />
      </div>

      {/* Modal d'analyse sectorielle */}
      {showSectorModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowSectorModal(false)}
            ></div>

            {/* Modal content */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary-hover px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Analyse de répartition sectorielle
                      </h3>
                      <p className="text-primary-light/80 text-sm">
                        Vue détaillée de la distribution par secteur d'activité
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSectorModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {sectorLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <MultiSegmentSpinner size="large" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Répartition visuelle */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Répartition détaillée
                      </h4>
                      <div className="space-y-4">
                        {Object.entries(sectorDistribution)
                          .sort(([,a], [,b]) => b - a)
                          .map(([sector, percentage]) => (
                          <div key={sector} className="group">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm" 
                                  style={{ backgroundColor: getSectorColor(sector) }}
                                ></div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {sector}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                              <div 
                                className="h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                                style={{ 
                                  width: `${percentage}%`,
                                  background: `linear-gradient(90deg, ${getSectorColor(sector)}, ${getSectorColor(sector)}dd)`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Statistiques et insights */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Statistiques clés
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-primary-light to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-primary/10">
                          <p className="text-xs uppercase tracking-wide text-primary font-medium mb-1">
                            Secteur dominant
                          </p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {Object.entries(sectorDistribution).length > 0 
                              ? Object.entries(sectorDistribution).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                              : 'Aucun'
                            }
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {Object.entries(sectorDistribution).length > 0 
                              ? `${Object.entries(sectorDistribution).reduce((a, b) => a[1] > b[1] ? a : b)[1].toFixed(1)}% du portefeuille`
                              : 'Aucune donnée'
                            }
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-green-200/50">
                          <p className="text-xs uppercase tracking-wide text-green-600 font-medium mb-1">
                            Diversification
                          </p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {Object.keys(sectorDistribution).length} secteurs
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {Object.keys(sectorDistribution).length >= 5 
                              ? 'Bonne diversification' 
                              : 'Diversification limitée'
                            }
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-amber-200/50">
                          <p className="text-xs uppercase tracking-wide text-amber-600 font-medium mb-1">
                            Concentration
                          </p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {Object.entries(sectorDistribution).length > 0 
                              ? `${(Object.entries(sectorDistribution)
                                  .sort(([,a], [,b]) => b - a)
                                  .slice(0, 3)
                                  .reduce((sum, [, percentage]) => sum + percentage, 0)).toFixed(1)}%`
                              : '0%'
                            }
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Top 3 secteurs
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowSectorModal(false)}
                    variant="outline"
                    size="sm"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Fonction pour obtenir une couleur par secteur
function getSectorColor(sector: string): string {
  // Palette de couleurs pour les secteurs
  const sectorColors: Record<string, string> = {
    // Secteurs communs
    'Agriculture': '#22c55e',
    'Industrie': '#3b82f6',
    'Commerce': '#f59e0b',
    'Services': '#8b5cf6',
    'BTP': '#ec4899',
    'Transport et logistique': '#06b6d4',
    'Technologies': '#6366f1',
    'Finance': '#10b981',
    'Santé': '#ef4444',
    'Énergie': '#f97316',
    'Éducation': '#0ea5e9',
    'Immobilier': '#14b8a6',
    'Média et communication': '#a855f7',
    'Agroalimentaire': '#84cc16',
    'Artisanat': '#f43f5e'
  };
  
  // Retourner la couleur associée au secteur ou une couleur par défaut
  return sectorColors[sector] || '#6b7280';
}

export default EnhancedPortfolioDashboard;
