import React from 'react';
import { mockLeasingReservations } from '../../data/mockLeasing';

export default function LeasingReservationsPage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Réservations d’équipements</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2">Équipement</th>
            <th className="px-4 py-2">Utilisateur</th>
            <th className="px-4 py-2">Début</th>
            <th className="px-4 py-2">Fin</th>
            <th className="px-4 py-2">Statut</th>
            <th className="px-4 py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {mockLeasingReservations.map(res => (
            <tr key={res.id} className="border-t">
              <td className="px-4 py-2">{res.equipment_id}</td>
              <td className="px-4 py-2">{res.user_id}</td>
              <td className="px-4 py-2">{new Date(res.start_date).toLocaleString()}</td>
              <td className="px-4 py-2">{new Date(res.end_date).toLocaleString()}</td>
              <td className="px-4 py-2">{res.status}</td>
              <td className="px-4 py-2">{res.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
