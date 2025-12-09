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
import type { Company } from '../types/company';
import { ProspectionSkeleton } from '../components/ui/ProspectionSkeleton';
import { Building2 } from 'lucide-react';
import { useErrorBoundary } from '../hooks/useErrorBoundary';

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
      
      const companiesData = await companyApi.getAllCompanies();
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
      
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
      navigate(`/company/${company.id}/view`, { state: { company: detailedCompany } });
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err);
      // Fallback sur les données de base
      setSelectedCompany(company);
      navigate(`/company/${company.id}/view`, { state: { company } });
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