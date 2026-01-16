// src/pages/Organization.tsx
// Page de visualisation des informations de l'institution (VIEW ONLY)

import { 
  Building2, MapPin, Phone, Mail, Globe, Shield, Calendar, 
  Target, Users, Briefcase, MapPinned, AlertCircle, Hash, FileText, CreditCard,
  Printer, Coins, Clock, CheckCircle, XCircle, Crown, RefreshCw
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/formatters';
import { useInstitutionApi } from '../hooks/useInstitutionApi';
import { OrganizationSkeleton } from '../components/ui/OrganizationSkeleton';

// Constante pour afficher quand une donnée est manquante
const NA = 'N/A';

/**
 * Page Institution - Affichage des informations pertinentes de l'institution
 * pour les gestionnaires de portefeuille de crédit
 */
export default function Organization() {
  const { institution, institutionProfile, loading, error, refetch } = useInstitutionApi();

  if (loading) {
    return <OrganizationSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageTitle />
        <EmptyState
          icon={Building2}
          title="Erreur de chargement"
          description={error}
          action={{ label: "Réessayer", onClick: () => refetch() }}
          size="lg"
        />
      </div>
    );
  }
  
  if (!institution) {
    return (
      <div className="space-y-6">
        <PageTitle />
        <EmptyState
          icon={Building2}
          title="Institution non disponible"
          description="Les informations de votre institution ne sont pas encore disponibles."
          size="lg"
        />
      </div>
    );
  }

  // Données du profil (priorité au profil API, fallback sur institution)
  const profile = institutionProfile;
  const denominationSociale = profile?.denominationSociale || institution.name;
  const typeInstitution = profile?.typeInstitution || institution.type;
  
  // Contact - priorité au profil
  const telephone = profile?.telephonePrincipal || institution.phone;
  const email = profile?.emailPrincipal || institution.email;
  const siteWeb = profile?.siteWeb || institution.website;
  const siegeSocial = profile?.siegeSocial || institution.address;
  
  // Réglementaire
  const numeroAgrement = profile?.numeroAgrement;
  const numeroNIF = profile?.numeroNIF;
  const regulatoryStatus = institution.regulatory_status;
  
  // Services et ciblage métier
  const servicesCredit = profile?.servicesCredit || [];
  const servicesPrioritaires = profile?.servicesPrioritaires || [];
  const segmentsClientele = profile?.segmentsClienteleCibles || [];
  const secteursActivite = profile?.secteursActivitePrivilegies || [];
  const zonesGeographiques = profile?.zonesGeographiquesPrioritaires || [];
  
  // Dates
  const createdAt = institution.created_at || institution.createdAt;

  // Déterminer le statut global
  const isActive = institution.status === 'active' && institution.active !== false;
  const isPendingVerification = institution.status === 'pending_verification' || regulatoryStatus === 'pending';

  return (
    <div className="space-y-6">
      <PageTitle />

      {/* Bannière de statut si en attente de vérification */}
      {isPendingVerification && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Vérification en cours
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Votre institution est en attente de vérification. Certaines fonctionnalités peuvent être limitées.
            </p>
          </div>
        </div>
      )}

      {/* Carte d'identification principale */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={isActive ? 'success' : 'warning'}>
                  {isActive ? 'Active' : formatStatus(institution.status)}
                </Badge>
                <Badge variant="secondary">
                  {formatInstitutionType(typeInstitution)}
                </Badge>
                {institution.active === false && (
                  <Badge variant="destructive">Inactive</Badge>
                )}
              </div>
              <CardTitle className="text-xl">{denominationSociale}</CardTitle>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">ID:</span>{' '}
                  <span className="font-mono">{institution.id || NA}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Kiota ID:</span>{' '}
                  <span className="font-mono">{institution.kiotaId || NA}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Créé: {createdAt ? formatDate(createdAt) : NA}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4" />
                <span>MAJ: {institution.updated_at ? formatDate(institution.updated_at) : NA}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <InfoItem icon={Phone} label="Téléphone" value={telephone} />
            <InfoItem icon={Mail} label="Email" value={email} />
            <InfoItem icon={Globe} label="Site web" value={siteWeb} isLink />
            <InfoItem icon={MapPin} label="Siège social" value={siegeSocial} />
            <InfoItem icon={Printer} label="Fax" value={institution.fax} />
          </div>
        </CardContent>
      </Card>

      {/* Informations réglementaires - toujours affichées */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-500" />
            <CardTitle>Informations réglementaires</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <InfoItem icon={FileText} label="N° Agrément" value={numeroAgrement} />
            <InfoItem icon={Hash} label="NIF" value={numeroNIF || institution.tax_id} />
            <InfoItem icon={CreditCard} label="N° Licence" value={institution.license_number} />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type de licence</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {institution.license_type || NA}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Statut réglementaire</p>
              {regulatoryStatus ? (
                <Badge variant={regulatoryStatus === 'approved' ? 'success' : 'warning'}>
                  {formatRegulatoryStatus(regulatoryStatus)}
                </Badge>
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500 italic">{NA}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID Fiscal (tax_id)</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {institution.tax_id || NA}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Représentant légal</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {institution.legal_representative || NA}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abonnement et Tokens */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gray-500" />
            <CardTitle>Abonnement & Tokens</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plan d'abonnement</p>
              {institution.subscriptionPlan ? (
                <Badge variant="secondary">{institution.subscriptionPlan}</Badge>
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500 italic">{NA}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Statut abonnement</p>
              {institution.subscriptionStatus ? (
                <Badge variant={institution.subscriptionStatus === 'active' ? 'success' : 'warning'}>
                  {formatSubscriptionStatus(institution.subscriptionStatus)}
                </Badge>
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500 italic">{NA}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fin d'abonnement</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {institution.subscriptionEndDate ? formatDate(institution.subscriptionEndDate) : NA}
              </p>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-gray-400" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Solde Tokens</p>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {institution.tokenBalance ?? 0}
              </p>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-gray-400" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Tokens utilisés</p>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {institution.tokensUsed ?? 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services et Ciblage métier - toujours affichés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Services de crédit */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-gray-500" />
              <CardTitle>Services de crédit</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <TagList items={[...new Set([...servicesPrioritaires, ...servicesCredit])]} emptyText="Aucun service de crédit défini" />
          </CardContent>
        </Card>

        {/* Segments clientèle */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <CardTitle>Segments clientèle cibles</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <TagList items={segmentsClientele} emptyText="Aucun segment clientèle défini" />
          </CardContent>
        </Card>

        {/* Secteurs d'activité */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-gray-500" />
              <CardTitle>Secteurs privilégiés</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <TagList items={secteursActivite} emptyText="Aucun secteur privilégié défini" />
          </CardContent>
        </Card>

        {/* Zones géographiques */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-gray-500" />
              <CardTitle>Zones géographiques</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <TagList items={zonesGeographiques} emptyText="Aucune zone géographique définie" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ Composants internes ============

function PageTitle() {
  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-6 w-6 text-primary" />
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Mon Institution
      </h1>
    </div>
  );
}

interface InfoItemProps {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  isLink?: boolean;
}

function InfoItem({ icon: Icon, label, value, isLink }: InfoItemProps) {
  const displayValue = value?.trim() || NA;
  const hasValue = !!value?.trim();
  
  return (
    <div className="flex items-start gap-2 min-w-0">
      {Icon && <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        {isLink && hasValue ? (
          <a 
            href={displayValue.startsWith('http') ? displayValue : `https://${displayValue}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-blue-600 hover:underline dark:text-blue-400 break-all"
          >
            {displayValue}
          </a>
        ) : hasValue ? (
          <p className="text-sm font-medium text-gray-900 dark:text-white break-words">{displayValue}</p>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500 italic">{NA}</span>
        )}
      </div>
    </div>
  );
}

interface TagListProps {
  items: string[];
  emptyText?: string;
}

function TagList({ items, emptyText = 'Non défini' }: TagListProps) {
  if (!items || items.length === 0) {
    return (
      <span className="text-sm text-gray-400 dark:text-gray-500 italic">{emptyText}</span>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <Badge key={index} variant="secondary" className="break-words max-w-full">{item}</Badge>
      ))}
    </div>
  );
}

// ============ Helpers ============

function formatInstitutionType(type: string | undefined): string {
  const types: Record<string, string> = {
    'bank': 'Banque',
    'microfinance': 'Microfinance',
    'cooperative': 'Coopérative',
    'sfd': 'SFD',
    'fintech': 'Fintech'
  };
  return types[type || ''] || type || 'Institution';
}

function formatStatus(status: string | undefined): string {
  const statuses: Record<string, string> = {
    'pending_verification': 'En attente',
    'active': 'Active',
    'suspended': 'Suspendue',
    'inactive': 'Inactive'
  };
  return statuses[status || ''] || status || 'Inconnu';
}

function formatRegulatoryStatus(status: string | undefined): string {
  const statuses: Record<string, string> = {
    'pending': 'En attente',
    'approved': 'Approuvé',
    'rejected': 'Rejeté',
    'suspended': 'Suspendu'
  };
  return statuses[status || ''] || status || 'Non défini';
}

function formatSubscriptionStatus(status: string | undefined): string {
  const statuses: Record<string, string> = {
    'active': 'Actif',
    'inactive': 'Inactif',
    'expired': 'Expiré',
    'pending': 'En attente',
    'cancelled': 'Annulé',
    'trial': 'Essai'
  };
  return statuses[status || ''] || status || 'Non défini';
}