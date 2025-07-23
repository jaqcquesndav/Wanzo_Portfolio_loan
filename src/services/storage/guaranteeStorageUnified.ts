// src/services/storage/guaranteeStorageUnified.ts
import { Guarantee } from '../../types/guarantee';
import { mockGuarantees } from '../../data/mockGuarantees';

// Clé de stockage dans le localStorage
const STORAGE_KEY = 'wanzo_guarantees';

class GuaranteeStorageService {
  /**
   * Récupère toutes les garanties stockées
   * 
   * Si aucune garantie n'est trouvée, initialise le stockage avec les données par défaut.
   * 
   * @returns {Promise<Guarantee[]>} Liste des garanties
   */
  async getAllGuarantees(): Promise<Guarantee[]> {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        return JSON.parse(storedData);
      } else {
        // Utiliser les données mock et les sauvegarder
        await this.initializeDefaultData();
        return mockGuarantees;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des garanties:', error);
      return [];
    }
  }

  /**
   * Récupère une garantie spécifique par son ID
   * 
   * @param {string} id - Identifiant unique de la garantie
   * @returns {Promise<Guarantee | null>} La garantie trouvée ou null si non trouvée
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
   * Met à jour une garantie existante
   * 
   * @param {string} id - Identifiant unique de la garantie à mettre à jour
   * @param {Partial<Guarantee>} updatedData - Données partielles de mise à jour
   * @returns {Promise<Guarantee | null>} La garantie mise à jour ou null en cas d'erreur
   */
  async updateGuarantee(id: string, updatedData: Partial<Guarantee>): Promise<Guarantee | null> {
    try {
      const guarantees = await this.getAllGuarantees();
      const index = guarantees.findIndex(g => g.id === id);
      
      if (index === -1) {
        throw new Error(`Garantie avec ID ${id} non trouvée`);
      }
      
      const updatedGuarantee = { ...guarantees[index], ...updatedData };
      guarantees[index] = updatedGuarantee;
      
      await this.saveGuarantees(guarantees);
      return updatedGuarantee;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la garantie ${id}:`, error);
      return null;
    }
  }

  /**
   * Enregistre toutes les garanties dans le localStorage
   * 
   * @param {Guarantee[]} guarantees - Liste des garanties à sauvegarder
   * @returns {Promise<void>}
   */
  async saveGuarantees(guarantees: Guarantee[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guarantees));
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des garanties:', error);
      throw error;
    }
  }

  /**
   * Supprime une garantie
   * 
   * @param {string} id - Identifiant unique de la garantie à supprimer
   * @returns {Promise<boolean>} true si la suppression a réussi, false sinon
   */
  async deleteGuarantee(id: string): Promise<boolean> {
    try {
      const guarantees = await this.getAllGuarantees();
      const initialLength = guarantees.length;
      const filteredGuarantees = guarantees.filter(g => g.id !== id);
      
      if (filteredGuarantees.length === initialLength) {
        console.warn(`Aucune garantie trouvée avec l'ID ${id}`);
        return false;
      }
      
      await this.saveGuarantees(filteredGuarantees);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la garantie ${id}:`, error);
      return false;
    }
  }

  /**
   * Initialise les données par défaut des garanties
   * 
   * @returns {Promise<boolean>} true si l'initialisation a réussi, false sinon
   */
  async initializeDefaultData(): Promise<boolean> {
    try {
      console.log('🔄 Vérification des données de garanties...');
      
      // Vérifier si les données existent déjà
      const existingData = localStorage.getItem(STORAGE_KEY);
      if (existingData) {
        const guarantees = JSON.parse(existingData);
        console.log(`✅ Données de garanties déjà présentes (${guarantees.length} garanties)`);
        
        // Vérifier si la garantie G001 de trad-1 existe
        const hasG001 = guarantees.some((g: Guarantee) => g.id === 'G001' && g.portfolioId === 'trad-1');
        if (!hasG001) {
          console.warn('⚠️ Garantie G001 du portfolio trad-1 non trouvée dans les données existantes');
        }
        
        return true;
      }
      
      // Sinon, initialiser avec les données mock
      console.log('🔄 Initialisation des données de garanties...');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockGuarantees));
      console.log(`✅ Données de garanties initialisées avec succès (${mockGuarantees.length} garanties)`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des données de garanties:', error);
      return false;
    }
  }

  /**
   * Réinitialise les données avec les données mock
   * 
   * @returns {Promise<boolean>} true si la réinitialisation a réussi, false sinon
   */
  async resetToMockData(): Promise<boolean> {
    return this.initializeDefaultData();
  }

  /**
   * Récupère les garanties pour un portefeuille spécifique
   * 
   * @param {string} portfolioId - Identifiant du portefeuille
   * @returns {Promise<Guarantee[]>} Liste des garanties filtrées par portefeuille
   */
  async getGuaranteesByPortfolio(portfolioId: string): Promise<Guarantee[]> {
    try {
      const guarantees = await this.getAllGuarantees();
      
      // Si portfolioId === 'default', retourner toutes les garanties
      if (portfolioId === 'default') {
        return guarantees;
      }
      
      // Sinon, filtrer par portfolioId
      return guarantees.filter(g => g.portfolioId === portfolioId);
    } catch (error) {
      console.error(`Erreur lors de la récupération des garanties pour le portefeuille ${portfolioId}:`, error);
      return [];
    }
  }

  /**
   * Récupère les garanties pour un contrat spécifique
   * 
   * @param {string} contractId - Identifiant ou référence du contrat
   * @returns {Promise<Guarantee[]>} Liste des garanties filtrées par contrat
   */
  async getGuaranteesByContract(contractId: string): Promise<Guarantee[]> {
    try {
      const guarantees = await this.getAllGuarantees();
      
      return guarantees.filter(g => 
        g.contractId === contractId || 
        g.contractReference === contractId
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération des garanties pour le contrat ${contractId}:`, error);
      return [];
    }
  }
}

// Exporter l'instance du service
export const guaranteeStorageService = new GuaranteeStorageService();
