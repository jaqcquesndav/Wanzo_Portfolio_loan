import React, { useState, useCallback, useMemo } from 'react';
import { 
  PanelContext, 
  PanelState, 
  PanelContextType, 
  PanelType, 
  PanelPosition,
  defaultPanelConfig,
  defaultPanelState,
  PANEL_STATE_KEY 
} from './panelTypes';

// Charger l'état depuis localStorage
function loadPanelState(): Partial<PanelState> {
  try {
    const saved = localStorage.getItem(PANEL_STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        panelPosition: parsed.panelPosition || 'right',
        isSidebarCollapsed: parsed.isSidebarCollapsed || false,
        secondaryPanel: {
          ...defaultPanelConfig,
          width: parsed.panelWidth || defaultPanelConfig.width,
          height: parsed.panelHeight || defaultPanelConfig.height,
        },
      };
    }
  } catch (e) {
    console.warn('Erreur lors du chargement de l\'état des panels:', e);
  }
  return {};
}

// Sauvegarder l'état dans localStorage
function savePanelState(state: Partial<PanelState>) {
  try {
    localStorage.setItem(PANEL_STATE_KEY, JSON.stringify({
      panelPosition: state.panelPosition,
      isSidebarCollapsed: state.isSidebarCollapsed,
      panelWidth: state.secondaryPanel?.width,
      panelHeight: state.secondaryPanel?.height,
    }));
  } catch (e) {
    console.warn('Erreur lors de la sauvegarde de l\'état des panels:', e);
  }
}

export function PanelProvider({ children }: { children: React.ReactNode }) {
  // Charger l'état initial depuis localStorage
  const initialState = useMemo(() => ({
    ...defaultPanelState,
    ...loadPanelState(),
  }), []);

  const [state, setState] = useState<PanelState>(initialState);

  // Ouvrir un panel
  const openPanel = useCallback((type: PanelType) => {
    setState(prev => {
      const newState = {
        ...prev,
        secondaryPanel: {
          ...prev.secondaryPanel,
          type,
          isFullscreen: false,
        },
        isAnimating: true,
      };
      setTimeout(() => savePanelState(newState), 100);
      return newState;
    });
    setTimeout(() => setState(prev => ({ ...prev, isAnimating: false })), 300);
  }, []);

  // Fermer le panel
  const closePanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      secondaryPanel: {
        ...prev.secondaryPanel,
        type: null,
        isFullscreen: false,
      },
      isAnimating: true,
    }));
    setTimeout(() => setState(prev => ({ ...prev, isAnimating: false })), 300);
  }, []);

  // Basculer un panel
  const togglePanel = useCallback((type: PanelType) => {
    setState(prev => {
      if (prev.secondaryPanel.type === type) {
        return {
          ...prev,
          secondaryPanel: {
            ...prev.secondaryPanel,
            type: null,
            isFullscreen: false,
          },
          isAnimating: true,
        };
      }
      return {
        ...prev,
        secondaryPanel: {
          ...prev.secondaryPanel,
          type,
          isFullscreen: false,
        },
        isAnimating: true,
      };
    });
    setTimeout(() => setState(prev => ({ ...prev, isAnimating: false })), 300);
  }, []);

  // Passer en mode plein écran
  const setFullscreen = useCallback((fullscreen: boolean) => {
    setState(prev => ({
      ...prev,
      secondaryPanel: {
        ...prev.secondaryPanel,
        isFullscreen: fullscreen,
      },
      isAnimating: true,
    }));
    setTimeout(() => setState(prev => ({ ...prev, isAnimating: false })), 300);
  }, []);

  // Basculer le mode plein écran
  const toggleFullscreen = useCallback(() => {
    setState(prev => ({
      ...prev,
      secondaryPanel: {
        ...prev.secondaryPanel,
        isFullscreen: !prev.secondaryPanel.isFullscreen,
      },
      isAnimating: true,
    }));
    setTimeout(() => setState(prev => ({ ...prev, isAnimating: false })), 300);
  }, []);

  // Redimensionner le panel
  const resizePanel = useCallback((dimension: number) => {
    setState(prev => {
      const config = prev.secondaryPanel;
      const newState = {
        ...prev,
        secondaryPanel: {
          ...config,
          width: prev.panelPosition === 'right' 
            ? Math.min(Math.max(dimension, config.minWidth), config.maxWidth)
            : config.width,
          height: prev.panelPosition === 'bottom'
            ? Math.min(Math.max(dimension, config.minHeight), config.maxHeight)
            : config.height,
        },
      };
      savePanelState(newState);
      return newState;
    });
  }, []);

  // Changer la position du panel
  const setPanelPosition = useCallback((position: PanelPosition) => {
    setState(prev => {
      const newState = {
        ...prev,
        panelPosition: position,
        isAnimating: true,
      };
      savePanelState(newState);
      return newState;
    });
    setTimeout(() => setState(prev => ({ ...prev, isAnimating: false })), 300);
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setState(prev => {
      const newState = {
        ...prev,
        isSidebarCollapsed: !prev.isSidebarCollapsed,
        isAnimating: true,
      };
      savePanelState(newState);
      return newState;
    });
    setTimeout(() => setState(prev => ({ ...prev, isAnimating: false })), 300);
  }, []);

  // Set sidebar collapsed
  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setState(prev => {
      const newState = {
        ...prev,
        isSidebarCollapsed: collapsed,
        isAnimating: true,
      };
      savePanelState(newState);
      return newState;
    });
    setTimeout(() => setState(prev => ({ ...prev, isAnimating: false })), 300);
  }, []);

  // Vérifier si un panel est ouvert
  const isPanelOpen = useCallback((type: PanelType) => {
    return state.secondaryPanel.type === type;
  }, [state.secondaryPanel.type]);

  const contextValue = useMemo<PanelContextType>(() => ({
    ...state,
    openPanel,
    closePanel,
    togglePanel,
    setFullscreen,
    toggleFullscreen,
    resizePanel,
    setPanelPosition,
    toggleSidebar,
    setSidebarCollapsed,
    isPanelOpen,
  }), [
    state,
    openPanel,
    closePanel,
    togglePanel,
    setFullscreen,
    toggleFullscreen,
    resizePanel,
    setPanelPosition,
    toggleSidebar,
    setSidebarCollapsed,
    isPanelOpen,
  ]);

  return (
    <PanelContext.Provider value={contextValue}>
      {children}
    </PanelContext.Provider>
  );
}
