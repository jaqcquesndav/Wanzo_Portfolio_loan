import React from 'react';

interface StockData {
  id: string;
  designation: string;
  categorie: 'matiere_premiere' | 'produit_semi_fini' | 'produit_fini' | 'fourniture' | 'emballage' | 'autre';
  description?: string;
  quantiteStock: number;
  unite: string;
  seuilMinimum?: number;
  seuilMaximum?: number;
  coutUnitaire: number;
  valeurTotaleStock: number;
  devise: 'USD' | 'CDF' | 'EUR';
  dateDernierInventaire?: string;
  dureeRotationMoyenne?: number;
  datePeremption?: string;
  emplacement?: string;
  conditionsStockage?: string;
  fournisseurPrincipal?: string;
  numeroLot?: string;
  codeArticle?: string;
  etatStock: 'excellent' | 'bon' | 'moyen' | 'deteriore' | 'perime';
  observations?: string;
}

interface StockTableProps {
  stocks: StockData[];
  editable?: boolean;
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
  compact?: boolean;
}

export const StockTable: React.FC<StockTableProps> = ({
  stocks,
  editable = false,
  onEdit,
  onDelete,
  compact = false
}) => {
  if (!stocks || stocks.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400 italic">Aucun stock enregistré</p>
      </div>
    );
  }

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      matiere_premiere: 'Matière première',
      produit_semi_fini: 'Produit semi-fini',
      produit_fini: 'Produit fini',
      fourniture: 'Fourniture',
      emballage: 'Emballage',
      autre: 'Autre'
    };
    return labels[cat] || cat;
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'excellent':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'bon':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'moyen':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'deteriore':
      case 'perime':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (compact) {
    // Version compacte pour affichage résumé
    return (
      <div className="space-y-2">
        {stocks.slice(0, 5).map((stock, idx) => (
          <div key={stock.id || idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{stock.designation}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stock.quantiteStock} {stock.unite} × {stock.coutUnitaire} {stock.devise}
              </p>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStateColor(stock.etatStock)}`}>
              {stock.etatStock}
            </span>
          </div>
        ))}
        {stocks.length > 5 && (
          <p className="text-xs text-gray-500 italic text-center">
            +{stocks.length - 5} autres articles
          </p>
        )}
      </div>
    );
  }

  // Version complète avec tous les détails
  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Article</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Catégorie</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Quantité</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Valeur totale</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">État</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Fournisseur</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Observations</th>
            {editable && <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-gray-700">
          {stocks.map((stock, idx) => (
            <tr key={stock.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                <div>
                  <p>{stock.designation}</p>
                  {stock.codeArticle && <p className="text-xs text-gray-500">Code: {stock.codeArticle}</p>}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {getCategoryLabel(stock.categorie)}
              </td>
              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {stock.quantiteStock} {stock.unite}
              </td>
              <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                {stock.valeurTotaleStock} {stock.devise}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStateColor(stock.etatStock)}`}>
                  {stock.etatStock.charAt(0).toUpperCase() + stock.etatStock.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs">
                {stock.fournisseurPrincipal || '-'}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-xs text-xs">
                {stock.observations || '-'}
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
