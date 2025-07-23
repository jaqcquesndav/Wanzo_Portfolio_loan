import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { PaginatedTable } from '../../ui/PaginatedTable';
import { TableSkeleton } from '../../ui/TableSkeleton';
import type { CompanyValuation } from '../../../types/securities';
import { Column } from '../../ui/TableTypes';
import { ReactNode } from 'react';

interface ValuationsTableProps {
  valuations?: CompanyValuation[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}

export function ValuationsTable({ valuations, loading, onDelete, onExport }: ValuationsTableProps) {
  if (loading) {
    return <TableSkeleton columns={4} rows={5} />;
  }

  const valData = valuations || [];

  const columns: Column<CompanyValuation>[] = [
    { header: 'Date', accessor: 'evaluationDate' as keyof CompanyValuation },
    { 
      header: 'Valeur', 
      accessor: (v: CompanyValuation) => `${v.totalValue.toLocaleString()} €` 
    },
    { header: 'Méthode', accessor: 'method' as keyof CompanyValuation },
    { 
      header: 'Actions', 
      accessor: (v: CompanyValuation): ReactNode => (
        <div className="actions-dropdown inline-block">
          <ActionsDropdown
            actions={[
              { label: 'Exporter', onClick: () => onExport && onExport(v.id) },
              { label: 'Supprimer', onClick: () => onDelete && onDelete(v.id) },
            ]}
          />
        </div>
      ),
      className: 'text-center'
    },
  ];

  return (
    <PaginatedTable
      data={valData}
      columns={columns}
      keyField="id"
      itemsPerPage={5}
      emptyMessage="Aucune valorisation à afficher"
    />
  );
}
