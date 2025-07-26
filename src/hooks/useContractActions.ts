// src/hooks/useContractActions.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditContract } from '../types/credit';
import { useNotification } from '../contexts/useNotification';
import { useCreditContracts } from './useCreditContracts';

// Interface pour les éléments d'échéancier
interface ScheduleItem {
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  status: string;
}

// Hook pour gérer les actions sur les contrats
export const useContractActions = (portfolioId: string) => {
  const { updateContract, deleteContract } = useCreditContracts(portfolioId);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Fonction pour récupérer un portefeuille par ID
  const getPortfolioById = async (id: string) => {
    try {
      // Simule un appel API
      return {
        id,
        name: `Portefeuille ${id}`,
        manager: { name: 'Gestionnaire par défaut' }
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération du portefeuille ${id}:`, error);
      return null;
    }
  };

  // Fonction pour récupérer l'échéancier d'un contrat
  const getContractSchedule = async (contractId: string): Promise<ScheduleItem[]> => {
    try {
      // Simule un appel API - génère un échéancier factice
      const now = new Date();
      const scheduleItems: ScheduleItem[] = [];
      
      for (let i = 0; i < 6; i++) {
        const dueDate = new Date(now);
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        
        scheduleItems.push({
          due_date: dueDate.toISOString(),
          principal_amount: 50000,
          interest_amount: 5000,
          total_amount: 55000,
          status: i === 0 ? 'paid' : (i === 1 ? 'partial' : 'pending')
        });
      }
      
      return scheduleItems;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'échéancier du contrat ${contractId}:`, error);
      return [];
    }
  };

  // Fonction pour générer un PDF du contrat
  const handleGeneratePDF = useCallback(async (contract: CreditContract) => {
    if (!contract) {
      showNotification('Impossible de générer un PDF pour un contrat inexistant', 'error');
      return;
    }
    
    try {
      if (!navigator.onLine) {
        showNotification(`Mode hors ligne: La génération du PDF pour le contrat ${contract.reference} est indisponible`, 'warning');
        return;
      }
      
      showNotification(`Génération du PDF pour le contrat ${contract.reference} en cours...`, 'info');
      
      // Obtenir les données du portefeuille
      const portfolioDetails = await getPortfolioById(portfolioId);
      
      // Obtenir les données d'échéancier si disponibles
      // Interface pour les données d'échéancier formatées
      interface FormattedScheduleItem {
        number: number;
        dueDate: string;
        principal: number;
        interest: number;
        total: number;
        status: string;
      }
      
      let scheduleData: FormattedScheduleItem[] = [];
      try {
        const schedule = await getContractSchedule(contract.id);
        scheduleData = schedule.map((item, index: number) => ({
          number: index + 1,
          dueDate: item.due_date,
          principal: item.principal_amount,
          interest: item.interest_amount,
          total: item.total_amount,
          status: item.status
        }));
      } catch (error) {
        console.warn('Échéancier non disponible:', error);
        scheduleData = [];
      }
      
      // Extraire le nom du gestionnaire du portfolio ou utiliser une valeur par défaut
      let managerName = "Gestionnaire non spécifié";
      if (portfolioDetails && typeof portfolioDetails.manager === 'object' && portfolioDetails.manager) {
        managerName = portfolioDetails.manager.name || "Gestionnaire non spécifié";
      } else if (portfolioDetails && typeof portfolioDetails.manager === 'string') {
        managerName = portfolioDetails.manager;
      }
      
      // Informations de l'institution (à adapter selon votre structure)
      const institutionInfo = {
        institutionName: "Wanzo Institution Financière",
        institutionAddress: "01 BP 1234, Abidjan 01, Côte d'Ivoire",
        institutionContact: "Tel: +225 27 20 xx xx xx | Email: contact@wanzo.com",
        portfolioName: portfolioDetails?.name || "Portefeuille de prêts",
        portfolioManager: managerName,
        scheduleData
      };
      
      // Importer dynamiquement la fonction d'export pour éviter les problèmes de dépendances circulaires
      // Utiliser la nouvelle implémentation moderne pour un rendu de meilleure qualité
      const { exportCreditContractToPDF } = await import('../utils/exportModern');
      
      // Générer le PDF
      const result = await exportCreditContractToPDF(contract, institutionInfo);
      
      if (result.success) {
        showNotification(`PDF du contrat ${contract.reference} généré avec succès`, 'success');
      } else {
        showNotification(`Erreur lors de la génération du PDF: ${result.message || 'Erreur inconnue'}`, 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      showNotification(`Erreur lors de la génération du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
    }
  }, [portfolioId, showNotification]);

  // Fonction pour afficher l'échéancier d'un contrat
  const handleViewSchedule = useCallback((contract: CreditContract) => {
    if (!contract) {
      showNotification('Impossible d\'afficher l\'échéancier d\'un contrat inexistant', 'error');
      return;
    }
    
    navigate(`/app/traditional/portfolio/${portfolioId}/contracts/${contract.id}/schedule`);
    showNotification(`Navigation vers l'échéancier du contrat ${contract.reference}`, 'info');
  }, [navigate, portfolioId, showNotification]);
  
  // Retourne les fonctions du hook
  return {
    handleGeneratePDF,
    handleViewSchedule,
    handleUpdateContract: updateContract,
    handleDeleteContract: deleteContract
  };
};
