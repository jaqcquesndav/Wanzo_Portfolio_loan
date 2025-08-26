import React, { useState, useMemo } from 'react';
import { useTraditionalPortfolios } from '../../hooks/useTraditionalPortfolios';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';
import { useOHADAMetrics } from '../../hooks/dashboard/useOHADAMetrics';
import { useDashboardCustomization } from '../../hooks/dashboard/useDashboardCustomization';
import { OHADACharts } from './OHADACharts';
import { WidgetSelector } from './WidgetSelector';
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
 * Dashboard Professionnel Crédit OHADA
 * Conforme aux standards du financement PME en zone CEMAC/UEMOA
 */
export const ProfessionalCreditDashboard: React.FC = () => {
  const { portfolios, loading: portfoliosLoading } = useTraditionalPortfolios();
  const { formatCurrency } = useFormatCurrency();
  const { 
    metrics, 
    globalMetrics, 
    loading: metricsLoading, 
    error: metricsError,
    refreshMetrics,
    getComplianceSummary,
    lastUpdate 
  } = useOHADAMetrics();

  // Hook de customisation (utilisateur simulé)
  const { 
    preferences,
    availableWidgets,
    updateWidgetVisibility,
    resetToDefault
  } = useDashboardCustomization('user_001');

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

  // Données à afficher selon la sélection
  const currentMetrics = useMemo(() => {
    if (portfolioSelection.mode === 'global') {
      return globalMetrics;
    }
    if (portfolioSelection.selectedPortfolioId) {
      return metrics.find(m => m.id === portfolioSelection.selectedPortfolioId) || null;
    }
    return null;
  }, [portfolioSelection, metrics, globalMetrics]);

  // Résumé de conformité
  const complianceSummary = getComplianceSummary();

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

  const loading = portfoliosLoading || metricsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCwIcon className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Chargement des métriques OHADA...</p>
        </div>
      </div>
    );
  }

  if (metricsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-sm text-gray-600 mb-4">{metricsError}</p>
          <Button onClick={refreshMetrics} variant="outline">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!currentMetrics) {
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
      {/* En-tête avec sélecteurs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-sm text-gray-600 mt-1">
            Conforme aux normes OHADA/BCEAO • 
            {lastUpdate && ` Dernière MAJ: ${new Date(lastUpdate).toLocaleString('fr-FR')}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Sélecteur de customisation des widgets */}
          <WidgetSelector
            widgets={preferences?.widgets || availableWidgets}
            onToggleWidget={updateWidgetVisibility}
            onResetToDefault={resetToDefault}
          />

          {/* Sélecteur de portefeuille */}
          <div className="relative">
            <div className="relative">
              <select
                value={portfolioSelection.selectedPortfolioId || 'global'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'global') {
                    setPortfolioSelection({ mode: 'global', label: 'Vue Globale - Tous Portefeuilles' });
                  } else {
                    const option = portfolioOptions.find(opt => 
                      opt.mode === 'individual' && opt.selectedPortfolioId === value
                    );
                    if (option) {
                      setPortfolioSelection(option);
                    }
                  }
                }}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px] relative z-10"
                style={{ backgroundImage: 'none' }}
              >
                {portfolioOptions.map((option, index) => (
                  <option 
                    key={index} 
                    value={option.selectedPortfolioId || 'global'}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Sélecteur de période */}
          <div className="relative">
            <div className="relative">
              <select
                value={periodFilter.type}
                onChange={(e) => {
                  const selectedType = e.target.value as PeriodFilter['type'];
                  const selectedOption = periodOptions.find(opt => opt.type === selectedType);
                  if (selectedOption) {
                    setPeriodFilter(selectedOption);
                  }
                }}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[160px]"
                style={{ backgroundImage: 'none' }}
              >
                {periodOptions.map((option) => (
                  <option key={option.type} value={option.type}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <Button onClick={refreshMetrics} variant="outline" size="sm">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
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
      {isWidgetVisible('kpi-overview') && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Montant total */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Montant Total</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {formatCurrency(currentMetrics.totalAmount)}
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
                  {currentMetrics.activeContracts.toLocaleString('fr-FR')}
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
                  currentMetrics.nplRatio <= 3 ? 'text-green-600' : 
                  currentMetrics.nplRatio <= 5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {currentMetrics.nplRatio}%
                </p>
              </div>
              <AlertCircleIcon className={`h-6 w-6 opacity-75 ${
                currentMetrics.nplRatio <= 3 ? 'text-green-600' : 
                currentMetrics.nplRatio <= 5 ? 'text-yellow-600' : 'text-red-600'
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
                  currentMetrics.roa >= 3 ? 'text-green-600' : 
                  currentMetrics.roa >= 2 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {currentMetrics.roa}%
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
                  {currentMetrics.portfolioYield}%
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
                  currentMetrics.collectionEfficiency >= 90 ? 'text-green-600' : 
                  currentMetrics.collectionEfficiency >= 80 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {currentMetrics.collectionEfficiency}%
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
                    style={{ width: `${currentMetrics.balanceAGE.current}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold w-12 text-right">
                  {currentMetrics.balanceAGE.current}%
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
                    style={{ width: `${currentMetrics.balanceAGE.days30}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold w-12 text-right">
                  {currentMetrics.balanceAGE.days30}%
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
                    style={{ width: `${currentMetrics.balanceAGE.days60}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold w-12 text-right">
                  {currentMetrics.balanceAGE.days60}%
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
                    style={{ width: `${currentMetrics.balanceAGE.days90Plus}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold w-12 text-right">
                  {currentMetrics.balanceAGE.days90Plus}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Métriques additionnelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations Générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Secteur:</span>
              <span className="text-sm font-medium">{currentMetrics.sector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Montant moyen:</span>
              <span className="text-sm font-medium">{formatCurrency(currentMetrics.avgLoanSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Croissance:</span>
              <span className={`text-sm font-medium ${
                currentMetrics.growthRate > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentMetrics.growthRate > 0 ? '+' : ''}{currentMetrics.growthRate}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Niveau de risque:</span>
              <Badge 
                variant="secondary"
                className={
                  currentMetrics.riskLevel === 'Faible' ? 'border-green-600 text-green-600' :
                  currentMetrics.riskLevel === 'Moyen' ? 'border-yellow-600 text-yellow-600' :
                  'border-red-600 text-red-600'
                }
              >
                {currentMetrics.riskLevel}
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
                variant={currentMetrics.regulatoryCompliance?.bceaoCompliant ? 'success' : 'error'}
                className={
                  currentMetrics.regulatoryCompliance?.bceaoCompliant 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }
              >
                {currentMetrics.regulatoryCompliance?.bceaoCompliant ? 'Conforme' : 'Non conforme'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">OHADA (Provisions):</span>
              <Badge 
                variant={currentMetrics.regulatoryCompliance?.ohadaProvisionCompliant ? 'success' : 'error'}
                className={
                  currentMetrics.regulatoryCompliance?.ohadaProvisionCompliant 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }
              >
                {currentMetrics.regulatoryCompliance?.ohadaProvisionCompliant ? 'Conforme' : 'Non conforme'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Notation de risque:</span>
              <span className="text-sm font-medium">
                {currentMetrics.regulatoryCompliance?.riskRating || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Taux de provision:</span>
              <span className="text-sm font-medium">{currentMetrics.provisionRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Graphiques OHADA */}
      {(isWidgetVisible('monthly-performance') || isWidgetVisible('balance-age-distribution') || 
        isWidgetVisible('risk-return-matrix') || isWidgetVisible('portfolio-composition')) && (
        <OHADACharts metrics={metrics} selectedMetrics={currentMetrics} />
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
};
