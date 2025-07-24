/**
 * API pour la gestion des paramètres des portefeuilles d'investissement
 * 
 * Ce module fournit des fonctions pour:
 * - Récupérer les classes d'actifs disponibles
 * - Récupérer les stratégies d'investissement disponibles
 * - Gérer les paramètres généraux des portefeuilles d'investissement
 */

// Types pour les paramètres de portefeuille
export interface AssetClass {
  id: string;
  name: string;
  description: string;
  risk_level: number; // 1-5
  expected_return: number; // pourcentage
}

export interface InvestmentStrategy {
  id: string;
  name: string;
  description: string;
  target_allocation: Record<string, number>; // assetClassId -> percentage
  risk_profile: string; // conservative, balanced, aggressive
  min_investment: number;
}

export interface PortfolioSettings {
  asset_classes: AssetClass[];
  investment_strategies: InvestmentStrategy[];
  default_strategy_id: string;
  trading_hours: {
    start: string; // format: "HH:MM"
    end: string;   // format: "HH:MM"
    timezone: string;
  };
  fees: {
    management_fee: number; // pourcentage
    performance_fee: number; // pourcentage
    entry_fee: number; // pourcentage
    exit_fee: number; // pourcentage
  };
}

// Données mock pour les paramètres de portefeuille
const mockPortfolioSettings: PortfolioSettings = {
  asset_classes: [
    {
      id: "ac-1",
      name: "Actions",
      description: "Titres de propriété d'entreprises cotées",
      risk_level: 4,
      expected_return: 8.5
    },
    {
      id: "ac-2",
      name: "Obligations",
      description: "Titres de créance émis par des gouvernements ou des entreprises",
      risk_level: 2,
      expected_return: 3.5
    },
    {
      id: "ac-3",
      name: "Immobilier",
      description: "Investissements dans des biens immobiliers ou des fonds immobiliers",
      risk_level: 3,
      expected_return: 6.0
    }
  ],
  investment_strategies: [
    {
      id: "is-1",
      name: "Conservatrice",
      description: "Stratégie à faible risque privilégiant la préservation du capital",
      target_allocation: {
        "ac-1": 20,
        "ac-2": 70,
        "ac-3": 10
      },
      risk_profile: "conservative",
      min_investment: 5000
    },
    {
      id: "is-2",
      name: "Équilibrée",
      description: "Stratégie modérée visant un équilibre entre croissance et sécurité",
      target_allocation: {
        "ac-1": 50,
        "ac-2": 30,
        "ac-3": 20
      },
      risk_profile: "balanced",
      min_investment: 10000
    },
    {
      id: "is-3",
      name: "Agressive",
      description: "Stratégie à haut risque visant une croissance maximale",
      target_allocation: {
        "ac-1": 80,
        "ac-2": 10,
        "ac-3": 10
      },
      risk_profile: "aggressive",
      min_investment: 20000
    }
  ],
  default_strategy_id: "is-2",
  trading_hours: {
    start: "09:00",
    end: "17:30",
    timezone: "UTC+1"
  },
  fees: {
    management_fee: 1.5,
    performance_fee: 10,
    entry_fee: 1,
    exit_fee: 0.5
  }
};

// Stocker les paramètres dans le localStorage
const SETTINGS_STORAGE_KEY = 'wanzo_investment_settings';

// Fonction helper pour récupérer les paramètres du localStorage
const getSettingsFromStorage = (): PortfolioSettings => {
  const settings = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (settings) {
    return JSON.parse(settings);
  }
  // Initialiser avec les données mock si rien n'existe
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(mockPortfolioSettings));
  return mockPortfolioSettings;
};

// Fonction helper pour mettre à jour les paramètres dans le localStorage
const updateSettingsInStorage = (settings: PortfolioSettings): void => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

/**
 * API pour la gestion des paramètres des portefeuilles d'investissement
 */
export const portfolioSettingsApi = {
  /**
   * Récupère les classes d'actifs disponibles
   */
  getAssetClasses: async (): Promise<AssetClass[]> => {
    try {
      // Simulation d'un appel API
      return new Promise((resolve) => {
        setTimeout(() => {
          const settings = getSettingsFromStorage();
          resolve(settings.asset_classes);
        }, 100);
      });
    } catch (error) {
      console.error('Error fetching asset classes:', error);
      return [];
    }
  },

  /**
   * Récupère les stratégies d'investissement disponibles
   */
  getInvestmentStrategies: async (): Promise<InvestmentStrategy[]> => {
    try {
      // Simulation d'un appel API
      return new Promise((resolve) => {
        setTimeout(() => {
          const settings = getSettingsFromStorage();
          resolve(settings.investment_strategies);
        }, 100);
      });
    } catch (error) {
      console.error('Error fetching investment strategies:', error);
      return [];
    }
  },

  /**
   * Récupère tous les paramètres du portefeuille
   */
  getPortfolioSettings: async (): Promise<PortfolioSettings> => {
    try {
      // Simulation d'un appel API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(getSettingsFromStorage());
        }, 100);
      });
    } catch (error) {
      console.error('Error fetching portfolio settings:', error);
      return mockPortfolioSettings;
    }
  },

  /**
   * Met à jour les paramètres du portefeuille
   */
  updatePortfolioSettings: async (settings: Partial<PortfolioSettings>): Promise<PortfolioSettings> => {
    try {
      // Simulation d'un appel API
      return new Promise((resolve) => {
        setTimeout(() => {
          const currentSettings = getSettingsFromStorage();
          const updatedSettings = { ...currentSettings, ...settings };
          updateSettingsInStorage(updatedSettings);
          resolve(updatedSettings);
        }, 100);
      });
    } catch (error) {
      console.error('Error updating portfolio settings:', error);
      return mockPortfolioSettings;
    }
  }
};
