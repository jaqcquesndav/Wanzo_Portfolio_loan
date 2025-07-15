import { useState } from 'react';
import { Building2, Edit2, Plus, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { OrganizationForm } from '../components/organization/OrganizationForm';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate } from '../utils/formatters';
import { useOrganization, OrganizationData } from '../hooks/useOrganization';

export default function Organization() {
  const { organizationData, isLoading, updateOrganization } = useOrganization();
  const { showNotification } = useNotification();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleUpdateOrganization = async (data: Partial<OrganizationData>) => {
    try {
      await updateOrganization(data);
      showNotification('Organisation mise à jour avec succès', 'success');
      setShowEditModal(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      showNotification('Erreur lors de la mise à jour', 'error');
    }
  };

  // Affichage du chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Chargement des données de l'organisation...</span>
      </div>
    );
  }
  
  // Affichage si aucune organisation n'est configurée
  if (!organizationData) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Aucune organisation configurée
        </h2>
        <p className="text-gray-500 mb-4">
          Configurez les informations de votre organisation pour commencer
        </p>
        <Button
          onClick={() => setShowEditModal(true)}
          icon={<Plus className="h-5 w-5" />}
        >
          Configurer l'organisation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Building2 className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Gestion de l'Organisation
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
              <Badge variant={organizationData.status === 'active' ? 'success' : 'warning'}>
                {organizationData.status}
              </Badge>
              <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                {organizationData.name}
              </h2>
              <p className="text-sm text-gray-500">
                Organisation principale
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Créée le {formatDate(organizationData.created_at)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Informations générales</h3>
              <dl className="mt-2 space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Forme juridique</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{organizationData.legalForm}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Adresse</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{organizationData.address}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Contact</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {organizationData.phone}<br />
                    {organizationData.email}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Documents</h3>
              <div className="mt-2 space-y-2">
                {organizationData.documents?.map((doc: {name: string, type: string, url: string}, index: number) => (
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
        <OrganizationForm
          organization={organizationData}
          onSubmit={handleUpdateOrganization}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}