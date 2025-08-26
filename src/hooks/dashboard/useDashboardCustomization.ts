/**
 * Hook pour la gestion de la customisation du dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import type { DashboardPreferences, WidgetType, CustomizationContextType } from '../../types/dashboard/customization';
import { DEFAULT_WIDGETS } from '../../types/dashboard/customization';
import { dashboardPreferencesService } from '../../services/api/dashboard/preferences.api';

export const useDashboardCustomization = (userId: string): CustomizationContextType => {
  const [preferences, setPreferences] = useState<DashboardPreferences | null>(null);

  // Charger les préférences au montage
  const loadPreferencesCallback = useCallback(async (uid: string) => {
    try {
      const prefs = await dashboardPreferencesService.loadUserPreferences(uid);
      setPreferences(prefs);
    } catch (err) {
      console.error('Erreur chargement préférences:', err);
    }
  }, []);

  useEffect(() => {
    loadPreferencesCallback(userId);
  }, [userId, loadPreferencesCallback]);

  /**
   * Charge les préférences utilisateur
   */
  const loadPreferences = useCallback(async (uid: string) => {
    return loadPreferencesCallback(uid);
  }, [loadPreferencesCallback]);

  /**
   * Met à jour la visibilité d'un widget
   */
  const updateWidgetVisibility = useCallback(async (widgetId: WidgetType, visible: boolean) => {
    if (!preferences) return;

    try {
      const updated = await dashboardPreferencesService.updateWidgetVisibility(
        preferences, 
        widgetId, 
        visible
      );
      setPreferences(updated);
    } catch (err) {
      console.error('Erreur mise à jour widget:', err);
    }
  }, [preferences]);

  /**
   * Met à jour la position d'un widget
   */
  const updateWidgetPosition = useCallback(async (widgetId: WidgetType, position: number) => {
    if (!preferences) return;

    try {
      const updated = await dashboardPreferencesService.updateWidgetPosition(
        preferences,
        widgetId,
        position
      );
      setPreferences(updated);
    } catch (err) {
      console.error('Erreur réorganisation:', err);
    }
  }, [preferences]);

  /**
   * Remet les préférences par défaut
   */
  const resetToDefault = useCallback(async () => {
    try {
      const defaultPrefs = await dashboardPreferencesService.resetToDefault(userId);
      setPreferences(defaultPrefs);
    } catch (err) {
      console.error('Erreur reset:', err);
    }
  }, [userId]);

  /**
   * Sauvegarde les préférences
   */
  const savePreferences = useCallback(async () => {
    if (!preferences) return;

    try {
      await dashboardPreferencesService.saveUserPreferences(preferences);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
    }
  }, [preferences]);

  return {
    preferences,
    availableWidgets: DEFAULT_WIDGETS,
    updateWidgetVisibility,
    updateWidgetPosition,
    resetToDefault,
    savePreferences,
    loadPreferences
  };
};
