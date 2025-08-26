/**
 * Types pour la customisation du dashboard OHADA
 */

export type WidgetType = 
  | 'kpi-overview'
  | 'balance-age'
  | 'risk-return-matrix'
  | 'monthly-performance'
  | 'balance-age-distribution'
  | 'regulatory-compliance'
  | 'portfolio-composition'
  | 'credit-quality'
  | 'provisioning-analysis'
  | 'sector-exposure'
  | 'geographical-distribution'
  | 'recent-activities';

export interface WidgetConfig {
  id: WidgetType;
  title: string;
  description: string;
  category: 'kpi' | 'analysis' | 'compliance' | 'activity';
  isVisible: boolean;
  position: number;
  size: 'small' | 'medium' | 'large' | 'full';
}

export interface DashboardPreferences {
  id: string;
  userId: string;
  name: string;
  widgets: WidgetConfig[];
  defaultPortfolioView: 'global' | 'individual';
  defaultPeriod: 'month' | 'quarter' | 'year';
  autoRefresh: boolean;
  refreshInterval: number; // en minutes
  createdAt: string;
  updatedAt: string;
}

export interface CustomizationContextType {
  preferences: DashboardPreferences | null;
  availableWidgets: WidgetConfig[];
  updateWidgetVisibility: (widgetId: WidgetType, visible: boolean) => void;
  updateWidgetPosition: (widgetId: WidgetType, position: number) => void;
  resetToDefault: () => void;
  savePreferences: () => Promise<void>;
  loadPreferences: (userId: string) => Promise<void>;
}

// Configuration par défaut des widgets selon OHADA
export const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'kpi-overview',
    title: 'KPI Principaux',
    description: 'Indicateurs clés de performance OHADA',
    category: 'kpi',
    isVisible: true,
    position: 1,
    size: 'full'
  },
  {
    id: 'balance-age',
    title: 'Analyse Balance Âgée',
    description: 'Répartition des créances par ancienneté',
    category: 'analysis',
    isVisible: true,
    position: 2,
    size: 'large'
  },
  {
    id: 'risk-return-matrix',
    title: 'Matrice Risque/Rendement',
    description: 'Analyse du couple risque-rendement',
    category: 'analysis',
    isVisible: true,
    position: 3,
    size: 'medium'
  },
  {
    id: 'monthly-performance',
    title: 'Performance Mensuelle',
    description: 'Évolution des performances dans le temps',
    category: 'analysis',
    isVisible: true,
    position: 4,
    size: 'medium'
  },
  {
    id: 'balance-age-distribution',
    title: 'Répartition Balance AGE',
    description: 'Distribution graphique des créances',
    category: 'analysis',
    isVisible: true,
    position: 5,
    size: 'medium'
  },
  {
    id: 'regulatory-compliance',
    title: 'Conformité Réglementaire',
    description: 'Respect des normes OHADA/BCEAO',
    category: 'compliance',
    isVisible: true,
    position: 6,
    size: 'medium'
  },
  {
    id: 'portfolio-composition',
    title: 'Composition Portefeuille',
    description: 'Répartition par secteur et taille',
    category: 'analysis',
    isVisible: true,
    position: 7,
    size: 'medium'
  },
  {
    id: 'credit-quality',
    title: 'Qualité du Crédit',
    description: 'Analyse de la qualité des créances',
    category: 'analysis',
    isVisible: false,
    position: 8,
    size: 'medium'
  },
  {
    id: 'provisioning-analysis',
    title: 'Analyse des Provisions',
    description: 'Évolution et adéquation des provisions',
    category: 'compliance',
    isVisible: false,
    position: 9,
    size: 'medium'
  },
  {
    id: 'sector-exposure',
    title: 'Exposition Sectorielle',
    description: 'Concentration par secteur d\'activité',
    category: 'analysis',
    isVisible: false,
    position: 10,
    size: 'medium'
  },
  {
    id: 'geographical-distribution',
    title: 'Répartition Géographique',
    description: 'Distribution par zone géographique',
    category: 'analysis',
    isVisible: false,
    position: 11,
    size: 'medium'
  },
  {
    id: 'recent-activities',
    title: 'Activités Récentes',
    description: 'Journal des actions et transactions',
    category: 'activity',
    isVisible: true,
    position: 12,
    size: 'full'
  }
];
