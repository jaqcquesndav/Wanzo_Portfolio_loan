import React from 'react';
import type { InvestmentRequest } from '../../../types/investment-portfolio';
import { ActionsDropdown } from '../../ui/ActionsDropdown';

interface InvestmentRequestsTableProps {
  requests: InvestmentRequest[];
  onView: (id: string) => void;
}

export const InvestmentRequestsTable: React.FC<InvestmentRequestsTableProps> = ({ requests, onView }) => {
  return (
    <div className="overflow-x-auto overflow-visible rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Entreprise</th>
            <th className="px-4 py-2 text-left">Stade</th>
            <th className="px-4 py-2 text-left">Montant demandé</th>
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400">Aucune demande</td>
            </tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onView(req.id)}>
                <td className="px-4 py-2">{req.companyId}</td>
                <td className="px-4 py-2">{req.stage}</td>
                <td className="px-4 py-2">{req.amountRequested.toLocaleString()} FCFA</td>
                <td className="px-4 py-2">{req.status}</td>
                <td className="px-4 py-2">{new Date(req.created_at).toLocaleDateString()}</td>
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
