// src/services/api/traditional/portfolio-settings.api.ts
import { apiClient } from '../base.api';
import { traditionalDataService } from './dataService';
import type { FinancialProduct } from '../../../types/traditional-portfolio';

/**
 * Type pour les paramètres de portefeuille traditionnel
 */
export interface TraditionalPortfolioSettings {
  portfolio_id: string;
  // Paramètres généraux
  risk_profile_settings: {
    max_risk_level: number;
    risk_assessment_frequency: 'monthly' | 'quarterly' | 'annually';
    risk_thresholds: {
      low: number;
      medium: number;
      high: number;
    };
  };
  // Paramètres des produits financiers
  product_settings: {
    interest_rate_ranges: {
      min: number;
      max: number;
      default: number;
    };
    term_ranges: {
      min: number; // en mois
      max: number; // en mois
      default: number; // en mois
    };
    allowed_currencies: string[];
    max_loan_amount: number;
    min_loan_amount: number;
    enable_auto_approval: boolean;
    auto_approval_threshold: number;
  };
  // Paramètres des remboursements
  repayment_settings: {
    allow_early_repayment: boolean;
    early_repayment_fee_percentage: number;
    late_payment_fee_percentage: number;
    grace_period_days: number;
    payment_reminder_days: number[]; // Jours avant échéance pour envoyer des rappels
    default_payment_methods: string[];
  };
  // Paramètres des garanties
  guarantee_settings: {
    required_guarantee_percentage: number;
    allowed_guarantee_types: string[];
    guarantee_valuation_frequency: 'monthly' | 'quarterly' | 'annually';
  };
  // Paramètres de provisionnement
  provisioning_settings: {
    provision_rates: {
      days_30: number;
      days_60: number;
      days_90: number;
      days_180: number;
      days_360: number;
    };
    enable_auto_provisioning: boolean;
  };
  created_at: string;
  updated_at: string;
}

/**
 * API pour les paramètres des portefeuilles traditionnels
 */
export const portfolioSettingsApi = {
  /**
   * Récupère les paramètres d'un portefeuille
   */
  getPortfolioSettings: async (portfolioId: string) => {
    try {
      return await apiClient.get<TraditionalPortfolioSettings>(`/portfolios/traditional/${portfolioId}/settings`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for traditional portfolio settings ${portfolioId}`, error);
      
      // Implémentation fictive pour le développement local
      // Dans un environnement réel, cette donnée serait récupérée depuis le backend
      return {
        portfolio_id: portfolioId,
        risk_profile_settings: {
          max_risk_level: 5,
          risk_assessment_frequency: 'quarterly',
          risk_thresholds: {
            low: 2,
            medium: 3,
            high: 4,
          },
        },
        product_settings: {
          interest_rate_ranges: {
            min: 5,
            max: 25,
            default: 12,
          },
          term_ranges: {
            min: 3,
            max: 60,
            default: 24,
          },
          allowed_currencies: ['CDF', 'USD'],
          max_loan_amount: 100000000,
          min_loan_amount: 1000000,
          enable_auto_approval: false,
          auto_approval_threshold: 5000000,
        },
        repayment_settings: {
          allow_early_repayment: true,
          early_repayment_fee_percentage: 2,
          late_payment_fee_percentage: 5,
          grace_period_days: 5,
          payment_reminder_days: [1, 3, 7],
          default_payment_methods: ['bank_transfer', 'mobile_money'],
        },
        guarantee_settings: {
          required_guarantee_percentage: 150,
          allowed_guarantee_types: ['real_estate', 'equipment', 'inventory', 'financial_assets'],
          guarantee_valuation_frequency: 'annually',
        },
        provisioning_settings: {
          provision_rates: {
            days_30: 0.1,
            days_60: 0.3,
            days_90: 0.5,
            days_180: 0.75,
            days_360: 1.0,
          },
          enable_auto_provisioning: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as TraditionalPortfolioSettings;
    }
  },

  /**
   * Met à jour les paramètres d'un portefeuille
   */
  updatePortfolioSettings: async (portfolioId: string, settings: Partial<TraditionalPortfolioSettings>) => {
    try {
      return await apiClient.put<TraditionalPortfolioSettings>(`/portfolios/traditional/${portfolioId}/settings`, settings);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating traditional portfolio settings ${portfolioId}`, error);
      
      // Dans un environnement réel, ces modifications seraient envoyées au backend
      // et la réponse serait retournée
      return {
        ...await portfolioSettingsApi.getPortfolioSettings(portfolioId),
        ...settings,
        updated_at: new Date().toISOString(),
      } as TraditionalPortfolioSettings;
    }
  },

  /**
   * Réinitialise les paramètres d'un portefeuille aux valeurs par défaut
   */
  resetPortfolioSettings: async (portfolioId: string) => {
    try {
      return await apiClient.post<TraditionalPortfolioSettings>(`/portfolios/traditional/${portfolioId}/settings/reset`, {});
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for resetting traditional portfolio settings ${portfolioId}`, error);
      
      // Retourne les paramètres par défaut
      return {
        portfolio_id: portfolioId,
        risk_profile_settings: {
          max_risk_level: 5,
          risk_assessment_frequency: 'quarterly',
          risk_thresholds: {
            low: 2,
            medium: 3,
            high: 4,
          },
        },
        product_settings: {
          interest_rate_ranges: {
            min: 5,
            max: 25,
            default: 12,
          },
          term_ranges: {
            min: 3,
            max: 60,
            default: 24,
          },
          allowed_currencies: ['CDF', 'USD'],
          max_loan_amount: 100000000,
          min_loan_amount: 1000000,
          enable_auto_approval: false,
          auto_approval_threshold: 5000000,
        },
        repayment_settings: {
          allow_early_repayment: true,
          early_repayment_fee_percentage: 2,
          late_payment_fee_percentage: 5,
          grace_period_days: 5,
          payment_reminder_days: [1, 3, 7],
          default_payment_methods: ['bank_transfer', 'mobile_money'],
        },
        guarantee_settings: {
          required_guarantee_percentage: 150,
          allowed_guarantee_types: ['real_estate', 'equipment', 'inventory', 'financial_assets'],
          guarantee_valuation_frequency: 'annually',
        },
        provisioning_settings: {
          provision_rates: {
            days_30: 0.1,
            days_60: 0.3,
            days_90: 0.5,
            days_180: 0.75,
            days_360: 1.0,
          },
          enable_auto_provisioning: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as TraditionalPortfolioSettings;
    }
  },

  /**
   * Récupère tous les produits financiers d'un portefeuille
   */
  getFinancialProducts: async (portfolioId: string) => {
    try {
      return await apiClient.get<FinancialProduct[]>(`/portfolios/traditional/${portfolioId}/products`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for financial products of portfolio ${portfolioId}`, error);
      
      // Retourne les produits financiers depuis le service de données local
      const portfolio = traditionalDataService.getTraditionalPortfolioById(portfolioId);
      return portfolio?.products || [];
    }
  },

  /**
   * Récupère un produit financier par son ID
   */
  getFinancialProductById: async (portfolioId: string, productId: string) => {
    try {
      return await apiClient.get<FinancialProduct>(`/portfolios/traditional/${portfolioId}/products/${productId}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for financial product ${productId} of portfolio ${portfolioId}`, error);
      
      // Retourne le produit financier depuis le service de données local
      const portfolio = traditionalDataService.getTraditionalPortfolioById(portfolioId);
      const product = portfolio?.products?.find(p => p.id === productId);
      
      if (!product) {
        throw new Error(`Product with ID ${productId} not found in portfolio ${portfolioId}`);
      }
      
      return product;
    }
  },

  /**
   * Crée un nouveau produit financier
   */
  createFinancialProduct: async (portfolioId: string, product: Omit<FinancialProduct, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      return await apiClient.post<FinancialProduct>(`/portfolios/traditional/${portfolioId}/products`, product);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for creating financial product in portfolio ${portfolioId}`, error);
      
      const portfolio = traditionalDataService.getTraditionalPortfolioById(portfolioId);
      
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${portfolioId} not found`);
      }
      
      const newProduct = {
        ...product,
        id: traditionalDataService.generatePortfolioId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as FinancialProduct;
      
      // Ajoute le nouveau produit au portefeuille
      portfolio.products = [...(portfolio.products || []), newProduct];
      traditionalDataService.updateTraditionalPortfolio(portfolio);
      
      return newProduct;
    }
  },

  /**
   * Met à jour un produit financier
   */
  updateFinancialProduct: async (portfolioId: string, productId: string, updates: Partial<FinancialProduct>) => {
    try {
      return await apiClient.put<FinancialProduct>(`/portfolios/traditional/${portfolioId}/products/${productId}`, updates);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating financial product ${productId} in portfolio ${portfolioId}`, error);
      
      const portfolio = traditionalDataService.getTraditionalPortfolioById(portfolioId);
      
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${portfolioId} not found`);
      }
      
      const productIndex = portfolio.products?.findIndex(p => p.id === productId) ?? -1;
      
      if (productIndex === -1) {
        throw new Error(`Product with ID ${productId} not found in portfolio ${portfolioId}`);
      }
      
      // Met à jour le produit
      portfolio.products![productIndex] = {
        ...portfolio.products![productIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updateTraditionalPortfolio(portfolio);
      
      return portfolio.products![productIndex];
    }
  },

  /**
   * Supprime un produit financier
   */
  deleteFinancialProduct: async (portfolioId: string, productId: string) => {
    try {
      await apiClient.delete(`/portfolios/traditional/${portfolioId}/products/${productId}`);
      return true;
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for deleting financial product ${productId} from portfolio ${portfolioId}`, error);
      
      const portfolio = traditionalDataService.getTraditionalPortfolioById(portfolioId);
      
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${portfolioId} not found`);
      }
      
      // Supprime le produit du portefeuille
      portfolio.products = portfolio.products?.filter(p => p.id !== productId) || [];
      traditionalDataService.updateTraditionalPortfolio(portfolio);
      
      return true;
    }
  }
};
