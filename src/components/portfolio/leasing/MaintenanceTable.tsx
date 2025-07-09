// Removed unused React import
import type { Maintenance } from '../../../types/leasing-asset';
import { ActionsDropdown } from '../../ui/ActionsDropdown';


interface MaintenanceTableProps {
  maintenances: Maintenance[];
  loading?: boolean;
  onRowClick?: (maintenance: Maintenance) => void;
}

export function MaintenanceTable({ maintenances, loading = false, onRowClick }: MaintenanceTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 w-full">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Équipement</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2 text-left">Coût</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                {Array.from({ length: 6 }).map((_, i) => (
                  <td key={i} className="px-4 py-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
                  </td>
                ))}
              </tr>
            ))
          ) : maintenances.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400">Aucune maintenance à afficher</td>
            </tr>
          ) : (
            maintenances.map((m) => (
              <tr
                key={m.id}
                className="group hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                onClick={onRowClick ? (e) => {
                  if ((e.target as HTMLElement).closest('.actions-dropdown')) return;
                  onRowClick(m);
                } : undefined}
              >
                <td className="px-4 py-2">{m.scheduled_date}</td>
                <td className="px-4 py-2">{m.equipment_id}</td>
                <td className="px-4 py-2">{m.type}</td>
                <td className="px-4 py-2">{m.status}</td>
                <td className="px-4 py-2">{m.cost ? m.cost.toLocaleString() + ' €' : '-'}</td>
                <td className="px-4 py-2 actions-dropdown" onClick={e => e.stopPropagation()}>
                  <ActionsDropdown
                    actions={[
                      { label: 'Détail', onClick: () => onRowClick && onRowClick(m) },
                      { label: 'Exporter', onClick: () => {/* TODO: Exporter */} },
                      { label: 'Supprimer', onClick: () => {/* TODO: Supprimer */} },
                    ]}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
