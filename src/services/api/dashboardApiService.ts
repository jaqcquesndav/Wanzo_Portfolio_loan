import { ApiService } from './apiService';
import { API_ENDPOINTS } from './apiConfig';
import type { PortfolioOperation } from '../../components/dashboard/RecentOperationsTable';
import type { PortfolioType } from '../../types/portfolio';

/**
 * Interface pour le résumé des opérations
 */
export interface OperationsSummary {
  today: {
    count: number;
    amount: number;
  };
  pending: {
    count: number;
    amount: number;
  };
  completed: {
    count: number;
    amount: number;
  };
  failed: {
    count: number;
    amount: number;
  };
}

/**
 * Service API pour les opérations du dashboard
 */
export class DashboardApiService {
  /**
   * Récupère toutes les opérations récentes
   */
  static async getRecentOperations(portfolioType?: PortfolioType): Promise<PortfolioOperation[]> {
    try {
      const params = portfolioType ? { type: portfolioType } : undefined;
      const response = await ApiService.get<PortfolioOperation[]>(API_ENDPOINTS.OPERATIONS, params);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des opérations:', error);
      throw error;
    }
  }
  
  /**
   * Récupère les opérations d'un portefeuille spécifique
   */
  static async getPortfolioOperations(portfolioId: string): Promise<PortfolioOperation[]> {
    try {
      const endpoint = API_ENDPOINTS.PORTFOLIO_OPERATIONS(portfolioId);
      const response = await ApiService.get<PortfolioOperation[]>(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des opérations du portefeuille ${portfolioId}:`, error);
      throw error;
    }
  }
  
  /**
   * Récupère un résumé des opérations
   */
  static async getOperationsSummary(portfolioType?: PortfolioType): Promise<OperationsSummary> {
    try {
      const params = portfolioType ? { type: portfolioType } : undefined;
      const response = await ApiService.get<OperationsSummary>(API_ENDPOINTS.OPERATIONS_SUMMARY, params);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé des opérations:', error);
      throw error;
    }
  }
  
  /**
   * Crée une nouvelle opération
   */
  static async createOperation(operation: Omit<PortfolioOperation, 'id'>): Promise<PortfolioOperation> {
    try {
      const response = await ApiService.post<PortfolioOperation, Omit<PortfolioOperation, 'id'>>(
        API_ENDPOINTS.OPERATIONS, 
        operation
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création d\'une opération:', error);
      throw error;
    }
  }
  
  /**
   * Met à jour une opération existante
   */
  static async updateOperation(id: string, operation: Partial<PortfolioOperation>): Promise<PortfolioOperation> {
    try {
      const endpoint = `${API_ENDPOINTS.OPERATIONS}/${id}`;
      const response = await ApiService.put<PortfolioOperation, Partial<PortfolioOperation>>(
        endpoint, 
        operation
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'opération ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Supprime une opération
   */
  static async deleteOperation(id: string): Promise<void> {
    try {
      const endpoint = `${API_ENDPOINTS.OPERATIONS}/${id}`;
      await ApiService.delete(endpoint);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'opération ${id}:`, error);
      throw error;
    }
  }
}
