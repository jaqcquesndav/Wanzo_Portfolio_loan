import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { PaginatedTable } from '../../ui/PaginatedTable';
import { TableSkeleton } from '../../ui/TableSkeleton';
import type { SecuritySubscription } from '../../../types/securities';
import { Column } from '../../ui/TableTypes';
import { ReactNode } from 'react';

interface SubscriptionsTableProps {
  subscriptions?: SecuritySubscription[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}

export function SubscriptionsTable({ subscriptions, loading, onDelete, onExport }: SubscriptionsTableProps) {
  if (loading) {
    return <TableSkeleton columns={5} rows={5} />;
  }

  const subData = subscriptions || [];

  const columns: Column<SecuritySubscription>[] = [
    { header: 'Souscripteur', accessor: 'investorId' as keyof SecuritySubscription },
    { 
      header: 'Montant', 
      accessor: (s: SecuritySubscription) => `${s.amount.toLocaleString()} €` 
    },
    { header: 'Date', accessor: 'created_at' as keyof SecuritySubscription },
    { header: 'Statut', accessor: 'status' as keyof SecuritySubscription },
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
    <PaginatedTable
      data={subData}
      columns={columns}
      keyField="id"
      itemsPerPage={5}
      emptyMessage="Aucune souscription à afficher"
    />
  );
}
