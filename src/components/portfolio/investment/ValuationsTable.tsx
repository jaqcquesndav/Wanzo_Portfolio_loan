import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { PaginatedTable } from '../../ui/PaginatedTable';
import { TableSkeleton } from '../../ui/TableSkeleton';
import type { CompanyValuation } from '../../../types/securities';
import { Column } from '../../ui/TableTypes';
import { ReactNode, useState, useEffect } from 'react';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';
import { formatDate } from '../../../utils/formatters';
import { useFormatCurrency } from '../../../hooks/useFormatCurrency';
import { mockCompanies } from '../../../data/companies';
import { SearchInput } from '../../ui/SearchInput';

interface ValuationsTableProps {
  valuations?: CompanyValuation[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}

export function ValuationsTable({ valuations, loading, onDelete, onExport }: ValuationsTableProps) {
  const { formatCurrency } = useFormatCurrency();
  const { refreshCounter } = useCurrencyContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<CompanyValuation[]>([]);
  
  // Mettre à jour les données filtrées lors d'un changement de recherche ou de données
  useEffect(() => {
    const valData = valuations || [];
    
    if (!searchTerm) {
      setFilteredData(valData);
      return;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = valData.filter((valuation) => {
      const company = mockCompanies.find(c => c.id === valuation.companyId);
      const companyName = company ? company.name.toLowerCase() : '';
      
      return (
        valuation.method.toLowerCase().includes(lowercaseSearch) ||
        companyName.includes(lowercaseSearch) ||
        valuation.evaluationDate.toLowerCase().includes(lowercaseSearch)
      );
    });
    
    setFilteredData(filtered);
  }, [valuations, searchTerm, refreshCounter]);
  
  if (loading) {
    return <TableSkeleton columns={5} rows={5} />;
  }

  const columns: Column<CompanyValuation>[] = [
    { 
      header: 'Entreprise', 
      accessor: (v: CompanyValuation) => {
        const company = mockCompanies.find(c => c.id === v.companyId);
        return company ? company.name : v.companyId;
      }
    },
    { header: 'Date', accessor: (v: CompanyValuation) => formatDate(v.evaluationDate) },
    { 
      header: 'Valeur', 
      accessor: (v: CompanyValuation) => formatCurrency(v.totalValue)
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
    <div className="space-y-4">
      <div className="relative">
        <SearchInput
          placeholder="Rechercher des valorisations..."
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
        emptyMessage="Aucune valorisation à afficher"
      />
    </div>
  );
}
