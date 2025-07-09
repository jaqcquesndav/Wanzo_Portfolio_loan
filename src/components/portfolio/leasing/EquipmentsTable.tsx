import React from 'react';
import type { Equipment } from '../../../types/leasing';

interface EquipmentsTableProps {
  equipments: Equipment[];
}

export function EquipmentsTable({ equipments }: EquipmentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 w-full">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Nom</th>
            <th className="px-4 py-2 text-left">Catégorie</th>
            <th className="px-4 py-2 text-left">Fabricant</th>
            <th className="px-4 py-2 text-left">Modèle</th>
            <th className="px-4 py-2 text-left">Année</th>
            <th className="px-4 py-2 text-left">Prix</th>
            <th className="px-4 py-2 text-left">État</th>
            <th className="px-4 py-2 text-left">Disponibilité</th>
          </tr>
        </thead>
        <tbody>
          {equipments.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-8 text-gray-400">Aucun équipement à afficher</td>
            </tr>
          ) : (
            equipments.map((eq) => (
              <tr key={eq.id}>
                <td className="px-4 py-2">{eq.name}</td>
                <td className="px-4 py-2">{eq.category}</td>
                <td className="px-4 py-2">{eq.manufacturer}</td>
                <td className="px-4 py-2">{eq.model}</td>
                <td className="px-4 py-2">{eq.year}</td>
                <td className="px-4 py-2">{eq.price.toLocaleString()} €</td>
                <td className="px-4 py-2">{eq.condition === 'new' ? 'Neuf' : 'Occasion'}</td>
                <td className="px-4 py-2">{eq.availability ? 'Disponible' : 'Indisponible'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
