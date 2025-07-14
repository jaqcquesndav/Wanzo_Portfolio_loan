import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../ui/Table';
import { TableSkeleton } from '../../ui/TableSkeleton';
import type { CompanyValuation } from '../../../types/securities';

interface ValuationsTableProps {
  valuations?: CompanyValuation[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}

export function ValuationsTable({ valuations, loading, onDelete, onExport }: ValuationsTableProps) {
  // Navigation désactivée
  // const navigate = useNavigate();
  // const { id: portfolioId } = useParams();
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeader>Date</TableHeader>
          <TableHeader>Valeur</TableHeader>
          <TableHeader>Méthode</TableHeader>
          <TableHeader align="center">Actions</TableHeader>
        </tr>
      </TableHead>
      {loading ? (
        <TableSkeleton columns={4} rows={5} />
      ) : (
        <TableBody>
          {valuations && valuations.length > 0 ? (
            valuations.map((v) => (
              <TableRow
                key={v.id}
                onClick={e => {
                  if ((e.target as HTMLElement).closest('.actions-dropdown')) return;
                  // Navigation désactivée
                  console.log(`Valorisation ${v.id} sélectionnée`);
                  // navigate(`/app/investment/${portfolioId}/valuations/${v.id}`);
                }}
                tabIndex={0}
                aria-label={`Voir la valorisation ${v.id}`}
                style={{ outline: 'none', cursor: 'pointer' }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    // Navigation désactivée
                    console.log(`Valorisation ${v.id} sélectionnée`);
                    // navigate(`/app/investment/${portfolioId}/valuations/${v.id}`);
                  }
                }}
              >
                <TableCell>{v.evaluationDate}</TableCell>
                <TableCell>{v.totalValue.toLocaleString()} €</TableCell>
                <TableCell>{v.method}</TableCell>
                <TableCell align="center">
                  <div className="actions-dropdown inline-block">
                    <ActionsDropdown
                      actions={[
                        { label: 'Exporter', onClick: () => onExport && onExport(v.id) },
                        { label: 'Supprimer', onClick: () => onDelete && onDelete(v.id) },
                      ]}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-400">Aucune valorisation à afficher</td>
            </tr>
          )}
        </TableBody>
      )}
    </Table>
  );
}
