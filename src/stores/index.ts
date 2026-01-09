/**
 * Point d'entrée des stores Zustand
 * 
 * Centralise l'exportation de tous les stores pour une utilisation simplifiée
 */

// Store des notifications toast
export { useToastStore } from './toastStore';
export type { ToastType, ToastData } from './toastStore';

// Store du contexte global de l'application
export { 
  useAppContextStore,
  getInstitutionId,
  isAppContextReady,
  getAppContext,
  isDemoMode,
} from './appContextStore';
export type { AppContextState, AppContextActions } from './appContextStore';
