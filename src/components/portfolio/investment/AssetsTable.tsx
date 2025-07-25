import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../ui/Table';
import { TableSkeleton } from '../../ui/TableSkeleton';
import type { InvestmentAsset } from '../../../types/investment-portfolio';
import { toast } from 'react-hot-toast';
import { useFormatCurrency } from '../../../hooks/useFormatCurrency';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';
import { formatDate } from '../../../utils/formatters';
import { useState, useEffect } from 'react';
import { SearchInput } from '../../ui/SearchInput';

interface AssetsTableProps {
  assets?: InvestmentAsset[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}

export function AssetsTable({ assets, loading, onDelete, onExport }: AssetsTableProps) {
  const { formatCurrency } = useFormatCurrency();
  const { refreshCounter } = useCurrencyContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAssets, setFilteredAssets] = useState<InvestmentAsset[]>([]);
  
  // Filtrer les actifs lorsque le terme de recherche change
  useEffect(() => {
    const assetData = assets || [];
    
    if (!searchTerm) {
      setFilteredAssets(assetData);
      return;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = assetData.filter((asset) => {
      return (
        asset.name.toLowerCase().includes(lowercaseSearch) ||
        asset.id.toLowerCase().includes(lowercaseSearch) ||
        asset.type.toLowerCase().includes(lowercaseSearch)
      );
    });
    
    setFilteredAssets(filtered);
  }, [assets, searchTerm, refreshCounter]);
  
  // Navigation désactivée
  // const portfolioId = "current";
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchInput
          placeholder="Rechercher des actifs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <Table>
        <TableHead>
          <tr>
            <TableHeader>Nom de l'actif</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Date d'acquisition</TableHeader>
            <TableHeader>Valeur initiale</TableHeader>
            <TableHeader>Valeur actuelle</TableHeader>
            <TableHeader>Statut</TableHeader>
            <TableHeader align="center">Actions</TableHeader>
          </tr>
        </TableHead>
        {loading ? (
          <TableSkeleton columns={7} rows={5} />
        ) : (
          <TableBody>
            {filteredAssets && filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <TableRow
                  key={asset.id}
                  onClick={(e) => {
                    // Ne pas ouvrir le détail si clic sur le menu actions
                    if ((e.target as HTMLElement).closest('.actions-dropdown')) return;
                    // Navigation désactivée
                    toast.success(`Actif ${asset.name} sélectionné`);
                  }}
                  tabIndex={0}
                  ariaLabel={`Voir l'actif ${asset.name}`}
                  style={{ outline: 'none' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toast.success(`Actif ${asset.name} sélectionné`);
                    }
                  }}
                >
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      asset.type === 'share' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      asset.type === 'bond' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {asset.type === 'share' ? 'Action' :
                       asset.type === 'bond' ? 'Obligation' : 'Autre'}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(asset.acquiredDate)}</TableCell>
                  <TableCell>{formatCurrency(asset.initialValue)}</TableCell>
                  <TableCell>{asset.currentValue ? formatCurrency(asset.currentValue) : '—'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      asset.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      asset.status === 'exited' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {asset.status === 'active' ? 'Actif' :
                       asset.status === 'exited' ? 'Cédé' : 'Radié'}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <div className="actions-dropdown inline-block">
                      <ActionsDropdown
                        actions={[
                          { label: 'Exporter', onClick: () => onExport && onExport(asset.id) },
                          { label: 'Supprimer', onClick: () => onDelete && onDelete(asset.id) },
                        ]}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">Aucun actif à afficher</td>
              </tr>
            )}
          </TableBody>
        )}
      </Table>
    </div>
  );
}
