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
  requestId?: string;
  portfolioId: string;
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
              <tr
                key={r.id}
                className="hover:bg-primary-light/10 cursor-pointer"
                onClick={() => onView(r.id)}
              >
                <td className="px-4 py-2">{r.company}</td>
                <td className="px-4 py-2">{r.product}</td>
                <td className="px-4 py-2">{r.dueDate}</td>
                <td className="px-4 py-2">{r.amount}</td>
                <td className="px-4 py-2">{r.status}</td>
                <td className="px-4 py-2 text-center">
                  <ActionsDropdown
                    actions={[
                      { label: 'Voir', onClick: () => onView(r.id) },
                      { label: 'Marquer comme payé', onClick: () => onMarkPaid(r.id), disabled: r.status !== 'à venir' }
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
};
