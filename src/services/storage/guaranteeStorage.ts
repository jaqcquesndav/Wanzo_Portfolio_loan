// src/services/storage/guaranteeStorage.ts
import { mockGuarantees } from '../../data/mockGuarantees';
import { Guarantee } from '../../types/guarantee';

// Clés de stockage pour les garanties
export const GUARANTEE_STORAGE_KEYS = {
  GUARANTEES: 'wanzo_guarantees'
};

/**
 * Service pour la gestion des données de garanties dans le localStorage
 */
class GuaranteeStorageService {
  /**
   * Initialise les données par défaut des garanties
   */
  async initializeDefaultData(): Promise<void> {
    try {
      // Vérifier si les données existent déjà
      const guaranteeData = localStorage.getItem(GUARANTEE_STORAGE_KEYS.GUARANTEES);
      
      // Initialiser les données de garanties si nécessaire
      if (!guaranteeData) {
        localStorage.setItem(GUARANTEE_STORAGE_KEYS.GUARANTEES, JSON.stringify(mockGuarantees));
        console.log('✅ Données de garanties initialisées');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des données de garanties:', error);
      throw error;
    }
  }
  
  /**
   * Récupère toutes les données de garanties
   */
  async getGuarantees(): Promise<Guarantee[]> {
    try {
      const storedData = localStorage.getItem(GUARANTEE_STORAGE_KEYS.GUARANTEES);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des données de garanties:', error);
      return [];
    }
  }
  
  /**
   * Récupère les garanties pour une entreprise spécifique
   */
  async getGuaranteesByCompany(companyName: string): Promise<Guarantee[]> {
    try {
      const allData = await this.getGuarantees();
      return allData.filter(guarantee => guarantee.company === companyName && guarantee.status === 'active');
    } catch (error) {
      console.error(`Erreur lors de la récupération des garanties pour l'entreprise ${companyName}:`, error);
      return [];
    }
  }
  
  /**
   * Ajoute une nouvelle garantie
   */
  async addGuarantee(guarantee: Guarantee): Promise<void> {
    try {
      const allData = await this.getGuarantees();
      allData.push(guarantee);
      localStorage.setItem(GUARANTEE_STORAGE_KEYS.GUARANTEES, JSON.stringify(allData));
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
      const allData = await this.getGuarantees();
      const index = allData.findIndex(g => g.id === guaranteeId);
      
      if (index === -1) {
        console.error(`Garantie avec ID=${guaranteeId} non trouvée`);
        return null;
      }
      
      // Mettre à jour la garantie
      const updatedGuarantee = {
        ...allData[index],
        ...updateData,
      };
      
      allData[index] = updatedGuarantee;
      localStorage.setItem(GUARANTEE_STORAGE_KEYS.GUARANTEES, JSON.stringify(allData));
      
      return updatedGuarantee;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la garantie ID=${guaranteeId}:`, error);
      throw error;
    }
  }
}

// Exporter l'instance du service
export const guaranteeStorageService = new GuaranteeStorageService();
