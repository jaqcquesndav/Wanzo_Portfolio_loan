import { useState, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, Download, Copy, Check, Phone, Mail, Globe, Users, Building2, Shield, Briefcase,
  Building, Wrench, Car, Package, BarChart3, Settings, FileText, Landmark, Smartphone,
  Wallet, Rocket, Scale, MapPin, Factory, Store
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { useCompanyData } from '../hooks/useCompanyData';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../components/ui/DropdownMenu';
import type { Company, Asset, Stock, BankAccount, MobileMoneyAccount, Location, CompanyDocuments } from '../types/company';
import { exportToExcel, exportToPDF } from '../utils/export';
import { exportToCSV } from '../utils/exportToCSV';
import DirigeantTable from '../components/company/DirigeantTable';
import ActionnaireTable from '../components/company/ActionnaireTable';
import EmployeTable from '../components/company/EmployeTable';
import AssuranceTable from '../components/company/AssuranceTable';

function getCreditScoreStyles(score: number | null) {
  if (score == null || Number.isNaN(score)) {
    return {
      label: 'N/A',
      textClass: 'text-gray-600 dark:text-gray-300',
      badgeClass: 'bg-gray-100 dark:bg-gray-700',
      description: 'Score indisponible'
    };
  }

  if (score >= 80) {
    return {
      label: `${score}/100`,
      textClass: 'text-green-700 dark:text-green-300',
      badgeClass: 'bg-green-100 dark:bg-green-900/30',
      description: 'Risque faible'
    };
  }

  if (score >= 60) {
    return {
      label: `${score}/100`,
      textClass: 'text-blue-700 dark:text-blue-300',
      badgeClass: 'bg-blue-100 dark:bg-blue-900/30',
      description: 'Risque modéré'
    };
  }

  if (score >= 40) {
    return {
      label: `${score}/100`,
      textClass: 'text-yellow-700 dark:text-yellow-300',
      badgeClass: 'bg-yellow-100 dark:bg-yellow-900/30',
      description: 'Risque surveillé'
    };
  }

  return {
    label: `${score}/100`,
    textClass: 'text-red-700 dark:text-red-300',
    badgeClass: 'bg-red-100 dark:bg-red-900/30',
    description: 'Risque élevé'
  };
}

const DOCUMENT_CATEGORY_LABELS: Record<keyof CompanyDocuments, string> = {
  documentsEntreprise: 'Documents Entreprise',
  documentsPersonnel: 'Documents Personnel',
  documentsFinanciers: 'Documents Financiers',
  documentsPatrimoine: 'Documents Patrimoine et Équipements',
  documentsProprieteIntellectuelle: 'Documents Propriété Intellectuelle',
  documentsSectoriels: 'Documents Sectoriels'
};

type DocumentRow = {
  id: string;
  category: string;
  name: string;
  reference: string;
  url?: string;
};

const DOCUMENT_CATEGORY_KEYS = Object.keys(DOCUMENT_CATEGORY_LABELS) as (keyof CompanyDocuments)[];

function buildDocumentRows(documents?: CompanyDocuments): DocumentRow[] {
  if (!documents) {
    return [];
  }

  const rows: DocumentRow[] = [];

  DOCUMENT_CATEGORY_KEYS.forEach((key) => {
    const items = documents[key];
    if (!items || items.length === 0) {
      return;
    }

    items.forEach((raw, index) => {
      if (!raw) {
        return;
      }
      const value = String(raw).trim();
      if (!value) {
        return;
      }

      const isUrl = /^https?:\/\//i.test(value);
      const withoutQuery = value.split('?')[0];
      const segments = withoutQuery.split('/').filter(Boolean);
      const lastSegment = segments.length > 0 ? segments[segments.length - 1] : '';
      const decodedSegment = lastSegment ? decodeURIComponent(lastSegment) : '';
      const name = decodedSegment || value || `${DOCUMENT_CATEGORY_LABELS[key]} ${index + 1}`;

      rows.push({
        id: `${key}-${index}`,
        category: DOCUMENT_CATEGORY_LABELS[key],
        name,
        reference: value,
        url: isUrl ? value : undefined
      });
    });
  });

  return rows;
}

type ExportRow = {
  section: string;
  label: string;
  value: string;
};

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'profil-entreprise';
}

function formatDate(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('fr-FR');
}

function formatNumber(value?: number | null): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  return value.toLocaleString('fr-FR');
}

function joinValues(values?: (string | null | undefined)[], separator = ', '): string | undefined {
  if (!values || values.length === 0) {
    return undefined;
  }
  const filtered = values
    .map((item) => (item && typeof item === 'string' ? item.trim() : ''))
    .filter((item) => Boolean(item));
  return filtered.length > 0 ? filtered.join(separator) : undefined;
}

function buildExportRows(company: Company): ExportRow[] {
  const rows: ExportRow[] = [];
  const pushRow = (section: string, label: string, rawValue: string | number | undefined | null) => {
    if (rawValue === undefined || rawValue === null) {
      return;
    }
    const value = typeof rawValue === 'string' ? rawValue.trim() : String(rawValue);
    if (!value) {
      return;
    }
    rows.push({ section, label, value });
  };

  const identificationSection = 'Identification';
  pushRow(identificationSection, 'Raison sociale', company.name);
  pushRow(identificationSection, 'Sigle', company.sigle);
  pushRow(identificationSection, 'Secteur principal', company.sector);
  pushRow(identificationSection, "Type d'entreprise", company.typeEntreprise);
  pushRow(identificationSection, 'Taille', company.size);
  pushRow(identificationSection, 'Description des activités', company.descriptionActivites);
  pushRow(identificationSection, 'Produits / Services', joinValues(company.produitsServices));
  pushRow(identificationSection, 'Secteurs secondaires', joinValues(company.secteursActiviteSecondaires));
  pushRow(identificationSection, 'Secteurs personnalisés', joinValues(company.secteursPersonalises));

  const legalSection = 'Immatriculations';
  pushRow(legalSection, 'Forme juridique', company.legal_info?.legalForm);
  pushRow(legalSection, 'Numéro RCCM', company.legal_info?.rccm);
  pushRow(legalSection, "Numéro d'identification nationale", company.numeroIdentificationNationale);
  pushRow(legalSection, 'Numéro fiscal', company.legal_info?.taxId);
  pushRow(legalSection, 'Année de création', company.legal_info?.yearFounded);
  pushRow(legalSection, 'Date de création', formatDate(company.dateCreation));
  pushRow(legalSection, "Date de début d'activités", formatDate(company.dateDebutActivites));

  const financeSection = 'Finance';
  pushRow(financeSection, 'Capital social', company.capitalSocial ? `${formatNumber(company.capitalSocial)} ${company.deviseCapital || ''}`.trim() : undefined);
  pushRow(financeSection, 'Chiffre d’affaires annuel', formatNumber(company.financial_metrics?.annual_revenue));
  pushRow(financeSection, 'Marge bénéficiaire', company.financial_metrics?.profit_margin != null ? `${company.financial_metrics.profit_margin}%` : undefined);
  pushRow(financeSection, 'Score crédit', company.financial_metrics?.credit_score != null ? `${Math.round(company.financial_metrics.credit_score)}/100` : undefined);
  pushRow(financeSection, 'Notation financière', company.financial_metrics?.financial_rating);

  const contactSection = 'Contacts';
  pushRow(contactSection, 'Téléphone mobile', company.telephoneMobile || company.contact_info?.phone);
  pushRow(contactSection, 'Téléphone fixe', company.telephoneFixe);
  pushRow(contactSection, 'Email', company.contact_info?.email);
  pushRow(contactSection, 'Site web', company.website_url || company.contact_info?.website);
  pushRow(contactSection, 'Boîte postale', company.boitePostale);
  pushRow(contactSection, 'Adresse principale', company.contact_info?.address);
  pushRow(contactSection, 'Réseaux sociaux', company.reseauxSociaux && company.reseauxSociaux.length > 0
    ? company.reseauxSociaux.map((social) => `${social.platform}${social.label ? ` (${social.label})` : ''}: ${social.url}`).join(' | ')
    : undefined);

  const localisationSection = 'Localisation';
  if (company.siegeSocial) {
    pushRow(localisationSection, 'Siège social', [company.siegeSocial.address, company.siegeSocial.city, company.siegeSocial.country].filter(Boolean).join(', '));
  }
  if (company.siegeExploitation) {
    pushRow(localisationSection, "Siège d'exploitation", [company.siegeExploitation.address, company.siegeExploitation.city, company.siegeExploitation.country].filter(Boolean).join(', '));
  }
  pushRow(localisationSection, 'Autres localisations', company.locations && company.locations.length > 0
    ? company.locations.map((location) => `${location.address}, ${location.city}, ${location.country}`).join(' | ')
    : undefined);

  const gouvernanceSection = 'Gouvernance';
  pushRow(gouvernanceSection, 'Dirigeant principal', company.owner?.name);
  pushRow(gouvernanceSection, 'Dirigeant - Email', company.owner?.email);
  pushRow(gouvernanceSection, 'Dirigeant - Téléphone', company.owner?.phone);
  pushRow(gouvernanceSection, 'Personnes de contact', company.contactPersons && company.contactPersons.length > 0
    ? company.contactPersons.map((person) => {
        const nameParts = [person.prenoms, person.nom].filter(Boolean).join(' ');
        const contacts = [person.email, person.telephone].filter(Boolean).join(' / ');
        return [nameParts || person.role || 'Contact', person.fonction].filter(Boolean).join(' - ') + (contacts ? ` (${contacts})` : '');
      }).join(' | ')
    : undefined);

  const legalAspectsSection = 'Aspects juridiques';
  pushRow(legalAspectsSection, 'Faillite antérieure', company.legalAspects?.failliteAnterieure ? 'Oui' : company.legalAspects?.failliteAnterieure === false ? 'Non' : undefined);
  pushRow(legalAspectsSection, 'Détails faillite', company.legalAspects?.detailsFaillite);
  pushRow(legalAspectsSection, 'Poursuites judiciaires', company.legalAspects?.poursuiteJudiciaire ? 'Oui' : company.legalAspects?.poursuiteJudiciaire === false ? 'Non' : undefined);
  pushRow(legalAspectsSection, 'Détails poursuites', company.legalAspects?.detailsPoursuites);
  pushRow(legalAspectsSection, 'Garanties pour tiers', company.legalAspects?.garantiePrets ? 'Oui' : company.legalAspects?.garantiePrets === false ? 'Non' : undefined);
  pushRow(legalAspectsSection, 'Détails garanties', company.legalAspects?.detailsGaranties);
  pushRow(legalAspectsSection, 'Antécédents fiscaux', company.legalAspects?.antecedentsFiscaux ? 'Oui' : company.legalAspects?.antecedentsFiscaux === false ? 'Non' : undefined);
  pushRow(legalAspectsSection, 'Détails antécédents fiscaux', company.legalAspects?.detailsAntecedentsFiscaux);

  const pitchSection = 'Pitch / Présentation';
  pushRow(pitchSection, 'Elevator pitch', company.pitch?.elevator_pitch);
  pushRow(pitchSection, 'Proposition de valeur', company.pitch?.value_proposition);
  pushRow(pitchSection, 'Marché cible', company.pitch?.target_market);
  pushRow(pitchSection, 'Avantage concurrentiel', company.pitch?.competitive_advantage);
  pushRow(pitchSection, 'Pitch deck', company.pitch?.pitch_deck_url || company.pitch_deck_url);
  pushRow(pitchSection, 'Vidéo démo', company.pitch?.demo_video_url);

  if (rows.length === 0) {
    rows.push({ section: 'Informations', label: 'Profil', value: 'Aucune donnée disponible' });
  }

  return rows;
}

/**
 * Page de consultation complète d'une entreprise (lecture seule)
 * Affiche les données organisées en 6 onglets: Général, Patrimoine, Structure, Finance, Localisation, Pitch
 * Miroir de la structure EnterpriseIdentificationForm pour l'édition
 */
export default function CompanyViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('general');

  const state = (location.state as { company?: Company } | null) || null;
  const passedCompany = state?.company;
  const { company, loading, error } = useCompanyData(id, passedCompany ?? null);

  // États de chargement
  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">Chargement des informations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Entreprise non trouvée</h2>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const primaryPhone = company.telephoneMobile || company.contact_info?.phone || company.telephoneFixe || null;
  const primaryEmail = company.contact_info?.email || null;
  const facebookLink = company.reseauxSociaux?.find(
    (social) => social.platform?.toLowerCase().includes('facebook')
  )?.url;
  const websiteUrl = company.website_url || company.contact_info?.website || facebookLink || null;
  const rawCreditScore = typeof company.financial_metrics?.credit_score === 'number'
    ? Math.round(company.financial_metrics.credit_score)
    : null;
  const creditScore = rawCreditScore == null ? null : Math.max(0, Math.min(100, rawCreditScore));
  const creditScoreStyles = getCreditScoreStyles(creditScore);
  const exportRows = useMemo(() => buildExportRows(company), [company]);
  const exportBaseName = useMemo(() => slugify(company.name || 'profil-entreprise'), [company.name]);

  const handleExport = useCallback((format: 'excel' | 'csv' | 'pdf') => {
    const rows = exportRows.length > 0 ? exportRows : [{ section: 'Informations', label: 'Profil', value: 'Aucune donnée disponible' }];
    const tabularData = rows.map((row) => ({
      Section: row.section,
      Champ: row.label,
      Valeur: row.value,
    }));
    const filename = `${exportBaseName}-profil`;

    if (format === 'excel') {
      exportToExcel(tabularData, filename);
      return;
    }

    if (format === 'csv') {
      exportToCSV(tabularData, `${filename}.csv`);
      return;
    }

    exportToPDF({
      title: `Profil entreprise - ${company.name}`,
      headers: ['Section', 'Champ', 'Valeur'],
      data: rows.map((row) => [row.section, row.label, row.value]),
      filename,
    });
  }, [company.name, exportBaseName, exportRows]);

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Logo de l'entreprise */}
              <div className="flex-shrink-0">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={`Logo ${company.name}`}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700 bg-white"
                  />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                    <Building2 className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>
              
              {/* Informations principales */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  {company.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{company.sector || 'N/A'}</p>
                {company.size && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Taille: {company.size}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exporter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      handleExport('excel');
                    }}
                  >
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      handleExport('csv');
                    }}
                  >
                    CSV (.csv)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      handleExport('pdf');
                    }}
                  >
                    PDF (.pdf)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Status */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant={company.status === 'active' ? 'success' : 'warning'}>
              {company.status === 'active' ? 'Actif' : company.status}
            </Badge>
          </div>

          {/* Score crédit & contacts */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Score crédit</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${creditScoreStyles.badgeClass} ${creditScoreStyles.textClass}`}>
                    {creditScoreStyles.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{creditScoreStyles.description}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary-600" />
              <span>{primaryPhone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary-600" />
              <span>{primaryEmail || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary-600" />
              {websiteUrl ? (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  {websiteUrl}
                </a>
              ) : (
                <span>N/A</span>
              )}
            </div>
          </div>
        </div>

        {/* TABS SECTION */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 h-auto p-2 bg-gray-100">
            <TabsTrigger value="general" currentValue={activeTab} onValueChange={setActiveTab}>Général</TabsTrigger>
            <TabsTrigger value="patrimoine" currentValue={activeTab} onValueChange={setActiveTab}>Patrimoine</TabsTrigger>
            <TabsTrigger value="structure" currentValue={activeTab} onValueChange={setActiveTab}>Structure</TabsTrigger>
            <TabsTrigger value="financier" currentValue={activeTab} onValueChange={setActiveTab}>Finance</TabsTrigger>
            <TabsTrigger value="localisation" currentValue={activeTab} onValueChange={setActiveTab}>Localisation</TabsTrigger>
            <TabsTrigger value="presentation" currentValue={activeTab} onValueChange={setActiveTab}>Pitch</TabsTrigger>
            <TabsTrigger value="documents" currentValue={activeTab} onValueChange={setActiveTab}>Documents</TabsTrigger>
          </TabsList>

          {/* ONGLET: GÉNÉRAL */}
          <TabsContent value="general" currentValue={activeTab} className="space-y-6">
            {/* Identification de base */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Identification de base
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ViewField label="Raison sociale" value={company.name} />
                <ViewField label="Sigle" value={company.sigle} />
                <ViewField label="Secteur principal" value={company.sector} />
                <ViewField label="Type d'entreprise" value={company.typeEntreprise} />
                <ViewField label="Taille" value={company.size} />
                <ViewField label="Capital social" value={company.capitalSocial ? `${company.capitalSocial.toLocaleString()} ${company.deviseCapital || 'USD'}` : undefined} />
                <ViewField label="Date de création" value={company.dateCreation || company.legal_info?.yearFounded?.toString()} />
              </div>
            </section>

            {/* Immatriculations */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Immatriculations et identifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ViewField label="Numéro RCCM" value={company.legal_info?.rccm} copyable />
                <ViewField label="Numéro d'identification nationale" value={company.numeroIdentificationNationale} copyable />
                <ViewField label="Numéro d'impôt fiscal" value={company.legal_info?.taxId} copyable />
                <ViewField label="Forme juridique OHADA" value={company.legal_info?.legalForm} />
              </div>
            </section>

            {/* Nature des activités */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Nature des activités
              </h2>
              <div className="space-y-4">
                <ViewField label="Description détaillée" value={company.descriptionActivites} />
                {company.secteursActiviteSecondaires && company.secteursActiviteSecondaires.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Secteurs secondaires</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {company.secteursActiviteSecondaires.map((secteur, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded text-sm">
                          {secteur}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {company.produitsServices && company.produitsServices.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Produits/Services offerts</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {company.produitsServices.map((produit, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm">
                          {produit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Incubation/Accélération */}
            {company.incubation && (
              <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Incubation / Accélération
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ViewField label="En incubation/accélération" value={company.incubation.enIncubation ? 'Oui' : 'Non'} />
                  {company.incubation.enIncubation && (
                    <>
                      <ViewField label="Type d'accompagnement" value={company.incubation.typeAccompagnement} />
                      <ViewField label="Nom de l'incubateur/accélérateur" value={company.incubation.nomIncubateur} />
                      <ViewField label="Certificat d'affiliation" value={company.incubation.certificatAffiliation} isLink />
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Spécificités Startup */}
            {company.typeEntreprise === 'startup' && company.startupSpecifics && (
              <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-6">
                <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-6">
                  Spécificités Startup
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ViewField label="Niveau de maturité technologique (TRL)" value={company.startupSpecifics.niveauMaturiteTechnologique} />
                  <ViewField label="Modèle économique" value={company.startupSpecifics.modeleEconomique} />
                </div>
                {company.startupSpecifics.proprieteIntellectuelle && company.startupSpecifics.proprieteIntellectuelle.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Propriété intellectuelle</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {company.startupSpecifics.proprieteIntellectuelle.map((pi, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300 rounded text-sm">
                          {pi}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Spécificités Traditional */}
            {company.typeEntreprise === 'traditional' && company.traditionalSpecifics && (
              <section className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 p-6">
                <h2 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-6">
                  Spécificités Entreprise Traditionnelle
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ViewField label="Certification qualité" value={company.traditionalSpecifics.certificationQualite ? 'Oui' : 'Non'} />
                </div>
                {company.traditionalSpecifics.licencesExploitation && company.traditionalSpecifics.licencesExploitation.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Licences d'exploitation</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {company.traditionalSpecifics.licencesExploitation.map((licence, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 rounded text-sm">
                          {licence}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </TabsContent>

          {/* ONGLET: PATRIMOINE */}
          <TabsContent value="patrimoine" currentValue={activeTab} className="space-y-6">
            {/* Immobilisations (bâtiments, terrains) */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Immobilisations (Bâtiments, Terrains)
              </h2>
              {company.immobilisations && company.immobilisations.length > 0 ? (
                <AssetsTable assets={company.immobilisations} showCategory={false} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucune immobilisation enregistrée (0)</p>
              )}
            </section>

            {/* Équipements */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-600" />
                Équipements et Machines
              </h2>
              {company.equipements && company.equipements.length > 0 ? (
                <AssetsTable assets={company.equipements} showCategory={false} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucun équipement enregistré (0)</p>
              )}
            </section>

            {/* Véhicules */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Car className="w-5 h-5 text-purple-600" />
                Véhicules
              </h2>
              {company.vehicules && company.vehicules.length > 0 ? (
                <AssetsTable assets={company.vehicules} showCategory={false} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucun véhicule enregistré (0)</p>
              )}
            </section>

            {/* Tous les actifs (si pas de séparation par catégorie) */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Autres actifs
              </h2>
              {company.assets && company.assets.length > 0 ? (
                <AssetsTable assets={company.assets} showCategory={true} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucun autre actif enregistré (0)</p>
              )}
            </section>

            {/* Stocks */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                Stocks et inventaire
              </h2>
              {company.stocks && company.stocks.length > 0 ? (
                <StocksTable stocks={company.stocks} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucun stock enregistré (0)</p>
              )}
            </section>

            {/* Moyens techniques et capacités */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Moyens techniques et capacités
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    Moyens techniques et technologiques
                  </label>
                  {company.moyensTechniques && company.moyensTechniques.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {company.moyensTechniques.map((moyen, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded text-sm">
                          {moyen}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">N/A</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    Capacité de production
                  </label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {company.capaciteProduction || 'N/A'}
                  </p>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* ONGLET: STRUCTURE */}
          <TabsContent value="structure" currentValue={activeTab} className="space-y-6">
            {/* Structure organisationnelle */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" />
                Structure organisationnelle
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ViewField label="Nombre total d'employés" value={company.employee_count?.toString()} />
                  <ViewField label="Taille de l'entreprise" value={company.size} />
                  <ViewField label="Capital social" value={company.capitalSocial ? `${company.capitalSocial.toLocaleString()} ${company.deviseCapital || 'USD'}` : undefined} />
                  <ViewField label="Forme juridique" value={company.legal_info?.legalForm} />
                </div>
                
                {company.organigramme && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                      Description de l'organigramme
                    </label>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-4 rounded">
                      {company.organigramme}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Dirigeants */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Dirigeants
              </h2>
              {company.dirigeants && company.dirigeants.length > 0 ? (
                <DirigeantTable dirigeants={company.dirigeants} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">Aucun dirigeant enregistré</p>
              )}
            </section>

            {/* Actionnariat */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Actionnariat
              </h2>
              {company.actionnaires && company.actionnaires.length > 0 ? (
                <ActionnaireTable actionnaires={company.actionnaires} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">Aucun actionnaire enregistré</p>
              )}
            </section>

            {/* Employés */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Employés
              </h2>
              {company.employes && company.employes.length > 0 ? (
                <EmployeTable employes={company.employes} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">Aucun employé enregistré</p>
              )}
            </section>
          </TabsContent>

          {/* ONGLET: FINANCE & JURIDIQUE */}
          <TabsContent value="financier" currentValue={activeTab} className="space-y-6">
            {/* Métriques financières clés */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Métriques financières
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400">Chiffre d'affaires</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-200 mt-1">
                    {company.financial_metrics?.annual_revenue ? `${company.financial_metrics.annual_revenue.toLocaleString()} USD` : 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs uppercase tracking-wide text-green-600 dark:text-green-400">Marge bénéficiaire</p>
                  <p className="text-xl font-bold text-green-900 dark:text-green-200 mt-1">
                    {company.financial_metrics?.profit_margin != null ? `${company.financial_metrics.profit_margin}%` : 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs uppercase tracking-wide text-purple-600 dark:text-purple-400">Cash flow</p>
                  <p className="text-xl font-bold text-purple-900 dark:text-purple-200 mt-1">
                    {company.financial_metrics?.cash_flow ? `${company.financial_metrics.cash_flow.toLocaleString()} USD` : 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-xs uppercase tracking-wide text-orange-600 dark:text-orange-400">Ratio d'endettement</p>
                  <p className="text-xl font-bold text-orange-900 dark:text-orange-200 mt-1">
                    {company.financial_metrics?.debt_ratio != null ? `${company.financial_metrics.debt_ratio}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </section>

            {/* Informations juridiques */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Informations juridiques
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ViewField label="Forme juridique" value={company.legal_info?.legalForm || 'N/A'} />
                <ViewField label="RCCM" value={company.legal_info?.rccm || 'N/A'} copyable />
                <ViewField label="Numéro fiscal" value={company.legal_info?.taxId || 'N/A'} copyable />
                <ViewField label="Année de création" value={company.legal_info?.yearFounded?.toString() || 'N/A'} />
              </div>
            </section>

            {/* Comptes bancaires */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-green-600" />
                Comptes bancaires
              </h2>
              {company.payment_info?.bankAccounts && company.payment_info.bankAccounts.length > 0 ? (
                <BankAccountsTable accounts={company.payment_info.bankAccounts} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucun compte bancaire enregistré (0)</p>
              )}
            </section>

            {/* Comptes Mobile Money */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-600" />
                Comptes Mobile Money
              </h2>
              {company.payment_info?.mobileMoneyAccounts && company.payment_info.mobileMoneyAccounts.length > 0 ? (
                <MobileMoneyTable accounts={company.payment_info.mobileMoneyAccounts} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucun compte Mobile Money enregistré (0)</p>
              )}
            </section>

            {/* Assurances */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Assurances
              </h2>
              {company.payment_info?.assurances && company.payment_info.assurances.length > 0 ? (
                <AssuranceTable assurances={company.payment_info.assurances} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucune assurance enregistrée (0)</p>
              )}
            </section>

            {/* Prêts en cours */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-red-600" />
                Concours financiers et prêts en cours
              </h2>
              {company.pretsEnCours && company.pretsEnCours.length > 0 ? (
                <LoansTable loans={company.pretsEnCours} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucun prêt en cours (0)</p>
              )}
            </section>

            {/* Levées de fonds */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-violet-600" />
                Levées de fonds
                {company.typeEntreprise !== 'startup' && (
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Startups uniquement)</span>
                )}
              </h2>
              {company.typeEntreprise === 'startup' ? (
                company.leveeDeFonds && company.leveeDeFonds.length > 0 ? (
                  <FundingRoundsTable rounds={company.leveeDeFonds} />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Aucune levée de fonds enregistrée (0)</p>
                )
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Cette section s'applique uniquement aux startups</p>
              )}
            </section>

            {/* Aspects juridiques et réglementaires */}
            <section className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700 p-6">
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-6 flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Aspects juridiques et réglementaires
              </h2>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded p-4">
                  <ViewField label="Faillite ou insolvabilité antérieure" value={company.legalAspects?.failliteAnterieure ? 'Oui' : company.legalAspects?.failliteAnterieure === false ? 'Non' : 'N/A'} />
                  {company.legalAspects?.failliteAnterieure && company.legalAspects.detailsFaillite && (
                    <div className="mt-2 pl-4 border-l-2 border-red-300">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{company.legalAspects.detailsFaillite}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded p-4">
                  <ViewField label="Poursuites judiciaires en cours" value={company.legalAspects?.poursuiteJudiciaire ? 'Oui' : company.legalAspects?.poursuiteJudiciaire === false ? 'Non' : 'N/A'} />
                  {company.legalAspects?.poursuiteJudiciaire && company.legalAspects.detailsPoursuites && (
                    <div className="mt-2 pl-4 border-l-2 border-red-300">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{company.legalAspects.detailsPoursuites}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded p-4">
                  <ViewField label="Garant de prêts pour tiers" value={company.legalAspects?.garantiePrets ? 'Oui' : company.legalAspects?.garantiePrets === false ? 'Non' : 'N/A'} />
                  {company.legalAspects?.garantiePrets && company.legalAspects.detailsGaranties && (
                    <div className="mt-2 pl-4 border-l-2 border-red-300">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{company.legalAspects.detailsGaranties}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded p-4">
                  <ViewField label="Antécédents avec l'administration fiscale" value={company.legalAspects?.antecedentsFiscaux ? 'Oui' : company.legalAspects?.antecedentsFiscaux === false ? 'Non' : 'N/A'} />
                  {company.legalAspects?.antecedentsFiscaux && company.legalAspects.detailsAntecedentsFiscaux && (
                    <div className="mt-2 pl-4 border-l-2 border-red-300">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{company.legalAspects.detailsAntecedentsFiscaux}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

          </TabsContent>

          {/* ONGLET: LOCALISATION */}
          <TabsContent value="localisation" currentValue={activeTab} className="space-y-6">
            {/* Sièges et localisations */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Sièges et implantations
              </h2>
              <div className="space-y-6">
                {/* Siège social */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Siège social
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {company.siegeSocial 
                      ? `${company.siegeSocial.address || 'N/A'}, ${company.siegeSocial.city || 'N/A'}, ${company.siegeSocial.country || 'N/A'}`
                      : 'N/A'}
                  </p>
                </div>
                
                {/* Siège d'exploitation */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-green-600" />
                    Siège d'exploitation
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {company.siegeExploitation 
                      ? `${company.siegeExploitation.address || 'N/A'}, ${company.siegeExploitation.city || 'N/A'}, ${company.siegeExploitation.country || 'N/A'}`
                      : 'N/A'}
                  </p>
                </div>
                
                {/* Coordonnées GPS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ViewField label="Latitude" value={company.latitude?.toString() || 'N/A'} />
                  <ViewField label="Longitude" value={company.longitude?.toString() || 'N/A'} />
                </div>
                
                {/* Autres localisations */}
                {company.locations && company.locations.length > 0 && (
                  <LocationsTable locations={company.locations} />
                )}
              </div>
            </section>

            {/* Unités de production */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Factory className="w-5 h-5 text-amber-600" />
                Unités de production
              </h2>
              {company.unitesProduction && company.unitesProduction.length > 0 ? (
                <div className="space-y-2">
                  {company.unitesProduction.map((unite, idx) => (
                    <div key={idx} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded text-sm">
                      {unite.address}, {unite.city}, {unite.country}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucune unité de production enregistrée (0)</p>
              )}
            </section>

            {/* Points de vente */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-600" />
                Points de vente
              </h2>
              {company.pointsVente && company.pointsVente.length > 0 ? (
                <div className="space-y-2">
                  {company.pointsVente.map((point, idx) => (
                    <div key={idx} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded text-sm">
                      {point.address}, {point.city}, {point.country}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucun point de vente enregistré (0)</p>
              )}
            </section>

            {/* Coordonnées de contact détaillées */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                Informations de contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ViewField label="Téléphone fixe" value={company.telephoneFixe || 'N/A'} copyable />
                <ViewField label="Téléphone mobile" value={company.telephoneMobile || 'N/A'} copyable />
                <ViewField label="Fax" value={company.fax || 'N/A'} copyable />
                <ViewField label="Email" value={company.contact_info?.email || 'N/A'} copyable />
                <ViewField label="Boîte postale" value={company.boitePostale || 'N/A'} />
                <ViewField label="Adresse" value={company.contact_info?.address || 'N/A'} />
              </div>
            </section>

            {/* Présence numérique et réseaux sociaux */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-600" />
                Présence numérique
              </h2>
              <div className="space-y-4">
                <ViewField label="Site web" value={company.website_url || company.contact_info?.website || 'N/A'} copyable isLink />
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-3">Réseaux sociaux</label>
                  {company.reseauxSociaux && company.reseauxSociaux.length > 0 ? (
                    <div className="space-y-2">
                      {company.reseauxSociaux.map((social, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{social.platform}</span>
                            {social.label && <span className="text-gray-600 dark:text-gray-400 ml-2">- {social.label}</span>}
                          </div>
                          <a 
                            href={social.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 underline text-sm"
                          >
                            Visiter →
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">Aucun réseau social enregistré (0)</p>
                  )}
                </div>
              </div>
            </section>
          </TabsContent>

          {/* ONGLET: PITCH & PRÉSENTATION */}
          <TabsContent value="presentation" currentValue={activeTab} className="space-y-6">
            {/* Pitch complet */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Pitch et proposition de valeur
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Elevator Pitch (30s)</label>
                  <p className="text-gray-900 dark:text-white mt-2 whitespace-pre-wrap">
                    {company.pitch?.elevator_pitch || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Proposition de valeur</label>
                  <p className="text-gray-900 dark:text-white mt-2 whitespace-pre-wrap">
                    {company.pitch?.value_proposition || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Marché cible</label>
                  <p className="text-gray-900 dark:text-white mt-2 whitespace-pre-wrap">
                    {company.pitch?.target_market || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Avantage concurrentiel</label>
                  <p className="text-gray-900 dark:text-white mt-2 whitespace-pre-wrap">
                    {company.pitch?.competitive_advantage || 'N/A'}
                  </p>
                </div>
              </div>
            </section>

            {/* Documents de présentation */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Documents de présentation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Pitch Deck</label>
                  {(company.pitch?.pitch_deck_url || company.pitch_deck_url) ? (
                    <a 
                      href={company.pitch?.pitch_deck_url || company.pitch_deck_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 underline mt-1 block"
                    >
                      Voir le pitch deck →
                    </a>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 mt-1">N/A</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Vidéo démo</label>
                  {company.pitch?.demo_video_url ? (
                    <a 
                      href={company.pitch.demo_video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 underline mt-1 block"
                    >
                      Voir la vidéo →
                    </a>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 mt-1">N/A</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Site web</label>
                  {(company.website_url || company.contact_info?.website) ? (
                    <a 
                      href={company.website_url || company.contact_info?.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 underline mt-1 block"
                    >
                      Visiter le site →
                    </a>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 mt-1">N/A</p>
                  )}
                </div>
              </div>
            </section>

          </TabsContent>

          {/* ONGLET: DOCUMENTS */}
          <TabsContent value="documents" currentValue={activeTab} className="space-y-6">
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Documents
              </h2>
              <DocumentsTable documents={company.documents} />
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANTS D'AFFICHAGE (READ-ONLY)
// ============================================================================

/**
 * Composant pour afficher un champ en lecture seule
 */
function ViewField({
  label,
  value,
  copyable = false,
  isLink = false
}: {
  label: string;
  value?: string | number | null;
  copyable?: boolean;
  isLink?: boolean;
}): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!value) {
    return (
      <div>
        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</label>
        <p className="text-gray-400 dark:text-gray-500 italic mt-1">N/A</p>
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</label>
      <div className="flex items-center justify-between mt-1">
        {isLink && typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')) ? (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 underline font-medium break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-gray-900 dark:text-white font-medium break-all">{value}</p>
        )}
        {copyable && (
          <button
            onClick={() => handleCopy(String(value))}
            className="ml-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
            title="Copier"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Tableau des immobilisations/actifs - avec affichage détaillé
 */
function AssetsTable({ assets, showCategory = true }: { assets: Asset[]; showCategory?: boolean }): JSX.Element {
  // Labels pour les types d'actifs
  const typeLabels: Record<string, string> = {
    'immobilier': 'Immobilier',
    'vehicule': 'Véhicule',
    'equipement': 'Équipement',
    'stock': 'Stock',
    'autre': 'Autre'
  };

  // Labels pour les états
  const conditionLabels: Record<string, string> = {
    'neuf': 'Neuf',
    'excellent': 'Excellent',
    'bon': 'Bon',
    'moyen': 'Moyen',
    'mauvais': 'Mauvais',
    'deteriore': 'Détérioré'
  };

  // Labels pour la propriété
  const ownershipLabels: Record<string, string> = {
    'propre': 'Propriété',
    'location': 'Location',
    'leasing': 'Leasing',
    'emprunt': 'Emprunt'
  };

  // Couleurs pour les états
  const conditionColors: Record<string, string> = {
    'neuf': 'bg-green-100 text-green-800',
    'excellent': 'bg-emerald-100 text-emerald-800',
    'bon': 'bg-blue-100 text-blue-800',
    'moyen': 'bg-yellow-100 text-yellow-800',
    'mauvais': 'bg-orange-100 text-orange-800',
    'deteriore': 'bg-red-100 text-red-800'
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Désignation</th>
            {showCategory && (
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Type</th>
            )}
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Marque/Modèle</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Prix d'achat</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Valeur actuelle</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">État</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Propriété</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Localisation</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, idx) => (
            <tr key={asset.id || idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-300">{asset.designation || 'N/A'}</p>
                  {asset.numeroSerie && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">N° série: {asset.numeroSerie}</p>
                  )}
                  {asset.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={asset.description}>
                      {asset.description}
                    </p>
                  )}
                </div>
              </td>
              {showCategory && (
                <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                  {asset.type ? typeLabels[asset.type] || asset.type : 'N/A'}
                </td>
              )}
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                {asset.marque || asset.modele ? (
                  <span>{[asset.marque, asset.modele].filter(Boolean).join(' ')}</span>
                ) : (
                  'N/A'
                )}
              </td>
              <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-300">
                {asset.prixAchat ? `${asset.prixAchat.toLocaleString()} ${asset.devise || 'USD'}` : 'N/A'}
              </td>
              <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-300">
                {asset.valeurActuelle ? `${asset.valeurActuelle.toLocaleString()} ${asset.devise || 'USD'}` : 'N/A'}
              </td>
              <td className="px-4 py-3">
                {asset.etatActuel ? (
                  <span className={`px-2 py-1 rounded-full text-xs ${conditionColors[asset.etatActuel] || 'bg-gray-100 text-gray-800'}`}>
                    {conditionLabels[asset.etatActuel] || asset.etatActuel}
                  </span>
                ) : (
                  'N/A'
                )}
              </td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                {asset.proprietaire ? ownershipLabels[asset.proprietaire] || asset.proprietaire : 'N/A'}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                {asset.localisation || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Résumé de la valeur totale */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Total: {assets.length} actif{assets.length > 1 ? 's' : ''}
        </span>
        <span className="font-semibold text-gray-900 dark:text-white">
          Valeur totale: {assets.reduce((sum, a) => sum + (a.valeurActuelle || 0), 0).toLocaleString()} USD
        </span>
      </div>
    </div>
  );
}

/**
 * Tableau des stocks - avec affichage détaillé
 */
function StocksTable({ stocks }: { stocks: Stock[] }): JSX.Element {
  // Labels pour les catégories
  const categoryLabels: Record<string, string> = {
    'matiere_premiere': 'Matière première',
    'produit_semi_fini': 'Produit semi-fini',
    'produit_fini': 'Produit fini',
    'fourniture': 'Fourniture',
    'emballage': 'Emballage',
    'autre': 'Autre'
  };

  // Labels pour les états
  const conditionLabels: Record<string, string> = {
    'excellent': 'Excellent',
    'bon': 'Bon',
    'moyen': 'Moyen',
    'deteriore': 'Détérioré',
    'perime': 'Périmé'
  };

  // Couleurs pour les états
  const conditionColors: Record<string, string> = {
    'excellent': 'bg-green-100 text-green-800',
    'bon': 'bg-blue-100 text-blue-800',
    'moyen': 'bg-yellow-100 text-yellow-800',
    'deteriore': 'bg-orange-100 text-orange-800',
    'perime': 'bg-red-100 text-red-800'
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Désignation</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Catégorie</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Quantité</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Coût unitaire</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Valeur totale</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">État</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Emplacement</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock, idx) => {
            // Vérifier si stock est sous le seuil minimum
            const isLowStock = stock.seuilMinimum && stock.quantiteStock && stock.quantiteStock < stock.seuilMinimum;
            
            return (
              <tr key={stock.id || idx} className={`border-b hover:bg-gray-50 dark:hover:bg-gray-700 ${isLowStock ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-300">{stock.designation || 'N/A'}</p>
                    {stock.codeArticle && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Code: {stock.codeArticle}</p>
                    )}
                    {stock.fournisseurPrincipal && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Fournisseur: {stock.fournisseurPrincipal}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                  {stock.categorie ? categoryLabels[stock.categorie] || stock.categorie : 'N/A'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div>
                    <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900 dark:text-gray-300'}`}>
                      {stock.quantiteStock?.toLocaleString() || 'N/A'} {stock.unite || ''}
                    </span>
                    {stock.seuilMinimum && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Min: {stock.seuilMinimum}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-300">
                  {stock.coutUnitaire ? `${stock.coutUnitaire.toLocaleString()} ${stock.devise || 'USD'}` : 'N/A'}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-300">
                  {stock.valeurTotaleStock ? `${stock.valeurTotaleStock.toLocaleString()} ${stock.devise || 'USD'}` : 'N/A'}
                </td>
                <td className="px-4 py-3">
                  {stock.etatStock ? (
                    <span className={`px-2 py-1 rounded-full text-xs ${conditionColors[stock.etatStock] || 'bg-gray-100 text-gray-800'}`}>
                      {conditionLabels[stock.etatStock] || stock.etatStock}
                    </span>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                  {stock.emplacement || 'N/A'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Résumé */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Total: {stocks.length} type{stocks.length > 1 ? 's' : ''} de stock
        </span>
        <span className="font-semibold text-gray-900 dark:text-white">
          Valeur totale: {stocks.reduce((sum, s) => sum + (s.valeurTotaleStock || 0), 0).toLocaleString()} USD
        </span>
      </div>
    </div>
  );
}

/**
 * Tableau des comptes bancaires - avec affichage détaillé
 */
function BankAccountsTable({ accounts }: { accounts: BankAccount[] }): JSX.Element {
  // Labels pour les types de compte
  const typeLabels: Record<string, string> = {
    'courant': 'Courant',
    'epargne': 'Épargne',
    'professionnel': 'Professionnel',
    'devise': 'Devise'
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Titulaire</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Banque</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Numéro de compte</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">SWIFT/IBAN</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Devise</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Principal</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account, idx) => (
            <tr key={account.id || idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-medium">{account.accountName || 'N/A'}</td>
              <td className="px-4 py-3">
                <div>
                  <p className="text-gray-900 dark:text-gray-300">{account.bankName || 'N/A'}</p>
                  {account.agence && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Agence: {account.agence}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                {account.typeCompte ? typeLabels[account.typeCompte] || account.typeCompte : 'Courant'}
              </td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-mono text-xs">{account.accountNumber || 'N/A'}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                {account.swiftCode || account.iban || 'N/A'}
              </td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{account.currency || 'USD'}</td>
              <td className="px-4 py-3 text-center">
                {account.isPrimary && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">✓</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Tableau des comptes Mobile Money
 */
function MobileMoneyTable({ accounts }: { accounts: MobileMoneyAccount[] }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Titulaire</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Numéro de téléphone</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Opérateur</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Devise</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{account.accountName || 'N/A'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-mono">{account.phoneNumber || 'N/A'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{account.provider || 'N/A'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{account.currency || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Tableau des localisations
 */
function LocationsTable({ locations }: { locations: Location[] }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Adresse</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Ville</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Pays</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Type</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{location.address || 'N/A'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{location.city || 'N/A'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{location.country || 'N/A'}</td>
              <td className="px-4 py-3">
                {location.isPrimary && <Badge variant="success">Principal</Badge>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Tableau des prêts en cours
 */
function LoansTable({ loans }: { loans: any[] }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Prêteur</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Montant</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Taux</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Début</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Fin</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Statut</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan, idx) => (
            <tr key={loan.id || idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{loan.type || 'N/A'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{loan.lender || 'N/A'}</td>
              <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-300">
                {loan.amount ? `${loan.amount.toLocaleString()} ${loan.currency || ''}` : 'N/A'}
              </td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                {loan.interestRate ? `${loan.interestRate}%` : 'N/A'}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                {loan.startDate ? new Date(loan.startDate).toLocaleDateString() : 'N/A'}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                {loan.endDate ? new Date(loan.endDate).toLocaleDateString() : 'N/A'}
              </td>
              <td className="px-4 py-3">
                <Badge variant={loan.status === 'active' ? 'success' : 'secondary'}>
                  {loan.status || 'N/A'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Tableau des levées de fonds
 */
function FundingRoundsTable({ rounds }: { rounds: any[] }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Tour</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Montant levé</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Valorisation</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Investisseurs</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Date</th>
          </tr>
        </thead>
        <tbody>
          {rounds.map((round, idx) => (
            <tr key={round.id || idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-medium">{round.roundType || 'N/A'}</td>
              <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-300">
                {round.amount ? `${round.amount.toLocaleString()} ${round.currency || ''}` : 'N/A'}
              </td>
              <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                {round.valuation ? `${round.valuation.toLocaleString()} ${round.currency || ''}` : 'N/A'}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                {round.investors && round.investors.length > 0 ? round.investors.join(', ') : 'N/A'}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                {round.date ? new Date(round.date).toLocaleDateString() : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Tableau consolidé des documents
 */
function DocumentsTable({ documents }: { documents?: CompanyDocuments }): JSX.Element {
  const rows = buildDocumentRows(documents);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Catégorie</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Nom du document</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Référence</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 text-gray-900 dark:text-gray-300 whitespace-nowrap">{row.category}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{row.name}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-400 break-all" title={row.reference}>
                  {row.reference}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-400">
                  {row.url ? (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </a>
                  ) : (
                    <span className="text-xs italic text-gray-500 dark:text-gray-400">Non disponible</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-6 text-gray-500 dark:text-gray-400 italic" colSpan={4}>
                Aucun document disponible
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

