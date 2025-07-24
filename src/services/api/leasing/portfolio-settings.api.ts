// src/services/api/leasing/portfolio-settings.api.ts
import { apiClient } from '../base.api';
import { leasingDataService } from './dataService';
import { LeasingPortfolio } from '../../../types/leasing';

/**
 * Type pour les paramètres de portefeuille de leasing
 */
export interface LeasingPortfolioSettings {
  portfolio_id: string;
  // Paramètres généraux
  leasing_terms: {
    min_duration: number; // en mois
    max_duration: number; // en mois
    default_duration: number; // en mois
    interest_rate_range: {
      min: number;
      max: number;
      default: number;
    };
    maintenance_included: boolean;
    insurance_required: boolean;
    deposit_percentage: number;
    residual_value_percentage: number;
  };
  // Paramètres des équipements
  equipment_settings: {
    depreciation_method: 'straight_line' | 'declining_balance' | 'sum_of_years_digits';
    depreciation_rates: Record<string, number>; // Taux de dépréciation par catégorie d'équipement
    equipment_categories: string[];
    max_equipment_age: number; // en années
    inspection_frequency: 'monthly' | 'quarterly' | 'bi-annually' | 'annually';
  };
  // Paramètres des incidents
  incident_settings: {
    incident_priority_levels: string[];
    response_time_requirements: Record<string, number>; // Temps de réponse requis en heures par niveau de priorité
    incident_types: string[];
    enable_auto_incident_assignment: boolean;
  };
  // Paramètres de maintenance
  maintenance_settings: {
    maintenance_frequency: Record<string, number>; // Fréquence de maintenance en jours par catégorie d'équipement
    maintenance_types: string[];
    enable_preventive_maintenance: boolean;
    preventive_maintenance_schedule: {
      frequency: 'monthly' | 'quarterly' | 'bi-annually' | 'annually';
      day_of_month?: number;
      month_of_year?: number[];
    };
  };
  // Paramètres des paiements
  payment_settings: {
    payment_frequency: 'monthly' | 'quarterly' | 'bi-annually' | 'annually';
    late_payment_fee_percentage: number;
    grace_period_days: number;
    payment_reminder_days: number[]; // Jours avant échéance pour envoyer des rappels
    default_payment_methods: string[];
  };
  created_at: string;
  updated_at: string;
}

/**
 * Type pour les options de maintenance
 */
export interface MaintenanceOption {
  id: string;
  portfolio_id: string;
  name: string;
  description?: string;
  included_services: string[];
  price_percentage: number; // pourcentage du montant du leasing
  service_intervals: number; // en mois
  created_at: string;
  updated_at: string;
}

/**
 * Type pour les options d'assurance
 */
export interface InsuranceOption {
  id: string;
  portfolio_id: string;
  name: string;
  description?: string;
  coverage_types: string[];
  price_percentage: number; // pourcentage du montant du leasing
  minimum_coverage: number; // pourcentage de la valeur de l'équipement
  provider?: string;
  created_at: string;
  updated_at: string;
}

/**
 * API pour les paramètres des portefeuilles de leasing
 */
export const portfolioSettingsApi = {
  /**
   * Récupère les paramètres d'un portefeuille de leasing
   */
  getPortfolioSettings: async (portfolioId: string) => {
    try {
      return await apiClient.get<LeasingPortfolioSettings>(`/portfolios/leasing/${portfolioId}/settings`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for leasing portfolio settings ${portfolioId}`, error);
      
      // Implémentation fictive pour le développement local
      return {
        portfolio_id: portfolioId,
        leasing_terms: {
          min_duration: 12,
          max_duration: 60,
          default_duration: 36,
          interest_rate_range: {
            min: 4,
            max: 20,
            default: 10,
          },
          maintenance_included: true,
          insurance_required: true,
          deposit_percentage: 10,
          residual_value_percentage: 15,
        },
        equipment_settings: {
          depreciation_method: 'straight_line',
          depreciation_rates: {
            'IT_equipment': 0.25,
            'vehicles': 0.2,
            'heavy_machinery': 0.15,
            'office_equipment': 0.2,
          },
          equipment_categories: ['IT_equipment', 'vehicles', 'heavy_machinery', 'office_equipment'],
          max_equipment_age: 5,
          inspection_frequency: 'quarterly',
        },
        incident_settings: {
          incident_priority_levels: ['low', 'medium', 'high', 'critical'],
          response_time_requirements: {
            'low': 48,
            'medium': 24,
            'high': 8,
            'critical': 4,
          },
          incident_types: ['breakdown', 'damage', 'theft', 'loss', 'performance_issue'],
          enable_auto_incident_assignment: true,
        },
        maintenance_settings: {
          maintenance_frequency: {
            'IT_equipment': 90, // tous les 3 mois
            'vehicles': 60, // tous les 2 mois
            'heavy_machinery': 30, // tous les mois
            'office_equipment': 180, // tous les 6 mois
          },
          maintenance_types: ['preventive', 'corrective', 'emergency'],
          enable_preventive_maintenance: true,
          preventive_maintenance_schedule: {
            frequency: 'quarterly',
            day_of_month: 15,
          },
        },
        payment_settings: {
          payment_frequency: 'monthly',
          late_payment_fee_percentage: 5,
          grace_period_days: 5,
          payment_reminder_days: [1, 3, 7],
          default_payment_methods: ['bank_transfer', 'mobile_money', 'direct_debit'],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as LeasingPortfolioSettings;
    }
  },

  /**
   * Met à jour les paramètres d'un portefeuille de leasing
   */
  updatePortfolioSettings: async (portfolioId: string, settings: Partial<LeasingPortfolioSettings>) => {
    try {
      return await apiClient.put<LeasingPortfolioSettings>(`/portfolios/leasing/${portfolioId}/settings`, settings);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating leasing portfolio settings ${portfolioId}`, error);
      
      // Dans un environnement réel, ces modifications seraient envoyées au backend
      return {
        ...await portfolioSettingsApi.getPortfolioSettings(portfolioId),
        ...settings,
        updated_at: new Date().toISOString(),
      } as LeasingPortfolioSettings;
    }
  },

  /**
   * Réinitialise les paramètres d'un portefeuille de leasing aux valeurs par défaut
   */
  resetPortfolioSettings: async (portfolioId: string) => {
    try {
      return await apiClient.post<LeasingPortfolioSettings>(`/portfolios/leasing/${portfolioId}/settings/reset`, {});
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for resetting leasing portfolio settings ${portfolioId}`, error);
      
      // Retourne les paramètres par défaut
      return {
        portfolio_id: portfolioId,
        leasing_terms: {
          min_duration: 12,
          max_duration: 60,
          default_duration: 36,
          interest_rate_range: {
            min: 4,
            max: 20,
            default: 10,
          },
          maintenance_included: true,
          insurance_required: true,
          deposit_percentage: 10,
          residual_value_percentage: 15,
        },
        equipment_settings: {
          depreciation_method: 'straight_line',
          depreciation_rates: {
            'IT_equipment': 0.25,
            'vehicles': 0.2,
            'heavy_machinery': 0.15,
            'office_equipment': 0.2,
          },
          equipment_categories: ['IT_equipment', 'vehicles', 'heavy_machinery', 'office_equipment'],
          max_equipment_age: 5,
          inspection_frequency: 'quarterly',
        },
        incident_settings: {
          incident_priority_levels: ['low', 'medium', 'high', 'critical'],
          response_time_requirements: {
            'low': 48,
            'medium': 24,
            'high': 8,
            'critical': 4,
          },
          incident_types: ['breakdown', 'damage', 'theft', 'loss', 'performance_issue'],
          enable_auto_incident_assignment: true,
        },
        maintenance_settings: {
          maintenance_frequency: {
            'IT_equipment': 90, // tous les 3 mois
            'vehicles': 60, // tous les 2 mois
            'heavy_machinery': 30, // tous les mois
            'office_equipment': 180, // tous les 6 mois
          },
          maintenance_types: ['preventive', 'corrective', 'emergency'],
          enable_preventive_maintenance: true,
          preventive_maintenance_schedule: {
            frequency: 'quarterly',
            day_of_month: 15,
          },
        },
        payment_settings: {
          payment_frequency: 'monthly',
          late_payment_fee_percentage: 5,
          grace_period_days: 5,
          payment_reminder_days: [1, 3, 7],
          default_payment_methods: ['bank_transfer', 'mobile_money', 'direct_debit'],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as LeasingPortfolioSettings;
    }
  },

  /**
   * Récupère toutes les options de maintenance d'un portefeuille
   */
  getMaintenanceOptions: async (portfolioId: string) => {
    try {
      return await apiClient.get<MaintenanceOption[]>(`/portfolios/leasing/${portfolioId}/maintenance-options`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for maintenance options of portfolio ${portfolioId}`, error);
      
      // Retourne les options de maintenance depuis le service de données local
      const portfolio = leasingDataService.getLeasingPortfolioById(portfolioId);
      return (portfolio as LeasingPortfolio)?.maintenance_options || [];
    }
  },

  /**
   * Récupère une option de maintenance par son ID
   */
  getMaintenanceOptionById: async (portfolioId: string, optionId: string) => {
    try {
      return await apiClient.get<MaintenanceOption>(`/portfolios/leasing/${portfolioId}/maintenance-options/${optionId}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for maintenance option ${optionId} of portfolio ${portfolioId}`, error);
      
      // Retourne l'option de maintenance depuis le service de données local
      const portfolio = leasingDataService.getLeasingPortfolioById(portfolioId);
      const option = (portfolio as LeasingPortfolio)?.maintenance_options?.find(o => o.id === optionId);
      
      if (!option) {
        throw new Error(`Maintenance option with ID ${optionId} not found in portfolio ${portfolioId}`);
      }
      
      return option;
    }
  },

  /**
   * Crée une nouvelle option de maintenance
   */
  createMaintenanceOption: async (portfolioId: string, option: Omit<MaintenanceOption, 'id' | 'portfolio_id' | 'created_at' | 'updated_at'>) => {
    try {
      return await apiClient.post<MaintenanceOption>(`/portfolios/leasing/${portfolioId}/maintenance-options`, option);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for creating maintenance option in portfolio ${portfolioId}`, error);
      
      const portfolio = leasingDataService.getLeasingPortfolioById(portfolioId);
      
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${portfolioId} not found`);
      }
      
      const newOption = {
        ...option,
        id: leasingDataService.generatePortfolioId(), // Utiliser une méthode qui existe
        portfolio_id: portfolioId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as MaintenanceOption;
      
      // Ajoute la nouvelle option de maintenance au portefeuille
      const typedPortfolio = portfolio as LeasingPortfolio;
      typedPortfolio.maintenance_options = [...(typedPortfolio.maintenance_options || []), newOption];
      leasingDataService.updateLeasingPortfolio(typedPortfolio);
      
      return newOption;
    }
  },

  /**
   * Met à jour une option de maintenance
   */
  updateMaintenanceOption: async (portfolioId: string, optionId: string, updates: Partial<MaintenanceOption>) => {
    try {
      return await apiClient.put<MaintenanceOption>(`/portfolios/leasing/${portfolioId}/maintenance-options/${optionId}`, updates);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating maintenance option ${optionId} in portfolio ${portfolioId}`, error);
      
      const portfolio = leasingDataService.getLeasingPortfolioById(portfolioId);
      
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${portfolioId} not found`);
      }
      
      const typedPortfolio = portfolio as LeasingPortfolio;
      const optionIndex = typedPortfolio.maintenance_options?.findIndex(o => o.id === optionId) ?? -1;
      
      if (optionIndex === -1) {
        throw new Error(`Maintenance option with ID ${optionId} not found in portfolio ${portfolioId}`);
      }
      
      // Assurons-nous que maintenance_options existe
      if (!typedPortfolio.maintenance_options) {
        typedPortfolio.maintenance_options = [];
      }
      
      // Met à jour l'option de maintenance
      typedPortfolio.maintenance_options[optionIndex] = {
        ...typedPortfolio.maintenance_options[optionIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      leasingDataService.updateLeasingPortfolio(typedPortfolio);
      
      // Assurons-nous que maintenance_options existe avant de retourner
      return typedPortfolio.maintenance_options?.[optionIndex];
    }
  },

  /**
   * Supprime une option de maintenance
   */
  deleteMaintenanceOption: async (portfolioId: string, optionId: string) => {
    try {
      await apiClient.delete(`/portfolios/leasing/${portfolioId}/maintenance-options/${optionId}`);
      return true;
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for deleting maintenance option ${optionId} from portfolio ${portfolioId}`, error);
      
      const portfolio = leasingDataService.getLeasingPortfolioById(portfolioId);
      
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${portfolioId} not found`);
      }
      
      // Supprime l'option de maintenance du portefeuille
      const typedPortfolio = portfolio as LeasingPortfolio;
      typedPortfolio.maintenance_options = typedPortfolio.maintenance_options?.filter(o => o.id !== optionId) || [];
      leasingDataService.updateLeasingPortfolio(typedPortfolio);
      
      return true;
    }
  },

  /**
   * Récupère toutes les options d'assurance d'un portefeuille
   */
  getInsuranceOptions: async (portfolioId: string) => {
    try {
      return await apiClient.get<InsuranceOption[]>(`/portfolios/leasing/${portfolioId}/insurance-options`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for insurance options of portfolio ${portfolioId}`, error);
      
      // Retourne les options d'assurance depuis le service de données local
      const portfolio = leasingDataService.getLeasingPortfolioById(portfolioId);
      return (portfolio as LeasingPortfolio)?.insurance_options || [];
    }
  },

  /**
   * Récupère une option d'assurance par son ID
   */
  getInsuranceOptionById: async (portfolioId: string, optionId: string) => {
    try {
      return await apiClient.get<InsuranceOption>(`/portfolios/leasing/${portfolioId}/insurance-options/${optionId}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for insurance option ${optionId} of portfolio ${portfolioId}`, error);
      
      // Retourne l'option d'assurance depuis le service de données local
      const portfolio = leasingDataService.getLeasingPortfolioById(portfolioId);
      const typedPortfolio = portfolio as LeasingPortfolio;
      const option = typedPortfolio?.insurance_options?.find(o => o.id === optionId);
      
      if (!option) {
        throw new Error(`Insurance option with ID ${optionId} not found in portfolio ${portfolioId}`);
      }
      
      return option;
    }
  },

  /**
   * Crée une nouvelle option d'assurance
   */
  createInsuranceOption: async (portfolioId: string, option: Omit<InsuranceOption, 'id' | 'portfolio_id' | 'created_at' | 'updated_at'>) => {
    try {
      return await apiClient.post<InsuranceOption>(`/portfolios/leasing/${portfolioId}/insurance-options`, option);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for creating insurance option in portfolio ${portfolioId}`, error);
      
      const portfolio = leasingDataService.getLeasingPortfolioById(portfolioId);
      
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${portfolioId} not found`);
      }
      
      const newOption = {
        ...option,
        id: leasingDataService.generatePortfolioId(), // Utiliser generatePortfolioId à la place
        portfolio_id: portfolioId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as InsuranceOption;
      
      // Ajoute la nouvelle option d'assurance au portefeuille
      const typedPortfolio = portfolio as LeasingPortfolio;
      typedPortfolio.insurance_options = [...(typedPortfolio.insurance_options || []), newOption];
      leasingDataService.updateLeasingPortfolio(typedPortfolio);
      
      return newOption;
    }
  },

  /**
   * Met à jour une option d'assurance
   */
  updateInsuranceOption: async (portfolioId: string, optionId: string, updates: Partial<InsuranceOption>) => {
    try {
      return await apiClient.put<InsuranceOption>(`/portfolios/leasing/${portfolioId}/insurance-options/${optionId}`, updates);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating insurance option ${optionId} in portfolio ${portfolioId}`, error);
      
      const portfolio = leasingDataService.getLeasingPortfolioById(portfolioId);
      
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${portfolioId} not found`);
      }
      
      const typedPortfolio = portfolio as LeasingPortfolio;
      const optionIndex = typedPortfolio.insurance_options?.findIndex(o => o.id === optionId) ?? -1;
      
      if (optionIndex === -1) {
        throw new Error(`Insurance option with ID ${optionId} not found in portfolio ${portfolioId}`);
      }
      
      // Assurons-nous que insurance_options existe
      if (!typedPortfolio.insurance_options) {
        typedPortfolio.insurance_options = [];
      }
      
      // Met à jour l'option d'assurance
      typedPortfolio.insurance_options[optionIndex] = {
        ...typedPortfolio.insurance_options[optionIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      leasingDataService.updateLeasingPortfolio(typedPortfolio);
      
      // Retourne l'option mise à jour
      return typedPortfolio.insurance_options[optionIndex];
    }
  },

  /**
   * Supprime une option d'assurance
   */
  deleteInsuranceOption: async (portfolioId: string, optionId: string) => {
    try {
      await apiClient.delete(`/portfolios/leasing/${portfolioId}/insurance-options/${optionId}`);
      return true;
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for deleting insurance option ${optionId} from portfolio ${portfolioId}`, error);
      
      const portfolio = leasingDataService.getLeasingPortfolioById(portfolioId);
      
      if (!portfolio) {
        throw new Error(`Portfolio with ID ${portfolioId} not found`);
      }
      
      // Supprime l'option d'assurance du portefeuille
      const typedPortfolio = portfolio as LeasingPortfolio;
      typedPortfolio.insurance_options = typedPortfolio.insurance_options?.filter(o => o.id !== optionId) || [];
      leasingDataService.updateLeasingPortfolio(typedPortfolio);
      
      return true;
    }
  }
};
