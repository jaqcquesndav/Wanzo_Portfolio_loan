// Re-export everything from the split files for backward compatibility
// Types and context
export { 
  PanelContext,
  type PanelType, 
  type PanelPosition, 
  type PanelConfig, 
  type PanelState, 
  type PanelActions, 
  type PanelContextType 
} from './panelTypes';

// Provider component
export { PanelProvider } from './PanelProvider';

// Hooks
export { 
  usePanelContext, 
  useChatPanel, 
  useNotificationsPanel, 
  usePanel 
} from './usePanelContext';
