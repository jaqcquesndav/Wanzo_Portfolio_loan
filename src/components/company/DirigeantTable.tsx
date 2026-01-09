import React from 'react';
import { Mail, Phone, Linkedin, FileText } from 'lucide-react';
import type { ContactPerson } from '../../types/company';

interface DirigeantTableProps {
  dirigeants: ContactPerson[];
  compact?: boolean;
}

/**
 * Tableau d'affichage des dirigeants (lecture seule)
 * Affiche tous les champs: nom, fonction, contact, CV, LinkedIn, diplômes
 */
export const DirigeantTable: React.FC<DirigeantTableProps> = ({
  dirigeants,
  compact = false
}) => {
  if (!dirigeants || dirigeants.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400 italic">Aucun dirigeant enregistré</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {dirigeants.slice(0, 3).map((person, idx) => (
          <div key={person.id || idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {person.prenoms} {person.nom}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{person.fonction}</p>
                {person.email && (
                  <a href={`mailto:${person.email}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" />
                    {person.email}
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                {person.linkedin && (
                  <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {person.cv && (
                  <a href={person.cv} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">
                    <FileText className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        {dirigeants.length > 3 && (
          <p className="text-xs text-gray-500 italic text-center">
            +{dirigeants.length - 3} autres dirigeants
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
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Nom complet</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Fonction</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Nationalité</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Contact</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Date nomination</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Documents</th>
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-gray-700">
          {dirigeants.map((person, idx) => (
            <tr key={person.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 dark:text-white">
                  {person.prenoms} {person.nom}
                </div>
                {person.adresse && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {person.adresse}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {person.fonction || '-'}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {person.nationalite || '-'}
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
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs">
                {person.dateNomination 
                  ? new Date(person.dateNomination).toLocaleDateString('fr-FR')
                  : '-'}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center gap-2">
                  {person.linkedin && (
                    <a 
                      href={person.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs hover:bg-blue-200"
                      title="Profil LinkedIn"
                    >
                      <Linkedin className="w-3 h-3" />
                      LinkedIn
                    </a>
                  )}
                  {person.cv && (
                    <a 
                      href={person.cv} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs hover:bg-green-200"
                      title="Télécharger le CV"
                    >
                      <FileText className="w-3 h-3" />
                      {person.cvFileName || 'CV'}
                    </a>
                  )}
                  {!person.linkedin && !person.cv && (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Section diplômes si disponibles */}
      {dirigeants.some(d => d.diplomes && d.diplomes.length > 0) && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Diplômes et formations</h4>
          <div className="space-y-2">
            {dirigeants.filter(d => d.diplomes && d.diplomes.length > 0).map((person, idx) => (
              <div key={idx} className="text-xs">
                <span className="font-medium text-gray-900 dark:text-white">{person.prenoms} {person.nom}:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  {person.diplomes?.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DirigeantTable;
