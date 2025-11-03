import { Building2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../utils/formatters';
import { useInstitutionApi } from '../hooks/useInstitutionApi';
import { OrganizationSkeleton } from '../components/ui/OrganizationSkeleton';
import { useEffect } from 'react';

export default function Organization() {
  const { institution, loading: isLoading, refetch } = useInstitutionApi();

  // Charger l'institution au montage du composant
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Affichage du chargement
  if (isLoading) {
    return <OrganizationSkeleton />;
  }
  
  // Affichage si aucune institution n'est configurée
  if (!institution) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Aucune institution configurée
        </h2>
        <p className="text-gray-500 mb-4">
          Les informations de votre institution ne sont pas disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Building2 className="h-6 w-6 text-primary mr-2" />
        <h1 className="text-2xl font-semibold text-gray-900">
          Informations de l'Institution
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Badge variant="success">
                {institution.type}
              </Badge>
              <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                {institution.name}
              </h2>
              <p className="text-sm text-gray-500">
                {institution.license_number ? `Licence: ${institution.license_number}` : ""}
              </p>
            </div>
            <div className="text-sm text-gray-500 flex flex-col items-end">
              <span>Créée le {formatDate(institution.created_at)}</span>
              <span>Dernière mise à jour le {formatDate(institution.updated_at)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Informations générales</h3>
              <dl className="mt-2 space-y-2">
                {institution.license_type && (
                  <div>
                    <dt className="text-sm text-gray-500">Type de licence</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{institution.license_type}</dd>
                  </div>
                )}
                
                {institution.address && (
                  <div>
                    <dt className="text-sm text-gray-500">Adresse</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {institution.address}
                    </dd>
                  </div>
                )}
                
                {institution.legal_representative && (
                  <div>
                    <dt className="text-sm text-gray-500">Représentant légal</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {institution.legal_representative}
                    </dd>
                  </div>
                )}
                
                {institution.phone && (
                  <div>
                    <dt className="text-sm text-gray-500">Téléphone</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {institution.phone}
                    </dd>
                  </div>
                )}
                
                {institution.email && (
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {institution.email}
                    </dd>
                  </div>
                )}
                
                {institution.website && (
                  <div>
                    <dt className="text-sm text-gray-500">Site web</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {institution.website}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Informations réglementaires</h3>
              <dl className="mt-2 space-y-2">
                {institution.license_number && (
                  <div>
                    <dt className="text-sm text-gray-500">N° de licence</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{institution.license_number}</dd>
                  </div>
                )}
                
                {institution.tax_id && (
                  <div>
                    <dt className="text-sm text-gray-500">N° Impôt</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{institution.tax_id}</dd>
                  </div>
                )}
                
                {institution.regulatory_status && (
                  <div>
                    <dt className="text-sm text-gray-500">Statut réglementaire</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{institution.regulatory_status}</dd>
                  </div>
                )}
                
                {institution.status && (
                  <div>
                    <dt className="text-sm text-gray-500">Statut</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      <Badge variant={institution.status === 'active' ? 'success' : 'warning'}>
                        {institution.status}
                      </Badge>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
          {institution.documents && institution.documents.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {institution.documents.map((document, index) => (
                  <div key={index} className="p-3 border rounded-md border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {document.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {document.type}
                    </p>
                    {document.url && (
                      <a href={document.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                        Télécharger
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}