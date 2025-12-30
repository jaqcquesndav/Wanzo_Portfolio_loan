/**
 * Store global pour le contexte de l'application
 * 
 * Ce store Zustand gère le contexte global de l'application qui est nécessaire 
 * pour tous les appels API. Il stocke notamment:
 * - L'ID de l'institution (institutionId) - CRITIQUE pour tous les endpoints
 * - L'ID Auth0 de l'utilisateur
 * - Les permissions de l'utilisateur
 * 
 * Ce store est synchrone et peut être utilisé en dehors des composants React,
 * notamment dans les services API.
 * 
 * @see API DOCUMENTATION/utilisateurs/README.md pour plus de détails sur l'endpoint /users/me
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { InstitutionLite } from '../types/institution';
import { User } from '../types/user';

// Interface du contexte global de l'application
export interface AppContextState {
  // Données de l'utilisateur connecté
  user: User | null;
  
  // Données de l'institution (version lite pour optimisation)
  institution: InstitutionLite | null;
  
  // ID de l'institution - CRITIQUE pour tous les appels API
  institutionId: string | null;
  
  // ID Auth0 de l'utilisateur
  auth0Id: string | null;
  
  // Permissions de l'utilisateur
  permissions: string[];
  
  // Indique si le contexte a été chargé depuis l'API /users/me
  isContextLoaded: boolean;
  
  // Indique si on est en mode démo (données mockées)
  isDemoMode: boolean;
  
  // Timestamp du dernier chargement du contexte
  lastLoadedAt: number | null;
}

// Interface des actions du store
export interface AppContextActions {
  // Définir le contexte complet après l'appel à /users/me
  setContext: (context: {
    user: User;
    institution: InstitutionLite | null;  // Peut être null pour les nouveaux utilisateurs
    auth0Id: string;
    permissions: string[];
    isDemoMode?: boolean;
  }) => void;
  
  // Mettre à jour uniquement l'utilisateur
  setUser: (user: User | null) => void;
  
  // Mettre à jour uniquement l'institution
  setInstitution: (institution: InstitutionLite | null) => void;
  
  // Mettre à jour les permissions
  setPermissions: (permissions: string[]) => void;
  
  // Réinitialiser le contexte (lors de la déconnexion)
  clearContext: () => void;
  
  // Vérifier si le contexte est valide et prêt à être utilisé
  isContextReady: () => boolean;
  
  // Obtenir l'institutionId de manière synchrone (pour les services API)
  getInstitutionId: () => string | null;
}

// État initial
const initialState: AppContextState = {
  user: null,
  institution: null,
  institutionId: null,
  auth0Id: null,
  permissions: [],
  isContextLoaded: false,
  isDemoMode: false,
  lastLoadedAt: null,
};

/**
 * Store Zustand pour le contexte global de l'application
 * 
 * Utilise la persistance pour maintenir le contexte entre les rechargements de page.
 * IMPORTANT: L'institutionId DOIT être chargé via /users/me avant de pouvoir utiliser
 * les autres endpoints de l'API.
 */
export const useAppContextStore = create<AppContextState & AppContextActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setContext: ({ user, institution, auth0Id, permissions, isDemoMode = false }) => {
        // Gérer le cas où institution peut être null (nouvel utilisateur sans institution)
        set({
          user,
          institution: institution || null,
          institutionId: institution?.id || null,
          auth0Id,
          permissions,
          isContextLoaded: true,
          isDemoMode,
          lastLoadedAt: Date.now(),
        });
      },
      
      setUser: (user) => {
        set({ user });
      },
      
      setInstitution: (institution) => {
        set({ 
          institution,
          institutionId: institution?.id || null,
        });
      },
      
      setPermissions: (permissions) => {
        set({ permissions });
      },
      
      clearContext: () => {
        set(initialState);
      },
      
      isContextReady: () => {
        const state = get();
        return state.isContextLoaded && !!state.institutionId && !!state.user;
      },
      
      getInstitutionId: () => {
        return get().institutionId;
      },
    }),
    {
      name: 'app-context-storage',
      storage: createJSONStorage(() => localStorage),
      // Ne persister que les données essentielles
      partialize: (state) => ({
        institutionId: state.institutionId,
        auth0Id: state.auth0Id,
        isContextLoaded: state.isContextLoaded,
        lastLoadedAt: state.lastLoadedAt,
        // Note: user et institution seront rechargés depuis /users/me au démarrage
      }),
    }
  )
);

/**
 * Fonction utilitaire pour obtenir l'institutionId de manière synchrone
 * Utilisable en dehors des composants React (ex: dans les services API)
 */
export const getInstitutionId = (): string | null => {
  return useAppContextStore.getState().institutionId;
};

/**
 * Fonction utilitaire pour vérifier si le contexte est prêt
 * Utilisable en dehors des composants React
 */
export const isAppContextReady = (): boolean => {
  return useAppContextStore.getState().isContextReady();
};

/**
 * Fonction utilitaire pour obtenir le contexte complet
 * Utilisable en dehors des composants React
 */
export const getAppContext = (): AppContextState => {
  return useAppContextStore.getState();
};

/**
 * Fonction utilitaire pour vérifier si on est en mode démo
 * Utilisable en dehors des composants React
 */
export const isDemoMode = (): boolean => {
  return useAppContextStore.getState().isDemoMode;
};
