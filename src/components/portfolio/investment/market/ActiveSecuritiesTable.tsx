// src/components/portfolio/investment/market/ActiveSecuritiesTable.tsx
import React, { useMemo, useState } from 'react';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { Input } from '../../../ui/form/Input';
import { ArrowUpDown, Download } from 'lucide-react';
import { InvestmentAsset } from '../../../../types/investment-portfolio';
import { exportToExcel, exportToPDF } from '../../../../utils/export';

interface ActiveSecuritiesTableProps {
  assets: InvestmentAsset[];
  loading: boolean;
  onSell: (assetId: string, quantity: number) => void;
}

const statusVariantMap: Record<InvestmentAsset['status'], 'success' | 'primary' | 'danger'> = {
  active: 'success',
  exited: 'primary',
  'written-off': 'danger',
};

export const ActiveSecuritiesTable: React.FC<ActiveSecuritiesTableProps> = ({ assets, loading, onSell }) => {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<{ key: keyof InvestmentAsset; direction: 'asc' | 'desc' } | null>(null);
  const [sellQuantities, setSellQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseInt(value, 10);
    setSellQuantities(prev => ({ ...prev, [id]: isNaN(quantity) ? 0 : quantity }));
  };

  const filteredAndSortedAssets = useMemo(() => {
    const filtered = assets.filter(a =>
      a.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[sortBy.key];
        const bValue = b[sortBy.key];
        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return sortBy.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortBy.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [assets, filter, sortBy]);

  const handleSort = (key: keyof InvestmentAsset) => {
    if (sortBy && sortBy.key === key) {
      setSortBy({ key, direction: sortBy.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortBy({ key, direction: 'asc' });
    }
  };

  const columns = [
    { key: 'name', label: 'Nom de l\'actif' },
    { key: 'type', label: 'Type' },
    { key: 'initialValue', label: 'Valeur Initiale' },
    { key: 'currentValue', label: 'Valeur Actuelle' },
    { key: 'status', label: 'Statut' },
  ];

  const handleExportExcel = () => {
    const dataToExport = filteredAndSortedAssets.map(a => ({
      'Nom': a.name,
      'Type': a.type,
      'Valeur Initiale (FCFA)': a.initialValue.toLocaleString(),
      'Valeur Actuelle (FCFA)': a.currentValue?.toLocaleString() || 'N/A',
      'Statut': a.status,
    }));
    exportToExcel(dataToExport, 'Actifs_En_Portefeuille');
  };

  const handleExportPDF = () => {
    exportToPDF({
      title: 'Actifs en Portefeuille',
      headers: columns.map(c => c.label),
      data: filteredAndSortedAssets.map(a => [
        a.name,
        a.type,
        a.initialValue.toLocaleString() + ' FCFA',
        a.currentValue?.toLocaleString() ? a.currentValue.toLocaleString() + ' FCFA' : 'N/A',
        a.status,
      ]),
      filename: 'Actifs_En_Portefeuille.pdf'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">Chargement du portefeuille...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
      {/* Portfolio Summary Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 text-white py-3 px-5 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Mon Portefeuille d'Actifs</h2>
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-xs block text-gray-200">Valeur Totale</span>
              <span className="font-semibold">
                {assets.reduce((sum, asset) => sum + (asset.currentValue || asset.initialValue), 0).toLocaleString()} FCFA
              </span>
            </div>
            <div>
              <span className="text-xs block text-gray-200">Actifs</span>
              <span className="font-semibold">{assets.length}</span>
            </div>
            <div>
              <span className="text-xs block text-gray-200">Performance</span>
              <span className="font-semibold text-green-300">+3.2%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter toolbar with professional styling - Horizontal tags */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-4">
          {/* Search and export buttons */}
          <div className="flex flex-wrap justify-between gap-3">
            <div className="relative">
              <Input
                placeholder="Rechercher un actif..."
                value={filter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute top-3 left-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                <Download className="mr-1 h-4 w-4" /> Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF} className="flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                <Download className="mr-1 h-4 w-4" /> PDF
              </Button>
            </div>
          </div>
          
          {/* Search label */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recherche par nom d'actif</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="border-b dark:border-gray-700">
              {columns.map(col => (
                <th 
                  key={col.key} 
                  className="py-2 px-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-left"
                  onClick={() => handleSort(col.key as keyof InvestmentAsset)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex items-center">
                    <span>{col.label}</span>
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortBy && sortBy.key === col.key ? 'text-primary' : 'text-gray-500'}`} />
                  </div>
                </th>
              ))}
              <th className="py-2 px-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-left">Transaction</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedAssets.length > 0 ? (
              filteredAndSortedAssets.map((asset) => {
                const performanceValue = asset.currentValue ? ((asset.currentValue - asset.initialValue) / asset.initialValue * 100) : 0;
                const isPositivePerformance = performanceValue >= 0;
                
                return (
                  <tr 
                    key={asset.id}
                    className="hover:bg-green-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{asset.name}</span>
                        <span className="text-xs text-gray-500">{new Date(asset.acquiredDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="secondary" className="text-xs px-2 py-1 rounded-md">
                        {asset.type === 'share' ? 'Action' : 
                         asset.type === 'bond' ? 'Obligation' : 'Autre'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono">{asset.initialValue.toLocaleString()} FCFA</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-medium">
                          {asset.currentValue?.toLocaleString() || 'N/A'} FCFA
                        </span>
                        {asset.currentValue && (
                          <span className={`text-xs ${isPositivePerformance ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositivePerformance ? '+' : ''}{performanceValue.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge 
                        variant={statusVariantMap[asset.status]}
                        className={`text-xs px-2 py-1 rounded-md ${
                          asset.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                          asset.status === 'exited' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}
                      >
                        {asset.status === 'active' ? 'Actif' : 
                         asset.status === 'exited' ? 'Cédé' : 'Déprécié'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qté"
                          className="w-20 h-9 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          value={sellQuantities[asset.id] || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQuantityChange(asset.id, e.target.value)}
                          disabled={asset.status !== 'active'}
                        />
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className={`h-9 ${asset.status !== 'active' || !sellQuantities[asset.id] || sellQuantities[asset.id] <= 0 ? 
                            'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : 
                            'bg-red-600 hover:bg-red-700 text-white'}`}
                          onClick={() => onSell(asset.id, sellQuantities[asset.id] || 0)}
                          disabled={asset.status !== 'active' || !sellQuantities[asset.id] || sellQuantities[asset.id] <= 0}
                        >
                          Vendre
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="py-10 text-center text-gray-500">
                  Aucun actif ne correspond à vos critères de recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Footer with summary */}
        <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
          <div className="flex flex-col mb-3 md:mb-0">
            <span className="text-sm text-gray-600 dark:text-gray-400">Affichage de {filteredAndSortedAssets.length} actifs sur {assets.length}</span>
            <span className="text-xs text-gray-500 dark:text-gray-500">Dernière mise à jour: {new Date().toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">Valeur totale du portefeuille:</span>
            <span className="text-lg font-bold text-emerald-600">
              {assets.reduce((sum, asset) => sum + (asset.currentValue || asset.initialValue), 0).toLocaleString()} FCFA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
