import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../ui/Table';
import { TableSkeleton } from '../../ui/TableSkeleton';
import type { InvestmentAsset } from '../../../types/investment-portfolio';
import { toast } from 'react-hot-toast';

interface AssetsTableProps {
  assets?: InvestmentAsset[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}

export function AssetsTable({ assets, loading, onDelete, onExport }: AssetsTableProps) {
  // Navigation désactivée
  // const portfolioId = "current";
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeader>Nom de l'actif</TableHeader>
          <TableHeader>ID</TableHeader>
          <TableHeader align="center">Actions</TableHeader>
        </tr>
      </TableHead>
      {loading ? (
        <TableSkeleton columns={3} rows={5} />
      ) : (
        <TableBody>
          {assets && assets.length > 0 ? (
            assets.map((asset) => (
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
                <TableCell>{asset.id}</TableCell>
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
              <td colSpan={3} className="text-center py-8 text-gray-400">Aucun actif à afficher</td>
            </tr>
          )}
        </TableBody>
      )}
    </Table>
  );
}
