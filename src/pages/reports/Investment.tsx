import { useMemo, useState } from 'react';
import { useInvestmentReports, InvestmentReportColumn } from '../../hooks/useInvestmentReports';
import { ReportingFilterBar } from '../../components/reports/FilterBar';
import { InvestmentReportTable } from '../../components/reports/InvestmentReportTable';
import { InvestmentReportSummary } from '../../components/reports/InvestmentReportSummary';
import { InvestmentReportCharts } from '../../components/reports/InvestmentReportCharts';
import { ReportExportButton } from '../../components/reports/ReportExportButton';
import { useReportExport } from '../../hooks/useReportExport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { FileSpreadsheet, ListFilter } from 'lucide-react';

export default function InvestmentReports() {
  const {
    data,
    searchTerm,
    setSearchTerm,
    // activeFilters,
    setActiveFilters,
    // filterOptions,
    summaryMetrics,
    chartData,
    allData,
  } = useInvestmentReports();

  const [view, setView] = useState<'summary' | 'table'>('summary');
  const [columnPreset, setColumnPreset] = useState<'basic' | 'performance' | 'social' | 'all'>('basic');

  // Define column presets
  const columnSets = useMemo(() => {
    const basicColumns: InvestmentReportColumn[] = [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Entreprise', accessorKey: 'companyName' },
      { header: 'Secteur', accessorKey: 'sector' },
      { header: 'Pays', accessorKey: 'country' },
      { header: 'Région', accessorKey: 'region' },
      { header: 'Date d\'investissement', accessorKey: 'investmentDate', format: 'date' },
      { header: 'Statut', accessorKey: 'exitStatus' },
      { header: 'Montant investi', accessorKey: 'initialInvestment', format: 'currency' },
    ];

    const performanceColumns: InvestmentReportColumn[] = [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Entreprise', accessorKey: 'companyName' },
      { header: 'Secteur', accessorKey: 'sector' },
      { header: 'Date d\'investissement', accessorKey: 'investmentDate', format: 'date' },
      { header: 'Montant investi', accessorKey: 'initialInvestment', format: 'currency' },
      { header: 'Valuation actuelle', accessorKey: 'currentValuation', format: 'currency' },
      { header: 'Multiple', accessorKey: 'returnMultiple', format: 'number' },
      { header: 'TRI (%)', accessorKey: 'irr', format: 'number' },
      { header: 'Durée (années)', accessorKey: 'holdingPeriod', format: 'number' },
      { header: 'Dernière valuation', accessorKey: 'lastValuationDate', format: 'date' },
    ];

    const socialColumns: InvestmentReportColumn[] = [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Entreprise', accessorKey: 'companyName' },
      { header: 'Pays', accessorKey: 'country' },
      { header: 'Région', accessorKey: 'region' },
      { header: 'Emplois créés', accessorKey: 'jobsCreated', format: 'number' },
      { header: 'Structure juridique', accessorKey: 'legalStructure' },
      { header: 'Conforme OHADA', accessorKey: 'ohada', format: 'boolean' },
      { header: 'Niveau de risque', accessorKey: 'riskLevel' },
    ];

    const allColumns: InvestmentReportColumn[] = [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Entreprise', accessorKey: 'companyName' },
      { header: 'Secteur', accessorKey: 'sector' },
      { header: 'Pays', accessorKey: 'country' },
      { header: 'Région', accessorKey: 'region' },
      { header: 'Stade', accessorKey: 'stage' },
      { header: 'Date d\'investissement', accessorKey: 'investmentDate', format: 'date' },
      { header: 'Montant investi', accessorKey: 'initialInvestment', format: 'currency' },
      { header: 'Valuation actuelle', accessorKey: 'currentValuation', format: 'currency' },
      { header: 'Multiple', accessorKey: 'returnMultiple', format: 'number' },
      { header: 'TRI (%)', accessorKey: 'irr', format: 'number' },
      { header: 'Durée (années)', accessorKey: 'holdingPeriod', format: 'number' },
      { header: 'Statut', accessorKey: 'exitStatus' },
      { header: 'Structure juridique', accessorKey: 'legalStructure' },
      { header: 'Conforme OHADA', accessorKey: 'ohada', format: 'boolean' },
      { header: 'Niveau de risque', accessorKey: 'riskLevel' },
      { header: 'Emplois créés', accessorKey: 'jobsCreated', format: 'number' },
      { header: 'Dernière valuation', accessorKey: 'lastValuationDate', format: 'date' },
    ];

    return {
      basic: basicColumns,
      performance: performanceColumns,
      social: socialColumns,
      all: allColumns,
    };
  }, []);

  // Current columns based on preset
  const currentColumns = useMemo(() => {
    return columnSets[columnPreset];
  }, [columnPreset, columnSets]);

  // Setup export functionality
  const { handleExport } = useReportExport({
    data,
    columns: columnSets.all,
    filename: 'wanzo-investissements-rapport',
    title: 'Rapport des Investissements',
  });

  // Handle export of raw data (all records, not just filtered)
  const exportAllData = useReportExport({
    data: allData,
    columns: columnSets.all,
    filename: 'wanzo-investissements-data-complete',
    title: 'Données Complètes des Investissements',
  });
  
  const handleExportRawData = () => {
    exportAllData.handleExport('excel');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rapport d'investissements
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Analyse des investissements en capital dans des entreprises non cotées
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExportRawData}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exporter données brutes
          </Button>

          <ReportExportButton
            onExport={handleExport}
            className="h-9"
            disabled={data.length === 0}
          />
        </div>
      </div>

      <ReportingFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onFilterToggle={() => alert('Filtres toggled')}
      />

      <Tabs
        value={view}
        onValueChange={(v) => setView(v as 'summary' | 'table')}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger 
              value="summary" 
              currentValue={view} 
              onValueChange={(v) => setView(v as 'summary' | 'table')}
            >
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger 
              value="table" 
              currentValue={view} 
              onValueChange={(v) => setView(v as 'summary' | 'table')}
            >
              Données détaillées
            </TabsTrigger>
          </TabsList>

          {view === 'table' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Vue:
              </span>
              <select
                value={columnPreset}
                onChange={(e) => setColumnPreset(e.target.value as 'basic' | 'performance' | 'social' | 'all')}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800"
              >
                <option value="basic">Basique</option>
                <option value="performance">Performance</option>
                <option value="social">Impact social</option>
                <option value="all">Toutes les colonnes</option>
              </select>
            </div>
          )}
        </div>

        <TabsContent value="summary" currentValue={view} className="space-y-6 mt-2">
          <InvestmentReportSummary metrics={summaryMetrics} />
          
          <div className="mt-8">
            <InvestmentReportCharts
              sectorData={chartData.sectorData}
              countryData={chartData.countryData}
              stagePerformance={chartData.stagePerformance}
              yearData={chartData.yearData}
            />
          </div>
        </TabsContent>

        <TabsContent value="table" currentValue={view} className="mt-2">
          {data.length > 0 ? (
            <InvestmentReportTable
              data={data}
              columns={currentColumns}
              pageSize={10}
            />
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <ListFilter className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Aucun résultat</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Aucun investissement ne correspond aux critères de recherche.
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    setActiveFilters({
                      sectors: [],
                      countries: [],
                      stages: [],
                      statuses: [],
                      dateRange: {
                        from: null,
                        to: null,
                      },
                    });
                    setSearchTerm('');
                  }}
                  variant="outline"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
