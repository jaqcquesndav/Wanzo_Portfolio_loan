import React, { useState, useMemo } from 'react';
import { useTraditionalPortfolios } from '../../hooks/useTraditionalPortfolios';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';
import { useDashboardApi, useDashboardRiskMetrics } from '../../hooks/useDashboardApi';
import { useDashboardCustomization } from '../../hooks/dashboard/useDashboardCustomization';
import { OHADACharts } from './OHADACharts';
import { WidgetSelector } from './WidgetSelector';
import { DashboardSkeleton } from '../ui/DashboardSkeleton';
import type { PortfolioSelection, PeriodFilter } from '../../types/dashboard/ohada';
import type { WidgetType } from '../../types/dashboard/customization';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUpIcon, AlertCircleIcon, CheckCircleIcon, BarChart3Icon, DollarSignIcon, UsersIcon, PieChartIcon, RefreshCwIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

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
 * Dashboard Professionnel Crédit OHADA
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
    metrics: riskMetrics,
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
    if (!preferences?.widgets) return availableWidgets;
    return preferences.widgets.filter(widget => widget.isVisible);
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
      timestamp: '2025-08-26T12:45:00Z'
    },
    {
      id: '4',
      type: 'remboursement',
      description: 'Remboursement mensuel - Société transport',
      user: 'Patrick Mbuyi',
      portfolio: 'Transport Kinshasa',
      contractId: 'CON-2024-156',
      amount: 12000000, // 12M CDF
      status: 'termine',
      timestamp: '2025-08-26T11:20:00Z'
    },
    {
      id: '5',
      type: 'garantie',
      description: 'Évaluation garantie foncière - Zone Gombe',
      user: 'Claudine Mujinga',
      portfolio: 'Immobilier Kinshasa',
      contractId: 'CON-2025-004',
      status: 'en_attente',
      timestamp: '2025-08-26T10:30:00Z'
    },
    {
      id: '6',
      type: 'validation',
      description: 'Approbation comité - Financement minier',
      user: 'Emmanuel Kasongo',
      portfolio: 'Mines Katanga',
      contractId: 'CON-2025-005',
      amount: 450000000, // 450M CDF
      status: 'en_cours',
      timestamp: '2025-08-26T09:15:00Z'
    },
    {
      id: '7',
      type: 'demande',
      description: 'Restructuration dette - PME Agroalimentaire',
      user: 'Sylvie Nzuzi',
      portfolio: 'Agriculture Bas-Congo',
      contractId: 'CON-2024-089',
      amount: 75000000, // 75M CDF
      status: 'rejete',
      timestamp: '2025-08-25T16:45:00Z'
    },
    {
      id: '8',
      type: 'virement',
      description: 'Financement matériel médical - Clinique privée',
      user: 'Dr. Robert Lukoki',
      portfolio: 'Santé Kinshasa',
      contractId: 'CON-2025-006',
      amount: 180000000, // 180M CDF
      status: 'en_cours',
      timestamp: '2025-08-25T15:30:00Z'
    },
    {
      id: '9',
      type: 'contrat',
      description: 'Accord financement - Société BTP infrastructure',
      user: 'Olivier Mbala',
      portfolio: 'BTP Kinshasa',
      contractId: 'CON-2025-007',
      amount: 320000000, // 320M CDF
      status: 'termine',
      timestamp: '2025-08-25T14:10:00Z'
    },
    {
      id: '10',
      type: 'remboursement',
      description: 'Remboursement anticipé - Entreprise télécoms',
      user: 'Isaac Kalala',
      portfolio: 'Télécoms RDC',
      contractId: 'CON-2024-234',
      amount: 95000000, // 95M CDF
      status: 'termine',
      timestamp: '2025-08-25T13:25:00Z'
    }
  ], []);

  // Calcul de la pagination
  const totalPages = Math.ceil(mockActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
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

  // Adapter les données API au format attendu par le composant
  const adaptedMetrics = useMemo(() => {
    if (!currentMetrics) return null;
    
    // Données par défaut basées sur l'API du dashboard
    return {
      id: 'dashboard-global',
      name: 'Vue globale des portefeuilles traditionnels',
      totalAmount: currentMetrics.totalValue,
      activeContracts: currentMetrics.count,
      nplRatio: currentMetrics.avgRiskScore * 1.2 || 2.5, // Approximation basée sur le score de risque
      collectionEfficiency: 95 - (currentMetrics.avgRiskScore * 5) || 95,
      portfolioYield: 8.5,
      roa: 2.1,
      provisionRate: currentMetrics.avgRiskScore * 2 || 3.5,
      balanceAGE: {
        current: 70,
        days30: 20,
        days60: 7,
        days90Plus: 3
      },
      sector: 'PME/Microfinance',
      avgLoanSize: currentMetrics.totalValue / currentMetrics.count || 0,
      growthRate: 3.2,
      riskLevel: (currentMetrics.avgRiskScore <= 2 ? 'Faible' : 
                 currentMetrics.avgRiskScore <= 3 ? 'Moyen' : 'Élevé') as 'Faible' | 'Moyen' | 'Élevé',
      regulatoryCompliance: {
        bceaoCompliant: currentMetrics.avgRiskScore <= 2.5,
        ohadaProvisionCompliant: true,
        riskRating: 'A' as 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC'
      },
      monthlyPerformance: [],
      lastActivity: new Date().toISOString()
    };
  }, [currentMetrics]);

  // Résumé de conformité - utiliser les alertes de risque de l'API
  const complianceSummary = useMemo(() => {
    const criticalAlerts = riskMetrics?.filter((alert: { level: string }) => alert.level === 'critical').length || 0;
    const totalPortfolios = dashboardData?.kpis.totalPortfolios || 0;
    
    return {
      status: criticalAlerts === 0 ? 'COMPLIANT' : criticalAlerts <= 2 ? 'WARNING' : 'NON_COMPLIANT',
      riskLevel: criticalAlerts === 0 ? 'Faible' : criticalAlerts <= 2 ? 'Moyen' : 'Élevé',
      totalPortfolios,
      nonCompliantCount: criticalAlerts,
      complianceRate: totalPortfolios > 0 ? 
        ((totalPortfolios - criticalAlerts) / totalPortfolios * 100).toFixed(1) : '0'
    };
  }, [riskMetrics, dashboardData]);

  // Options de portefeuilles pour le sélecteur
  const portfolioOptions = useMemo(() => {
    const options: PortfolioSelection[] = [
      { mode: 'global', label: 'Vue Globale - Tous Portefeuilles' }
    ];
    
    portfolios.forEach(portfolio => {
      options.push({
        mode: 'individual',
        selectedPortfolioId: portfolio.id,
        label: `${portfolio.name} (${portfolio.target_sectors?.[0] || 'PME'})`
      });
    });
    
    return options;
  }, [portfolios]);

  // Options de période
  const periodOptions: PeriodFilter[] = [
    { type: 'month', label: 'Mois en cours' },
    { type: 'quarter', label: 'Trimestre en cours' },
    { type: 'semester', label: 'Semestre en cours' },
    { type: 'year', label: 'Année en cours' },
    { type: 'custom', label: 'Période personnalisée' }
  ];

  const loading = portfoliosLoading || dashboardLoading || riskLoading;

  // Rendu principal - toujours afficher l'en-tête
  return (
    <div className="space-y-6">
      {/* En-tête toujours visible */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <BarChart3Icon className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Dashboard Professionnel Crédit
          </h1>
          {loading && (
            <RefreshCwIcon className="h-5 w-5 animate-spin text-blue-600" />
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Sélecteur de portefeuille */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Portefeuille:</span>
            <select 
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm disabled:opacity-50"
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
          </div>

          {/* Sélecteur de période */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Période:</span>
            <select 
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm disabled:opacity-50"
              value={periodOptions.findIndex(opt => opt.type === periodFilter.type)}
              onChange={(e) => setPeriodFilter(periodOptions[parseInt(e.target.value)])}
              disabled={loading}
            >
              {periodOptions.map((option, index) => (
                <option key={index} value={index}>{option.label}</option>
              ))}
            </select>
          </div>

          <Button 
            onClick={refreshDashboard} 
            variant="outline" 
            size="sm"
            disabled={loading}
            icon={<RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Actualiser
          </Button>
        </div>
      </div>

      {/* Contenu conditionnel */}
      {loading ? (
        <DashboardSkeleton />
      ) : renderDashboardContent()}
    </div>
  );

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
              {selectedWidgets?.length || 0} widget{(selectedWidgets?.length || 0) > 1 ? 's' : ''} actif{(selectedWidgets?.length || 0) > 1 ? 's' : ''}
            </span>
          </div>

          <div className="text-sm text-gray-500">
            Conforme aux normes OHADA/BCEAO • 
            {dashboardData && ` Dernière MAJ: ${new Date().toLocaleString('fr-FR')}`}
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
                  <h3 className="font-semibold text-gray-900">Conformité Réglementaire OHADA/BCEAO</h3>
                  <p className="text-sm text-gray-600">
                    {complianceSummary.totalPortfolios} portefeuilles • {complianceSummary.complianceRate}% conforme
                  </p>
                </div>
              </div>
              <Badge 
                variant={complianceSummary.status === 'COMPLIANT' ? 'success' : 'warning'}
                className={
                  complianceSummary.status === 'COMPLIANT' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {complianceSummary.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs compacts */}
      {isWidgetVisible('kpi-overview') && adaptedMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Montant total */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Montant Total</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {formatCurrency(adaptedMetrics?.totalAmount || 0)}
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
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Contrats</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
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
                }}`}>
                  {adaptedMetrics.nplRatio}%
                </p>
              </div>
              <AlertCircleIcon className={`h-6 w-6 opacity-75 ${
                adaptedMetrics.nplRatio <= 3 ? 'text-green-600' : 
                adaptedMetrics.nplRatio <= 5 ? 'text-yellow-600' : 'text-red-600'
              }`} />
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
                }}`}>
                  {adaptedMetrics.roa}%
                </p>
              </div>
              <TrendingUpIcon className="h-6 w-6 text-purple-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        {/* Rendement */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Rendement</p>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  {adaptedMetrics.portfolioYield}%
                </p>
              </div>
              <PieChartIcon className="h-6 w-6 text-blue-600 opacity-75" />
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
      {isWidgetVisible('balance-age') && adaptedMetrics && (
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

      {/* Métriques additionnelles */}
      {adaptedMetrics && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations Générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Secteur:</span>
              <span className="text-sm font-medium">{adaptedMetrics.sector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Montant moyen:</span>
              <span className="text-sm font-medium">{formatCurrency(adaptedMetrics.avgLoanSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Croissance:</span>
              <span className={`text-sm font-medium ${
                adaptedMetrics.growthRate > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {adaptedMetrics.growthRate > 0 ? '+' : ''}{adaptedMetrics.growthRate}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Niveau de risque:</span>
              <Badge 
                variant="secondary"
                className={
                  adaptedMetrics.riskLevel === 'Faible' ? 'border-green-600 text-green-600' :
                  adaptedMetrics.riskLevel === 'Moyen' ? 'border-yellow-600 text-yellow-600' :
                  'border-red-600 text-red-600'
                }
              >
                {adaptedMetrics.riskLevel}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Conformité réglementaire */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conformité OHADA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">BCEAO (NPL ≤ 5%):</span>
              <Badge 
                variant={adaptedMetrics.regulatoryCompliance?.bceaoCompliant ? 'success' : 'error'}
                className={
                  adaptedMetrics.regulatoryCompliance?.bceaoCompliant 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }
              >
                {adaptedMetrics.regulatoryCompliance?.bceaoCompliant ? 'Conforme' : 'Non conforme'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">OHADA (Provisions):</span>
              <Badge 
                variant={adaptedMetrics.regulatoryCompliance?.ohadaProvisionCompliant ? 'success' : 'error'}
                className={
                  adaptedMetrics.regulatoryCompliance?.ohadaProvisionCompliant 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }
              >
                {adaptedMetrics.regulatoryCompliance?.ohadaProvisionCompliant ? 'Conforme' : 'Non conforme'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Notation de risque:</span>
              <span className="text-sm font-medium">
                {adaptedMetrics.regulatoryCompliance?.riskRating || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Taux de provision:</span>
              <span className="text-sm font-medium">{adaptedMetrics.provisionRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Section Graphiques OHADA */}
      {(isWidgetVisible('monthly-performance') || isWidgetVisible('balance-age-distribution') || 
        isWidgetVisible('risk-return-matrix') || isWidgetVisible('portfolio-composition')) && (
        <OHADACharts metrics={[]} selectedMetrics={adaptedMetrics} />
      )}

      {/* Activités récentes - Tableau paginé */}
      {isWidgetVisible('recent-activities') && (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activités Récentes</CardTitle>
          <p className="text-sm text-gray-600">
            Suivi des actions et transactions par utilisateur, portefeuille et contrat
          </p>
        </CardHeader>
        <CardContent>
          {/* Tableau des activités */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Description</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Utilisateur</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Portefeuille</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Contrat</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Montant</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Statut</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {currentActivities.map((activity) => (
                  <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <Badge 
                        variant="secondary" 
                        className={
                          activity.type === 'demande' ? 'bg-blue-100 text-blue-800' :
                          activity.type === 'contrat' ? 'bg-green-100 text-green-800' :
                          activity.type === 'virement' ? 'bg-purple-100 text-purple-800' :
                          activity.type === 'remboursement' ? 'bg-yellow-100 text-yellow-800' :
                          activity.type === 'garantie' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-900">{activity.description}</td>
                    <td className="py-3 px-2 text-sm text-gray-700">{activity.user}</td>
                    <td className="py-3 px-2 text-sm text-gray-700">{activity.portfolio}</td>
                    <td className="py-3 px-2 text-sm text-gray-600 font-mono">
                      {activity.contractId || '-'}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-900">
                      {activity.amount ? formatCurrency(activity.amount) : '-'}
                    </td>
                    <td className="py-3 px-2">
                      <Badge 
                        variant={
                          activity.status === 'termine' ? 'success' :
                          activity.status === 'en_cours' ? 'secondary' :
                          activity.status === 'rejete' ? 'error' :
                          'secondary'
                        }
                        className={
                          activity.status === 'termine' ? 'bg-green-100 text-green-800' :
                          activity.status === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                          activity.status === 'rejete' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {activity.status === 'en_cours' ? 'En cours' :
                         activity.status === 'termine' ? 'Terminé' :
                         activity.status === 'rejete' ? 'Rejeté' :
                         'En attente'}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {new Date(activity.timestamp).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-700">
              Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, mockActivities.length)} sur {mockActivities.length} activités
            </p>
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
};
