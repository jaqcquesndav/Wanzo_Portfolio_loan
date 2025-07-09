// Removed unused React import
import type { LeasingPayment } from '../../../types/leasing-payment';
import { ActionsDropdown } from '../../ui/ActionsDropdown';


interface PaymentsTableProps {
  payments: LeasingPayment[];
  loading?: boolean;
  onRowClick?: (payment: LeasingPayment) => void;
}

export function PaymentsTable({ payments, loading = false, onRowClick }: PaymentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 w-full">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Montant</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <td key={i} className="px-4 py-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
                  </td>
                ))}
              </tr>
            ))
          ) : payments.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-400">Aucun paiement à afficher</td>
            </tr>
          ) : (
            payments.map((p) => (
              <tr
                key={p.id}
                className="group hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                onClick={onRowClick ? (e) => {
                  if ((e.target as HTMLElement).closest('.actions-dropdown')) return;
                  onRowClick(p);
                } : undefined}
              >
                <td className="px-4 py-2">{p.date}</td>
                <td className="px-4 py-2">{p.amount.toLocaleString()} €</td>
                <td className="px-4 py-2">{p.type}</td>
                <td className="px-4 py-2">{p.status}</td>
                <td className="px-4 py-2 actions-dropdown" onClick={e => e.stopPropagation()}>
                  <ActionsDropdown
                    actions={[
                      { label: 'Détail', onClick: () => onRowClick && onRowClick(p) },
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
