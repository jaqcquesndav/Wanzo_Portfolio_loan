// src/hooks/useBCCCompliance.ts
/**
 * Hook pour la gestion de la conformité BCC Instruction 004 (RDC)
 * Gère les références officielles, préférences gestionnaire et métriques temps réel
 */
import { useState, useEffect, useCallback } from 'react';
import { bccComplianceApi } from '../services/api/traditional/bccCompliance.api';
import type { 
  BCCOfficialReferences, 
  ManagerPreferences,
  BCCComplianceMetrics,
  BCCComplianceStatus 
} from '../types/bcc-thresholds';

interface UseBCCComplianceOptions {
  portfolioId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // en millisecondes
}

interface UseBCCComplianceReturn {
  // Données
  references: BCCOfficialReferences | null;
  preferences: ManagerPreferences | null;
  metrics: BCCComplianceMetrics | null;
  complianceStatus: BCCComplianceStatus | null;
  
  // États
  loading: boolean;
  saving: boolean;
  error: string | null;
  validationErrors: string[];
  
  // Actions
  updatePreference: (field: keyof ManagerPreferences, value: number | object) => void;
  updateAlertThreshold: (field: keyof ManagerPreferences['alertThresholds'], value: number) => void;
  savePreferences: () => Promise<boolean>;
  resetPreferences: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  validatePreferences: () => string[];
}

export function useBCCCompliance(options: UseBCCComplianceOptions = {}): UseBCCComplianceReturn {
  const { portfolioId, autoRefresh = false, refreshInterval = 60000 } = options;
  
  // États des données
  const [references, setReferences] = useState<BCCOfficialReferences | null>(null);
  const [preferences, setPreferences] = useState<ManagerPreferences | null>(null);
  const [metrics, setMetrics] = useState<BCCComplianceMetrics | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<BCCComplianceStatus | null>(null);
  
  // États UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  /**
   * Charge la configuration BCC (références + préférences)
   */
  const loadConfiguration = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const config = await bccComplianceApi.getConfiguration(portfolioId);
      setReferences(config.bccReferences);
      setPreferences(config.managerPreferences);
    } catch (err) {
      console.error('[BCC] Erreur chargement configuration:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  /**
   * Charge les métriques de conformité
   */
  const refreshMetrics = useCallback(async () => {
    if (!portfolioId) return;
    
    try {
      const metricsData = await bccComplianceApi.getMetrics(portfolioId);
      setMetrics(metricsData);
      
      // Calculer le statut de conformité
      if (references && preferences) {
        const status = calculateComplianceStatus(metricsData, references, preferences);
        setComplianceStatus(status);
      }
    } catch (err) {
      console.error('[BCC] Erreur chargement métriques:', err);
    }
  }, [portfolioId, references, preferences]);

  /**
   * Valide les préférences par rapport aux références BCC
   */
  const validatePreferences = useCallback((): string[] => {
    if (!references || !preferences) return [];
    
    const errors: string[] = [];
    
    // Qualité portefeuille
    if (preferences.maxNplRatio > references.maxNplRatio) {
      errors.push(`NPL Max (${preferences.maxNplRatio}%) dépasse le seuil BCC (${references.maxNplRatio}%)`);
    }
    if (preferences.maxWriteOffRatio > references.maxWriteOffRatio) {
      errors.push(`Abandon Max (${preferences.maxWriteOffRatio}%) dépasse le seuil BCC (${references.maxWriteOffRatio}%)`);
    }
    if (preferences.minRecoveryRate < references.minRecoveryRate) {
      errors.push(`Récupération Min (${preferences.minRecoveryRate}%) inférieur au seuil BCC (${references.minRecoveryRate}%)`);
    }
    
    // Rentabilité
    if (preferences.minRoa < references.minRoa) {
      errors.push(`ROA Min (${preferences.minRoa}%) inférieur au seuil BCC (${references.minRoa}%)`);
    }
    if (preferences.minPortfolioYield < references.minPortfolioYield) {
      errors.push(`Rendement Min (${preferences.minPortfolioYield}%) inférieur au seuil BCC (${references.minPortfolioYield}%)`);
    }
    
    // Efficacité
    if (preferences.minCollectionEfficiency < references.minCollectionEfficiency) {
      errors.push(`Recouvrement Min (${preferences.minCollectionEfficiency}%) inférieur au seuil BCC (${references.minCollectionEfficiency}%)`);
    }
    if (preferences.maxProcessingTime > references.maxProcessingTime) {
      errors.push(`Délai Max (${preferences.maxProcessingTime}j) dépasse le seuil BCC (${references.maxProcessingTime}j)`);
    }
    
    return errors;
  }, [references, preferences]);

  /**
   * Met à jour une préférence
   */
  const updatePreference = useCallback((field: keyof ManagerPreferences, value: number | object) => {
    setPreferences(prev => {
      if (!prev) return null;
      const updated = { ...prev, [field]: value };
      return updated;
    });
  }, []);

  /**
   * Met à jour un seuil d'alerte
   */
  const updateAlertThreshold = useCallback((field: keyof ManagerPreferences['alertThresholds'], value: number) => {
    setPreferences(prev => {
      if (!prev) return null;
      return {
        ...prev,
        alertThresholds: {
          ...prev.alertThresholds,
          [field]: value
        }
      };
    });
  }, []);

  /**
   * Sauvegarde les préférences
   */
  const savePreferences = useCallback(async (): Promise<boolean> => {
    if (!preferences) return false;
    
    // Validation avant sauvegarde
    const errors = validatePreferences();
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      return false;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      await bccComplianceApi.savePreferences(preferences, portfolioId);
      return true;
    } catch (err) {
      console.error('[BCC] Erreur sauvegarde:', err);
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
      return false;
    } finally {
      setSaving(false);
    }
  }, [preferences, portfolioId, validatePreferences]);

  /**
   * Réinitialise les préférences aux valeurs par défaut
   */
  const resetPreferences = useCallback(async () => {
    try {
      const defaultPrefs = await bccComplianceApi.resetPreferences(portfolioId);
      setPreferences(defaultPrefs);
      setValidationErrors([]);
    } catch (err) {
      console.error('[BCC] Erreur reset:', err);
      setError(err instanceof Error ? err.message : 'Erreur de réinitialisation');
    }
  }, [portfolioId]);

  // Effet: Chargement initial
  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  // Effet: Chargement des métriques après configuration
  useEffect(() => {
    if (references && preferences && portfolioId) {
      refreshMetrics();
    }
  }, [references, preferences, portfolioId, refreshMetrics]);

  // Effet: Validation en temps réel
  useEffect(() => {
    if (preferences && references) {
      const errors = validatePreferences();
      setValidationErrors(errors);
    }
  }, [preferences, references, validatePreferences]);

  // Effet: Auto-refresh des métriques
  useEffect(() => {
    if (!autoRefresh || !portfolioId) return;
    
    const interval = setInterval(() => {
      refreshMetrics();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, portfolioId, refreshInterval, refreshMetrics]);

  return {
    references,
    preferences,
    metrics,
    complianceStatus,
    loading,
    saving,
    error,
    validationErrors,
    updatePreference,
    updateAlertThreshold,
    savePreferences,
    resetPreferences,
    refreshMetrics,
    validatePreferences,
  };
}

/**
 * Calcule le statut de conformité global
 */
function calculateComplianceStatus(
  metrics: BCCComplianceMetrics,
  references: BCCOfficialReferences,
  preferences: ManagerPreferences
): BCCComplianceStatus {
  // Vérifications BCC (critiques)
  const bccChecks = {
    npl: metrics.qualityMetrics.nplRatio <= references.maxNplRatio,
    writeOff: metrics.qualityMetrics.writeOffRatio <= references.maxWriteOffRatio,
    recovery: metrics.qualityMetrics.recoveryRate >= references.minRecoveryRate,
    roa: metrics.profitabilityMetrics.roa >= references.minRoa,
    yield: metrics.profitabilityMetrics.portfolioYield >= references.minPortfolioYield,
    efficiency: metrics.operationalMetrics.collectionEfficiency >= references.minCollectionEfficiency,
    processing: metrics.operationalMetrics.avgProcessingTime <= references.maxProcessingTime,
  };
  
  // Vérifications gestionnaire (alertes)
  const managerChecks = {
    npl: metrics.qualityMetrics.nplRatio <= preferences.maxNplRatio,
    writeOff: metrics.qualityMetrics.writeOffRatio <= preferences.maxWriteOffRatio,
    recovery: metrics.qualityMetrics.recoveryRate >= preferences.minRecoveryRate,
    roa: metrics.profitabilityMetrics.roa >= preferences.minRoa,
    yield: metrics.profitabilityMetrics.portfolioYield >= preferences.minPortfolioYield,
    efficiency: metrics.operationalMetrics.collectionEfficiency >= preferences.minCollectionEfficiency,
    processing: metrics.operationalMetrics.avgProcessingTime <= preferences.maxProcessingTime,
  };
  
  const totalChecks = Object.keys(bccChecks).length;
  const bccCompliantCount = Object.values(bccChecks).filter(Boolean).length;
  const nonCompliantCount = totalChecks - bccCompliantCount;
  
  // Warnings: conforme BCC mais pas aux préférences gestionnaire
  const warningCount = Object.entries(bccChecks)
    .filter(([key, bccOk]) => bccOk && !managerChecks[key as keyof typeof managerChecks])
    .length;
  
  const compliantCount = bccCompliantCount - warningCount;
  
  const overallScore = (bccCompliantCount / totalChecks) * 100;
  
  return {
    isFullyCompliant: nonCompliantCount === 0,
    overallScore,
    compliantCount,
    warningCount,
    nonCompliantCount,
    totalChecks,
    lastAssessment: new Date().toISOString(),
  };
}
