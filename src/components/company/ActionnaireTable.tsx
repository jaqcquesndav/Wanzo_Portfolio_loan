import React from 'react';
import { Building2, User, Mail, Phone } from 'lucide-react';
import type { ContactPerson } from '../../types/company';

interface ActionnaireTableProps {
  actionnaires: ContactPerson[];
  formeJuridique?: string; // Pour déterminer si on parle d'actions ou de parts sociales
  compact?: boolean;
}

/**
 * Tableau d'affichage des actionnaires (lecture seule)
 * Supporte les personnes physiques ET morales
 */
export const ActionnaireTable: React.FC<ActionnaireTableProps> = ({
  actionnaires,
  formeJuridique,
  compact = false
}) => {
  if (!actionnaires || actionnaires.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400 italic">Aucun actionnaire enregistré</p>
      </div>
    );
  }

  // Déterminer le libellé selon la forme juridique
  const isPartsociales = formeJuridique && ['SARL', 'SARLU', 'SNC', 'SCS'].includes(formeJuridique);
  const capitalLabel = isPartsociales ? 'Parts sociales' : 'Actions';

  // Calculer le total des pourcentages
  const totalPourcentage = actionnaires.reduce((sum, a) => sum + (a.pourcentageActions || 0), 0);

  if (compact) {
    return (
      <div className="space-y-2">
        {actionnaires.slice(0, 5).map((person, idx) => (
          <div key={person.id || idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {person.typeDetenteur === 'morale' ? (
                  <Building2 className="w-4 h-4 text-purple-600" />
                ) : (
                  <User className="w-4 h-4 text-blue-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {person.typeDetenteur === 'morale' 
                      ? person.raisonSociale 
                      : `${person.prenoms} ${person.nom}`}
                  </p>
                  {person.typeDetenteur === 'morale' && person.representantLegal && (
                    <p className="text-xs text-gray-500">Rep.: {person.representantLegal}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold px-2 py-1 rounded">
                  {person.pourcentageActions || 0}%
                </span>
                {person.nombreActions && (
                  <p className="text-xs text-gray-500 mt-1">{person.nombreActions.toLocaleString()} {capitalLabel}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {actionnaires.length > 5 && (
          <p className="text-xs text-gray-500 italic text-center">
            +{actionnaires.length - 5} autres actionnaires
          </p>
        )}
        {/* Barre de progression du capital */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Répartition du capital</span>
            <span>{totalPourcentage.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${Math.min(totalPourcentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Identité</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Contact</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{capitalLabel}</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">% Capital</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {actionnaires.map((person, idx) => (
              <tr key={person.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 py-3">
                  {person.typeDetenteur === 'morale' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                      <Building2 className="w-3 h-3" />
                      Personne morale
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                      <User className="w-3 h-3" />
                      Personne physique
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {person.typeDetenteur === 'morale' ? (
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {person.raisonSociale}
                      </div>
                      {person.formeJuridique && (
                        <div className="text-xs text-gray-500">{person.formeJuridique}</div>
                      )}
                      {person.rccm && (
                        <div className="text-xs text-gray-500">RCCM: {person.rccm}</div>
                      )}
                      {person.representantLegal && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          <span className="font-medium">Représentant:</span> {person.representantLegal}
                          {person.representantFonction && ` (${person.representantFonction})`}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {person.prenoms} {person.nom}
                      </div>
                      {person.nationalite && (
                        <div className="text-xs text-gray-500">{person.nationalite}</div>
                      )}
                      {person.adresse && (
                        <div className="text-xs text-gray-500">{person.adresse}</div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {person.email && (
                      <a href={`mailto:${person.email}`} className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                        <Mail className="w-3 h-3" />
                        {person.email}
                      </a>
                    )}
                    {person.telephone && (
                      <a href={`tel:${person.telephone}`} className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                        <Phone className="w-3 h-3" />
                        {person.telephone}
                      </a>
                    )}
                    {person.typeDetenteur === 'morale' && person.siegeSocial && (
                      <div className="text-xs text-gray-500">
                        Siège: {person.siegeSocial}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                  {person.nombreActions 
                    ? person.nombreActions.toLocaleString()
                    : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold px-3 py-1 rounded">
                    {person.pourcentageActions || 0}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                Total
              </td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                {actionnaires.reduce((sum, a) => sum + (a.nombreActions || 0), 0).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right">
                <span className={`inline-block text-sm font-bold px-3 py-1 rounded ${
                  totalPourcentage === 100 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                }`}>
                  {totalPourcentage.toFixed(1)}%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Visualisation de la répartition */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Répartition du capital
        </h4>
        <div className="space-y-2">
          {actionnaires.map((person, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-32 truncate text-xs text-gray-600 dark:text-gray-400">
                {person.typeDetenteur === 'morale' 
                  ? person.raisonSociale 
                  : `${person.prenoms} ${person.nom}`}
              </div>
              <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    person.typeDetenteur === 'morale' 
                      ? 'bg-purple-500' 
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${person.pourcentageActions || 0}%` }}
                />
              </div>
              <div className="w-12 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
                {person.pourcentageActions || 0}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionnaireTable;
