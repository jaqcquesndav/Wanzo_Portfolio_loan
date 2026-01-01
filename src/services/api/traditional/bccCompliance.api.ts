// src/services/api/traditional/bccCompliance.api.ts
/**
 * Service API pour la conformité BCC Instruction 004 (RDC)
 * Gère la communication avec le backend pour les seuils et métriques BCC
 */
import { apiClient } from '../base.api';
import type { 
  BCCOfficialReferences, 
  ManagerPreferences, 
  BCCConfiguration,
  BCCComplianceMetrics 
} from '../../../types/bcc-thresholds';

const BCC_CONFIG_KEY = 'bcc_configuration';
const isDevelopment = import.meta.env.DEV;

// Références officielles BCC Instruction 004 (FIXES - Non modifiables)
const BCC_OFFICIAL_REFERENCES: BCCOfficialReferences = {
  // Article 2 - Qualité du portefeuille
  maxNplRatio: 5,           // NPL < 5%
  maxWriteOffRatio: 2,      // Abandon créances < 2%
  minRecoveryRate: 85,      // Taux récupération > 85%
  
  // Article 4 - Rentabilité
  minRoa: 3,                // ROA > 3%
  minPortfolioYield: 15,    // Rendement portefeuille > 15%
  
  // Efficacité opérationnelle
  minCollectionEfficiency: 90, // Efficacité recouvrement > 90%
  maxProcessingTime: 14,       // Temps traitement < 14 jours
};

// Préférences par défaut du gestionnaire (plus strictes que BCC)
const DEFAULT_MANAGER_PREFERENCES: ManagerPreferences = {
  maxNplRatio: 3,
  maxWriteOffRatio: 1,
  minRecoveryRate: 90,
  minRoa: 4,
  minPortfolioYield: 18,
  minCollectionEfficiency: 92,
  maxProcessingTime: 10,
  alertThresholds: {
    nplWarningRatio: 2,
    roaWarningLevel: 3.5,
    efficiencyWarningLevel: 88,
  },
};

class BCCComplianceApiService {
  private baseUrl = '/bcc';

  /**
   * Récupère la configuration BCC (références + préférences)
   */
  async getConfiguration(portfolioId?: string): Promise<BCCConfiguration> {
    try {
      // Essayer d'abord le backend
      const endpoint = portfolioId 
        ? `${this.baseUrl}/configuration/${portfolioId}`
        : `${this.baseUrl}/configuration`;
      
      const response = await apiClient.get<BCCConfiguration>(endpoint);
      
      if (response) {
        return response;
      }
    } catch {
      console.warn('[BCC API] Backend indisponible, utilisation du fallback localStorage');
    }
    
    // Fallback localStorage (dev mode ou backend indisponible)
    return this.getConfigurationFromLocalStorage();
  }

  /**
   * Récupère les métriques de conformité d'un portefeuille
   */
  async getMetrics(portfolioId: string): Promise<BCCComplianceMetrics> {
    try {
      const response = await apiClient.get<BCCComplianceMetrics>(
        `${this.baseUrl}/metrics/${portfolioId}`
      );
      
      if (response) {
        return response;
      }
    } catch {
      console.warn('[BCC API] Métriques indisponibles, génération mock');
    }
    
    // Fallback: générer des métriques mock (dev mode)
    if (isDevelopment) {
      return this.generateMockMetrics();
    }
    
    throw new Error('Métriques BCC indisponibles');
  }

  /**
   * Sauvegarde les préférences du gestionnaire
   */
  async savePreferences(preferences: ManagerPreferences, portfolioId?: string): Promise<void> {
    // Validation côté client
    const validationErrors = this.validatePreferences(preferences);
    if (validationErrors.length > 0) {
      throw new Error(`Validation échouée: ${validationErrors.join(', ')}`);
    }

    try {
      const endpoint = portfolioId 
        ? `${this.baseUrl}/preferences/${portfolioId}`
        : `${this.baseUrl}/preferences`;
      
      await apiClient.put(endpoint, preferences);
      
      // Aussi sauvegarder en localStorage pour le cache
      this.saveToLocalStorage(preferences);
    } catch {
      console.warn('[BCC API] Sauvegarde backend échouée, localStorage uniquement');
      this.saveToLocalStorage(preferences);
    }
  }

  /**
   * Réinitialise les préférences aux valeurs par défaut
   */
  async resetPreferences(portfolioId?: string): Promise<ManagerPreferences> {
    try {
      const endpoint = portfolioId 
        ? `${this.baseUrl}/preferences/${portfolioId}/reset`
        : `${this.baseUrl}/preferences/reset`;
      
      const response = await apiClient.post<ManagerPreferences>(endpoint);
      
      if (response) {
        this.saveToLocalStorage(response);
        return response;
      }
    } catch {
      console.warn('[BCC API] Reset backend échoué, utilisation des valeurs par défaut');
    }
    
    // Fallback: valeurs par défaut
    this.saveToLocalStorage(DEFAULT_MANAGER_PREFERENCES);
    return DEFAULT_MANAGER_PREFERENCES;
  }

  /**
   * Récupère les références officielles BCC (non modifiables)
   */
  async getReferences(): Promise<BCCOfficialReferences> {
    try {
      const response = await apiClient.get<BCCOfficialReferences>(`${this.baseUrl}/references`);
      if (response) {
        return response;
      }
    } catch {
      console.warn('[BCC API] Références backend indisponibles');
    }
    
    return BCC_OFFICIAL_REFERENCES;
  }

  /**
   * Valide les préférences par rapport aux références BCC
   */
  validatePreferences(preferences: ManagerPreferences): string[] {
    const errors: string[] = [];
    const ref = BCC_OFFICIAL_REFERENCES;
    
    if (preferences.maxNplRatio > ref.maxNplRatio) {
      errors.push(`NPL Max ne peut pas dépasser ${ref.maxNplRatio}%`);
    }
    if (preferences.maxWriteOffRatio > ref.maxWriteOffRatio) {
      errors.push(`Abandon Max ne peut pas dépasser ${ref.maxWriteOffRatio}%`);
    }
    if (preferences.minRecoveryRate < ref.minRecoveryRate) {
      errors.push(`Récupération Min ne peut pas être inférieur à ${ref.minRecoveryRate}%`);
    }
    if (preferences.minRoa < ref.minRoa) {
      errors.push(`ROA Min ne peut pas être inférieur à ${ref.minRoa}%`);
    }
    if (preferences.minPortfolioYield < ref.minPortfolioYield) {
      errors.push(`Rendement Min ne peut pas être inférieur à ${ref.minPortfolioYield}%`);
    }
    if (preferences.minCollectionEfficiency < ref.minCollectionEfficiency) {
      errors.push(`Recouvrement Min ne peut pas être inférieur à ${ref.minCollectionEfficiency}%`);
    }
    if (preferences.maxProcessingTime > ref.maxProcessingTime) {
      errors.push(`Délai Max ne peut pas dépasser ${ref.maxProcessingTime} jours`);
    }
    
    return errors;
  }

  // ============ Méthodes privées ============

  private getConfigurationFromLocalStorage(): BCCConfiguration {
    try {
      const stored = localStorage.getItem(BCC_CONFIG_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        return {
          bccReferences: BCC_OFFICIAL_REFERENCES,
          managerPreferences: { ...DEFAULT_MANAGER_PREFERENCES, ...config.managerPreferences },
          lastUpdated: config.lastUpdated || new Date().toISOString(),
          updatedBy: config.updatedBy || 'System',
        };
      }
    } catch {
      console.warn('[BCC] Erreur lecture localStorage');
    }
    
    return {
      bccReferences: BCC_OFFICIAL_REFERENCES,
      managerPreferences: DEFAULT_MANAGER_PREFERENCES,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'System',
    };
  }

  private saveToLocalStorage(preferences: ManagerPreferences): void {
    const config: BCCConfiguration = {
      bccReferences: BCC_OFFICIAL_REFERENCES,
      managerPreferences: preferences,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'User',
    };
    localStorage.setItem(BCC_CONFIG_KEY, JSON.stringify(config));
  }

  private generateMockMetrics(): BCCComplianceMetrics {
    return {
      qualityMetrics: {
        nplRatio: 2 + Math.random() * 6,
        writeOffRatio: Math.random() * 3,
        par30: 1 + Math.random() * 4,
        recoveryRate: 70 + Math.random() * 25,
      },
      profitabilityMetrics: {
        roa: 2 + Math.random() * 5,
        portfolioYield: 8 + Math.random() * 12,
        netInterestMargin: 8 + Math.random() * 6,
        costOfRisk: 1 + Math.random() * 4,
      },
      operationalMetrics: {
        collectionEfficiency: 75 + Math.random() * 20,
        avgProcessingTime: 5 + Math.random() * 10,
        portfolioTurnover: 15 + Math.random() * 25,
      },
      calculatedAt: new Date().toISOString(),
      portfolioId: 'mock',
    };
  }
}

export const bccComplianceApi = new BCCComplianceApiService();
