import React, { useState } from 'react';
import { Building2, Edit2, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InstitutionForm } from '../components/institution/InstitutionForm';


import { useNotification } from '../contexts/NotificationContext';
import { formatDate } from '../utils/formatters';
import type { Institution } from '../types/institution';

export default function InstitutionManagement() {
  // TODO: Replace with real institution data from API or context
  const [institutionData, setInstitutionData] = useState<Institution | null>(null);
  // Optionally, fetch institution data from API here and setInstitutionData

  const { showNotification } = useNotification();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleUpdateInstitution = async (data: Partial<Institution>) => {
    try {
      // TODO: Call API to update institution
      setInstitutionData((prev: Institution | null) => prev ? {
        ...prev,
        ...data,
        updated_at: new Date().toISOString()
      } : null);
      showNotification('Institution mise à jour avec succès', 'success');
      setShowEditModal(false);
    } catch {
      showNotification('Erreur lors de la mise à jour', 'error');
    }
  };

  if (!institutionData) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Aucune institution configurée
        </h2>
        <p className="text-gray-500 mb-4">
          Configurez les informations de votre institution pour commencer
        </p>
        <Button
          onClick={() => setShowEditModal(true)}
          icon={<Plus className="h-5 w-5" />}
        >
          Configurer l'institution
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Building2 className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Gestion de l'Institution
          </h1>
        </div>
        <Button
          onClick={() => setShowEditModal(true)}
          icon={<Edit2 className="h-5 w-5" />}
        >
          Modifier
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Badge variant={institutionData.status === 'active' ? 'success' : 'warning'}>
                {institutionData.status}
              </Badge>
              <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                {institutionData.name}
              </h2>
              <p className="text-sm text-gray-500">
                {institutionData.type === 'bank' ? 'Banque' :
                 institutionData.type === 'microfinance' ? 'Institution de Microfinance' :
                 institutionData.type === 'investment_fund' ? 'Fonds d\'Investissement' :
                 'Coopérative d\'Épargne et de Crédit'}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Créée le {formatDate(institutionData.created_at)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Informations générales</h3>
              <dl className="mt-2 space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Numéro d'agrément</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {institutionData.license_number}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Type d'agrément</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {institutionData.license_type}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Contact</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {institutionData.phone}<br />
                    {institutionData.email}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Documents</h3>
              <div className="mt-2 space-y-2">
                {institutionData.documents?.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">{doc.name}</span>
                    <Button variant="ghost" size="sm">
                      Télécharger
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <InstitutionForm
          institution={institutionData}
          onSubmit={handleUpdateInstitution}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}