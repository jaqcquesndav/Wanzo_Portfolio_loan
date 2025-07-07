import React from 'react';
import type { ExitEvent } from '../../../types/investment-portfolio';
import { ActionsDropdown } from '../../ui/ActionsDropdown';

interface ExitEventsTableProps {
  exits: ExitEvent[];
  onView: (id: string) => void;
}

export const ExitEventsTable: React.FC<ExitEventsTableProps> = ({ exits, onView }) => {
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
          {exits.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-400">Aucune sortie</td>
            </tr>
          ) : (
            exits.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onView(e.id)}>
                <td className="px-4 py-2">{e.companyId}</td>
                <td className="px-4 py-2">{e.type}</td>
                <td className="px-4 py-2">{e.date}</td>
                <td className="px-4 py-2">{e.amount.toLocaleString()} FCFA</td>
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
