import React from 'react';
import type { InvestmentRequest } from '../../../types/investment-portfolio';
import { ActionsDropdown } from '../../ui/ActionsDropdown';


interface InvestmentRequestsTableProps {
  requests: InvestmentRequest[];
  loading?: boolean;
  onView: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (request: InvestmentRequest) => void;
}


export const InvestmentRequestsTable: React.FC<InvestmentRequestsTableProps> = ({ requests, loading, onView, onDelete, onEdit }) => {
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
          {loading ? (
            <tr>
              <td colSpan={6} className="py-8">
                <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto" />
              </td>
            </tr>
          ) : requests.length === 0 ? (
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
                    actions={[
                      { label: 'Voir', onClick: () => onView(req.id) },
                      onEdit ? { label: 'Éditer', onClick: () => onEdit(req) } : undefined,
                      onDelete ? { label: 'Supprimer', onClick: (e: React.MouseEvent) => { e?.stopPropagation?.(); onDelete(req.id); } } : undefined,
                    ].filter((a): a is { label: string; onClick: (e?: React.MouseEvent) => void } => Boolean(a))}
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
