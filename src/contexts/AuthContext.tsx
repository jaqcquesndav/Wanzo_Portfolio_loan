import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Institution, InstitutionLite } from '../types/institution';
import { auth0Service } from '../services/api/auth/auth0Service';
import { UserRole, UserType } from '../types/users';
import { userApi } from '../services/api/shared/user.api';
import { useAppContextStore } from '../stores/appContextStore';

// Interface pour l'utilisateur adapté avec les nouveaux types
export interface User {
  id: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  email: string;
  role?: UserRole;
  institutionId?: string;
  financialInstitutionId?: string;
  companyId?: string;
  userType?: UserType;
  isCompanyOwner?: boolean;
  picture?: string;
  permissions?: string[];
  language?: 'fr' | 'en';
  status?: 'active' | 'inactive' | 'suspended';
  department?: string;
}

// Statut du contexte utilisateur
export type UserContextStatus = 
  | 'loading'           // Chargement en cours
  | 'authenticated'     // Authentifié avec institution
  | 'no_institution'    // Authentifié mais pas d'institution (mode démo possible)
  | 'demo_mode'         // Mode démo actif (mock data)
  | 'unauthenticated'   // Non authentifié
  | 'error';            // Erreur lors du chargement

// Interface pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  institution: Institution | InstitutionLite | null;
  institutionId: string | null;  // ID de l'institution pour les autres endpoints
  auth0Id: string | null;        // ID Auth0 pour référence
  permissions: string[];          // Permissions de l'utilisateur
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshContext: () => Promise<void>;  // Recharge le contexte depuis /users/me
  enableDemoMode: () => void;           // Active le mode démo si pas d'institution
  isAuthenticated: boolean;
  isLoading: boolean;
  isContextLoaded: boolean;  // Indique si le contexte user+institution est chargé
  isDemoMode: boolean;       // Indique si on est en mode démo
  contextStatus: UserContextStatus;  // Statut détaillé du contexte
  error: string | null;
}

// Créer le contexte avec une valeur par défaut
export const AuthContext = createContext<AuthContextType>({
  user: null,
  institution: null,
  institutionId: null,
  auth0Id: null,
  permissions: [],
  login: async () => {},
  logout: () => {},
  refreshContext: async () => {},
  enableDemoMode: () => {},
  isAuthenticated: false,
  isLoading: false,
  isContextLoaded: false,
  isDemoMode: false,
  contextStatus: 'unauthenticated',
  error: null
});

// Hook personnalisé déplacé dans useAuth.ts

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [institution, setInstitution] = useState<Institution | InstitutionLite | null>(null);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [auth0Id, setAuth0Id] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isContextLoaded, setIsContextLoaded] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [contextStatus, setContextStatus] = useState<UserContextStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  // Store Zustand pour le contexte global (utilisable dans les services API)
  const { setContext: setGlobalContext, clearContext: clearGlobalContext } = useAppContextStore();

  /**
   * Charge le contexte complet depuis /users/me
   * Cette fonction est le coeur de l'intégrité des données
   * Elle fournit l'institutionId nécessaire pour tous les autres endpoints
   * 
   * @returns 'success' | 'no_institution' | 'error'
   */
  const loadUserContext = useCallback(async (): Promise<'success' | 'no_institution' | 'error'> => {
    try {
      console.log('🔄 Chargement du contexte utilisateur depuis /users/me...');
      
      const response = await userApi.getCurrentUserWithInstitution();
      
      // Extraire les données de la réponse
      const { user: userData, institution: institutionData, auth0Id: authId, role, permissions: userPermissions } = response;
      
      // Construire l'objet utilisateur complet
      const fullUser: User = {
        ...userData,
        role: role || userData.role,
        permissions: userPermissions
      };
      
      // Stocker l'utilisateur dans tous les cas
      setUser(fullUser);
      setAuth0Id(authId);
      setPermissions(userPermissions || []);
      
      // Vérifier si l'utilisateur a une institution associée
      if (!institutionData || !institutionData.id) {
        console.warn('⚠️ Utilisateur authentifié mais SANS institution');
        console.log('💡 L\'utilisateur doit créer son institution sur wanzo.com ou utiliser le mode démo');
        
        setInstitution(null);
        setInstitutionId(null);
        setIsContextLoaded(true);
        setContextStatus('no_institution');
        
        return 'no_institution';
      }
      
      // Institution présente - tout est OK
      setInstitution(institutionData);
      setInstitutionId(institutionData.id);
      setIsContextLoaded(true);
      setContextStatus('authenticated');
      setIsDemoMode(false);
      
      // IMPORTANT: Synchroniser avec le store Zustand pour les services API
      setGlobalContext({
        user: fullUser,
        institution: institutionData,
        auth0Id: authId,
        permissions: userPermissions || []
      });
      
      console.log('✅ Contexte chargé avec succès:', {
        userId: userData.id,
        userName: userData.name,
        institutionId: institutionData.id,
        institutionName: institutionData.name,
        role,
        permissionsCount: userPermissions?.length || 0
      });
      
      return 'success';
    } catch (err) {
      console.error('❌ Erreur lors du chargement du contexte /users/me:', err);
      setIsContextLoaded(false);
      setContextStatus('error');
      return 'error';
    }
  }, [setGlobalContext]);

  /**
   * Rafraîchit le contexte utilisateur/institution
   * Utile après des modifications ou pour forcer un rechargement
   */
  const refreshContext = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadUserContext();
    } finally {
      setIsLoading(false);
    }
  }, [loadUserContext]);

  /**
   * Active le mode démo avec des données mockées
   * À utiliser quand l'utilisateur n'a pas d'institution et veut explorer l'app
   */
  const enableDemoMode = useCallback(() => {
    console.log('🎮 Activation du mode DEMO...');
    
    const mockInstitution: InstitutionLite = {
      id: 'demo-institution-001',
      name: 'Institution Démo - Wanzo',
      type: 'bank',
      status: 'active',
      country: 'CD',
      city: 'Kinshasa',
      logo: '/assets/demo-logo.png',
      documents: [],
      settings: {
        currency: 'USD',
        language: 'fr',
        timezone: 'Africa/Kinshasa'
      }
    };
    
    // Mettre à jour avec les données mock
    setInstitution(mockInstitution);
    setInstitutionId(mockInstitution.id);
    setIsDemoMode(true);
    setContextStatus('demo_mode');
    setIsContextLoaded(true);
    
    // Synchroniser avec le store Zustand pour les services API en mode démo
    if (user) {
      setGlobalContext({
        user: user,
        institution: mockInstitution,
        auth0Id: auth0Id || 'demo-auth0-id',
        permissions: permissions.length > 0 ? permissions : ['view_dashboard', 'view_reports'],
        isDemoMode: true
      });
    }
    
    console.log('✅ Mode DEMO activé:', {
      institutionId: mockInstitution.id,
      institutionName: mockInstitution.name
    });
  }, [user, auth0Id, permissions, setGlobalContext]);

  // Effet pour vérifier si l'utilisateur est déjà connecté au chargement de l'application
  useEffect(() => {
    const checkAuth = async () => {
      setContextStatus('loading');
      
      try {
        // Vérifier s'il y a un utilisateur authentifié via Auth0
        if (auth0Service.isAuthenticated()) {
          const storedUser = auth0Service.getUser();
          
          if (storedUser) {
            // Charger le contexte complet depuis /users/me
            const result = await loadUserContext();
            
            if (result === 'error') {
              // Erreur API - fallback vers les données stockées
              console.warn('⚠️ /users/me échoué, fallback vers données Auth0 stockées');
              setUser(storedUser);
              setInstitutionId(storedUser.institutionId || null);
              setContextStatus(storedUser.institutionId ? 'authenticated' : 'no_institution');
            }
            // 'success' et 'no_institution' sont gérés dans loadUserContext
          }
        } else {
          setContextStatus('unauthenticated');
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'authentification:', err);
        setContextStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [loadUserContext]);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setIsContextLoaded(false);
    
    try {
      // Dans une implémentation réelle, nous utiliserions le mot de passe ici
      console.log(`🔐 Tentative de connexion pour: ${email}`);
      
      // Pour la démo, nous créons un utilisateur avec le rôle Admin par défaut
      let role: UserRole = 'Admin';
      
      // Détermination du rôle basée sur l'email pour la démonstration
      if (email.toLowerCase().includes('portfolio')) {
        role = 'Portfolio_Manager';
      } else if (email.toLowerCase().includes('audit')) {
        role = 'Auditor';
      } else if (email.toLowerCase().includes('user')) {
        role = 'User';
      }
      
      // Générer un nom pour la démonstration
      let fullName = 'Joseph Kabila';
      let givenName = 'Joseph';
      let familyName = 'Kabila';
      
      if (role === 'Portfolio_Manager') {
        fullName = 'Emmanuel Shadary';
        givenName = 'Emmanuel';
        familyName = 'Shadary';
      } else if (role === 'Auditor') {
        fullName = 'Félix Tshisekedi';
        givenName = 'Félix';
        familyName = 'Tshisekedi';
      } else if (role === 'User') {
        fullName = 'Patrice Lumumba';
        givenName = 'Patrice';
        familyName = 'Lumumba';
      }
      
      // Stocker les credentials pour Auth0 (pour persistance)
      const mockUser: User = {
        id: '12345',
        name: fullName,
        givenName,
        familyName,
        email,
        role,
        institutionId: '123456',
        financialInstitutionId: 'fin-001',
        userType: 'financial_institution',
        isCompanyOwner: role === 'Admin',
        picture: '/avatars/profile.jpg',
        permissions: ['manage_users', 'view_reports', 'edit_settings'],
        language: 'fr'
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // IMPORTANT: Charger le contexte complet depuis /users/me
      // Cet appel est CRITIQUE car il fournit l'institutionId pour tous les autres endpoints
      console.log('🔄 Chargement du contexte depuis /users/me après login...');
      const result = await loadUserContext();
      
      if (result === 'error') {
        // Fallback vers les données mockées si /users/me échoue (mode dev/demo)
        console.warn('⚠️ /users/me non disponible, activation du mode DEMO automatique');
        
        // Stocker l'utilisateur mock
        setUser(mockUser);
        setPermissions(mockUser.permissions || []);
        
        // Activer automatiquement le mode démo
        enableDemoMode();
        
        console.log('✅ Mode DEMO activé automatiquement après échec /users/me');
      } else if (result === 'no_institution') {
        // L'utilisateur est authentifié mais n'a pas d'institution
        // Le contextStatus est déjà 'no_institution', on laisse l'UI décider
        console.log('ℹ️ Utilisateur sans institution - en attente de décision (mode démo ou création institution)');
      }
      // 'success' - tout est géré dans loadUserContext
      
    } catch (err) {
      setError('Échec de la connexion. Veuillez vérifier vos identifiants.');
      console.error('❌ Erreur de connexion:', err);
      setIsContextLoaded(false);
      setContextStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    console.log('🚪 Déconnexion et nettoyage du contexte...');
    
    // Nettoyer l'état local React
    setUser(null);
    setInstitution(null);
    setInstitutionId(null);
    setAuth0Id(null);
    setPermissions([]);
    setIsContextLoaded(false);
    setIsDemoMode(false);
    setContextStatus('unauthenticated');
    
    // Nettoyer le stockage local
    localStorage.removeItem('user');
    auth0Service.clearAuth();
    
    // IMPORTANT: Nettoyer le store Zustand global
    clearGlobalContext();
    
    console.log('✅ Contexte complètement nettoyé');
  };

  // Valeur du contexte - TOUJOURS inclure institutionId pour les autres endpoints
  const value = {
    user,
    institution,
    institutionId,
    auth0Id,
    permissions,
    login,
    logout,
    refreshContext,
    enableDemoMode,
    isAuthenticated: !!user,
    isLoading,
    isContextLoaded,
    isDemoMode,
    contextStatus,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
