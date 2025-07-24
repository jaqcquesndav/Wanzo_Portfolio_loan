/**
 * Types pour les paramètres de portefeuille de leasing
 */

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
