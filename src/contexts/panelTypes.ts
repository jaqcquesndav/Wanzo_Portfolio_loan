import { createContext } from 'react';

// Types de panels disponibles
export type PanelType = 'chat' | 'notifications' | 'settings' | 'help' | null;

// Position du panel secondaire
export type PanelPosition = 'right' | 'bottom';

// Configuration d'un panel
export interface PanelConfig {
  type: PanelType;
  isFullscreen: boolean;
  width: number; // en pixels pour position 'right'
  height: number; // en pixels pour position 'bottom'
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

// État du système de panels
export interface PanelState {
  // Panel secondaire (chat, notifications, etc.)
  secondaryPanel: PanelConfig;
  // Position du panel secondaire
  panelPosition: PanelPosition;
  // Sidebar collapsed state
  isSidebarCollapsed: boolean;
  // Animation en cours
  isAnimating: boolean;
}

// Actions disponibles
export interface PanelActions {
  // Ouvrir un panel
  openPanel: (type: PanelType) => void;
  // Fermer le panel secondaire
  closePanel: () => void;
  // Basculer un panel
  togglePanel: (type: PanelType) => void;
  // Passer en mode plein écran
  setFullscreen: (fullscreen: boolean) => void;
  // Basculer le mode plein écran
  toggleFullscreen: () => void;
  // Redimensionner le panel
  resizePanel: (dimension: number) => void;
  // Changer la position du panel
  setPanelPosition: (position: PanelPosition) => void;
  // Collapse/expand sidebar
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  // Vérifier si un panel est ouvert
  isPanelOpen: (type: PanelType) => boolean;
}

export type PanelContextType = PanelState & PanelActions;

export const defaultPanelConfig: PanelConfig = {
  type: null,
  isFullscreen: false,
  width: 420,
  height: 400,
  minWidth: 320,
  maxWidth: 800,
  minHeight: 300,
  maxHeight: 600,
};

export const defaultPanelState: PanelState = {
  secondaryPanel: defaultPanelConfig,
  panelPosition: 'right',
  isSidebarCollapsed: false,
  isAnimating: false,
};

// Créer et exporter le contexte
export const PanelContext = createContext<PanelContextType | null>(null);

// Clé pour la persistance localStorage
export const PANEL_STATE_KEY = 'wanzo_panel_state';
