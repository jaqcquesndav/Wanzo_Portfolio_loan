import { useState } from 'react';
import { Building2, Edit2, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { OrganizationForm } from '../components/organization/OrganizationForm';
import { useAuth } from '../contexts/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate } from '../utils/formatters';

// Définition d'un type adapté aux données d'organisation utilisées dans ce composant
interface OrganizationData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  legalForm: 'sa' | 'sarl' | 'sas' | 'other';
  capital: number;
  employeeCount: number;
  subsidiaryCount: number;
  boardMembers: number;
  executiveCommitteeMembers: number;
  specializedCommittees: number;
  created_at: string;
  updated_at: string;
  status: string;
  documents?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

export default function Organization() {
  const { institution } = useAuth();
  const { showNotification } = useNotification();
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Convertir l'institution en format attendu par ce composant
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(() => {
    if (institution) {
      return {
        id: institution.id,
        name: institution.name,
        address: institution.address,
        phone: institution.phone,
        email: institution.email,
        website: institution.website,
        legalForm: 'sa', // valeur par défaut
        capital: 1000000,
        employeeCount: 150,
        subsidiaryCount: 3,
        boardMembers: 7,
        executiveCommitteeMembers: 5,
        specializedCommittees: 3,
        created_at: institution.created_at,
        updated_at: institution.updated_at,
        status: institution.status,
        documents: institution.documents
      };
    }
    return null;
  });

  const handleUpdateOrganization = async (data: Partial<OrganizationData>) => {
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      if (organizationData) {
        setOrganizationData({
          ...organizationData,
          ...data,
          updated_at: new Date().toISOString()
        });
      }
      
      showNotification('Organisation mise à jour avec succès', 'success');
      setShowEditModal(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      showNotification('Erreur lors de la mise à jour', 'error');
    }
  };

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