// src/components/risk/InvestmentRiskTable.tsx.new
import { PaginatedTable } from '../ui/PaginatedTable';
import { Column } from '../ui/TableTypes';
import { InvestmentRiskEntry } from '../../data/mockCentraleRisque';
import { useCurrencyContext } from '../../hooks/useCurrencyContext';

interface InvestmentRiskTableProps {
  data: InvestmentRiskEntry[];
}

export function InvestmentRiskTable({ data }: InvestmentRiskTableProps) {
  // Use the useCurrencyContext hook directly to access the currency context
  const { formatAmount } = useCurrencyContext();
  
  const columns: Column<InvestmentRiskEntry>[] = [
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
      header: 'Type',
      accessor: 'investmentType'
    },
    {
      header: 'Montant investi',
      accessor: (item) => formatAmount(item.montantInvesti)
    },
    {
      header: 'Valorisation',
      accessor: (item) => formatAmount(item.valorisation)
    },
    {
      header: 'Statut',
      accessor: (item) => (
        <span 
          className={`px-2 py-1 rounded-full text-xs ${
            item.statut === 'Performant' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          {item.statut}
        </span>
      )
    },
    {
      header: 'Rendement',
      accessor: (item) => `${(item.rendementActuel * 100).toFixed(2)}%`
    }
  ];

  return (
    <PaginatedTable
      data={data}
      columns={columns}
      keyField="id"
      emptyMessage="Aucune donnée de risque investissement trouvée"
    />
  );
}
