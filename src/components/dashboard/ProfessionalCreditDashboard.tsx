import React, { useState, useMemo } from 'react';
import { useTraditionalPortfolios } from '../../hooks/useTraditionalPortfolios';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';
import { useDashboardApi, useDashboardRiskMetrics } from '../../hooks/useDashboardApi';
import { useDashboardCustomization } from '../../hooks/dashboard/useDashboardCustomization';
import { WidgetSelector } from './WidgetSelector';
import { DashboardSkeleton } from '../ui/DashboardSkeleton';
import type { PortfolioSelection, PeriodFilter } from '../../types/dashboard/ohada';
import type { WidgetType } from '../../types/dashboard/customization';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { CalendarIcon, ChevronDownIcon, TrendingUpIcon, AlertCircleIcon, CheckCircleIcon, BarChart3Icon, DollarSignIcon, UsersIcon, PieChartIcon, RefreshCwIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

// Interface pour les activités récentes
interface ActivityItem {
  id: string;
  type: 'demande' | 'contrat' | 'virement' | 'remboursement' | 'garantie' | 'validation';
  description: string;
  user: string;
  portfolio: string;
  contractId?: string;
  amount?: number;
  status: 'en_cours' | 'termine' | 'rejete' | 'en_attente';
  timestamp: string;
}

/**
 * Dashboard Crédit OHADA
 * Conforme aux standards du financement PME en zone CEMAC/UEMOA
 */
export const ProfessionalCreditDashboard: React.FC = () => {
  const { portfolios, loading: portfoliosLoading } = useTraditionalPortfolios();
  const { formatCurrency } = useFormatCurrency();
  
  // Utiliser les hooks API pour récupérer les données réelles
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refreshDashboard
  } = useDashboardApi();
  
  const {
    loading: riskLoading,
    error: riskError
  } = useDashboardRiskMetrics();

  // Hook de customisation (utilisateur simulé)
  const { 
    preferences,
    availableWidgets,
    updateWidgetVisibility,
    resetToDefault
  } = useDashboardCustomization('user_001');

  // Calculer les widgets sélectionnés depuis les préférences
  const selectedWidgets = useMemo(() => {
    return preferences?.widgets?.filter(w => w.isVisible).map(w => w.id) || availableWidgets.map(w => w.id);
  }, [preferences?.widgets, availableWidgets]);

  // États locaux
  const [portfolioSelection, setPortfolioSelection] = useState<PortfolioSelection>({
    mode: 'global',
    label: 'Vue Globale - Tous Portefeuilles'
  });

  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({
    type: 'year',
    label: 'Année en cours'
  });

  // État pour la pagination des activités
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Données mockées des activités récentes (basées sur entreprises RDC réelles)
  const mockActivities: ActivityItem[] = useMemo(() => [
    {
      id: '1',
      type: 'demande',
      description: 'Nouvelle demande de crédit PME - Secteur Agro-alimentaire',
      user: 'Marie Kabila',
      portfolio: 'PME Kinshasa',
      contractId: 'CON-2025-001',
      amount: 150000000, // 150M CDF
      status: 'en_cours',
      timestamp: '2025-08-26T14:30:00Z'
    },
    {
      id: '2',
      type: 'virement',
      description: 'Déblocage fonds - Projet expansion commerciale',
      user: 'Jean-Pierre Mukendi',
      portfolio: 'Commerce RDC',
      contractId: 'CON-2025-002',
      amount: 85000000, // 85M CDF
      status: 'termine',
      timestamp: '2025-08-26T13:15:00Z'
    },
    {
      id: '3',
      type: 'contrat',
      description: 'Signature contrat financement - Entreprise textile',
      user: 'Grace Tshimanga',
      portfolio: 'Industries Lubumbashi',
      contractId: 'CON-2025-003',
      amount: 220000000, // 220M CDF
      status: 'termine',
      timestamp: '2025-08-26T11:45:00Z'
    },
    {
      id: '4',
      type: 'garantie',
      description: 'Validation garantie immobilière - Local commercial',
      user: 'Antoine Nsembo',
      portfolio: 'PME Kinshasa',
      contractId: 'CON-2025-001',
      status: 'en_cours',
      timestamp: '2025-08-26T10:20:00Z'
    },
    {
      id: '5',
      type: 'remboursement',
      description: 'Échéance mensuelle - Crédit équipement agricole',
      user: 'System Auto',
      portfolio: 'Agriculture Kasaï',
      contractId: 'CON-2025-015',
      amount: 12500000, // 12.5M CDF
      status: 'termine',
      timestamp: '2025-08-26T09:00:00Z'
    }
  ], []);

  // Calculs pour la pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const totalPages = Math.ceil(mockActivities.length / itemsPerPage);
  const currentActivities = mockActivities.slice(startIndex, startIndex + itemsPerPage);

  // Helper pour vérifier si un widget est visible
  const isWidgetVisible = (widgetId: WidgetType): boolean => {
    if (!preferences?.widgets) return true;
    const widget = preferences.widgets.find(w => w.id === widgetId);
    return widget?.isVisible ?? true;
  };

  // Données à afficher selon la sélection - utiliser les données API
  const currentMetrics = useMemo(() => {
    if (portfolioSelection.mode === 'global') {
      // Utiliser les données globales du dashboard
      return dashboardData?.portfolioSummary.traditional;
    }
    if (portfolioSelection.selectedPortfolioId) {
      // Pour un portefeuille spécifique, utiliser les données globales pour l'instant
      return dashboardData?.portfolioSummary.traditional;
    }
    return null;
  }, [portfolioSelection, dashboardData]);

  // Adaptateur pour transformer les données API en métriques dashboard
  const adaptedMetrics = useMemo(() => {
    if (!currentMetrics && !dashboardData) return null;

    // Données de base depuis l'API ou valeurs par défaut
    const baseData = currentMetrics || dashboardData?.kpis || {};
    
    return {
      totalAmount: (baseData as { totalValue?: number })?.totalValue || 0,
      activeContracts: (baseData as { activePortfolios?: number })?.activePortfolios || 0,
      nplRatio: 3.2,
      roa: 2.8,
      portfolioYield: 4.5,
      collectionEfficiency: 87.5,
      balanceAGE: {
        current: 65,
        days30: 20,
        days60: 10,
        days90Plus: 5
      },
      sector: 'PME',
      avgLoanSize: 75000000,
      growthRate: 12.3,
      riskLevel: 'Moyen' as const,
      regulatoryCompliance: {
        bceaoCompliant: true,
        ohadaProvisionCompliant: true,
        riskRating: 'BBB+'
      },
      provisionRate: 4.2
    };
  }, [currentMetrics, dashboardData]);

  // Données de conformité mockées
  const complianceSummary = useMemo(() => {
    return {
      status: 'COMPLIANT' as const,
      totalPortfolios: portfolios.length || 12,
      complianceRate: 94.2
    };
  }, [portfolios.length]);

  // Options des sélecteurs
  const portfolioOptions = useMemo(() => {
    const baseOptions: PortfolioSelection[] = [
      { mode: 'global', label: 'Vue Globale - Tous Portefeuilles' }
    ];
    
    const portfolioSpecificOptions: PortfolioSelection[] = portfolios.map(portfolio => ({
      mode: 'individual' as const,
      selectedPortfolioId: portfolio.id,
      label: portfolio.name
    }));
    
    return [...baseOptions, ...portfolioSpecificOptions];
  }, [portfolios]);

  const periodOptions: PeriodFilter[] = [
    { type: 'month', label: 'Mois en cours' },
    { type: 'quarter', label: 'Trimestre en cours' },
    { type: 'semester', label: 'Semestre en cours' },
    { type: 'year', label: 'Année en cours' },
    { type: 'custom', label: 'Période personnalisée' }
  ];

  const loading = portfoliosLoading || dashboardLoading || riskLoading;

  // Fonction pour rendre le contenu selon l'état
  function renderDashboardContent() {
    // Gestion des erreurs API
    const hasError = dashboardError || riskError;
  
    if (hasError) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-sm text-gray-600 mb-4">{dashboardError || riskError}</p>
            <Button onClick={refreshDashboard} variant="outline">
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      );
    }

    if (!adaptedMetrics) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune donnée disponible</h3>
            <p className="text-sm text-gray-600">Sélectionnez un portefeuille pour voir les métriques.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Actions des widgets */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <WidgetSelector
              widgets={preferences?.widgets || availableWidgets}
              onToggleWidget={updateWidgetVisibility}
              onResetToDefault={resetToDefault}
            />
            <span className="text-sm text-gray-500">
              {selectedWidgets.length} widget{selectedWidgets.length > 1 ? 's' : ''} actif{selectedWidgets.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="text-sm text-gray-500">
            Conforme aux normes OHADA/BCEAO • 
            Dernière MAJ: {dashboardData ? new Date().toLocaleString('fr-FR') : 'Chargement...'}
          </div>
        </div>

        {/* Indicateur de conformité OHADA */}
        {isWidgetVisible('regulatory-compliance') && (
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {complianceSummary.status === 'COMPLIANT' ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircleIcon className="h-6 w-6 text-yellow-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {complianceSummary.totalPortfolios} portefeuilles • {complianceSummary.complianceRate}% conforme
                  </p>
                </div>
              </div>
              <Badge 
                variant={complianceSummary.status === 'COMPLIANT' ? 'success' : 'warning'}
                className={
                  complianceSummary.status === 'COMPLIANT'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }
              >
                {complianceSummary.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
        )}

        {/* KPIs Overview */}
        {isWidgetVisible('kpi-overview') && adaptedMetrics && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Montant total */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Montant Total</p>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {formatCurrency(adaptedMetrics.totalAmount)}
                  </p>
                </div>
                <DollarSignIcon className="h-6 w-6 text-blue-600 opacity-75" />
              </div>
            </CardContent>
          </Card>

          {/* Contrats actifs */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Contrats Actifs</p>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    {adaptedMetrics.activeContracts.toLocaleString('fr-FR')}
                  </p>
                </div>
                <UsersIcon className="h-6 w-6 text-green-600 opacity-75" />
              </div>
            </CardContent>
          </Card>

          {/* NPL Ratio */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">NPL Ratio</p>
                  <p className={`text-lg font-bold mt-1 ${
                    adaptedMetrics.nplRatio <= 3 ? 'text-green-600' :
                    adaptedMetrics.nplRatio <= 5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {adaptedMetrics.nplRatio}%
                  </p>
                  <p className={`text-xs mt-1 ${
                    adaptedMetrics.nplRatio <= 3 ? 'text-green-600' :
                    adaptedMetrics.nplRatio <= 5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    Seuil BCEAO: 5%
                  </p>
                </div>
                <AlertCircleIcon className="h-6 w-6 text-orange-600 opacity-75" />
              </div>
            </CardContent>
          </Card>

          {/* ROA */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">ROA</p>
                  <p className={`text-lg font-bold mt-1 ${
                    adaptedMetrics.roa >= 3 ? 'text-green-600' :
                    adaptedMetrics.roa >= 2 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {adaptedMetrics.roa}%
                  </p>
                </div>
                <TrendingUpIcon className="h-6 w-6 text-purple-600 opacity-75" />
              </div>
            </CardContent>
          </Card>

          {/* Rendement portefeuille */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Rendement</p>
                  <p className="text-lg font-bold text-indigo-600 mt-1">
                    {adaptedMetrics.portfolioYield}%
                  </p>
                </div>
                <PieChartIcon className="h-6 w-6 text-indigo-600 opacity-75" />
              </div>
            </CardContent>
          </Card>

          {/* Efficacité recouvrement */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Recouvrement</p>
                  <p className={`text-lg font-bold mt-1 ${
                    adaptedMetrics.collectionEfficiency >= 90 ? 'text-green-600' :
                    adaptedMetrics.collectionEfficiency >= 80 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {adaptedMetrics.collectionEfficiency}%
                  </p>
                </div>
                <BarChart3Icon className="h-6 w-6 text-indigo-600 opacity-75" />
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Balance AGE */}
        {isWidgetVisible('balance-age') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Analyse Balance Âgée (AGE)</span>
              <Badge variant="secondary" className="ml-auto">
                Norme OHADA
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Courant (0-30 jours) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Courant (0-30j)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${adaptedMetrics.balanceAGE.current}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {adaptedMetrics.balanceAGE.current}%
                  </span>
                </div>
              </div>

              {/* 31-60 jours */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">31-60 jours</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${adaptedMetrics.balanceAGE.days30}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {adaptedMetrics.balanceAGE.days30}%
                  </span>
                </div>
              </div>

              {/* 61-90 jours */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium">61-90 jours</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${adaptedMetrics.balanceAGE.days60}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {adaptedMetrics.balanceAGE.days60}%
                  </span>
                </div>
              </div>

              {/* 90+ jours */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">90+ jours</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${adaptedMetrics.balanceAGE.days90Plus}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {adaptedMetrics.balanceAGE.days90Plus}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Graphiques OHADA */}
        <Card>
          <CardHeader>
            <CardTitle>Graphiques OHADA - En développement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p>Les graphiques OHADA seront disponibles prochainement</p>
            </div>
          </CardContent>
        </Card>

        {/* Activités récentes */}
        {isWidgetVisible('recent-activities') && (
        <Card>
          <CardHeader>
            <CardTitle>Activités Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>{activity.portfolio}</span>
                      <span>•</span>
                      <span>{new Date(activity.timestamp).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activity.amount && (
                      <span className="text-sm font-semibold text-blue-600">
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                    <Badge 
                      variant={
                        activity.status === 'termine' ? 'success' : 
                        activity.status === 'en_cours' ? 'warning' : 
                        activity.status === 'rejete' ? 'error' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {activity.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination simple */}
            <div className="flex items-center justify-center mt-6">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Précédent
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1"
                >
                  Suivant
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    );
  }

  // Rendu principal - toujours afficher l'en-tête
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* En-tête responsive */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        {/* Section titre */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
              <BarChart3Icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                Dashboard Crédit
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                Conforme aux normes OHADA/BCEAO
              </p>
            </div>
            {loading && (
              <RefreshCwIcon className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-blue-600 flex-shrink-0" />
            )}
          </div>
          
          {/* Bouton actualiser (mobile uniquement) */}
          <div className="sm:hidden">
            <Button 
              onClick={refreshDashboard} 
              variant="outline" 
              size="sm"
              disabled={loading}
              className="w-full"
            >
              <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>
        
        {/* Section contrôles */}
        <div className="mt-4 flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-end sm:justify-between">
          {/* Sélecteurs responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-3 lg:gap-4">
            {/* Sélecteur de portefeuille */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-medium">Portefeuille</span>
              </div>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white shadow-sm hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  value={portfolioOptions.findIndex(opt => 
                    opt.mode === portfolioSelection.mode && 
                    opt.selectedPortfolioId === portfolioSelection.selectedPortfolioId
                  )}
                  onChange={(e) => setPortfolioSelection(portfolioOptions[parseInt(e.target.value)])}
                  disabled={loading}
                >
                  {portfolioOptions.map((option, index) => (
                    <option key={index} value={index}>{option.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Sélecteur de période */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-medium">Période</span>
              </div>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white shadow-sm hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  value={periodOptions.findIndex(opt => opt.type === periodFilter.type)}
                  onChange={(e) => setPeriodFilter(periodOptions[parseInt(e.target.value)])}
                  disabled={loading}
                >
                  {periodOptions.map((option, index) => (
                    <option key={index} value={index}>{option.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Bouton actualiser (desktop) */}
          <div className="hidden sm:block lg:ml-4">
            <Button 
              onClick={refreshDashboard} 
              variant="outline" 
              size="sm"
              disabled={loading}
              className="shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">Actualiser</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu conditionnel */}
      {loading ? (
        <DashboardSkeleton />
      ) : renderDashboardContent()}
    </div>
  );
};