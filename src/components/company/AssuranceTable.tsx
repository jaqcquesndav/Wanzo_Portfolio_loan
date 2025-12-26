import React from 'react';
import { Shield, Calendar, AlertTriangle } from 'lucide-react';
import type { Insurance, Currency } from '../../types/company';

interface AssuranceTableProps {
  assurances: Insurance[];
  compact?: boolean;
}

const INSURANCE_TYPE_LABELS: Record<string, string> = {
  'responsabilite_civile': 'Responsabilité civile',
  'incendie': 'Incendie',
  'vol': 'Vol',
  'accidents_travail': 'Accidents du travail',
  'marchandises': 'Marchandises',
  'vehicules': 'Véhicules',
  'multirisque': 'Multirisque',
  'autre': 'Autre'
};

const getInsuranceTypeColor = (type?: string): string => {
  switch (type) {
    case 'responsabilite_civile':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    case 'incendie':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    case 'vol':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    case 'accidents_travail':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    case 'vehicules':
      return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300';
    case 'multirisque':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  }
};

const formatCurrency = (amount?: number, currency?: Currency): string => {
  if (!amount) return '-';
  return `${amount.toLocaleString('fr-FR')} ${currency || 'USD'}`;
};

const isExpiringSoon = (dateExpiration?: string): boolean => {
  if (!dateExpiration) return false;
  const expDate = new Date(dateExpiration);
  const now = new Date();
  const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  return expDate <= threeMonthsFromNow && expDate > now;
};

const isExpired = (dateExpiration?: string): boolean => {
  if (!dateExpiration) return false;
  return new Date(dateExpiration) < new Date();
};

/**
 * Tableau d'affichage des assurances (lecture seule)
 */
export const AssuranceTable: React.FC<AssuranceTableProps> = ({
  assurances,
  compact = false
}) => {
  if (!assurances || assurances.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400 italic">Aucune assurance enregistrée</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {assurances.slice(0, 4).map((assurance, idx) => (
          <div 
            key={assurance.id || idx} 
            className={`p-3 rounded border ${
              isExpired(assurance.dateExpiration)
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                : isExpiringSoon(assurance.dateExpiration)
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 ${
                  isExpired(assurance.dateExpiration) ? 'text-red-500' : 'text-blue-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {assurance.compagnie}
                  </p>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium ${getInsuranceTypeColor(assurance.typeAssurance)}`}>
                    {INSURANCE_TYPE_LABELS[assurance.typeAssurance] || assurance.typeAssurance}
                  </span>
                </div>
              </div>
              {isExpired(assurance.dateExpiration) && (
                <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Expirée
                </span>
              )}
            </div>
          </div>
        ))}
        {assurances.length > 4 && (
          <p className="text-xs text-gray-500 italic text-center">
            +{assurances.length - 4} autres assurances
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Compagnie</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">N° Police</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Couverture</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Prime</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Validité</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-gray-700">
          {assurances.map((assurance, idx) => {
            const expired = isExpired(assurance.dateExpiration);
            const expiringSoon = isExpiringSoon(assurance.dateExpiration);
            
            return (
              <tr 
                key={assurance.id || idx} 
                className={`transition-colors ${
                  expired 
                    ? 'bg-red-50 dark:bg-red-900/10' 
                    : expiringSoon 
                      ? 'bg-yellow-50 dark:bg-yellow-900/10'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getInsuranceTypeColor(assurance.typeAssurance)}`}>
                    {INSURANCE_TYPE_LABELS[assurance.typeAssurance] || assurance.typeAssurance}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {assurance.compagnie}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono text-xs">
                  {assurance.numeroPolice || '-'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                  {formatCurrency(assurance.montantCouverture, assurance.devise)}
                </td>
                <td className="px-4 py-3 text-right">
                  {assurance.prime ? (
                    <div>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(assurance.prime, assurance.devise)}
                      </span>
                      {assurance.frequencePaiement && (
                        <span className="text-xs text-gray-500 block">
                          /{assurance.frequencePaiement === 'mensuel' ? 'mois' : 
                            assurance.frequencePaiement === 'trimestriel' ? 'trim.' : 'an'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs">
                  {assurance.dateDebut && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(assurance.dateDebut).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  {assurance.dateExpiration && (
                    <div className={`flex items-center gap-1 mt-1 ${expired ? 'text-red-600' : expiringSoon ? 'text-yellow-600' : ''}`}>
                      <span className="text-gray-400">→</span>
                      {new Date(assurance.dateExpiration).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {expired ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      Expirée
                    </span>
                  ) : expiringSoon ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      Expire bientôt
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Résumé */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{assurances.length}</p>
            <p className="text-xs text-gray-500">Polices</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {assurances.filter(a => !isExpired(a.dateExpiration) && !isExpiringSoon(a.dateExpiration)).length}
            </p>
            <p className="text-xs text-gray-500">Actives</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {assurances.filter(a => isExpiringSoon(a.dateExpiration)).length}
            </p>
            <p className="text-xs text-gray-500">À renouveler</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {assurances.filter(a => isExpired(a.dateExpiration)).length}
            </p>
            <p className="text-xs text-gray-500">Expirées</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssuranceTable;
