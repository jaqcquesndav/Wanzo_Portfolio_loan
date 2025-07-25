import React from 'react';
import type { ExitEvent } from '../../../types/investment-portfolio';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { useFormatCurrency } from '../../../hooks/useFormatCurrency';

interface ExitEventsTableProps {
  exits: ExitEvent[];
  loading?: boolean;
  onView: (id: string) => void;
}

export const ExitEventsTable: React.FC<ExitEventsTableProps> = ({ exits, loading, onView }) => {
  const { formatCurrency } = useFormatCurrency();
  
  return (
    <div className="overflow-x-auto overflow-visible rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Entreprise</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Montant</th>
            <th className="px-4 py-2 text-left">TRI</th>
            <th className="px-4 py-2 text-left">Multiple</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="py-8">
                <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto" />
              </td>
            </tr>
          ) : exits.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-400">Aucune sortie</td>
            </tr>
          ) : (
            exits.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onView(e.id)}>
                <td className="px-4 py-2">{e.companyId}</td>
                <td className="px-4 py-2">{e.type}</td>
                <td className="px-4 py-2">{e.date}</td>
                <td className="px-4 py-2">{formatCurrency(e.amount)}</td>
                <td className="px-4 py-2">{e.performance.tri}%</td>
                <td className="px-4 py-2">{e.performance.multiple}x</td>
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
