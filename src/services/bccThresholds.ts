// src/services/bccThresholds.ts
import { BCCOfficialReferences, ManagerPreferences, BCCConfiguration } from '../types/bcc-thresholds';

const BCC_CONFIG_KEY = 'bcc_configuration';

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
  // Plus strict que les références BCC
  maxNplRatio: 3,           // 3% au lieu de 5%
  maxWriteOffRatio: 1,      // 1% au lieu de 2%
  minRecoveryRate: 90,      // 90% au lieu de 85%
  
  minRoa: 4,                // 4% au lieu de 3%
  minPortfolioYield: 18,    // 18% au lieu de 15%
  
  minCollectionEfficiency: 92, // 92% au lieu de 90%
  maxProcessingTime: 10,       // 10 jours au lieu de 14
  
  // Seuils d'alerte personnalisés
  alertThresholds: {
    nplWarningRatio: 2,       // Alerte à 2%
    roaWarningLevel: 3.5,     // Alerte si ROA < 3.5%
    efficiencyWarningLevel: 88, // Alerte si efficacité < 88%
  },
};

export const bccThresholdsService = {
  /**
   * Récupère les références officielles BCC (non modifiables)
   */
  getBCCReferences(): BCCOfficialReferences {
    return BCC_OFFICIAL_REFERENCES;
  },

  /**
   * Récupère la configuration complète BCC
   */
  getConfiguration(): BCCConfiguration {
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
    } catch (error) {
      console.warn('Erreur lors de la récupération de la configuration BCC:', error);
    }
    
    return {
      bccReferences: BCC_OFFICIAL_REFERENCES,
      managerPreferences: DEFAULT_MANAGER_PREFERENCES,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'System',
    };
  },

  /**
   * Sauvegarde les préférences du gestionnaire
   */
  async saveManagerPreferences(preferences: ManagerPreferences, updatedBy: string = 'User'): Promise<void> {
    // Validation des préférences par rapport aux références BCC
    const validationErrors = this.validateManagerPreferences(preferences);
    if (validationErrors.length > 0) {
      throw new Error(`Validation échouée: ${validationErrors.join(', ')}`);
    }

    try {
      const config: BCCConfiguration = {
        bccReferences: BCC_OFFICIAL_REFERENCES,
        managerPreferences: preferences,
        lastUpdated: new Date().toISOString(),
        updatedBy,
      };
      
      localStorage.setItem(BCC_CONFIG_KEY, JSON.stringify(config));
      console.log('Configuration BCC sauvegardée avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration BCC:', error);
      throw new Error('Échec de la sauvegarde de la configuration BCC');
    }
  },

  /**
   * Valide que les préférences du gestionnaire respectent les références BCC
   */
  validateManagerPreferences(preferences: ManagerPreferences): string[] {
    const errors: string[] = [];
    const refs = BCC_OFFICIAL_REFERENCES;

    // Validation que les préférences sont plus strictes que BCC
    if (preferences.maxNplRatio > refs.maxNplRatio) {
      errors.push(`NPL maximum (${preferences.maxNplRatio}%) doit être ≤ ${refs.maxNplRatio}% (référence BCC)`);
    }

    if (preferences.maxWriteOffRatio > refs.maxWriteOffRatio) {
      errors.push(`Abandon créances maximum (${preferences.maxWriteOffRatio}%) doit être ≤ ${refs.maxWriteOffRatio}% (référence BCC)`);
    }

    if (preferences.minRecoveryRate < refs.minRecoveryRate) {
      errors.push(`Taux récupération minimum (${preferences.minRecoveryRate}%) doit être ≥ ${refs.minRecoveryRate}% (référence BCC)`);
    }

    if (preferences.minRoa < refs.minRoa) {
      errors.push(`ROA minimum (${preferences.minRoa}%) doit être ≥ ${refs.minRoa}% (référence BCC)`);
    }

    if (preferences.minPortfolioYield < refs.minPortfolioYield) {
      errors.push(`Rendement minimum (${preferences.minPortfolioYield}%) doit être ≥ ${refs.minPortfolioYield}% (référence BCC)`);
    }

    if (preferences.minCollectionEfficiency < refs.minCollectionEfficiency) {
      errors.push(`Efficacité minimum (${preferences.minCollectionEfficiency}%) doit être ≥ ${refs.minCollectionEfficiency}% (référence BCC)`);
    }

    if (preferences.maxProcessingTime > refs.maxProcessingTime) {
      errors.push(`Temps traitement maximum (${preferences.maxProcessingTime} jours) doit être ≤ ${refs.maxProcessingTime} jours (référence BCC)`);
    }

    // Validation des valeurs raisonnables
    if (preferences.maxNplRatio < 0 || preferences.maxNplRatio > 20) {
      errors.push('Le ratio NPL doit être entre 0% et 20%');
    }

    return errors;
  },

  /**
   * Remet les préférences aux valeurs par défaut
   */
  async resetManagerPreferences(): Promise<ManagerPreferences> {
    try {
      localStorage.removeItem(BCC_CONFIG_KEY);
      return DEFAULT_MANAGER_PREFERENCES;
    } catch (error) {
      console.error('Erreur lors de la remise à zéro des préférences:', error);
      throw error;
    }
  }
};