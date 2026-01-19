import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyFilters } from '../components/prospection/CompanyFilters';
import { CompanyListPaginated } from '../components/prospection/CompanyListPaginated';
import { CompanyMap } from '../components/prospection/CompanyMap';
import { ViewToggle } from '../components/prospection/ViewToggle';
import { MeetingScheduler } from '../components/prospection/MeetingScheduler';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { useProspection } from '../hooks/useProspection';
import { companyApi } from '../services/api/shared/company.api';
import type { Company, FinancialMetrics, ESGMetrics } from '../types/company';
import { ProspectionSkeleton } from '../components/ui/ProspectionSkeleton';
import { Building2 } from 'lucide-react';
import { useErrorBoundary } from '../hooks/useErrorBoundary';

/**
 * Normalise les données d'une entreprise venant du backend vers le format attendu par le frontend
 * Le backend utilise camelCase et le frontend utilise snake_case pour certains champs
 */
function normalizeCompanyData(raw: Record<string, unknown>): Company {
  // Normaliser financial_metrics
  const rawFinancials = (raw.financial_metrics || raw.financialMetrics || {}) as Record<string, unknown>;
  const financial_metrics: FinancialMetrics = {
    annual_revenue: parseFloat(String(rawFinancials.annual_revenue || rawFinancials.annualRevenue || 0)),
    revenue_growth: parseFloat(String(rawFinancials.revenue_growth || rawFinancials.revenueGrowth || 0)),
    profit_margin: parseFloat(String(rawFinancials.profit_margin || rawFinancials.profitMargin || 0)),
    cash_flow: parseFloat(String(rawFinancials.cash_flow || rawFinancials.cashFlow || 0)),
    debt_ratio: parseFloat(String(rawFinancials.debt_ratio || rawFinancials.debtRatio || 0)),
    working_capital: parseFloat(String(rawFinancials.working_capital || rawFinancials.workingCapital || 0)),
    credit_score: Number(rawFinancials.credit_score || rawFinancials.creditScore || 0),
    financial_rating: (rawFinancials.financial_rating || rawFinancials.financialRating || 'NR') as FinancialMetrics['financial_rating'],
    ebitda: rawFinancials.ebitda != null ? parseFloat(String(rawFinancials.ebitda)) : undefined,
  };

  // Normaliser esg_metrics
  const rawEsg = (raw.esg_metrics || raw.esgMetrics || {}) as Record<string, unknown>;
  const esg_metrics: ESGMetrics = {
    esg_rating: String(rawEsg.esg_rating || rawEsg.esgRating || 'NR'),
    carbon_footprint: Number(rawEsg.carbon_footprint || rawEsg.carbonFootprint || 0),
    environmental_rating: (rawEsg.environmental_rating || rawEsg.environmentalRating || 'NR') as ESGMetrics['environmental_rating'],
    social_rating: (rawEsg.social_rating || rawEsg.socialRating || 'NR') as ESGMetrics['social_rating'],
    governance_rating: (rawEsg.governance_rating || rawEsg.governanceRating || 'NR') as ESGMetrics['governance_rating'],
    gender_ratio: rawEsg.gender_ratio || rawEsg.genderRatio ? {
      male: Number((rawEsg.gender_ratio as Record<string, number>)?.male || (rawEsg.genderRatio as Record<string, number>)?.male || 50),
      female: Number((rawEsg.gender_ratio as Record<string, number>)?.female || (rawEsg.genderRatio as Record<string, number>)?.female || 50),
    } : undefined,
  };

  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    sector: String(raw.sector || raw.activitePrincipale || 'Autre'),
    size: (raw.size || 'small') as Company['size'],
    status: (raw.status || 'active') as Company['status'],
    logo_url: raw.logo_url as string | undefined,
    
    // Données opérationnelles - gérer les deux conventions de nommage
    employee_count: Number(raw.employee_count ?? raw.employeeCount ?? 0),
    website_url: (raw.website_url || raw.contact_info?.website || (raw.contactInfo as Record<string, unknown>)?.website) as string | undefined,
    pitch_deck_url: (raw.pitch_deck_url || raw.pitch?.pitch_deck_url) as string | undefined,
    lastContact: raw.lastContact as string | undefined,
    
    // Données financières - gérer les deux conventions
    annual_revenue: parseFloat(String(raw.annual_revenue ?? rawFinancials.annual_revenue ?? rawFinancials.annualRevenue ?? 0)),
    financial_metrics,
    
    // Données de contact
    contact_info: raw.contact_info || raw.contactInfo ? {
      email: String((raw.contact_info as Record<string, unknown>)?.email || (raw.contactInfo as Record<string, unknown>)?.email || ''),
      phone: String((raw.contact_info as Record<string, unknown>)?.phone || (raw.contactInfo as Record<string, unknown>)?.phone || ''),
      address: ((raw.contact_info as Record<string, unknown>)?.address || (raw.contactInfo as Record<string, unknown>)?.address) as string | undefined,
      website: ((raw.contact_info as Record<string, unknown>)?.website || (raw.contactInfo as Record<string, unknown>)?.website) as string | undefined,
    } : undefined,
    
    // Localisation
    locations: raw.locations as Company['locations'],
    latitude: raw.latitude as number | undefined,
    longitude: raw.longitude as number | undefined,
    
    // Données légales
    legal_info: raw.legal_info || raw.legalInfo ? {
      legalForm: ((raw.legal_info as Record<string, unknown>)?.legalForm || (raw.legalInfo as Record<string, unknown>)?.legalForm) as Company['legal_info']['legalForm'],
      rccm: ((raw.legal_info as Record<string, unknown>)?.rccm || (raw.legalInfo as Record<string, unknown>)?.rccm) as string | undefined,
      taxId: ((raw.legal_info as Record<string, unknown>)?.taxId || (raw.legalInfo as Record<string, unknown>)?.taxId) as string | undefined,
      yearFounded: Number((raw.legal_info as Record<string, unknown>)?.yearFounded || (raw.legalInfo as Record<string, unknown>)?.yearFounded || 0),
    } : undefined,
    
    // ESG
    esg_metrics,
    
    // Métadonnées
    profileCompleteness: Number(raw.profileCompleteness || 0),
    lastSyncFromAccounting: raw.lastSyncFromAccounting as string | undefined,
    lastSyncFromCustomer: raw.lastSyncFromCustomer as string | undefined,
    
    // Timestamps
    created_at: String(raw.created_at || raw.createdAt || new Date().toISOString()),
    updated_at: String(raw.updated_at || raw.updatedAt || new Date().toISOString()),
    
    // Autres champs optionnels
    owner: raw.owner as Company['owner'],
    contactPersons: raw.contactPersons as Company['contactPersons'],
    dirigeants: raw.dirigeants as Company['dirigeants'],
    actionnaires: raw.actionnaires as Company['actionnaires'],
    employes: raw.employes as Company['employes'],
    assets: raw.assets as Company['assets'],
    immobilisations: raw.immobilisations as Company['immobilisations'],
    equipements: raw.equipements as Company['equipements'],
    vehicules: raw.vehicules as Company['vehicules'],
    stocks: raw.stocks as Company['stocks'],
    payment_info: raw.payment_info || raw.paymentInfo as Company['payment_info'],
    sigle: raw.sigle as string | undefined,
    typeEntreprise: raw.typeEntreprise as Company['typeEntreprise'],
    numeroIdentificationNationale: raw.numeroIdentificationNationale as string | undefined,
    secteursActiviteSecondaires: raw.secteursActiviteSecondaires || raw.activitesSecondaires as string[] | undefined,
    secteursPersonalises: raw.secteursPersonalises as string[] | undefined,
    descriptionActivites: raw.descriptionActivites as string | undefined,
    produitsServices: raw.produitsServices as string[] | undefined,
  };
}

export default function Prospection() {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useErrorBoundary();
  
  // Rate limiting et circuit breaker
  const lastApiCall = useRef<number>(0);
  const rateLimitBackoff = useRef<number>(0);
  const apiCallInProgress = useRef<boolean>(false);
  
  // Utilisation du hook useProspection pour la gestion d'état local
  const {
    selectedCompany,
    setSelectedCompany,
    showMeetingScheduler,
    setShowMeetingScheduler,
  } = useProspection([]);

  const navigate = useNavigate();

  // Fonction pour vérifier si on peut faire un appel API
  const canCallApi = useCallback(() => {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall.current;
    const minInterval = Math.max(10000, rateLimitBackoff.current); // Minimum 10 secondes pour Prospection
    
    return timeSinceLastCall >= minInterval && !apiCallInProgress.current;
  }, []);

  // Charger les entreprises depuis l'API avec rate limiting
  const loadCompanies = useCallback(async () => {
    if (!canCallApi()) {
      console.log('Rate limit actif, chargement différé');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      apiCallInProgress.current = true;
      lastApiCall.current = Date.now();
      
      const response = await companyApi.getAllCompanies();
      console.log('Response from getAllCompanies:', JSON.stringify(response, null, 2));
      
      // L'API peut retourner différents formats:
      // 1. Double enveloppe: { data: { data: Company[], meta: {...} } }
      // 2. Simple enveloppe: { data: Company[], meta: {...} }
      // 3. Tableau direct: Company[]
      let rawCompaniesArray: Record<string, unknown>[] = [];
      
      if (response && typeof response === 'object' && 'data' in response) {
        const innerData = (response as { data: unknown }).data;
        // Cas 1: Double enveloppe { data: { data: [...], meta: {...} } }
        if (innerData && typeof innerData === 'object' && 'data' in innerData && Array.isArray((innerData as { data: unknown[] }).data)) {
          rawCompaniesArray = (innerData as { data: Record<string, unknown>[] }).data;
          console.log('Extracted from double envelope:', rawCompaniesArray.length, 'companies');
        }
        // Cas 2: Simple enveloppe { data: [...] }
        else if (Array.isArray(innerData)) {
          rawCompaniesArray = innerData as Record<string, unknown>[];
          console.log('Extracted from simple envelope:', rawCompaniesArray.length, 'companies');
        }
      } else if (Array.isArray(response)) {
        // Cas 3: Tableau direct
        rawCompaniesArray = response as Record<string, unknown>[];
        console.log('Direct array:', rawCompaniesArray.length, 'companies');
      } else {
        console.warn('Format de réponse inattendu pour getAllCompanies:', response);
      }
      
      // Normaliser les données pour correspondre au format attendu par le frontend
      const normalizedCompanies = rawCompaniesArray.map(normalizeCompanyData);
      console.log('Normalized companies:', normalizedCompanies);
      
      setCompanies(normalizedCompanies);
      
      // Reset du backoff en cas de succès
      rateLimitBackoff.current = 0;
      
    } catch (err) {
      console.error('Erreur lors du chargement des entreprises:', err);
      
      if (err instanceof Error && err.message.includes('429')) {
        rateLimitBackoff.current = Math.min(rateLimitBackoff.current * 2 || 15000, 120000); // Jusqu'à 2 minutes
        addError({
          id: `prospection-rate-limit-${Date.now()}`,
          message: 'Trop de requêtes pour le chargement des entreprises. Réessai automatique différé.',
          type: 'rate_limit',
          timestamp: Date.now(),
          details: err,
          retryable: true
        });
      } else {
        setError('Impossible de charger les entreprises');
      }
      // S'assurer que companies reste un tableau même en cas d'erreur
      setCompanies([]); 
    } finally {
      setLoading(false);
      apiCallInProgress.current = false;
    }
  }, [canCallApi, addError]);

  // Charger les données au montage
  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  // Gérer la sélection d'une entreprise avec chargement des détails
  const handleViewDetails = async (company: Company) => {
    try {
      // Charger les détails complets de l'entreprise
      const detailedCompany = await companyApi.getCompanyById(company.id);
      setSelectedCompany(detailedCompany);
      // Naviguer vers la page de consultation en passant les données via location state
      navigate(`/app/traditional/company/${company.id}/view`, { state: { company: detailedCompany } });
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err);
      // Fallback sur les données de base
      setSelectedCompany(company);
      navigate(`/app/traditional/company/${company.id}/view`, { state: { company } });
    }
  };

  // Filtrer les entreprises
  const filteredCompanies = (companies || []).filter(company => {
    if (searchTerm) {
      return company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             company.sector.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  // Gestion des états de chargement et d'erreur
  if (loading) {
    return (
      <div className="space-y-6 flex flex-col">
        <ProspectionSkeleton view={view} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col">
        <ErrorState
          error={error}
          onRetry={loadCompanies}
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex flex-wrap justify-between items-center w-full">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Prospection
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gérez et analysez vos opportunités d'investissement
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      <div className="w-full">
        <CompanyFilters
          onSearch={setSearchTerm}
          onFilterChange={() => {}}
        />
      </div>

      {view === 'map' ? (
        <CompanyMap
          companies={filteredCompanies}
          onSelectCompany={handleViewDetails}
        />
      ) : filteredCompanies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucune entreprise trouvée"
          description={searchTerm 
            ? `Aucune entreprise ne correspond à "${searchTerm}"`
            : 'Aucune entreprise n\'est disponible pour la prospection'
          }
          size="lg"
        />
      ) : (
        <CompanyListPaginated
          companies={filteredCompanies}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Modals - replaced by navigation to CompanyViewPage - CompanyDetails modal removed */}

      {showMeetingScheduler && selectedCompany && (
        <MeetingScheduler
          company={selectedCompany}
          onClose={() => {
            setShowMeetingScheduler(false);
            setSelectedCompany(null);
          }}
          onSchedule={async () => {}}
        />
      )}
    </div>
  );
}