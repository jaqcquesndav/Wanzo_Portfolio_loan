import React from 'react';
import type { InvestmentTransaction } from '../../../types/investment-portfolio';
import { ActionsDropdown } from '../../ui/ActionsDropdown';

interface InvestmentTransactionsTableProps {
  transactions: InvestmentTransaction[];
  loading?: boolean;
  onView: (id: string) => void;
}

export const InvestmentTransactionsTable: React.FC<InvestmentTransactionsTableProps> = ({ transactions, loading, onView }) => {
  return (
    <div className="overflow-x-auto overflow-visible rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Entreprise</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Montant</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="py-8">
                <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto" />
              </td>
            </tr>
          ) : transactions.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400">Aucune transaction</td>
            </tr>
          ) : (
            transactions.map((trx) => (
              <tr key={trx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onView(trx.id)}>
                <td className="px-4 py-2">{trx.companyId}</td>
                <td className="px-4 py-2">{trx.type}</td>
                <td className="px-4 py-2">{trx.amount.toLocaleString()} FCFA</td>
                <td className="px-4 py-2">{trx.date}</td>
                <td className="px-4 py-2">{trx.status}</td>
                <td className="px-4 py-2 text-center">
                  <ActionsDropdown
                    actions={[]}
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
