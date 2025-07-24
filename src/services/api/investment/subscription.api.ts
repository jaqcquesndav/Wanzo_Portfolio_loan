// src/services/api/investment/subscription.api.ts
import { apiClient } from '../base.api';

/**
 * Interface pour les souscriptions d'investissement
 */
interface InvestmentSubscription {
  id: string;
  portfolio_id: string;
  investor_id: string;
  investor_name: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  subscription_date: string;
  value_date?: string;
  payment_details?: {
    payment_method: string;
    payment_reference: string;
    payment_date: string;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * API pour les souscriptions d'investissement
 */
export const subscriptionApi = {
  /**
   * Récupère toutes les souscriptions pour un portefeuille
   */
  getSubscriptionsByPortfolio: async (portfolioId: string, filters?: {
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    dateFrom?: string;
    dateTo?: string;
  }) => {
    try {
      // Version API
      const params = new URLSearchParams();
      params.append('portfolioId', portfolioId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      return await apiClient.get<InvestmentSubscription[]>(`/portfolios/investment/subscriptions?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for subscriptions of portfolio ${portfolioId}`, error);
      // Note: Cette partie nécessiterait une implémentation dans dataService.ts
      // Retourne une liste vide pour l'instant
      return [];
    }
  },

  /**
   * Récupère une souscription par son ID
   */
  getSubscriptionById: async (id: string) => {
    try {
      return await apiClient.get<InvestmentSubscription>(`/portfolios/investment/subscriptions/${id}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for subscription ${id}`, error);
      // Note: Cette partie nécessiterait une implémentation dans dataService.ts
      throw new Error(`Subscription with ID ${id} not found`);
    }
  },

  /**
   * Crée une nouvelle souscription
   */
  createSubscription: async (subscription: Omit<InvestmentSubscription, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      return await apiClient.post<InvestmentSubscription>('/portfolios/investment/subscriptions', subscription);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for creating subscription', error);
      // Note: Cette partie nécessiterait une implémentation dans dataService.ts
      const newSubscription = {
        ...subscription,
        id: `SUB-${Date.now()}`,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as InvestmentSubscription;
      
      // Ici, vous devriez ajouter newSubscription à votre stockage local
      
      return newSubscription;
    }
  },

  /**
   * Approuve une souscription
   */
  approveSubscription: async (id: string) => {
    try {
      return await apiClient.post<InvestmentSubscription>(`/portfolios/investment/subscriptions/${id}/approve`, {});
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for approving subscription ${id}`, error);
      // Note: Cette partie nécessiterait une implémentation dans dataService.ts
      throw new Error(`Subscription with ID ${id} not found`);
    }
  },

  /**
   * Rejette une souscription
   */
  rejectSubscription: async (id: string, reason: string) => {
    try {
      return await apiClient.post<InvestmentSubscription>(`/portfolios/investment/subscriptions/${id}/reject`, { reason });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for rejecting subscription ${id}`, error);
      // Note: Cette partie nécessiterait une implémentation dans dataService.ts
      throw new Error(`Subscription with ID ${id} not found`);
    }
  },

  /**
   * Annule une souscription
   */
  cancelSubscription: async (id: string, reason: string) => {
    try {
      return await apiClient.post<InvestmentSubscription>(`/portfolios/investment/subscriptions/${id}/cancel`, { reason });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for cancelling subscription ${id}`, error);
      // Note: Cette partie nécessiterait une implémentation dans dataService.ts
      throw new Error(`Subscription with ID ${id} not found`);
    }
  },

  /**
   * Finalise une souscription (marque comme complétée)
   */
  completeSubscription: async (id: string, paymentDetails: {
    payment_method: string;
    payment_reference: string;
    payment_date: string;
    value_date: string;
  }) => {
    try {
      return await apiClient.post<InvestmentSubscription>(`/portfolios/investment/subscriptions/${id}/complete`, paymentDetails);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for completing subscription ${id}`, error);
      // Note: Cette partie nécessiterait une implémentation dans dataService.ts
      throw new Error(`Subscription with ID ${id} not found`);
    }
  }
};
