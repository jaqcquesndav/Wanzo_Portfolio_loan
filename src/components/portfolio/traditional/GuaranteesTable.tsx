import React from 'react';
// import { Button } from '../../ui/Button';
import { ActionsDropdown } from '../../ui/ActionsDropdown';

export interface Guarantee {
  id: string;
  company: string;
  type: string;
  value: number;
  status: 'active' | 'libérée' | 'saisie';
  created_at: string;
  requestId?: string;
  portfolioId: string;
}

interface GuaranteesTableProps {
  guarantees: Guarantee[];
  onRelease: (id: string) => void;
  onSeize: (id: string) => void;
  onView: (id: string) => void;
}

export const GuaranteesTable: React.FC<GuaranteesTableProps> = ({ guarantees, onRelease, onSeize, onView }) => {
  return (
    <div className="overflow-x-auto overflow-visible rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Entreprise</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Valeur</th>
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {guarantees.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400">Aucune garantie</td>
            </tr>
          ) : (
            guarantees.map((g) => (
              <tr
                key={g.id}
                className="hover:bg-primary-light/10 cursor-pointer"
                onClick={() => onView(g.id)}
              >
                <td className="px-4 py-2">{g.company}</td>
                <td className="px-4 py-2">{g.type}</td>
                <td className="px-4 py-2">{g.value.toLocaleString()} FCFA</td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${g.status === 'active' ? 'bg-yellow-100 text-yellow-700' : g.status === 'libérée' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{g.status}</span>
                </td>
                <td className="px-4 py-2 text-xs">{new Date(g.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-center overflow-visible" style={{ position: 'relative' }}>
                  <ActionsDropdown
                    actions={[
                      { label: 'Voir', onClick: () => onView(g.id) },
                      g.status === 'active' ? { label: 'Mainlevée', onClick: () => onRelease(g.id) } : null,
                      g.status === 'active' ? { label: 'Saisir', onClick: () => onSeize(g.id) } : null,
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
