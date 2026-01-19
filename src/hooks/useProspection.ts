import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../contexts/useNotification';
import { companyApi } from '../services/api/shared/company.api';
import type { Company } from '../types/company';
import { useCompaniesData } from './useCompaniesData';
import { useErrorBoundary } from './useErrorBoundary';

// Type de base pour les paramètres de réunion
interface MeetingData {
  companyId: string;
  type: "physical" | "virtual";
  date: string;
  time: string;
  location?: string;
  notes?: string;
}

export function useProspection(initialCompanies: Company[] = []) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const { showNotification } = useNotification();
  const { addError } = useErrorBoundary();
  
  // Utiliser le hook useCompaniesData pour accéder aux données d'entreprises du localStorage
  const { companies: localStorageCompanies, loading: loadingLocalStorage } = useCompaniesData();
  
  // Références pour éviter les appels multiples et gérer le rate limiting
  const apiCallAttempted = useRef(false);
  const lastApiCall = useRef<number>(0);
  const rateLimitBackoff = useRef<number>(0);
  const consecutiveFailures = useRef<number>(0);
  const circuitBreakerOpen = useRef<boolean>(false);
  const hasLoadedOnce = useRef<boolean>(false); // Nouveau: empêcher les rechargements

  // Fonction pour vérifier si on peut faire un appel API (rate limiting + circuit breaker)
  const canCallApi = useCallback(() => {
    // Circuit breaker: arrêter complètement les appels après trop d'échecs
    if (circuitBreakerOpen.current) {
      console.log('Circuit breaker activé, API désactivée temporairement');
      return false;
    }
    
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall.current;
    const minInterval = Math.max(5000, rateLimitBackoff.current); // Minimum 5 secondes, plus si rate limited
    
    return timeSinceLastCall >= minInterval;
  }, []);

  // Fonction pour gérer les erreurs de rate limiting
  const handleRateLimitError = useCallback((error: unknown) => {
    consecutiveFailures.current += 1;
    rateLimitBackoff.current = Math.min(rateLimitBackoff.current * 2 || 10000, 60000); // Exponential backoff jusqu'à 1 minute
    
    // Ouvrir le circuit breaker après 5 échecs consécutifs
    if (consecutiveFailures.current >= 5) {
      circuitBreakerOpen.current = true;
      console.warn('Circuit breaker activé après', consecutiveFailures.current, 'échecs consécutifs');
      
      // Réinitialiser le circuit breaker après 5 minutes
      setTimeout(() => {
        circuitBreakerOpen.current = false;
        consecutiveFailures.current = 0;
        rateLimitBackoff.current = 0;
        console.log('Circuit breaker réinitialisé');
      }, 5 * 60 * 1000); // 5 minutes
    }
    
    addError({
      id: `rate-limit-${Date.now()}`,
      message: consecutiveFailures.current >= 5 
        ? 'API temporairement désactivée en raison de trop nombreuses requêtes. Réessai automatique dans 5 minutes.'
        : 'Trop de requêtes. Réessai automatique dans quelques secondes.',
      type: 'rate_limit',
      timestamp: Date.now(),
      details: error,
      retryable: consecutiveFailures.current < 5
    });
    
    console.warn('Taux de requêtes dépassé, backoff activé pour:', rateLimitBackoff.current, 'ms');
  }, [addError]);

  // Fonction pour réinitialiser les compteurs en cas de succès
  const handleApiSuccess = useCallback(() => {
    consecutiveFailures.current = 0;
    rateLimitBackoff.current = 0;
    circuitBreakerOpen.current = false;
  }, []);

  // Définir loadCompanies avec useCallback pour éviter les dépendances cycliques
  const loadCompanies = useCallback(async (baseCompanies: Company[] | unknown[]) => {
    // Éviter les appels multiples simultanés
    if (apiCallAttempted.current) {
      console.log('Appel API déjà en cours, ignorer...');
      return;
    }
    
    // Si nous avons déjà des données suffisantes, ne pas appeler l'API
    if (baseCompanies.length > 0 && !canCallApi()) {
      console.log('Données existantes utilisées, API rate limitée');
      setCompanies(baseCompanies as Company[]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      let allCompanies = [...baseCompanies] as Company[];
      
      // Vérifier le rate limiting avant d'appeler l'API
      if (canCallApi() && allCompanies.length === 0) { // Appeler l'API seulement si pas de données locales
        apiCallAttempted.current = true;
        lastApiCall.current = Date.now();
        
        try {
          // Tenter de charger des données supplémentaires depuis l'API si disponible
          const response = await companyApi.getAllCompanies();
          
          // Reset du backoff en cas de succès
          handleApiSuccess();
          
          // Gérer la double enveloppe: { data: { data: [...], meta: {...} } }
          let apiCompanies: Company[] = [];
          
          if (response && typeof response === 'object' && 'data' in response) {
            const innerData = (response as { data: unknown }).data;
            if (innerData && typeof innerData === 'object' && 'data' in innerData && Array.isArray((innerData as { data: unknown[] }).data)) {
              apiCompanies = (innerData as { data: Company[] }).data;
            } else if (Array.isArray(innerData)) {
              apiCompanies = innerData as Company[];
            }
          } else if (Array.isArray(response)) {
            apiCompanies = response;
          }
          
          // Combine les données d'API avec les données de base, en évitant les doublons par ID
          const apiIds = new Set(apiCompanies.map((company: Company) => company.id));
          const uniqueBaseCompanies = allCompanies.filter(company => !apiIds.has(company.id));
          allCompanies = [...apiCompanies, ...uniqueBaseCompanies];
          
        } catch (error: unknown) {
          // Gestion spécifique des erreurs 429
          if (error instanceof Error && error.message.includes('429')) {
            handleRateLimitError(error);
          } else {
            // Autres erreurs API - ne pas montrer de notification intrusive
            console.warn('Impossible de charger les données depuis l\'API, utilisation des données de base');
          }
        } finally {
          apiCallAttempted.current = false;
        }
      } else {
        if (allCompanies.length > 0) {
          console.log('Utilisation des données locales existantes');
        } else {
          console.log('Rate limit actif, utilisation des données de base uniquement');
        }
      }
      
      setCompanies(allCompanies);
    } catch (err) {
      showNotification('Erreur lors du chargement des entreprises', 'error');
      // En cas d'erreur, utiliser au moins les données initiales
      setCompanies(baseCompanies as Company[]);
      console.error('Erreur dans loadCompanies:', err);
    } finally {
      setLoading(false);
    }
  }, [showNotification, canCallApi, handleRateLimitError, handleApiSuccess]);

  // Séparer la logique de formatage des données
  const formatCompanies = useCallback((dataToFormat: unknown[]): Company[] => {
    return dataToFormat.map(company => {
      // Si c'est déjà un objet Company complet, le retourner tel quel
      if (typeof company === 'object' && company !== null && 'financial_metrics' in company && 'esg_metrics' in company) {
        return company as Company;
      }
      
      // Sinon, créer un objet Company minimal avec les données disponibles
      const comp = company as Record<string, unknown>;
      return {
        id: String(comp.id || ''),
        name: String(comp.name || ''),
        sector: String(comp.sector || ''),
        status: String(comp.status || ''),
        size: 'small' as const,
        annual_revenue: typeof comp.annual_revenue === 'number' ? comp.annual_revenue : 0,
        employee_count: typeof comp.employee_count === 'number' ? comp.employee_count : 0,
        website_url: '',
        pitch_deck_url: '',
        financial_metrics: {
          revenue_growth: 0,
          profit_margin: 0,
          cash_flow: 0,
          debt_ratio: 0,
          working_capital: 0,
          credit_score: 0,
          financial_rating: 'C' as const
        },
        esg_metrics: {
          carbon_footprint: 0,
          environmental_rating: 'C' as const,
          social_rating: 'C' as const,
          governance_rating: 'C' as const,
          gender_ratio: {
            male: 50,
            female: 50
          }
        },
        created_at: '',
        updated_at: ''
      } as Company;
    });
  }, []);

  useEffect(() => {
    // Éviter les effets multiples - utiliser une seule source de données
    if (!loadingLocalStorage && !hasLoadedOnce.current) {
      hasLoadedOnce.current = true; // Marquer comme chargé
      
      const dataToUse = localStorageCompanies.length > 0 ? localStorageCompanies : initialCompanies;
      
      if (dataToUse.length > 0) {
        const formattedCompanies = formatCompanies(dataToUse);
        loadCompanies(formattedCompanies);
      } else {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingLocalStorage, localStorageCompanies.length, initialCompanies.length]); // Utiliser .length pour éviter les référence cycliques

  const handleContact = async (company: Company) => {
    try {
      // Simuler une action d'API puisque prospectionApi.initiateContact n'existe pas
      console.log(`Initialisation du contact avec ${company.name}`, company);
      // Mise à jour du statut de l'entreprise
      const updatedCompany: Company = { ...company, status: 'contacted', lastContact: new Date().toISOString() };
      
      // Mettre à jour l'état local
      setCompanies(prev => 
        prev.map(c => c.id === company.id ? updatedCompany : c)
      );
      
      showNotification('Contact initié avec succès', 'success');
    } catch {
      showNotification('Erreur lors de la prise de contact', 'error');
    }
  };

  const handleScheduleMeeting = async (meetingData: Record<string, unknown>) => {
    try {
      // Convertir les données génériques en MeetingData typé
      const typedMeetingData: MeetingData = {
        companyId: String(meetingData.companyId || ''),
        type: (meetingData.type as "physical" | "virtual") || "virtual",
        date: String(meetingData.date || ''),
        time: String(meetingData.time || ''),
        location: meetingData.location ? String(meetingData.location) : undefined,
        notes: meetingData.notes ? String(meetingData.notes) : undefined
      };
      
      // Simuler une action d'API puisque prospectionApi.createMeeting n'existe pas
      console.log('Création de la réunion:', typedMeetingData);
      
      showNotification('Rendez-vous planifié avec succès', 'success');
      setShowMeetingScheduler(false);
    } catch {
      showNotification('Erreur lors de la planification', 'error');
    }
  };

  const handleCreateCompany = async (data: Record<string, unknown>) => {
    try {
      const newCompany = await companyApi.createCompany(data as Partial<Company>);
      setCompanies(prev => [...prev, newCompany]);
      showNotification('Entreprise créée avec succès', 'success');
      setShowNewCompanyModal(false);
    } catch {
      showNotification('Erreur lors de la création', 'error');
    }
  };

  return {
    companies,
    loading: loading || loadingLocalStorage,
    selectedCompany,
    setSelectedCompany,
    showMeetingScheduler,
    setShowMeetingScheduler,
    showNewCompanyModal,
    setShowNewCompanyModal,
    handleContact,
    handleScheduleMeeting,
    handleCreateCompany
  };
}
