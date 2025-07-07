import React from 'react';
import type { PortfolioCompanyReport } from '../../../types/investment-portfolio';
import { ActionsDropdown } from '../../ui/ActionsDropdown';

interface PortfolioCompanyReportsTableProps {
  reports: PortfolioCompanyReport[];
  onView: (id: string) => void;
}

export const PortfolioCompanyReportsTable: React.FC<PortfolioCompanyReportsTableProps> = ({ reports, onView }) => {
  return (
    <div className="overflow-x-auto overflow-visible rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Entreprise</th>
            <th className="px-4 py-2 text-left">Période</th>
            <th className="px-4 py-2 text-left">KPI principaux</th>
            <th className="px-4 py-2 text-left">Rapport</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-400">Aucun reporting</td>
            </tr>
          ) : (
            reports.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onView(r.id)}>
                <td className="px-4 py-2">{r.companyId}</td>
                <td className="px-4 py-2">{r.period}</td>
                <td className="px-4 py-2">{Object.entries(r.kpis).map(([k, v]) => `${k}: ${v}`).join(', ')}</td>
                <td className="px-4 py-2">{r.reportUrl ? <a href={r.reportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">PDF</a> : '-'}</td>
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
