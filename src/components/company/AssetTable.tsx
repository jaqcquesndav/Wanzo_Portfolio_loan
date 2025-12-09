import React from 'react';

interface AssetData {
  id: string;
  designation: string;
  type: 'immobilier' | 'vehicule' | 'equipement' | 'stock' | 'autre';
  description?: string;
  prixAchat?: number;
  valeurActuelle?: number;
  devise?: 'USD' | 'CDF' | 'EUR';
  dateAcquisition?: string;
  etatActuel?: 'neuf' | 'excellent' | 'bon' | 'moyen' | 'mauvais' | 'deteriore';
  localisation?: string;
  numeroSerie?: string;
  marque?: string;
  modele?: string;
  quantite?: number;
  unite?: string;
  proprietaire?: 'propre' | 'location' | 'leasing' | 'emprunt';
  observations?: string;
}

interface AssetTableProps {
  assets: AssetData[];
  editable?: boolean;
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  editable = false,
  onEdit,
  onDelete
}) => {
  if (!assets || assets.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400 italic">Aucun actif enregistré</p>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      immobilier: 'Immobilier',
      vehicule: 'Véhicule',
      equipement: 'Équipement',
      stock: 'Stock',
      autre: 'Autre'
    };
    return labels[type] || type;
  };

  const getStateColor = (state?: string) => {
    switch (state) {
      case 'neuf':
      case 'excellent':
        return 'text-green-600 bg-green-50';
      case 'bon':
        return 'text-blue-600 bg-blue-50';
      case 'moyen':
        return 'text-yellow-600 bg-yellow-50';
      case 'mauvais':
      case 'deteriore':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Désignation</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Valeur actuelle</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">État</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Propriétaire</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Notes</th>
            {editable && <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-gray-700">
          {assets.map((asset, idx) => (
            <tr key={asset.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                {asset.designation}
                {asset.marque && <p className="text-xs text-gray-500">{asset.marque} {asset.modele}</p>}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {getTypeLabel(asset.type)}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {asset.valeurActuelle ? `${asset.valeurActuelle} ${asset.devise || 'USD'}` : '-'}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStateColor(asset.etatActuel)}`}>
                  {asset.etatActuel ? asset.etatActuel.charAt(0).toUpperCase() + asset.etatActuel.slice(1) : '-'}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {asset.proprietaire ? asset.proprietaire.charAt(0).toUpperCase() + asset.proprietaire.slice(1) : '-'}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-xs">
                {asset.observations || '-'}
              </td>
              {editable && (
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit?.(idx)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Éditer
                    </button>
                    <button
                      onClick={() => onDelete?.(idx)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
