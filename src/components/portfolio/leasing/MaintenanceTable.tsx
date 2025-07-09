import React from 'react';
import type { Maintenance } from '../../../types/leasing-asset';

interface MaintenanceTableProps {
  maintenances: Maintenance[];
}

export function MaintenanceTable({ maintenances }: MaintenanceTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 w-full">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Équipement</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Statut</th>
            <th className="px-4 py-2 text-left">Coût</th>
          </tr>
        </thead>
        <tbody>
          {maintenances.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-400">Aucune maintenance à afficher</td>
            </tr>
          ) : (
            maintenances.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-2">{m.scheduled_date}</td>
                <td className="px-4 py-2">{m.equipment_id}</td>
                <td className="px-4 py-2">{m.type}</td>
                <td className="px-4 py-2">{m.status}</td>
                <td className="px-4 py-2">{m.cost ? m.cost.toLocaleString() + ' €' : '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
