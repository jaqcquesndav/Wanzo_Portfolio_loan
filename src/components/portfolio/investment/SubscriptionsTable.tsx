import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { PaginatedTable } from '../../ui/PaginatedTable';
import { TableSkeleton } from '../../ui/TableSkeleton';
import type { SecuritySubscription } from '../../../types/securities';
import { Column } from '../../ui/TableTypes';
import { ReactNode, useState, useEffect } from 'react';
import { useFormatCurrency } from '../../../hooks/useFormatCurrency';
import { formatDate } from '../../../utils/formatters';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';
import { SearchInput } from '../../ui/SearchInput';

interface SubscriptionsTableProps {
  subscriptions?: SecuritySubscription[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}

export function SubscriptionsTable({ subscriptions, loading, onDelete, onExport }: SubscriptionsTableProps) {
  const { formatCurrency } = useFormatCurrency();
  const { refreshCounter } = useCurrencyContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<SecuritySubscription[]>([]);
  
  // Mettre à jour les données filtrées lors d'un changement de recherche ou de données
  useEffect(() => {
    const subData = subscriptions || [];
    
    if (!searchTerm) {
      setFilteredData(subData);
      return;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = subData.filter((subscription) => {
      return (
        subscription.investorId.toLowerCase().includes(lowercaseSearch) ||
        subscription.status.toLowerCase().includes(lowercaseSearch) ||
        subscription.created_at.toLowerCase().includes(lowercaseSearch)
      );
    });
    
    setFilteredData(filtered);
  }, [subscriptions, searchTerm, refreshCounter]);
  
  if (loading) {
    return <TableSkeleton columns={5} rows={5} />;
  }

  const columns: Column<SecuritySubscription>[] = [
    { header: 'Souscripteur', accessor: 'investorId' as keyof SecuritySubscription },
    { 
      header: 'Montant', 
      accessor: (s: SecuritySubscription) => formatCurrency(s.amount)
    },
    { header: 'Date', accessor: (s: SecuritySubscription) => formatDate(s.created_at) },
    { 
      header: 'Statut', 
      accessor: (s: SecuritySubscription) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          s.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          s.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }`}>
          {s.status === 'approved' ? 'Approuvée' :
           s.status === 'rejected' ? 'Rejetée' : 'En attente'}
        </span>
      )
    },
    { 
      header: 'Actions', 
      accessor: (s: SecuritySubscription): ReactNode => (
        <div className="actions-dropdown inline-block">
          <ActionsDropdown
            actions={[
              { label: 'Exporter', onClick: () => onExport && onExport(s.id) },
              { label: 'Supprimer', onClick: () => onDelete && onDelete(s.id) },
            ]}
          />
        </div>
      ),
      className: 'text-center'
    },
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchInput
          placeholder="Rechercher des souscriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <PaginatedTable
        data={filteredData}
        columns={columns}
        keyField="id"
        itemsPerPage={5}
        emptyMessage="Aucune souscription à afficher"
      />
    </div>
  );
}
