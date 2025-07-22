/**
 * Service de gestion des garanties
 * 
 * Ce service gère le stockage, la récupération et la manipulation des garanties
 * dans l'application. Il utilise le localStorage comme mécanisme de persistance.
 */

import { Guarantee } from './types';
import { mockGuarantees } from '../../data/mockGuarantees';

// Clé de stockage dans le localStorage
const STORAGE_KEY = 'wanzo_guarantees';

class GuaranteesStorageService {
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
   * Crée une nouvelle garantie
   * 
   * @param {Omit<Guarantee, 'id' | 'created_at'>} guaranteeData - Données de la garantie à créer
   * @returns {Promise<Guarantee | null>} La garantie créée ou null en cas d'erreur
   */
  async createGuarantee(guaranteeData: Omit<Guarantee, 'id' | 'created_at'>): Promise<Guarantee | null> {
    try {
      const guarantees = await this.getAllGuarantees();
      
      // Génération d'un identifiant unique basé sur le timestamp
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0].replace(/-/g, '');
      const counter = (guarantees.length + 1).toString().padStart(4, '0');
      const id = `GUAR-TRAD-${timestamp}-${counter}`;
      
      const newGuarantee: Guarantee = {
        ...guaranteeData,
        id,
        created_at: now.toISOString(),
      };
      
      const updatedGuarantees = [...guarantees, newGuarantee];
      await this.saveGuarantees(updatedGuarantees);
      
      return newGuarantee;
    } catch (error) {
      console.error('Erreur lors de la création de la garantie:', error);
      return null;
    }
  }

  /**
   * Supprime une garantie
   * 
   * @param {string} id - Identifiant unique de la garantie à supprimer
   * @returns {Promise<boolean>} Succès de l'opération
   */
  async deleteGuarantee(id: string): Promise<boolean> {
    try {
      const guarantees = await this.getAllGuarantees();
      const filteredGuarantees = guarantees.filter(g => g.id !== id);
      
      if (filteredGuarantees.length === guarantees.length) {
        throw new Error(`Garantie avec ID ${id} non trouvée`);
      }
      
      await this.saveGuarantees(filteredGuarantees);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la garantie ${id}:`, error);
      return false;
    }
  }

  /**
   * Réinitialise les données avec les valeurs par défaut
   * 
   * Cette méthode est utilisée pour initialiser ou réinitialiser
   * le stockage avec les données de garanties mock.
   * 
   * @returns {Promise<boolean>} Succès de l'opération
   */
  async initializeDefaultData(): Promise<boolean> {
    try {
      await this.saveGuarantees(mockGuarantees);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des données par défaut:', error);
      return false;
    }
  }
  
  /**
   * Réinitialise les données aux valeurs mock par défaut
   * 
   * Alias pour initializeDefaultData pour compatibilité avec useGuarantees
   * 
   * @returns {Promise<boolean>} Succès de l'opération
   */
  async resetToMockData(): Promise<boolean> {
    return this.initializeDefaultData();
  }

  /**
   * Sauvegarde les garanties dans le localStorage
   * 
   * @param {Guarantee[]} guarantees - Liste des garanties à sauvegarder
   * @returns {Promise<void>}
   * @private
   */
  private async saveGuarantees(guarantees: Guarantee[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guarantees));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des garanties:', error);
      throw error;
    }
  }
}

export const guaranteesStorageService = new GuaranteesStorageService();
