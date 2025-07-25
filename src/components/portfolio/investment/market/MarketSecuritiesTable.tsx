// src/components/portfolio/investment/market/MarketSecuritiesTable.tsx
import React, { useMemo, useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { ArrowUpDown, Download } from 'lucide-react';
import { MarketSecurity, SecuritiesType, InvestmentEntryType } from '../../../../types/market-securities';
import { exportToExcel, exportToPDF } from '../../../../utils/exports';
import { useFormatCurrency } from '../../../../hooks/useFormatCurrency';

interface MarketSecuritiesTableProps {
  securities: MarketSecurity[];
  loading: boolean;
  onPurchase: (security: MarketSecurity, quantity: number) => void;
}

const entryTypeLabels: Record<InvestmentEntryType, string> = {
  ipo: 'IPO',
  private_equity: 'Private Equity',
  venture_capital: 'Venture Capital',
  seed: 'Amorçage',
  series_a: 'Série A',
  series_b: 'Série B',
  series_c: 'Série C',
  growth: 'Croissance',
  mezzanine: 'Mezzanine',
  lbo: 'LBO',
  other: 'Autre',
};



export const MarketSecuritiesTable: React.FC<MarketSecuritiesTableProps> = ({ securities, loading, onPurchase }) => {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<{ key: keyof MarketSecurity; direction: 'asc' | 'desc' } | null>(null);
  const [typeFilter, setTypeFilter] = useState<SecuritiesType | 'all'>('all');
  const [purchaseQuantities, setPurchaseQuantities] = useState<Record<string, number>>({});
  const { formatCurrency } = useFormatCurrency();

  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseInt(value, 10);
    setPurchaseQuantities(prev => ({ ...prev, [id]: isNaN(quantity) ? 0 : quantity }));
  };

  const filteredAndSortedSecurities = useMemo(() => {
    let filtered = securities.filter(s =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.companyName.toLowerCase().includes(filter.toLowerCase())
    );

    if (typeFilter !== 'all') {
      filtered = filtered.filter(s => s.type === typeFilter);
    }

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
  }, [securities, filter, sortBy, typeFilter]);

  const handleSort = (key: keyof MarketSecurity) => {
    if (sortBy && sortBy.key === key) {
      setSortBy({ key, direction: sortBy.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortBy({ key, direction: 'asc' });
    }
  };

  const columns = [
    { key: 'companyName', label: 'Entreprise' },
    { key: 'type', label: 'Type' },
    { key: 'investmentEntryType', label: 'Entrée Capital' },
    { key: 'enterpriseValue', label: 'Valeur Ent.' },
    { key: 'unitPrice', label: 'Prix Unitaire' },
    { key: 'risk', label: 'Risque' },
    { key: 'expectedReturn', label: 'Rdt. Attendu' },
  ];

  const handleExportExcel = () => {
    const dataToExport = filteredAndSortedSecurities.map(s => ({
      'Entreprise': s.companyName,
      'Type': s.type,
      'Entrée Capital': s.investmentEntryType ? entryTypeLabels[s.investmentEntryType] : 'N/A',
      'Valeur Ent.': formatCurrency(s.enterpriseValue || 0),
      'Prix Unitaire': formatCurrency(s.unitPrice),
      'Risque': s.risk,
      'Rdt. Attendu (%)': s.expectedReturn,
    }));
    exportToExcel(dataToExport, 'Marche_Valeurs_Mobilieres');
  };

  const handleExportPDF = () => {
    exportToPDF({
      title: 'Marché des Valeurs Mobilières',
      headers: columns.map(c => c.label),
      data: filteredAndSortedSecurities.map(s => [
        s.companyName,
        s.type,
        s.investmentEntryType ? entryTypeLabels[s.investmentEntryType] : 'N/A',
        formatCurrency(s.enterpriseValue || 0),
        formatCurrency(s.unitPrice),
        s.risk,
        s.expectedReturn ? `${s.expectedReturn}%` : 'N/A',
      ]),
      filename: 'Marche_Valeurs_Mobilieres.pdf'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">Chargement des données du marché...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
      {/* Market Summary Header - Similar to stock market indices display */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-3 px-5 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Marché des Valeurs Mobilières</h2>
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-xs block text-gray-200">Indice PME</span>
              <span className="font-semibold">8,241.44 <span className="text-green-400">+1.2%</span></span>
            </div>
            <div>
              <span className="text-xs block text-gray-200">Volume</span>
              <span className="font-semibold">{formatCurrency(14200000, { compact: true })}</span>
            </div>
            <div>
              <span className="text-xs block text-gray-200">Cotations</span>
              <span className="font-semibold">{securities.length}</span>
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
                placeholder="Rechercher un titre..."
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
          
          {/* Filter tags displayed horizontally - Types filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</span>
            
            <Badge 
              variant={typeFilter === 'all' ? 'primary' : 'secondary'} 
              className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setTypeFilter('all')}
            >
              Tous
            </Badge>
            
            <Badge 
              variant={typeFilter === 'actions' ? 'primary' : 'secondary'} 
              className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setTypeFilter('actions')}
            >
              Actions
            </Badge>
            
            <Badge 
              variant={typeFilter === 'obligations' ? 'primary' : 'secondary'} 
              className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setTypeFilter('obligations')}
            >
              Obligations
            </Badge>
            
            <Badge 
              variant={typeFilter === 'parts_sociales' ? 'primary' : 'secondary'} 
              className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setTypeFilter('parts_sociales')}
            >
              Parts Sociales
            </Badge>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        {/* En-tête de tableau horizontal force avec table native */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="border-b dark:border-gray-700">
              {columns.map(col => (
                <th 
                  key={col.key} 
                  className="py-2 px-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-left"
                  onClick={() => handleSort(col.key as keyof MarketSecurity)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex items-center">
                    <span>{col.label}</span>
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortBy && sortBy.key === col.key ? 'text-primary' : 'text-gray-500'}`} />
                  </div>
                </th>
              ))}
              <th className="py-2 px-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-left">
                Transaction
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedSecurities.length > 0 ? (
              filteredAndSortedSecurities.map((security) => (
                <tr 
                  key={security.id}
                  className="hover:bg-blue-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{security.companyName}</span>
                      <span className="text-xs text-gray-500">{security.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="secondary" className="text-xs px-2 py-1 rounded-md">
                      {security.type === 'actions' ? 'Action' : 
                       security.type === 'obligations' ? 'Obligation' : 
                       security.type === 'parts_sociales' ? 'Part Sociale' : 'Autre'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    {security.investmentEntryType ? (
                      <Badge variant="secondary" className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {entryTypeLabels[security.investmentEntryType]}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono">{formatCurrency(security.enterpriseValue || 0)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(security.unitPrice)}
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        +2.3% <span className="text-gray-400 dark:text-gray-500">24h</span>
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge 
                      variant={security.risk === 'faible' ? 'success' : 
                              security.risk === 'modéré' ? 'warning' : 'danger'}
                      className={`text-xs px-2 py-1 rounded-md ${
                        security.risk === 'faible' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                        security.risk === 'modéré' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {security.risk === 'faible' ? 'Faible' : 
                       security.risk === 'modéré' ? 'Modéré' : 'Élevé'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    {security.expectedReturn ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{security.expectedReturn}%</span>
                        <span className="text-xs text-gray-500">estimé</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          max={security.availableUnits}
                          placeholder="Qté"
                          className="w-20 h-9 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          value={purchaseQuantities[security.id] || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQuantityChange(security.id, e.target.value)}
                        />
                        <div className="absolute right-0 top-full mt-1">
                          <span className="text-xs text-gray-500">
                            Max: {security.availableUnits || '—'}
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        className={`h-9 ${!purchaseQuantities[security.id] || purchaseQuantities[security.id] <= 0 ? 
                          'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : 
                          'bg-green-600 hover:bg-green-700 text-white'}`}
                        onClick={() => onPurchase(security, purchaseQuantities[security.id] || 0)}
                        disabled={!purchaseQuantities[security.id] || purchaseQuantities[security.id] <= 0}
                      >
                        Acheter
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="py-10 text-center text-gray-500">
                  Aucune valeur mobilière ne correspond à vos critères de recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination and market summary footer */}
        <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
          <div className="flex flex-col mb-3 md:mb-0">
            <span className="text-sm text-gray-600 dark:text-gray-400">Affichage de {filteredAndSortedSecurities.length} titres sur {securities.length}</span>
            <span className="text-xs text-gray-500 dark:text-gray-500">Dernière mise à jour: {new Date().toISOString().split('T')[0]} {new Date().toTimeString().split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600">
              Précédent
            </Button>
            <span className="px-3 py-1 rounded-md bg-primary text-white">1</span>
            <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600">
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
