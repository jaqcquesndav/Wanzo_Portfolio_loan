import { useContext } from 'react';
import { PanelContext, PanelType } from './panelTypes';

// Hook principal pour utiliser le contexte des panels
export function usePanelContext() {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error('usePanelContext must be used within a PanelProvider');
  }
  return context;
}

// Hook pour gérer facilement le panel chat
export function useChatPanel() {
  const { secondaryPanel, openPanel, closePanel, togglePanel, toggleFullscreen } = usePanelContext();
  
  return {
    isOpen: secondaryPanel.type === 'chat',
    isFullscreen: secondaryPanel.isFullscreen,
    open: () => openPanel('chat'),
    close: closePanel,
    toggle: () => togglePanel('chat'),
    toggleFullscreen,
  };
}

// Hook pour les notifications
export function useNotificationsPanel() {
  const { secondaryPanel, openPanel, closePanel, togglePanel } = usePanelContext();
  
  return {
    isOpen: secondaryPanel.type === 'notifications',
    open: () => openPanel('notifications'),
    close: closePanel,
    toggle: () => togglePanel('notifications'),
  };
}

// Hook générique pour n'importe quel type de panel
export function usePanel(type: PanelType) {
  const { secondaryPanel, openPanel, closePanel, togglePanel, toggleFullscreen } = usePanelContext();
  
  return {
    isOpen: secondaryPanel.type === type,
    isFullscreen: secondaryPanel.isFullscreen,
    open: () => openPanel(type),
    close: closePanel,
    toggle: () => togglePanel(type),
    toggleFullscreen,
  };
}
