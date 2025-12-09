import { useState } from 'react';
import { ArrowLeft, Download, Edit, Copy, Check } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { useCompanyData } from '../hooks/useCompanyData';
import type { Company, Asset, Stock, BankAccount, MobileMoneyAccount, Location } from '../types/company';

/**
 * Page de consultation complète d'une entreprise (lecture seule)
 * Affiche les données organisées en 6 onglets: Général, Patrimoine, Structure, Finance, Localisation, Pitch
 * Miroir de la structure EnterpriseIdentificationForm pour l'édition
 */
export default function CompanyViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const state = (location.state as { company?: Company } | null) || null;
  const passedCompany = state?.company;
  const { company, loading, error } = useCompanyData(id, passedCompany ?? null);

  // États de chargement
  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-gray-600 mt-4">Chargement des informations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Entreprise non trouvée</h2>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

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
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {company.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{company.sector}</p>
              {company.size && (
                <p className="text-sm text-gray-500 mt-1">Taille: {company.size}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/company/${company.id}/edit`)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Éditer
              </Button>
            </div>
          </div>

          {/* Status et complétude */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant={company.status === 'active' ? 'success' : 'warning'}>
              {company.status === 'active' ? 'Actif' : company.status}
            </Badge>
            {company.profileCompleteness && (
              <Badge variant="secondary">
                Complétude: {company.profileCompleteness}%
              </Badge>
            )}
          </div>
        </div>

        {/* TABS SECTION */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-2 bg-gray-100">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="patrimoine">Patrimoine</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="financier">Finance</TabsTrigger>
            <TabsTrigger value="localisation">Localisation</TabsTrigger>
            <TabsTrigger value="presentation">Pitch</TabsTrigger>
          </TabsList>

          {/* ONGLET: GÉNÉRAL */}
          <TabsContent value="general" className="space-y-6">
            {/* Identification de base */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Identification de base
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ViewField label="Raison sociale" value={company.name} />
                <ViewField label="Sigle" value={company.name} />
                <ViewField label="Secteur principal" value={company.sector} />
                <ViewField label="Type d'entreprise" value={company.size} />
                <ViewField label="Taille" value={company.size} />
                <ViewField label="Nombre d'employés" value={company.employee_count?.toString()} />
                <ViewField label="Capital social" value={company.financial_metrics?.ebitda?.toString()} />
                <ViewField label="Devise" value="USD" />
              </div>
            </section>

            {/* Coordonnées et contact */}
            {company.contact_info && (
              <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Coordonnées et contact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ViewField label="Email" value={company.contact_info.email} copyable />
                  <ViewField label="Téléphone" value={company.contact_info.phone} copyable />
                  <ViewField label="Adresse" value={company.contact_info.address} />
                  <ViewField label="Site web" value={company.contact_info.website} />
                </div>
              </section>
            )}

            {/* Métriques financières */}
            {company.financial_metrics && (
              <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Métriques financières
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ViewField label="CA annuel" value={`${company.financial_metrics.annual_revenue?.toLocaleString()} USD`} />
                  <ViewField label="Score de crédit" value={`${company.financial_metrics.credit_score}/100`} />
                  <ViewField label="Note financière" value={company.financial_metrics.financial_rating} />
                  <ViewField label="Croissance (YoY)" value={`${company.financial_metrics.revenue_growth}%`} />
                  <ViewField label="Marge bénéficiaire" value={`${company.financial_metrics.profit_margin}%`} />
                  <ViewField label="Ratio d'endettement" value={`${company.financial_metrics.debt_ratio}`} />
                </div>
              </section>
            )}

            {/* Réseaux sociaux et web */}
            {company.website_url && (
              <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Présence web
                </h2>
                <ViewField label="Site web" value={company.website_url} copyable />
                {company.pitch_deck_url && (
                  <ViewField label="Pitch deck" value={company.pitch_deck_url} copyable />
                )}
              </section>
            )}
          </TabsContent>

          {/* ONGLET: PATRIMOINE */}
          <TabsContent value="patrimoine" className="space-y-6">
            {/* Immobilisations */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Immobilisations et équipements
              </h2>
              {company.assets && company.assets.length > 0 ? (
                <AssetsTable assets={company.assets} />
              ) : (
                <p className="text-gray-500 italic">Aucune immobilisation enregistrée</p>
              )}
            </section>

            {/* Stocks */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Stocks et inventaire
              </h2>
              {company.stocks && company.stocks.length > 0 ? (
                <StocksTable stocks={company.stocks} />
              ) : (
                <p className="text-gray-500 italic">Aucun stock enregistré</p>
              )}
            </section>
          </TabsContent>

          {/* ONGLET: STRUCTURE */}
          <TabsContent value="structure" className="space-y-6">
            {/* Dirigeants */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Dirigeants et management
              </h2>
              {/* TODO: Ajouter contactPersons à Company type */}
              <p className="text-gray-500 italic">À intégrer selon la structure Company</p>
            </section>

            {/* Structure organisationnelle */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Structure organisationnelle
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ViewField label="Nombre total d'employés" value={company.employee_count?.toString()} />
              </div>
            </section>
          </TabsContent>

          {/* ONGLET: FINANCE & JURIDIQUE */}
          <TabsContent value="financier" className="space-y-6">
            {/* Informations juridiques */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Informations juridiques
              </h2>
              {company.legal_info ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ViewField label="Forme juridique" value={company.legal_info.legalForm} />
                  <ViewField label="RCCM" value={company.legal_info.rccm} copyable />
                  <ViewField label="Numéro fiscal" value={company.legal_info.taxId} />
                  <ViewField label="Année de création" value={company.legal_info.yearFounded?.toString()} />
                </div>
              ) : (
                <p className="text-gray-500 italic">Informations juridiques non disponibles</p>
              )}
            </section>

            {/* Comptes bancaires */}
            {company.payment_info?.bankAccounts && company.payment_info.bankAccounts.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Comptes bancaires
                </h2>
                <BankAccountsTable accounts={company.payment_info.bankAccounts} />
              </section>
            )}

            {/* Mobile Money */}
            {company.payment_info?.mobileMoneyAccounts && company.payment_info.mobileMoneyAccounts.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Comptes Mobile Money
                </h2>
                <MobileMoneyTable accounts={company.payment_info.mobileMoneyAccounts} />
              </section>
            )}
          </TabsContent>

          {/* ONGLET: LOCALISATION */}
          <TabsContent value="localisation" className="space-y-6">
            {/* Sièges et localisations */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Localisations
              </h2>
              {company.locations && company.locations.length > 0 ? (
                <LocationsTable locations={company.locations} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {company.latitude && company.longitude && (
                    <>
                      <ViewField label="Latitude" value={company.latitude.toString()} />
                      <ViewField label="Longitude" value={company.longitude.toString()} />
                    </>
                  )}
                </div>
              )}
            </section>
          </TabsContent>

          {/* ONGLET: PITCH & PRÉSENTATION */}
          <TabsContent value="presentation" className="space-y-6">
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Présentation et pitch
              </h2>
              <p className="text-gray-500 italic">
                Section à intégrer selon la structure des données de présentation dans le type Company
              </p>
            </section>

            {/* Métriques ESG */}
            {company.esg_metrics && (
              <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Métriques ESG
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ViewField label="Rating ESG" value={company.esg_metrics.esg_rating} />
                  <ViewField label="Note environnement" value={company.esg_metrics.environmental_rating} />
                  <ViewField label="Note sociale" value={company.esg_metrics.social_rating} />
                  <ViewField label="Note gouvernance" value={company.esg_metrics.governance_rating} />
                  <ViewField label="Empreinte carbone" value={`${company.esg_metrics.carbon_footprint} kg CO2`} />
                </div>
              </section>
            )}
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
  copyable = false
}: {
  label: string;
  value?: string | number | null;
  copyable?: boolean;
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
        <p className="text-gray-400 dark:text-gray-500 italic mt-1">-</p>
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</label>
      <div className="flex items-center justify-between mt-1">
        <p className="text-gray-900 dark:text-white font-medium break-all">{value}</p>
        {copyable && (
          <button
            onClick={() => handleCopy(String(value))}
            className="ml-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
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
 * Tableau des immobilisations/actifs
 */
function AssetsTable({ assets }: { assets: Asset[] }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Désignation</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Type</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Valeur actuelle</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">État</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Observations</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{asset.designation || '-'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{asset.type || '-'}</td>
              <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-300">
                {asset.valeurActuelle ? `${asset.valeurActuelle.toLocaleString()}` : '-'}
              </td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{asset.etatActuel || '-'}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{asset.observations || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Tableau des stocks
 */
function StocksTable({ stocks }: { stocks: Stock[] }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Désignation</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Catégorie</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Quantité</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Valeur totale</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">État</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{stock.designation || '-'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{stock.categorie || '-'}</td>
              <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-300">{stock.quantiteStock || '-'}</td>
              <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-300">
                {stock.valeurTotaleStock ? `${stock.valeurTotaleStock.toLocaleString()}` : '-'}
              </td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{stock.etatStock || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Tableau des comptes bancaires
 */
function BankAccountsTable({ accounts }: { accounts: BankAccount[] }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Titulaire</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Banque</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Numéro de compte</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">SWIFT/IBAN</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Devise</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{account.accountName || '-'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{account.bankName || '-'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-mono text-xs">{account.accountNumber || '-'}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                {account.swiftCode || account.iban || '-'}
              </td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{account.currency || '-'}</td>
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
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{account.accountName || '-'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-mono">{account.phoneNumber || '-'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{account.provider || '-'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{account.currency || '-'}</td>
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
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{location.address || '-'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{location.city || '-'}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{location.country || '-'}</td>
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
