// src/components/prospection/treasury/TreasuryExport.tsx
import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Settings } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { TreasuryAccount, TreasuryPeriod, TimeseriesScale } from '../../../types/company';

interface TreasuryExportProps {
  accounts: TreasuryAccount[];
  periods?: TreasuryPeriod[];
  selectedScale?: TimeseriesScale;
  companyName: string;
}

type ExportFormat = 'excel' | 'csv';
type ExportContent = 'current' | 'timeseries' | 'both';

export function TreasuryExport({ accounts, periods, selectedScale, companyName }: TreasuryExportProps) {
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [content, setContent] = useState<ExportContent>('current');
  const [showOptions, setShowOptions] = useState(false);

  // Generate CSV content for current accounts
  const generateAccountsCSV = (): string => {
    const headers = ['Code SYSCOHADA', 'Libellé', 'Type', 'Banque', 'N° Compte', 'Solde', 'Devise'];
    const rows = accounts.map(acc => [
      acc.code,
      acc.name,
      acc.type,
      acc.bankName || '',
      acc.accountNumber || '',
      acc.balance.toString(),
      acc.currency
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  };

  // Generate CSV content for timeseries
  const generateTimeseriesCSV = (): string => {
    if (!periods || periods.length === 0) return '';

    const headers = ['Période', 'Date Début', 'Date Fin', 'Solde Total', 'Nb Comptes'];
    const rows = periods.map(period => [
      period.periodId,
      period.startDate,
      period.endDate,
      period.totalBalance.toString(),
      period.accountsCount.toString()
    ]);

    const csvRows = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ];
    
    return csvRows.join('\n');
  };

  // Generate combined CSV
  const generateCombinedCSV = (): string => {
    const accountsCSV = generateAccountsCSV();
    const timeseriesCSV = generateTimeseriesCSV();

    return [
      '=== COMPTES DE TRÉSORERIE ===',
      accountsCSV,
      '',
      `=== SÉRIES TEMPORELLES (${selectedScale?.toUpperCase()}) ===`,
      timeseriesCSV
    ].join('\n');
  };

  // Download function
  const handleExport = () => {
    let csvContent = '';
    let filename = '';

    // Generate content based on selection
    switch (content) {
      case 'current':
        csvContent = generateAccountsCSV();
        filename = `tresorerie_${companyName.replace(/\s+/g, '_')}_comptes`;
        break;
      case 'timeseries':
        csvContent = generateTimeseriesCSV();
        filename = `tresorerie_${companyName.replace(/\s+/g, '_')}_serie_${selectedScale}`;
        break;
      case 'both':
        csvContent = generateCombinedCSV();
        filename = `tresorerie_${companyName.replace(/\s+/g, '_')}_complet`;
        break;
    }

    // Add timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    filename += `_${timestamp}`;

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.${format}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Check if export is possible
  const canExport = accounts.length > 0 && (content !== 'timeseries' || (periods && periods.length > 0));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            Exporter les données
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Options Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOptions(!showOptions)}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Export Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            disabled={!canExport}
          >
            {format === 'excel' ? (
              <FileSpreadsheet className="w-4 h-4 mr-2" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Exporter
          </Button>
        </div>
      </div>

      {/* Export Options */}
      {showOptions && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Format d'export
            </label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={format === 'excel' ? 'primary' : 'outline'}
                onClick={() => setFormat('excel')}
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Excel (.csv)
              </Button>
              <Button
                size="sm"
                variant={format === 'csv' ? 'primary' : 'outline'}
                onClick={() => setFormat('csv')}
              >
                <FileText className="w-4 h-4 mr-1" />
                CSV
              </Button>
            </div>
          </div>

          {/* Content Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenu à exporter
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="content"
                  value="current"
                  checked={content === 'current'}
                  onChange={() => setContent('current')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Comptes actuels uniquement ({accounts.length} comptes)
                </span>
              </label>

              {periods && periods.length > 0 && (
                <>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="content"
                      value="timeseries"
                      checked={content === 'timeseries'}
                      onChange={() => setContent('timeseries')}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Séries temporelles uniquement ({periods.length} périodes - {selectedScale})
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="content"
                      value="both"
                      checked={content === 'both'}
                      onChange={() => setContent('both')}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Export complet (comptes + séries temporelles)
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Format SYSCOHADA :</strong> Les exports respectent la classification SYSCOHADA
              (classes 521: Banques, 53: Caisse, 54: Placements, 57: Virements internes).
              Les fichiers sont encodés en UTF-8 pour compatibilité Excel.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
