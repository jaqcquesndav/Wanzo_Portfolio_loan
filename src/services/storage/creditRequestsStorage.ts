// src/services/storage/creditRequestsStorage.ts
import { CreditRequest, CreditRequestStatus } from '../../types/credit';
import { mockCreditRequests as initialMockData } from '../../data';

const STORAGE_KEYS = {
  CREDIT_REQUESTS: 'credit_requests'
};

/**
 * Service de gestion des demandes de crédit dans le localStorage
 */
export const creditRequestsStorageService = {
  /**
   * Initialise les données dans le localStorage si elles n'existent pas déjà
   */
  init(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CREDIT_REQUESTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.CREDIT_REQUESTS, JSON.stringify(initialMockData));
        console.log('[DEBUG] Credit requests initialized in localStorage');
      }
    } catch (error) {
      console.error('Error initializing credit requests in localStorage:', error);
    }
  },

  /**
   * Récupère toutes les demandes de crédit
   */
  async getAllRequests(): Promise<CreditRequest[]> {
    try {
      this.init(); // S'assurer que les données sont initialisées
      const stored = localStorage.getItem(STORAGE_KEYS.CREDIT_REQUESTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting credit requests from localStorage:', error);
      return [];
    }
  },

  /**
   * Récupère une demande de crédit par son identifiant
   */
  async getRequestById(id: string): Promise<CreditRequest | undefined> {
    try {
      const requests = await this.getAllRequests();
      return requests.find(request => request.id === id);
    } catch (error) {
      console.error(`Error getting credit request with id ${id} from localStorage:`, error);
      return undefined;
    }
  },

  /**
   * Ajoute une nouvelle demande de crédit
   */
  async addRequest(request: CreditRequest): Promise<CreditRequest> {
    try {
      const requests = await this.getAllRequests();
      requests.push(request);
      localStorage.setItem(STORAGE_KEYS.CREDIT_REQUESTS, JSON.stringify(requests));
      return request;
    } catch (error) {
      console.error('Error adding credit request to localStorage:', error);
      throw error;
    }
  },

  /**
   * Met à jour une demande de crédit existante
   */
  async updateRequest(id: string, updates: Partial<CreditRequest>): Promise<CreditRequest | undefined> {
    try {
      const requests = await this.getAllRequests();
      const index = requests.findIndex(request => request.id === id);
      
      if (index !== -1) {
        requests[index] = { 
          ...requests[index], 
          ...updates,
          updatedAt: new Date().toISOString() 
        };
        localStorage.setItem(STORAGE_KEYS.CREDIT_REQUESTS, JSON.stringify(requests));
        return requests[index];
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error updating credit request with id ${id} in localStorage:`, error);
      throw error;
    }
  },

  /**
   * Met à jour le statut d'une demande de crédit
   */
  async updateRequestStatus(id: string, status: CreditRequestStatus): Promise<CreditRequest | undefined> {
    return this.updateRequest(id, { status });
  },

  /**
   * Supprime une demande de crédit
   */
  async deleteRequest(id: string): Promise<boolean> {
    try {
      const requests = await this.getAllRequests();
      const updatedRequests = requests.filter(request => request.id !== id);
      localStorage.setItem(STORAGE_KEYS.CREDIT_REQUESTS, JSON.stringify(updatedRequests));
      return true;
    } catch (error) {
      console.error(`Error deleting credit request with id ${id} from localStorage:`, error);
      throw error;
    }
  },

  /**
   * Réinitialise les données de demandes de crédit aux valeurs initiales
   */
  async resetToMockData(): Promise<CreditRequest[]> {
    try {
      localStorage.setItem(STORAGE_KEYS.CREDIT_REQUESTS, JSON.stringify(initialMockData));
      return initialMockData;
    } catch (error) {
      console.error('Error resetting credit requests to mock data:', error);
      throw error;
    }
  }
};
