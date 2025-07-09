import React from 'react';
import type { Incident } from '../../../types/leasing-asset';

interface IncidentsTableProps {
  incidents: Incident[];
}

export function IncidentsTable({ incidents }: IncidentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 w-full">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Équipement</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Statut</th>
          </tr>
        </thead>
        <tbody>
          {incidents.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-400">Aucun incident à afficher</td>
            </tr>
          ) : (
            incidents.map((incident) => (
              <tr key={incident.id}>
                <td className="px-4 py-2">{incident.date_reported}</td>
                <td className="px-4 py-2">{incident.equipment_id}</td>
                <td className="px-4 py-2">{incident.description}</td>
                <td className="px-4 py-2">{incident.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
