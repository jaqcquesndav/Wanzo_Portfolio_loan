import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { prospectionApi } from '../services/api/prospection.api';
import type { Company } from '../types/company';
import { mockCompanies } from '../data/mockCompanies';


export function useProspection(initialCompanies: Company[] = []) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const { showNotification } = useNotification();


  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await prospectionApi.getCompanies();
      setCompanies(data);
    } catch (error) {
      showNotification('Erreur lors du chargement des entreprises', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (company: Company) => {
    try {
      await prospectionApi.initiateContact(company.id);
      showNotification('Contact initié avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la prise de contact', 'error');
    }
  };

  const handleScheduleMeeting = async (meetingData: any) => {
    try {
      await prospectionApi.createMeeting(meetingData);
      showNotification('Rendez-vous planifié avec succès', 'success');
      setShowMeetingScheduler(false);
    } catch (error) {
      showNotification('Erreur lors de la planification', 'error');
    }
  };

  const handleCreateCompany = async (data: any) => {
    try {
      const newCompany = await prospectionApi.createCompany(data);
      setCompanies(prev => [...prev, newCompany]);
      showNotification('Entreprise créée avec succès', 'success');
      setShowNewCompanyModal(false);
    } catch (error) {
      showNotification('Erreur lors de la création', 'error');
    }
  };

   return {
    companies,
    loading,
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