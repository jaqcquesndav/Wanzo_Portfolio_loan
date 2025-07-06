import React from 'react';

export interface ReportingRow {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
}

interface ReportingTableProps {
  data: ReportingRow[];
}

export const ReportingTable: React.FC<ReportingTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Indicateur</th>
            <th className="px-4 py-2 text-left">Valeur</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center py-8 text-gray-400">Aucun indicateur</td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-4 py-2 font-medium">{row.label}</td>
                <td className="px-4 py-2">{row.value} {row.unit || ''}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
