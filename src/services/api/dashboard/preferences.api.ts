/**
 * Service de gestion des préférences du dashboard
 */

import type { DashboardPreferences, WidgetType } from '../../../types/dashboard/customization';
import { DEFAULT_WIDGETS } from '../../../types/dashboard/customization';

class DashboardPreferencesService {
  private readonly STORAGE_KEY = 'wanzo_dashboard_preferences';

  /**
   * Charge les préférences utilisateur depuis le localStorage
   */
  async loadUserPreferences(userId: string): Promise<DashboardPreferences | null> {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      if (!stored) {
        return this.createDefaultPreferences(userId);
      }
      
      const preferences: DashboardPreferences = JSON.parse(stored);
      
      // Vérifier si de nouveaux widgets ont été ajoutés
      const currentWidgetIds = preferences.widgets.map(w => w.id);
      const newWidgets = DEFAULT_WIDGETS.filter(w => !currentWidgetIds.includes(w.id));
      
      if (newWidgets.length > 0) {
        preferences.widgets = [...preferences.widgets, ...newWidgets];
        await this.saveUserPreferences(preferences);
      }
      
      return preferences;
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
      return this.createDefaultPreferences(userId);
    }
  }

  /**
   * Sauvegarde les préférences utilisateur
   */
  async saveUserPreferences(preferences: DashboardPreferences): Promise<void> {
    try {
      const updated = {
        ...preferences,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(
        `${this.STORAGE_KEY}_${preferences.userId}`, 
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      throw new Error('Impossible de sauvegarder les préférences');
    }
  }

  /**
   * Met à jour la visibilité d'un widget
   */
  async updateWidgetVisibility(
    preferences: DashboardPreferences, 
    widgetId: WidgetType, 
    visible: boolean
  ): Promise<DashboardPreferences> {
    const updated = {
      ...preferences,
      widgets: preferences.widgets.map(widget =>
        widget.id === widgetId 
          ? { ...widget, isVisible: visible }
          : widget
      )
    };
    
    await this.saveUserPreferences(updated);
    return updated;
  }

  /**
   * Met à jour la position d'un widget
   */
  async updateWidgetPosition(
    preferences: DashboardPreferences, 
    widgetId: WidgetType, 
    position: number
  ): Promise<DashboardPreferences> {
    const updated = {
      ...preferences,
      widgets: preferences.widgets.map(widget =>
        widget.id === widgetId 
          ? { ...widget, position }
          : widget
      ).sort((a, b) => a.position - b.position)
    };
    
    await this.saveUserPreferences(updated);
    return updated;
  }

  /**
   * Remet les préférences par défaut
   */
  async resetToDefault(userId: string): Promise<DashboardPreferences> {
    const defaultPrefs = this.createDefaultPreferences(userId);
    await this.saveUserPreferences(defaultPrefs);
    return defaultPrefs;
  }

  /**
   * Crée les préférences par défaut
   */
  private createDefaultPreferences(userId: string): DashboardPreferences {
    return {
      id: `pref_${userId}_${Date.now()}`,
      userId,
      name: 'Configuration par défaut',
      widgets: [...DEFAULT_WIDGETS],
      defaultPortfolioView: 'global',
      defaultPeriod: 'year',
      autoRefresh: false,
      refreshInterval: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Exporte les préférences (pour backup)
   */
  exportPreferences(preferences: DashboardPreferences): string {
    return JSON.stringify(preferences, null, 2);
  }

  /**
   * Importe les préférences depuis un backup
   */
  async importPreferences(data: string, userId: string): Promise<DashboardPreferences> {
    try {
      const imported: DashboardPreferences = JSON.parse(data);
      imported.userId = userId;
      imported.updatedAt = new Date().toISOString();
      
      await this.saveUserPreferences(imported);
      return imported;
    } catch {
      throw new Error('Format de données invalide');
    }
  }
}

export const dashboardPreferencesService = new DashboardPreferencesService();
