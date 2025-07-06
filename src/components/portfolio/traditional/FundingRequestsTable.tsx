import React from 'react';
// import { Button } from '../../ui/Button';
import { ActionsDropdown } from '../../ui/ActionsDropdown';

// Type simplifié pour une demande de financement PME
export interface FundingRequest {
  id: string;
  company: string;
  product: string;
  amount: number;
  status: 'en attente' | 'validée' | 'refusée' | 'décaissée';
  created_at: string;
}

interface FundingRequestsTableProps {
  requests: FundingRequest[];
  onValidate: (id: string) => void;
  onRefuse: (id: string) => void;
  onDisburse: (id: string) => void;
  onView: (id: string) => void;
}

export const FundingRequestsTable: React.FC<FundingRequestsTableProps> = ({ requests, onValidate, onRefuse, onDisburse, onView }) => {
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
          {requests.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400">Aucune demande</td>
            </tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-4 py-2 font-medium">{req.company}</td>
                <td className="px-4 py-2">{req.product}</td>
                <td className="px-4 py-2">{req.amount.toLocaleString()} FCFA</td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${req.status === 'validée' ? 'bg-green-100 text-green-700' : req.status === 'refusée' ? 'bg-red-100 text-red-700' : req.status === 'décaissée' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{req.status}</span>
                </td>
                <td className="px-4 py-2 text-xs">{new Date(req.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-center overflow-visible" style={{ position: 'relative' }}>
                  <ActionsDropdown
                    actions={[
                      { label: 'Voir', onClick: () => onView(req.id) },
                      req.status === 'en attente' ? { label: 'Valider', onClick: () => onValidate(req.id) } : null,
                      req.status === 'en attente' ? { label: 'Refuser', onClick: () => onRefuse(req.id) } : null,
                      req.status === 'validée' ? { label: 'Débloquer', onClick: () => onDisburse(req.id) } : null,
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
