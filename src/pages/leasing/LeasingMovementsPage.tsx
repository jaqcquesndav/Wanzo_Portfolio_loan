import React from 'react';
import { mockLeasingMovements } from '../../data/mockLeasing';

export default function LeasingMovementsPage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Mouvements d’équipements</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2">Équipement</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">De</th>
            <th className="px-4 py-2">Vers</th>
            <th className="px-4 py-2">Utilisateur</th>
            <th className="px-4 py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {mockLeasingMovements.map(mov => (
            <tr key={mov.id} className="border-t">
              <td className="px-4 py-2">{mov.equipment_id}</td>
              <td className="px-4 py-2">{mov.type}</td>
              <td className="px-4 py-2">{new Date(mov.date).toLocaleString()}</td>
              <td className="px-4 py-2">{mov.from_location || '-'}</td>
              <td className="px-4 py-2">{mov.to_location || '-'}</td>
              <td className="px-4 py-2">{mov.user_id || '-'}</td>
              <td className="px-4 py-2">{mov.notes || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
