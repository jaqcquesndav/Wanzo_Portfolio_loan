// src/components/risk/CreditRiskTable.tsx
import { PaginatedTable } from '../ui/PaginatedTable';
import { Column } from '../ui/TableTypes';
import { CreditRiskEntry } from '../../data/mockCentraleRisque';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';
import { convertScoreToRating, getCreditRatingClass } from '../../utils/creditScoreConverter';

interface CreditRiskTableProps {
  data: CreditRiskEntry[];
}

export function CreditRiskTable({ data }: CreditRiskTableProps) {
  const { formatCurrency } = useFormatCurrency();
  
  const columns: Column<CreditRiskEntry>[] = [
    {
      header: 'Institution',
      accessor: 'institution'
    },
    {
      header: 'Entreprise',
      accessor: 'companyName'
    },
    {
      header: 'Secteur',
      accessor: 'sector'
    },
    {
      header: 'Encours',
      accessor: (item) => formatCurrency(item.encours, undefined, 'USD')
    },
    {
      header: 'Statut',
      accessor: (item) => (
        <span 
          className={`px-2 py-1 rounded-full text-xs ${
            item.statut === 'Actif' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          {item.statut}
        </span>
      )
    },
    {
      header: 'Cote crédit',
      accessor: (item) => {
        // Convertir le score numérique en cote alphabétique
        const rating = convertScoreToRating(item.creditScore);
        return (
          <span 
            className={`px-2 py-1 rounded-full text-xs ${getCreditRatingClass(rating)}`}
            title={`Score: ${item.creditScore}/100`}
          >
            {rating}
          </span>
        );
      }
    },
    {
      header: 'Incidents',
      accessor: 'incidents'
    }
  ];

  return (
    <PaginatedTable
      data={data}
      columns={columns}
      keyField="id"
      emptyMessage="Aucune donnée de risque crédit trouvée"
    />
  );
}
