import React from 'react';
// import { Button } from '../../ui/Button';
import { ActionsDropdown } from '../../ui/ActionsDropdown';

export interface Repayment {
  id: string;
  company: string;
  product: string;
  dueDate: string;
  amount: number;
  status: 'à venir' | 'payé' | 'retard';
}

interface RepaymentsTableProps {
  repayments: Repayment[];
  onMarkPaid: (id: string) => void;
  onView: (id: string) => void;
}

export const RepaymentsTable: React.FC<RepaymentsTableProps> = ({ repayments, onMarkPaid, onView }) => {
  return (
    <div className="overflow-x-auto overflow-visible rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Entreprise</th>
            <th className="px-4 py-2 text-left">Produit</th>
            <th className="px-4 py-2 text-left">Échéance</th>
            <th className="px-4 py-2 text-left">Montant</th>
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {repayments.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400">Aucun remboursement</td>
            </tr>
          ) : (
            repayments.map((r) => (
              <tr key={r.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-4 py-2 font-medium">{r.company}</td>
                <td className="px-4 py-2">{r.product}</td>
                <td className="px-4 py-2 text-xs">{new Date(r.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{r.amount.toLocaleString()} FCFA</td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${r.status === 'payé' ? 'bg-green-100 text-green-700' : r.status === 'retard' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
                </td>
                <td className="px-4 py-2 text-center overflow-visible" style={{ position: 'relative' }}>
                  <ActionsDropdown
                    actions={[
                      { label: 'Voir', onClick: () => onView(r.id) },
                      r.status !== 'payé' ? { label: 'Marquer payé', onClick: () => onMarkPaid(r.id) } : null,
                    ].filter(Boolean) as { label: string; onClick: () => void }[]}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
