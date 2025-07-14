import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../ui/Table';
import { TableSkeleton } from '../../ui/TableSkeleton';
import type { SecuritySubscription } from '../../../types/securities';

interface SubscriptionsTableProps {
  subscriptions?: SecuritySubscription[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}

export function SubscriptionsTable({ subscriptions, loading, onDelete, onExport }: SubscriptionsTableProps) {
  // Navigation désactivée
  // const navigate = useNavigate();
  // const { id: portfolioId } = useParams();
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeader>Souscripteur</TableHeader>
          <TableHeader>Montant</TableHeader>
          <TableHeader>Date</TableHeader>
          <TableHeader>Statut</TableHeader>
          <TableHeader align="center">Actions</TableHeader>
        </tr>
      </TableHead>
      {loading ? (
        <TableSkeleton columns={5} rows={5} />
      ) : (
        <TableBody>
          {subscriptions && subscriptions.length > 0 ? (
            subscriptions.map((s) => (
              <TableRow
                key={s.id}
                onClick={e => {
                  if ((e.target as HTMLElement).closest('.actions-dropdown')) return;
                  // Navigation désactivée
                  console.log(`Souscription ${s.id} sélectionnée`);
                  // navigate(`/app/investment/${portfolioId}/subscriptions/${s.id}`);
                }}
                tabIndex={0}
                aria-label={`Voir la souscription ${s.id}`}
                style={{ outline: 'none', cursor: 'pointer' }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    // Navigation désactivée
                    console.log(`Souscription ${s.id} sélectionnée`);
                    // navigate(`/app/investment/${portfolioId}/subscriptions/${s.id}`);
                  }
                }}
              >
                <TableCell>{s.investorId}</TableCell>
                <TableCell>{s.amount.toLocaleString()} €</TableCell>
                <TableCell>{s.created_at}</TableCell>
                <TableCell>{s.status}</TableCell>
                <TableCell align="center">
                  <div className="actions-dropdown inline-block">
                    <ActionsDropdown
                      actions={[
                        { label: 'Exporter', onClick: () => onExport && onExport(s.id) },
                        { label: 'Supprimer', onClick: () => onDelete && onDelete(s.id) },
                      ]}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-400">Aucune souscription à afficher</td>
            </tr>
          )}
        </TableBody>
      )}
    </Table>
  );
}
