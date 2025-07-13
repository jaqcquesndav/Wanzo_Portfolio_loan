import { useNavigate } from 'react-router-dom';
import type { Equipment } from '../../../types/leasing';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../ui/Table';
import { TableSkeleton } from '../../ui/TableSkeleton';

interface EquipmentsTableProps {
  equipments: Equipment[];
  loading?: boolean;
  onRowClick?: (equipment: Equipment) => void;
}

export function EquipmentsTable({ equipments, loading, onRowClick }: EquipmentsTableProps) {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeader>Nom</TableHeader>
          <TableHeader>Catégorie</TableHeader>
          <TableHeader>État</TableHeader>
          <TableHeader>Disponibilité</TableHeader>
          <TableHeader align="center">Actions</TableHeader>
        </tr>
      </TableHead>
      {loading ? (
        <TableSkeleton columns={5} rows={5} />
      ) : (
        <TableBody>
          {equipments && equipments.length > 0 ? (
            equipments.map((equipment) => (
              <TableRow
                key={equipment.id}
                onClick={(e) => {
                  // Ne pas ouvrir le détail si clic sur le menu actions
                  if ((e.target as HTMLElement).closest('.actions-dropdown')) return;
                  if (onRowClick) {
                    onRowClick(equipment);
                  } else {
                    navigate(`/app/leasing/equipments/${equipment.id}`);
                  }
                }}
                tabIndex={0}
                ariaLabel={`Voir l'équipement ${equipment.name}`}
                style={{ outline: 'none' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (onRowClick) {
                      onRowClick(equipment);
                    } else {
                      navigate(`/app/leasing/equipments/${equipment.id}`);
                    }
                  }
                }}
              >
                <TableCell>{equipment.name}</TableCell>
                <TableCell>{equipment.category}</TableCell>
                <TableCell>{equipment.condition}</TableCell>
                <TableCell>{equipment.availability ? 'Disponible' : 'Indisponible'}</TableCell>
                <TableCell align="center">
                  <div className="actions-dropdown inline-block">
                    <ActionsDropdown
                      actions={[
                        { label: 'Détail', onClick: () => navigate(`/app/leasing/equipments/${equipment.id}`) },
                        { label: 'Réserver', onClick: () => navigate(`/app/leasing/reservations/new?equipment=${equipment.id}`) },
                        { label: 'Maintenance', onClick: () => navigate(`/app/leasing/maintenance/new?equipment=${equipment.id}`) }
                      ]}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-400">Aucun équipement à afficher</td>
            </tr>
          )}
        </TableBody>
      )}
    </Table>
  );
}


