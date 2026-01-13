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

// Responsive panel constraints - calculated based on viewport
export const getPanelConstraints = () => {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080;
  
  return {
    // Panel can take up to 70% of viewport width/height
    minWidth: Math.max(280, vw * 0.15),  // Min 15% or 280px
    maxWidth: Math.min(vw * 0.70, vw - 100), // Max 70% of viewport, leave 100px for content
    minHeight: Math.max(200, vh * 0.15), // Min 15% or 200px  
    maxHeight: Math.min(vh * 0.70, vh - 150), // Max 70% of viewport, leave 150px for header
  };
};

export const defaultPanelConfig: PanelConfig = {
  type: null,
  isFullscreen: false,
  width: 420,
  height: 350,
  // These are initial values, will be recalculated dynamically
  minWidth: 280,
  maxWidth: 1200,
  minHeight: 200,
  maxHeight: 700,
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
