import React from 'react';
// import { Button } from '../../ui/Button';
import { ActionsDropdown } from '../../ui/ActionsDropdown';

export interface Disbursement {
  id: string;
  company: string;
  product: string;
  amount: number;
  status: 'en attente' | 'effectué';
  date: string;
}

interface DisbursementsTableProps {
  disbursements: Disbursement[];
  onConfirm: (id: string) => void;
  onView: (id: string) => void;
}

export const DisbursementsTable: React.FC<DisbursementsTableProps> = ({ disbursements, onConfirm, onView }) => {
  return (
    <div className="overflow-x-auto overflow-visible rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Entreprise</th>
            <th className="px-4 py-2 text-left">Produit</th>
            <th className="px-4 py-2 text-left">Montant</th>
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {disbursements.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400">Aucun virement</td>
            </tr>
          ) : (
            disbursements.map((d) => (
              <tr key={d.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-4 py-2 font-medium">{d.company}</td>
                <td className="px-4 py-2">{d.product}</td>
                <td className="px-4 py-2">{d.amount.toLocaleString()} FCFA</td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${d.status === 'effectué' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{d.status}</span>
                </td>
                <td className="px-4 py-2 text-xs">{new Date(d.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-center overflow-visible" style={{ position: 'relative' }}>
                  <ActionsDropdown
                    actions={[
                      { label: 'Voir', onClick: () => onView(d.id) },
                      d.status === 'en attente' ? { label: 'Confirmer', onClick: () => onConfirm(d.id) } : null,
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
