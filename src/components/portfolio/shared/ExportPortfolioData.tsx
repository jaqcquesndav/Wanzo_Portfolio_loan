import React, { useState } from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon, TableCellsIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import type { Portfolio } from '../../../types/portfolio';

interface ExportPortfolioDataProps {
  portfolio: Portfolio;
  onExport: (format: string, dataType: string) => void;
}

export function ExportPortfolioData({ portfolio, onExport }: ExportPortfolioDataProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('xlsx');
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  });
  
  const dataTypeOptions = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'performance', label: 'Performance' },
    { id: 'clients', label: 'Clients' },
    { id: 'metrics', label: 'Métriques' },
  ];
  
  // Add portfolio type specific options
  if (portfolio.type === 'traditional') {
    dataTypeOptions.push({ id: 'loans', label: 'Crédits' });
    dataTypeOptions.push({ id: 'repayments', label: 'Remboursements' });
  } else if (portfolio.type === 'investment') {
    dataTypeOptions.push({ id: 'companies', label: 'Entreprises' });
    dataTypeOptions.push({ id: 'valuations', label: 'Valorisations' });
  } else if (portfolio.type === 'leasing') {
    dataTypeOptions.push({ id: 'equipment', label: 'Équipements' });
    dataTypeOptions.push({ id: 'contracts', label: 'Contrats' });
    dataTypeOptions.push({ id: 'maintenance', label: 'Maintenance' });
  }
  
  const handleCheckboxChange = (id: string) => {
    setSelectedData(prev => 
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a formatted report name
    const reportName = `${portfolio.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    
    // Format could be passed to a real export function
    const exportConfig = {
      portfolioId: portfolio.id,
      format: selectedFormat,
      dataTypes: selectedData,
      dateRange: dateRange,
      fileName: reportName
    };
    
    console.log('Exporting with config:', exportConfig);
    
    // Call the provided export handler with the first data type (or 'full' if multiple selected)
    onExport(
      selectedFormat, 
      selectedData.length === 1 ? selectedData[0] : 'full'
    );
    
    setIsOpen(false);
  };
  
  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        variant="secondary"
        className="flex items-center"
      >
        <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
        Exporter les données
      </Button>
    );
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg p-6 flex flex-col gap-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Exporter les données du portefeuille</h3>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block font-medium mb-2">Format d'export</label>
            <div className="flex gap-3">
              <button
                type="button"
                className={`flex items-center px-4 py-2 rounded ${selectedFormat === 'xlsx' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => setSelectedFormat('xlsx')}
              >
                <TableCellsIcon className="w-5 h-5 mr-1" />
                Excel
              </button>
              <button
                type="button"
                className={`flex items-center px-4 py-2 rounded ${selectedFormat === 'pdf' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => setSelectedFormat('pdf')}
              >
                <DocumentTextIcon className="w-5 h-5 mr-1" />
                PDF
              </button>
              <button
                type="button"
                className={`flex items-center px-4 py-2 rounded ${selectedFormat === 'csv' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => setSelectedFormat('csv')}
              >
                <ChartBarIcon className="w-5 h-5 mr-1" />
                CSV
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block font-medium mb-2">Données à exporter</label>
            <div className="grid grid-cols-2 gap-2">
              {dataTypeOptions.map(option => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`data-${option.id}`}
                    checked={selectedData.includes(option.id)}
                    onChange={() => handleCheckboxChange(option.id)}
                    className="mr-2 h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor={`data-${option.id}`}>{option.label}</label>
                </div>
              ))}
            </div>
            {selectedData.length === 0 && (
              <p className="text-red-500 text-xs mt-1">Veuillez sélectionner au moins un type de données</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block font-medium mb-2">Période</label>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Date de début</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Date de fin</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setIsOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={selectedData.length === 0}
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              Exporter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
