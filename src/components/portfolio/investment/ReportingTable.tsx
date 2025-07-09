import { useNavigate, useParams } from 'react-router-dom';
import type { InvestmentPortfolio } from '../../../types/investment-portfolio';
import { usePortfolio } from '../../../hooks/usePortfolio';
import { ActionsDropdown } from '../../ui/ActionsDropdown';

export function ReportingTable({ loading, onDelete, onExport }: { loading?: boolean; onDelete?: (id: string) => void; onExport?: (id: string) => void }) {
  const { id: portfolioId } = useParams();
  const navigate = useNavigate();
  const { portfolio } = usePortfolio(portfolioId, 'investment');
  const reports = (portfolio && portfolio.type === 'investment' && Array.isArray((portfolio as InvestmentPortfolio).reports)) ? (portfolio as InvestmentPortfolio).reports! : [];
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 w-full">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Période</th>
            <th className="px-4 py-2 text-left">KPI</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={3} className="py-8"><div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" /></td></tr>
          ) : reports.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-8 text-gray-400">Aucun reporting à afficher</td>
            </tr>
          ) : (
            reports.map((r) => (
              <tr
                key={r.id}
                onClick={e => {
                  if ((e.target as HTMLElement).closest('.actions-dropdown')) return;
                  navigate(`/app/investment/${portfolioId}/reporting/${r.id}`);
                }}
                tabIndex={0}
                aria-label={`Voir le reporting ${r.id}`}
                style={{ outline: 'none' }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/app/investment/${portfolioId}/reporting/${r.id}`);
                  }
                }}
              >
                <td className="px-4 py-2">{r.period}</td>
                <td className="px-4 py-2">{Object.keys(r.kpis).join(', ')}</td>
                <td className="px-4 py-2 text-center">
                  <div className="actions-dropdown inline-block">
                    <ActionsDropdown
                      actions={[
                        { label: 'Détail', onClick: () => navigate(`/app/investment/${portfolioId}/reporting/${r.id}`) },
                        { label: 'Exporter', onClick: () => onExport && onExport(r.id) },
                        { label: 'Supprimer', onClick: () => onDelete && onDelete(r.id) },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
