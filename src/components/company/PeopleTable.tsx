import React from 'react';
import { Mail, Phone } from 'lucide-react';

interface PersonData {
  id: string;
  nom: string;
  prenoms: string;
  fonction: string;
  nationalite?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  pourcentageActions?: number;
  dateNomination?: string;
  typeContrat?: string;
  salaire?: number;
  diplomes?: string[];
}

interface PeopleTableProps {
  people: PersonData[];
  editable?: boolean;
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
  compact?: boolean;
}

export const PeopleTable: React.FC<PeopleTableProps> = ({
  people,
  editable = false,
  onEdit,
  onDelete,
  compact = false
}) => {
  if (!people || people.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400 italic">Aucune personne enregistrée</p>
      </div>
    );
  }

  if (compact) {
    // Version compacte pour affichage résumé
    return (
      <div className="space-y-2">
        {people.slice(0, 3).map((person, idx) => (
          <div key={person.id || idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {person.nom} {person.prenoms}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{person.fonction}</p>
                {person.email && (
                  <a href={`mailto:${person.email}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" />
                    {person.email}
                  </a>
                )}
              </div>
              {person.pourcentageActions && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                  {person.pourcentageActions}%
                </span>
              )}
            </div>
          </div>
        ))}
        {people.length > 3 && (
          <p className="text-xs text-gray-500 italic text-center">
            +{people.length - 3} autres personnes
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
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Nom</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Fonction</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Email</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Téléphone</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Actions</th>
            {editable && <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Contrôles</th>}
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-gray-700">
          {people.map((person, idx) => (
            <tr key={person.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 dark:text-white">
                  {person.nom} {person.prenoms}
                </div>
                {person.nationalite && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {person.nationalite}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                <div>{person.fonction}</div>
                {person.dateNomination && (
                  <div className="text-xs text-gray-500">
                    Depuis: {new Date(person.dateNomination).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {person.email ? (
                  <a href={`mailto:${person.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {person.email}
                  </a>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {person.telephone ? (
                  <a href={`tel:${person.telephone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {person.telephone}
                  </a>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                {person.pourcentageActions && (
                  <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2 py-1 rounded">
                    {person.pourcentageActions}%
                  </span>
                )}
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
