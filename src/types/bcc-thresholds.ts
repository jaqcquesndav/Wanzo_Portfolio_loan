// src/types/bcc-thresholds.ts
/**
 * Références officielles BCC Instruction 004 (non modifiables)
 */
export interface BCCOfficialReferences {
  // Article 2 - Qualité du portefeuille
  maxNplRatio: number;           // NPL < 5%
  maxWriteOffRatio: number;      // Abandon créances < 2%
  minRecoveryRate: number;       // Taux récupération > 85%
  
  // Article 4 - Rentabilité
  minRoa: number;                // ROA > 3%
  minPortfolioYield: number;     // Rendement portefeuille > 15%
  
  // Efficacité opérationnelle
  minCollectionEfficiency: number; // Efficacité recouvrement > 90%
  maxProcessingTime: number;        // Temps traitement < 14 jours
}

/**
 * Préférences du gestionnaire de portefeuille (modifiables)
 * Doivent respecter les références BCC
 */
export interface ManagerPreferences {
  // Article 2 - Qualité du portefeuille (plus strict que BCC)
  maxNplRatio: number;           // Doit être ≤ référence BCC
  maxWriteOffRatio: number;      // Doit être ≤ référence BCC
  minRecoveryRate: number;       // Doit être ≥ référence BCC
  
  // Article 4 - Rentabilité (plus strict que BCC)
  minRoa: number;                // Doit être ≥ référence BCC
  minPortfolioYield: number;     // Doit être ≥ référence BCC
  
  // Efficacité opérationnelle (plus strict que BCC)
  minCollectionEfficiency: number; // Doit être ≥ référence BCC
  maxProcessingTime: number;        // Doit être ≤ référence BCC
  
  // Seuils d'alerte personnalisés
  alertThresholds: {
    nplWarningRatio: number;     // Alerte avant d'atteindre le seuil
    roaWarningLevel: number;     // Alerte si ROA descend sous ce niveau
    efficiencyWarningLevel: number; // Alerte efficacité
  };
}

/**
 * Configuration complète BCC
 */
export interface BCCConfiguration {
  bccReferences: BCCOfficialReferences;
  managerPreferences: ManagerPreferences;
  lastUpdated: string;
  updatedBy: string;
}