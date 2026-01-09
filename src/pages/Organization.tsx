// src/pages/Organization.tsx
// Page de visualisation des informations de l'institution (VIEW ONLY)

import { Building2, MapPin, Phone, Mail, Globe, FileText, Shield, Calendar, CreditCard, Coins, Key, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/formatters';
import { useInstitutionApi } from '../hooks/useInstitutionApi';
import { OrganizationSkeleton } from '../components/ui/OrganizationSkeleton';

/**
 * Page Institution - Affichage en lecture seule des informations de l'institution
 * 
 * Cette page affiche les données de l'institution chargées via l'API /institutions/:id
 * L'institutionId est obtenu automatiquement depuis le contexte d'authentification
 */
export default function Organization() {
  // Charger les données de l'institution via l'API
  const { institution, loading, error, refetch } = useInstitutionApi();

  // DEBUG: Log à chaque render
  console.log('🏢 Organization page render:', {
    loading,
    error,
    hasInstitution: !!institution,
    institutionName: institution?.name,
    institutionId: institution?.id
  });

  // Affichage du chargement
  if (loading) {
    console.log('🏢 Organization: Affichage skeleton (loading=true)');
    return <OrganizationSkeleton />;
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <EmptyState
          icon={Building2}
          title="Erreur de chargement"
          description={error}
          action={{
            label: "Réessayer",
            onClick: () => refetch()
          }}
          size="lg"
        />
      </div>
    );
  }
  
  // Affichage si aucune institution n'est configurée
  if (!institution) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <EmptyState
          icon={Building2}
          title="Institution non disponible"
          description="Les informations de votre institution ne sont pas encore disponibles. Veuillez contacter l'administrateur."
          size="lg"
        />
      </div>
    );
  }

  // Extraire les métadonnées si présentes (format API réel)
  const metadata = institution.metadata as Record<string, string> | undefined;
  const sigle = metadata?.sigle;
  const typeInstitution = metadata?.typeInstitution;
  const denominationSociale = metadata?.denominationSociale;
  
  // Support des deux formats de date (snake_case et camelCase)
  const createdAt = institution.created_at || (institution as Record<string, unknown>).createdAt as string;
  const updatedAt = institution.updated_at || (institution as Record<string, unknown>).updatedAt as string;
  
  // Champs supplémentaires de l'API
  const inst = institution as Record<string, unknown>;
  const kiotaId = inst.kiotaId as string | undefined;
  const active = inst.active as boolean | undefined;
  const subscriptionPlan = inst.subscriptionPlan as string | null;
  const subscriptionStatus = inst.subscriptionStatus as string | null;
  const subscriptionEndDate = inst.subscriptionEndDate as string | null;
  const tokenBalance = inst.tokenBalance as number | undefined;
  const tokensUsed = inst.tokensUsed as number | undefined;

  return (
    <div className="space-y-6">
      <PageHeader />

      {/* Card principale */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* En-tête avec nom et badges */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <div className="flex gap-2 flex-wrap mb-2">
                <Badge variant={institution.status === 'active' ? 'success' : 'warning'}>
                  {institution.status === 'active' ? 'Active' : institution.status}
                </Badge>
                <Badge variant="info">
                  {typeInstitution || institution.type}
                </Badge>
                {sigle && (
                  <Badge variant="secondary">{sigle}</Badge>
                )}
                {active !== undefined && (
                  <Badge variant={active ? 'success' : 'danger'}>
                    {active ? 'Activée' : 'Désactivée'}
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {denominationSociale || institution.name}
              </h2>
              {denominationSociale && denominationSociale !== institution.name && (
                <p className="text-sm text-gray-500 mt-1">{institution.name}</p>
              )}
              <p className="text-xs text-gray-400 mt-1 font-mono">ID: {institution.id}</p>
            </div>
            
            {/* Dates */}
            <div className="text-sm text-gray-500 flex flex-col items-end gap-1">
              {createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Créée le {formatDate(createdAt)}
                </span>
              )}
              {updatedAt && (
                <span className="text-xs">
                  Mise à jour le {formatDate(updatedAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contenu principal en grille */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne gauche : Informations générales */}
            <InformationSection title="Informations générales" icon={Building2}>
              <InfoItem 
                icon={MapPin} 
                label="Adresse" 
                value={institution.address} 
              />
              <InfoItem 
                icon={Phone} 
                label="Téléphone" 
                value={institution.phone} 
              />
              <InfoItem 
                icon={Mail} 
                label="Email" 
                value={institution.email} 
              />
              <InfoItem 
                icon={Globe} 
                label="Site web" 
                value={institution.website}
                isLink
              />
              <InfoItem 
                label="Représentant légal" 
                value={institution.legal_representative} 
              />
              {kiotaId && (
                <InfoItem 
                  icon={Key}
                  label="Kiota ID" 
                  value={kiotaId} 
                />
              )}
            </InformationSection>

            {/* Colonne droite : Informations réglementaires */}
            <InformationSection title="Informations réglementaires" icon={Shield}>
              <InfoItem 
                label="N° de licence" 
                value={institution.license_number} 
              />
              <InfoItem 
                label="Type de licence" 
                value={institution.license_type} 
              />
              <InfoItem 
                label="N° Impôt" 
                value={institution.tax_id} 
              />
              <InfoItem 
                label="Statut réglementaire" 
                value={institution.regulatory_status}
                badge={institution.regulatory_status === 'approved' ? 'success' : 'warning'}
              />
            </InformationSection>
          </div>

          {/* Section Abonnement et Tokens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <InformationSection title="Abonnement" icon={CreditCard}>
              <InfoItem 
                label="Plan d'abonnement" 
                value={subscriptionPlan || 'Aucun'} 
              />
              <InfoItem 
                label="Statut abonnement" 
                value={subscriptionStatus || 'Non défini'}
                badge={subscriptionStatus === 'active' ? 'success' : 'warning'}
              />
              {subscriptionEndDate && (
                <InfoItem 
                  icon={Calendar}
                  label="Fin d'abonnement" 
                  value={formatDate(subscriptionEndDate)} 
                />
              )}
            </InformationSection>

            <InformationSection title="Tokens" icon={Coins}>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Solde de tokens</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tokenBalance ?? 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Tokens utilisés</p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    {tokensUsed ?? 0}
                  </p>
                </div>
              </div>
            </InformationSection>
          </div>

          {/* Section Documents */}
          <div className="mt-8">
            <InformationSection title="Documents" icon={FileText}>
              {institution.documents && institution.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {institution.documents.map((doc, index) => (
                    <DocumentCard key={doc.id || index} document={doc} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic mt-2">Aucun document disponible</p>
              )}
            </InformationSection>
          </div>

          {/* Section Métadonnées brutes (pour debug/admin) */}
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="mt-8">
              <InformationSection title="Métadonnées" icon={FileText}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {Object.entries(metadata).map(([key, value]) => (
                    <InfoItem key={key} label={key} value={String(value)} />
                  ))}
                </div>
              </InformationSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ Composants internes ============

function PageHeader() {
  return (
    <div className="flex items-center">
      <Building2 className="h-6 w-6 text-primary mr-2" />
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Informations de l'Institution
      </h1>
    </div>
  );
}

interface InformationSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function InformationSection({ title, icon: Icon, children }: InformationSectionProps) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      <dl className="space-y-3">
        {children}
      </dl>
    </div>
  );
}

interface InfoItemProps {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  isLink?: boolean;
  badge?: 'success' | 'warning' | 'info';
}

function InfoItem({ icon: Icon, label, value, isLink, badge }: InfoItemProps) {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />}
      <div className={Icon ? '' : 'ml-7'}>
        <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
          {badge ? (
            <Badge variant={badge}>{value}</Badge>
          ) : isLink ? (
            <a 
              href={value.startsWith('http') ? value : `https://${value}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
            >
              {value}
            </a>
          ) : (
            value
          )}
        </dd>
      </div>
    </div>
  );
}

interface DocumentCardProps {
  document: {
    id?: string;
    name: string;
    type: string;
    url?: string;
    status?: string;
  };
}

function DocumentCard({ document }: DocumentCardProps) {
  return (
    <div className="p-4 border rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
      <div className="flex items-start gap-3">
        <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {document.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {document.type}
          </p>
          {document.url && (
            <a 
              href={document.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline text-xs mt-2 inline-block"
            >
              Télécharger
            </a>
          )}
        </div>
        {document.status && (
          <Badge 
            variant={document.status === 'verified' ? 'success' : 'warning'} 
            className="flex-shrink-0"
          >
            {document.status}
          </Badge>
        )}
      </div>
    </div>
  );
}