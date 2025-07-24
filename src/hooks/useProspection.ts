import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { companyApi } from '../services/api/shared/company.api';
import type { Company } from '../types/company';
import { useCompaniesData } from './useCompaniesData';

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
  
  // Utiliser le hook useCompaniesData pour accéder aux données d'entreprises du localStorage
  const { companies: localStorageCompanies, loading: loadingLocalStorage } = useCompaniesData();

  // Définir loadCompanies avec useCallback pour éviter les dépendances cycliques
  const loadCompanies = useCallback(async (baseCompanies: Company[] | unknown[]) => {
    try {
      setLoading(true);
      // Toujours utiliser les données de base pour garantir que toutes les entreprises sont visibles
      // dans l'espace de prospection, qui est un espace public
      let allCompanies = [...baseCompanies] as Company[];
      
      try {
        // Tenter de charger des données supplémentaires depuis l'API si disponible
        const apiData = await companyApi.getAllCompanies();
        // Combine les données d'API avec les données de base, en évitant les doublons par ID
        const apiIds = new Set(apiData.map((company: Company) => company.id));
        const uniqueBaseCompanies = allCompanies.filter(company => !apiIds.has(company.id));
        allCompanies = [...apiData, ...uniqueBaseCompanies];
      } catch {
        // En cas d'échec de l'API, utiliser uniquement les données de base
        // Aucune notification d'erreur car les données de base sont disponibles
        console.warn('Impossible de charger les données depuis l\'API, utilisation des données de base');
      }
      
      setCompanies(allCompanies);
    } catch {
      showNotification('Erreur lors du chargement des entreprises', 'error');
      // En cas d'erreur, utiliser au moins les données initiales
      setCompanies(baseCompanies as Company[]);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    // Si les données du localStorage sont chargées, les utiliser
    if (!loadingLocalStorage && localStorageCompanies.length > 0) {
      // Convertir les données du localStorage au format Company
      const formattedCompanies = localStorageCompanies.map(company => {
        // Créer un objet Company minimal avec les données disponibles
        return {
          id: company.id,
          name: company.name,
          sector: company.sector,
          status: company.status,
          size: 'small', // Valeur par défaut
          annual_revenue: typeof company.annual_revenue === 'number' ? company.annual_revenue : 0,
          employee_count: typeof company.employee_count === 'number' ? company.employee_count : 0,
          website_url: '',
          pitch_deck_url: '',
          financial_metrics: {
            revenue_growth: 0,
            profit_margin: 0,
            cash_flow: 0,
            debt_ratio: 0,
            working_capital: 0,
            credit_score: 0,
            financial_rating: 'C'
          },
          esg_metrics: {
            carbon_footprint: 0,
            environmental_rating: 'C',
            social_rating: 'C',
            governance_rating: 'C',
            gender_ratio: {
              male: 50,
              female: 50
            }
          },
          created_at: '',
          updated_at: ''
        } as Company;
      });
      
      loadCompanies(formattedCompanies);
    } else {
      // Sinon, utiliser les données initiales
      loadCompanies(initialCompanies);
    }
  }, [loadingLocalStorage, localStorageCompanies, initialCompanies, loadCompanies]);

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