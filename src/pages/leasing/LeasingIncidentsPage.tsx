import React from 'react';
import { mockLeasingIncidents } from '../../data/mockLeasing';

export default function LeasingIncidentsPage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Incidents signalés</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2">Équipement</th>
            <th className="px-4 py-2">Signalé par</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Statut</th>
            <th className="px-4 py-2">Résolution</th>
          </tr>
        </thead>
        <tbody>
          {mockLeasingIncidents.map(inc => (
            <tr key={inc.id} className="border-t">
              <td className="px-4 py-2">{inc.equipment_id}</td>
              <td className="px-4 py-2">{inc.reported_by}</td>
              <td className="px-4 py-2">{new Date(inc.date_reported).toLocaleString()}</td>
              <td className="px-4 py-2">{inc.description}</td>
              <td className="px-4 py-2">{inc.status}</td>
              <td className="px-4 py-2">{inc.resolution_notes || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
