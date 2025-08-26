import { Building2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../utils/formatters';
import { useOrganization } from '../hooks/useOrganization';
import { LoadingScreen } from '../components/ui/LoadingScreen';

export default function Organization() {
  const { institutionData, isLoading } = useOrganization();

  // Affichage du chargement
  if (isLoading) {
    return (
      <LoadingScreen 
        message="Chargement des données de l'institution..." 
        overlay={false} 
        className="py-12"
      />
    );
  }
  
  // Affichage si aucune institution n'est configurée
  if (!institutionData) {
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
                {institutionData.type}
              </Badge>
              {institutionData.sector && (
                <Badge variant="secondary" className="ml-2 border border-gray-300 dark:border-gray-600 bg-transparent">
                  {institutionData.sector}
                </Badge>
              )}
              <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                {institutionData.name}
              </h2>
              <p className="text-sm text-gray-500">
                {institutionData.legalForm || ""}
              </p>
            </div>
            <div className="text-sm text-gray-500 flex flex-col items-end">
              <span>Créée le {formatDate(institutionData.creationDate || institutionData.createdAt)}</span>
              <span>Dernière mise à jour le {formatDate(institutionData.updatedAt)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Informations générales</h3>
              <dl className="mt-2 space-y-2">
                {institutionData.legalForm && (
                  <div>
                    <dt className="text-sm text-gray-500">Forme juridique</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{institutionData.legalForm}</dd>
                  </div>
                )}
                
                {institutionData.headquartersAddress && (
                  <div>
                    <dt className="text-sm text-gray-500">Adresse du siège</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {institutionData.headquartersAddress.street}, <br />
                      {institutionData.headquartersAddress.city}, {institutionData.headquartersAddress.country}
                    </dd>
                  </div>
                )}
                
                {institutionData.contactPerson && (
                  <div>
                    <dt className="text-sm text-gray-500">Personne de contact</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {institutionData.contactPerson.name}, {institutionData.contactPerson.title}<br />
                      {institutionData.contactPerson.email}<br />
                      {institutionData.contactPerson.phone}
                    </dd>
                  </div>
                )}
                
                {institutionData.website && (
                  <div>
                    <dt className="text-sm text-gray-500">Site web</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      <a href={institutionData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {institutionData.website}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Informations réglementaires</h3>
              <dl className="mt-2 space-y-2">
                {institutionData.approvalNumber && (
                  <div>
                    <dt className="text-sm text-gray-500">N° d'agrément</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{institutionData.approvalNumber}</dd>
                  </div>
                )}
                
                {institutionData.taxId && (
                  <div>
                    <dt className="text-sm text-gray-500">N° Impôt</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{institutionData.taxId}</dd>
                  </div>
                )}
                
                {institutionData.natId && (
                  <div>
                    <dt className="text-sm text-gray-500">IDNAT</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{institutionData.natId}</dd>
                  </div>
                )}
                
                {institutionData.rccm && (
                  <div>
                    <dt className="text-sm text-gray-500">RCCM</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{institutionData.rccm}</dd>
                  </div>
                )}
                
                {institutionData.capital && (
                  <div>
                    <dt className="text-sm text-gray-500">Capital</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('fr-FR').format(institutionData.capital.amount)} {institutionData.capital.currency}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
          {institutionData.branches && institutionData.branches.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Succursales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {institutionData.branches.map((branch, index) => (
                  <div key={index} className="p-3 border rounded-md border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {branch.street}<br />
                      {branch.city}, {branch.country}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {institutionData.primaryActivity && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Activités</h3>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                <span className="font-semibold">Principale:</span> {institutionData.primaryActivity}
              </p>
              
              {institutionData.secondaryActivities && institutionData.secondaryActivities.length > 0 && (
                <>
                  <p className="text-sm text-gray-500 mb-1">Secondaires:</p>
                  <ul className="list-disc list-inside text-sm text-gray-900 dark:text-white pl-2">
                    {institutionData.secondaryActivities.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}