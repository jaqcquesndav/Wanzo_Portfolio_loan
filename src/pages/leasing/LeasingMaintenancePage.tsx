import React from 'react';
import { mockLeasingMaintenances } from '../../data/mockLeasing';

export default function LeasingMaintenancePage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Maintenances programmées</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2">Équipement</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Date prévue</th>
            <th className="px-4 py-2">Statut</th>
            <th className="px-4 py-2">Fournisseur</th>
            <th className="px-4 py-2">Coût</th>
          </tr>
        </thead>
        <tbody>
          {mockLeasingMaintenances.map(mnt => (
            <tr key={mnt.id} className="border-t">
              <td className="px-4 py-2">{mnt.equipment_id}</td>
              <td className="px-4 py-2">{mnt.type}</td>
              <td className="px-4 py-2">{mnt.description}</td>
              <td className="px-4 py-2">{new Date(mnt.scheduled_date).toLocaleString()}</td>
              <td className="px-4 py-2">{mnt.status}</td>
              <td className="px-4 py-2">{mnt.provider}</td>
              <td className="px-4 py-2">{mnt.cost ? mnt.cost + ' €' : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
