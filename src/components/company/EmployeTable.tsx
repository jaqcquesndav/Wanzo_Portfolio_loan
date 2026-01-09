import React from 'react';
import { Mail, Phone, GraduationCap, Calendar, DollarSign } from 'lucide-react';
import type { ContactPerson } from '../../types/company';

interface EmployeTableProps {
  employes: ContactPerson[];
  showSalary?: boolean; // Option pour masquer les salaires (confidentialité)
  compact?: boolean;
}

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  'CDI': 'CDI',
  'CDD': 'CDD',
  'interim': 'Intérim',
  'stage': 'Stage',
  'apprentissage': 'Apprentissage',
  'consultant': 'Consultant',
  'freelance': 'Freelance',
  'journalier': 'Journalier',
  'benevole': 'Bénévole',
  'autre': 'Autre'
};

const getContractBadgeColor = (type?: string): string => {
  switch (type) {
    case 'CDI':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    case 'CDD':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    case 'stage':
    case 'apprentissage':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    case 'consultant':
    case 'freelance':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  }
};

const formatSalary = (amount?: number, currency?: string): string => {
  if (!amount) return '-';
  const formatted = amount.toLocaleString('fr-FR');
  return `${formatted} ${currency || 'USD'}`;
};

/**
 * Tableau d'affichage des employés (lecture seule)
 * Affiche tous les champs: nom, fonction, contrat, salaire, diplômes
 */
export const EmployeTable: React.FC<EmployeTableProps> = ({
  employes,
  showSalary = true,
  compact = false
}) => {
  if (!employes || employes.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400 italic">Aucun employé clé enregistré</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {employes.slice(0, 5).map((person, idx) => (
          <div key={person.id || idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {person.prenoms} {person.nom}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{person.fonction}</p>
                {person.typeContrat && (
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getContractBadgeColor(person.typeContrat)}`}>
                    {CONTRACT_TYPE_LABELS[person.typeContrat] || person.typeContrat}
                  </span>
                )}
              </div>
              {person.email && (
                <a href={`mailto:${person.email}`} className="text-blue-600 hover:text-blue-800">
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
        {employes.length > 5 && (
          <p className="text-xs text-gray-500 italic text-center">
            +{employes.length - 5} autres employés
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
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Contrat</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Contact</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Date engagement</th>
            {showSalary && (
              <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Salaire</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-gray-700">
          {employes.map((person, idx) => (
            <tr key={person.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 dark:text-white">
                  {person.prenoms} {person.nom}
                </div>
                {person.nationalite && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {person.nationalite}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="text-gray-700 dark:text-gray-300">
                  {person.fonction || '-'}
                </div>
                {person.diplomes && person.diplomes.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <GraduationCap className="w-3 h-3" />
                    {person.diplomes.slice(0, 2).join(', ')}
                    {person.diplomes.length > 2 && ` +${person.diplomes.length - 2}`}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                {person.typeContrat ? (
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getContractBadgeColor(person.typeContrat)}`}>
                    {CONTRACT_TYPE_LABELS[person.typeContrat] || person.typeContrat}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
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
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {person.dateNomination ? (
                  <div className="flex items-center gap-1 text-xs">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {new Date(person.dateNomination).toLocaleDateString('fr-FR')}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              {showSalary && (
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                  {person.salaire ? (
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span className="font-medium">{formatSalary(person.salaire)}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Statistiques résumées */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{employes.length}</p>
            <p className="text-xs text-gray-500">Employés clés</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {employes.filter(e => e.typeContrat === 'CDI').length}
            </p>
            <p className="text-xs text-gray-500">CDI</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {employes.filter(e => e.typeContrat === 'CDD').length}
            </p>
            <p className="text-xs text-gray-500">CDD</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {employes.filter(e => ['consultant', 'freelance', 'stage'].includes(e.typeContrat || '')).length}
            </p>
            <p className="text-xs text-gray-500">Autres</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeTable;
