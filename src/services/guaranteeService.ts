// src/services/guaranteeService.ts
import { Guarantee } from '../types/guarantee';
import { traditionalDataService } from './api/traditional/dataService';
import { mockGuarantees } from '../data/mockGuarantees';

// Clé de stockage dans le localStorage
const STORAGE_KEY = 'wanzo_guarantees';

/**
 * Service unifié pour la gestion des garanties
 * 
 * Ce service sert de point d'entrée unique pour toutes les opérations liées aux garanties.
 * Il coordonne les interactions entre le localStorage et le traditionalDataService pour
 * assurer la cohérence des données.
 */
class GuaranteeService {
  /**
   * Initialise les données par défaut si nécessaire
   */
  async initialize(): Promise<void> {
    try {
      // Vérifier si les données existent déjà dans le localStorage
      const storedData = localStorage.getItem(STORAGE_KEY);
      
      if (!storedData) {
        // Initialiser avec les données mockées
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockGuarantees));
        console.log('✅ Données de garanties initialisées dans le localStorage');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des données de garanties:', error);
      throw error;
    }
  }
  
  /**
   * Initialise les données par défaut
   * @returns {Promise<boolean>} true si l'initialisation a réussi, false sinon
   */
  async initializeDefaultData(): Promise<boolean> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockGuarantees));
      console.log('✅ Données de garanties initialisées avec les données par défaut');
      
      // Assurer que les garanties sont également associées aux contrats appropriés
      const guaranteesByContract = new Map<string, Guarantee[]>();
      
      // Regrouper les garanties par contrat
      mockGuarantees.forEach(guarantee => {
        if (guarantee.contractId) {
          const contractGuarantees = guaranteesByContract.get(guarantee.contractId) || [];
          contractGuarantees.push(guarantee);
          guaranteesByContract.set(guarantee.contractId, contractGuarantees);
        }
      });
      
      // Enregistrer les garanties pour chaque contrat
      guaranteesByContract.forEach((guarantees, contractId) => {
        traditionalDataService.saveContractRelatedData(
          contractId,
          'GUARANTEES',
          guarantees
        );
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des données de garanties:', error);
      return false;
    }
  }
  
  /**
   * Réinitialise les données avec les données mock
   * @returns {Promise<boolean>} true si la réinitialisation a réussi, false sinon
   */
  async resetToMockData(): Promise<boolean> {
    return this.initializeDefaultData();
  }
  
  /**
   * Récupère toutes les garanties
   */
  async getAllGuarantees(): Promise<Guarantee[]> {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des garanties:', error);
      return [];
    }
  }
  
  /**
   * Récupère une garantie par son ID
   */
  async getGuaranteeById(id: string): Promise<Guarantee | null> {
    try {
      const guarantees = await this.getAllGuarantees();
      return guarantees.find(g => g.id === id) || null;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la garantie ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Récupère les garanties associées à un contrat
   */
  async getGuaranteesByContractId(contractId: string): Promise<Guarantee[]> {
    try {
      // Utilise traditionalDataService pour assurer la cohérence
      return traditionalDataService.getContractRelatedData<Guarantee>(
        contractId,
        'GUARANTEES'
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération des garanties pour le contrat ${contractId}:`, error);
      return [];
    }
  }
  
  /**
   * Récupère les garanties pour un portefeuille
   */
  async getGuaranteesByPortfolioId(portfolioId: string): Promise<Guarantee[]> {
    try {
      const allGuarantees = await this.getAllGuarantees();
      return allGuarantees.filter(g => g.portfolioId === portfolioId);
    } catch (error) {
      console.error(`Erreur lors de la récupération des garanties pour le portefeuille ${portfolioId}:`, error);
      return [];
    }
  }
  
  /**
   * Ajoute une nouvelle garantie
   */
  async addGuarantee(guarantee: Guarantee): Promise<Guarantee> {
    try {
      // 1. Ajouter à la liste générale
      const allGuarantees = await this.getAllGuarantees();
      allGuarantees.push(guarantee);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allGuarantees));
      
      // 2. Si associée à un contrat, mettre à jour la relation via traditionalDataService
      if (guarantee.contractId) {
        const contractGuarantees = await this.getGuaranteesByContractId(guarantee.contractId);
        traditionalDataService.saveContractRelatedData(
          guarantee.contractId,
          'GUARANTEES',
          [...contractGuarantees, guarantee]
        );
      }
      
      return guarantee;
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'une garantie:', error);
      throw error;
    }
  }
  
  /**
   * Met à jour une garantie existante
   */
  async updateGuarantee(guaranteeId: string, updateData: Partial<Guarantee>): Promise<Guarantee | null> {
    try {
      // 1. Mettre à jour dans la liste générale
      const allGuarantees = await this.getAllGuarantees();
      const index = allGuarantees.findIndex(g => g.id === guaranteeId);
      
      if (index === -1) {
        console.error(`Garantie avec ID=${guaranteeId} non trouvée`);
        return null;
      }
      
      const updatedGuarantee = {
        ...allGuarantees[index],
        ...updateData,
      };
      
      allGuarantees[index] = updatedGuarantee;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allGuarantees));
      
      // 2. Si associée à un contrat, mettre à jour la relation via traditionalDataService
      if (updatedGuarantee.contractId) {
        const contractGuarantees = await this.getGuaranteesByContractId(updatedGuarantee.contractId);
        const updatedContractGuarantees = contractGuarantees.map(g => 
          g.id === guaranteeId ? updatedGuarantee : g
        );
        
        traditionalDataService.saveContractRelatedData(
          updatedGuarantee.contractId,
          'GUARANTEES',
          updatedContractGuarantees
        );
      }
      
      return updatedGuarantee;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la garantie ID=${guaranteeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Supprime une garantie
   */
  async deleteGuarantee(guaranteeId: string): Promise<boolean> {
    try {
      // 1. Récupérer la garantie pour connaître son contrat associé
      const allGuarantees = await this.getAllGuarantees();
      const guaranteeToDelete = allGuarantees.find(g => g.id === guaranteeId);
      
      if (!guaranteeToDelete) {
        console.error(`Garantie avec ID=${guaranteeId} non trouvée`);
        return false;
      }
      
      // 2. Supprimer de la liste générale
      const filteredGuarantees = allGuarantees.filter(g => g.id !== guaranteeId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredGuarantees));
      
      // 3. Si associée à un contrat, mettre à jour la relation via traditionalDataService
      if (guaranteeToDelete.contractId) {
        const contractGuarantees = await this.getGuaranteesByContractId(guaranteeToDelete.contractId);
        const updatedContractGuarantees = contractGuarantees.filter(g => g.id !== guaranteeId);
        
        traditionalDataService.saveContractRelatedData(
          guaranteeToDelete.contractId,
          'GUARANTEES',
          updatedContractGuarantees
        );
      }
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la garantie ID=${guaranteeId}:`, error);
      return false;
    }
  }
  
  /**
   * Enregistre une liste de garanties pour un contrat
   * 
   * Cette méthode est utilisée par le formulaire d'édition du contrat
   */
  async saveContractGuarantees(contractId: string, guarantees: Guarantee[]): Promise<boolean> {
    try {
      // 1. Mettre à jour via traditionalDataService
      traditionalDataService.saveContractRelatedData(
        contractId,
        'GUARANTEES',
        guarantees
      );
      
      // 2. Synchroniser avec la liste générale
      const allGuarantees = await this.getAllGuarantees();
      
      // Supprimer les anciennes garanties liées à ce contrat
      const guaranteesNotForThisContract = allGuarantees.filter(g => 
        g.contractId !== contractId && g.contractReference !== contractId
      );
      
      // Ajouter les nouvelles garanties
      const updatedAllGuarantees = [...guaranteesNotForThisContract, ...guarantees];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAllGuarantees));
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement des garanties pour le contrat ${contractId}:`, error);
      return false;
    }
  }
  
  // La méthode resetToMockData est déjà définie plus haut dans la classe
}

// Exporter une instance unique du service
export const guaranteeService = new GuaranteeService();
