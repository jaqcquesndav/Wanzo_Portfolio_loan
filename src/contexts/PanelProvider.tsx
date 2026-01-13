import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  PanelContext, 
  PanelState, 
  PanelContextType, 
  PanelType, 
  PanelPosition,
  defaultPanelConfig,
  defaultPanelState,
  getPanelConstraints,
  PANEL_STATE_KEY 
} from './panelTypes';

// Charger l'état depuis localStorage
function loadPanelState(): Partial<PanelState> {
  try {
    const saved = localStorage.getItem(PANEL_STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const constraints = getPanelConstraints();
      
      // Clamp saved values to current viewport constraints
      const width = Math.min(Math.max(parsed.panelWidth || defaultPanelConfig.width, constraints.minWidth), constraints.maxWidth);
      const height = Math.min(Math.max(parsed.panelHeight || defaultPanelConfig.height, constraints.minHeight), constraints.maxHeight);
      
      return {
        panelPosition: parsed.panelPosition || 'right',
        isSidebarCollapsed: parsed.isSidebarCollapsed || false,
        secondaryPanel: {
          ...defaultPanelConfig,
          ...constraints,
          width,
          height,
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
  // Charger l'état initial depuis localStorage avec contraintes dynamiques
  const initialState = useMemo(() => {
    const constraints = getPanelConstraints();
    return {
      ...defaultPanelState,
      secondaryPanel: {
        ...defaultPanelState.secondaryPanel,
        ...constraints,
      },
      ...loadPanelState(),
    };
  }, []);

  const [state, setState] = useState<PanelState>(initialState);

  // Update constraints when window resizes
  useEffect(() => {
    const handleResize = () => {
      const constraints = getPanelConstraints();
      setState(prev => ({
        ...prev,
        secondaryPanel: {
          ...prev.secondaryPanel,
          ...constraints,
          // Clamp current dimensions to new constraints
          width: Math.min(Math.max(prev.secondaryPanel.width, constraints.minWidth), constraints.maxWidth),
          height: Math.min(Math.max(prev.secondaryPanel.height, constraints.minHeight), constraints.maxHeight),
        },
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Redimensionner le panel - appelé uniquement à la fin du drag
  const resizePanel = useCallback((dimension: number) => {
    setState(prev => {
      const config = prev.secondaryPanel;
      const clampedDimension = prev.panelPosition === 'right'
        ? Math.min(Math.max(dimension, config.minWidth), config.maxWidth)
        : Math.min(Math.max(dimension, config.minHeight), config.maxHeight);
      
      const newState = {
        ...prev,
        secondaryPanel: {
          ...config,
          width: prev.panelPosition === 'right' ? clampedDimension : config.width,
          height: prev.panelPosition === 'bottom' ? clampedDimension : config.height,
        },
      };
      // Defer localStorage save to avoid blocking
      requestAnimationFrame(() => savePanelState(newState));
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
