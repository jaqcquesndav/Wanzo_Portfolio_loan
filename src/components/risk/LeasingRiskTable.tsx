// src/components/risk/LeasingRiskTable.tsx.new
import { PaginatedTable } from '../ui/PaginatedTable';
import { Column } from '../ui/TableTypes';
import { LeasingRiskEntry } from '../../data/mockCentraleRisque';
import { useCurrencyContext } from '../../hooks/useCurrencyContext';
import { convertScoreToRating, getCreditRatingClass } from '../../utils/creditScoreConverter';

interface LeasingRiskTableProps {
  data: LeasingRiskEntry[];
  loading?: boolean;
}

export function LeasingRiskTable({ data, loading = false }: LeasingRiskTableProps) {
  // Use the useCurrencyContext hook directly to access the currency context
  const { formatAmount } = useCurrencyContext();
  
  const columns: Column<LeasingRiskEntry>[] = [
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
      header: 'Équipement',
      accessor: 'equipmentType'
    },
    {
      header: 'Valeur',
      accessor: (item) => formatAmount(item.valeurFinancement)
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
        // Pour les entrées de leasing, on utilise la cote existante mais on ajoute le score estimé au survol
        const estimatedScore = item.incidents > 0 ? 65 - item.incidents * 15 : 80;
        const rating = convertScoreToRating(estimatedScore);
        
        return (
          <span 
            className={`px-2 py-1 rounded-full text-xs ${getCreditRatingClass(rating)}`}
            title={`Score estimé: ${estimatedScore}/100`}
          >
            {rating}
          </span>
        );
      }
    }
  ];

  return (
    <PaginatedTable
      data={data}
      columns={columns}
      keyField="id"
      loading={loading}
      loadingRows={8}
      emptyMessage="Aucune donnée de risque leasing trouvée"
    />
  );
}
