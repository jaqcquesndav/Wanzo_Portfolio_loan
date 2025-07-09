// Removed unused React import
import type { LeasingContract } from '../../../types/leasing';
import { ActionsDropdown } from '../../ui/ActionsDropdown';


interface ContractsTableProps {
  contracts: LeasingContract[];
  loading?: boolean;
  onRowClick?: (contract: LeasingContract) => void;
}

export function ContractsTable({ contracts, loading = false, onRowClick }: ContractsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 w-full">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Numéro</th>
            <th className="px-4 py-2 text-left">Client</th>
            <th className="px-4 py-2 text-left">Équipement</th>
            <th className="px-4 py-2 text-left">Montant</th>
            <th className="px-4 py-2 text-left">Durée</th>
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                {Array.from({ length: 7 }).map((_, i) => (
                  <td key={i} className="px-4 py-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
                  </td>
                ))}
              </tr>
            ))
          ) : contracts.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-400">Aucun contrat à afficher</td>
            </tr>
          ) : (
            contracts.map((contract) => (
              <tr
                key={contract.id}
                className="group hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                onClick={onRowClick ? (e) => {
                  if ((e.target as HTMLElement).closest('.actions-dropdown')) return;
                  onRowClick(contract);
                } : undefined}
              >
                <td className="px-4 py-2">{contract.id}</td>
                <td className="px-4 py-2">{contract.client_id}</td>
                <td className="px-4 py-2">{contract.equipment_id}</td>
                <td className="px-4 py-2">{contract.monthly_payment.toLocaleString()} €</td>
                <td className="px-4 py-2">{contract.start_date} - {contract.end_date}</td>
                <td className="px-4 py-2">{contract.status}</td>
                <td className="px-4 py-2 actions-dropdown" onClick={e => e.stopPropagation()}>
                  <ActionsDropdown
                    actions={[
                      { label: 'Détail', onClick: () => onRowClick && onRowClick(contract) },
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
