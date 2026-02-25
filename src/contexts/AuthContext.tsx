import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Institution, InstitutionLite, InstitutionProfile } from '../types/institution';
import { auth0Service } from '../services/api/auth/auth0Service';
import { UserRole, UserType } from '../types/users';
import { userApi } from '../services/api/shared/user.api';
import { useAppContextStore } from '../stores/appContextStore';
import { resetTokenExchangeFlag } from '../pages/AuthCallback';

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
  institutionProfile: InstitutionProfile | null;  // Profil détaillé de l'institution
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
  institutionProfile: null,
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
  const [institutionProfile, setInstitutionProfile] = useState<InstitutionProfile | null>(null);
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
      console.log('📦 Réponse brute /users/me:', response);
      
      // Gérer les deux formats possibles de réponse :
      // Format 1: { user, institution, institutionProfile, auth0Id, role, permissions } (déjà extrait par base.api.ts)
      // Format 2: { data: { user, institution, institutionProfile, auth0Id, role, permissions } } (non extrait)
      const responseData = (response as { data?: unknown }).data || response;
      
      // Extraire les données de la réponse
      const { 
        user: userData, 
        institution: institutionData,
        institutionProfile: profileData,
        auth0Id: authId, 
        role, 
        permissions: userPermissions 
      } = responseData as {
        user: User & { institutionId?: string; firstName?: string; lastName?: string; givenName?: string; familyName?: string };
        institution: InstitutionLite | null;
        institutionProfile?: InstitutionProfile | null;
        auth0Id: string;
        role: string;
        permissions: string[];
      };
      
      // Vérifier que les données utilisateur sont présentes
      if (!userData) {
        console.error('❌ Données utilisateur manquantes dans la réponse /users/me');
        throw new Error('Données utilisateur non disponibles');
      }
      
      console.log('👤 Données utilisateur extraites:', {
        id: userData?.id,
        name: userData?.name,
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        email: userData?.email,
        institutionId: userData?.institutionId
      });
      
      console.log('🏢 Profil institution extrait:', {
        denominationSociale: profileData?.denominationSociale,
        typeInstitution: profileData?.typeInstitution,
        servicesCount: profileData?.servicesCredit?.length || 0
      });
      
      // Construire l'objet utilisateur complet
      // L'API peut renvoyer firstName/lastName au lieu de givenName/familyName
      // On construit le nom complet si nécessaire
      const firstName = userData?.firstName || userData?.givenName || '';
      const lastName = userData?.lastName || userData?.familyName || '';
      const fullName = userData?.name || `${firstName} ${lastName}`.trim() || userData?.email?.split('@')[0] || 'Utilisateur';
      
      const fullUser: User = {
        ...userData,
        name: fullName,
        givenName: firstName,
        familyName: lastName,
        role: role || userData?.role || 'user',  // Fallback sécurisé
        permissions: userPermissions || []
      };
      
      // Stocker l'utilisateur dans tous les cas
      setUser(fullUser);
      setAuth0Id(authId || '');
      setPermissions(userPermissions || []);
      
      // Stocker le profil de l'institution s'il existe
      if (profileData) {
        setInstitutionProfile(profileData);
      }
      
      // Vérifier si l'utilisateur a une institution associée
      // L'institution peut être fournie directement OU via userData.institutionId
      const effectiveInstitutionId = institutionData?.id || userData?.institutionId;
      
      if (!effectiveInstitutionId) {
        console.warn('⚠️ Utilisateur authentifié mais SANS institution');
        console.log('💡 L\'utilisateur doit créer son institution sur wanzo.com ou utiliser le mode démo');
        
        setInstitution(null);
        setInstitutionId(null);
        setIsContextLoaded(true);
        setContextStatus('no_institution');
        
        return 'no_institution';
      }
      
      // Institution présente - utiliser les données de /users/me directement
      // Note: Le backend n'a pas d'endpoint GET /institutions/:id, donc on utilise
      // les données d'institution retournées par /users/me
      console.log('🏢 Institution chargée depuis /users/me:', effectiveInstitutionId);
      
      const fullInstitution: Institution | InstitutionLite | null = institutionData || null;
      
      // Stocker l'institution ET l'institutionId (TOUJOURS défini à ce point)
      setInstitution(fullInstitution);
      setInstitutionId(effectiveInstitutionId);  // CRITIQUE: toujours défini ici
      setIsContextLoaded(true);
      setContextStatus('authenticated');
      setIsDemoMode(false);
      
      // IMPORTANT: Synchroniser avec le store Zustand pour les services API
      // On utilise getState() pour éviter les problèmes de closure avec dépendances []
      // On passe EXPLICITEMENT l'institutionId car institution peut être null
      useAppContextStore.getState().setContext({
        user: fullUser,
        institution: fullInstitution,
        institutionProfile: profileData || null,
        institutionId: effectiveInstitutionId,  // EXPLICITE: pour que le store ait l'ID même si institution est null
        auth0Id: authId,
        permissions: userPermissions || []
      });
      
      console.log('✅ Contexte chargé avec succès:', {
        userId: userData.id,
        userName: fullName,
        institutionId: effectiveInstitutionId,
        institutionName: fullInstitution?.name || 'N/A',
        hasProfile: !!profileData,
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
  }, []); // Pas de dépendances dynamiques

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
    
    const mockInstitutionId = 'demo-institution-001';
    const mockInstitution: InstitutionLite = {
      id: mockInstitutionId,
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
    
    const mockUser: User = {
      id: 'demo-user-001',
      email: 'demo@wanzo.io',
      name: 'Utilisateur Démo',
      givenName: 'Utilisateur',
      familyName: 'Démo',
      role: 'admin',
      institutionId: mockInstitutionId,
      permissions: ['view_dashboard', 'view_reports', 'manage_portfolios']
    };
    
    // Mettre à jour l'état React
    setUser(mockUser);
    setInstitution(mockInstitution);
    setInstitutionId(mockInstitutionId);
    setAuth0Id('demo-auth0-id');
    setPermissions(mockUser.permissions || []);
    setIsDemoMode(true);
    setContextStatus('demo_mode');
    setIsContextLoaded(true);
    
    // Synchroniser avec le store Zustand pour les services API en mode démo
    // IMPORTANT: On utilise useAppContextStore.getState().setContext directement
    // pour éviter les problèmes de closure avec les dépendances vides
    useAppContextStore.getState().setContext({
      user: mockUser,
      institution: mockInstitution,
      institutionId: mockInstitutionId,  // EXPLICITE
      auth0Id: 'demo-auth0-id',
      permissions: mockUser.permissions || [],
      isDemoMode: true
    });
    
    console.log('✅ Mode DEMO activé:', {
      institutionId: mockInstitutionId,
      institutionName: mockInstitution.name,
      userId: mockUser.id
    });
  }, []); // Pas de dépendances - utilise getState() pour le store

  // Effet pour vérifier si l'utilisateur est déjà connecté au chargement de l'application
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔐 AuthContext: checkAuth démarré');
      setContextStatus('loading');
      
      try {
        const isAuth = auth0Service.isAuthenticated();
        const token = auth0Service.getAccessToken();
        console.log('🔐 AuthContext: isAuthenticated =', isAuth, 'token =', token ? 'present' : 'absent');
        
        // Vérifier s'il y a un utilisateur authentifié via Auth0
        if (isAuth) {
          // Token présent = utilisateur authentifié
          // On charge TOUJOURS le contexte depuis /users/me pour avoir les vraies données
          console.log('🔐 AuthContext: Token présent, appel /users/me pour charger le contexte...');
          const result = await loadUserContext();
          console.log('🔐 AuthContext: loadUserContext result =', result);
          
          if (result === 'error') {
            // Erreur API - essayer avec les données stockées localement en fallback
            const storedUser = auth0Service.getUser();
            console.log('🔐 AuthContext: storedUser fallback =', storedUser);
            
            if (storedUser) {
              console.warn('⚠️ /users/me échoué, fallback vers données Auth0 stockées');
              setUser(storedUser);
              setInstitutionId(storedUser.institutionId || null);
              setContextStatus(storedUser.institutionId ? 'authenticated' : 'no_institution');
              setIsContextLoaded(true);
              
              // IMPORTANT: Synchroniser aussi avec le store Zustand pour les appels API
              if (storedUser.institutionId) {
                useAppContextStore.getState().setContext({
                  user: storedUser,
                  institution: null,  // On n'a pas l'institution en local
                  institutionId: storedUser.institutionId,
                  auth0Id: storedUser.id || 'unknown',
                  permissions: storedUser.permissions || []
                });
              }
            } else {
              // Pas de token local non plus - interdire l'accès, ne pas activer le mode démo
              console.warn('🔐 AuthContext: Erreur API et pas de données locales → contextStatus = error');
              setContextStatus('error');
              setIsContextLoaded(true);
            }
          }
        } else {
          // PAS AUTHENTIFIÉ - Laisser afficher la page de login
          console.log('🔐 AuthContext: Pas authentifié (pas de token)');
          setContextStatus('unauthenticated');
          setIsContextLoaded(true);
          
          // Rediriger vers la page de login si on n'y est pas déjà
          if (window.location.pathname !== '/' && window.location.pathname !== '/auth/callback') {
            window.location.href = '/';
          }
        }
      } catch (err) {
        console.error('❌ AuthContext: Erreur lors de la vérification de l\'authentification:', err);
        setContextStatus('error');
        setIsContextLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Exécuter une seule fois au montage

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setIsContextLoaded(false);
    
    try {
      // Dans une implémentation réelle, nous utiliserions le mot de passe ici
      console.log(`🔐 Tentative de connexion pour: ${email}`);
      
      // Pour la démo, nous créons un utilisateur avec le rôle Admin par défaut
      let role: UserRole = 'admin';
      
      // Détermination du rôle basée sur l'email pour la démonstration
      if (email.toLowerCase().includes('portfolio')) {
        role = 'portfolio_manager';
      } else if (email.toLowerCase().includes('audit')) {
        role = 'auditor';
      } else if (email.toLowerCase().includes('user')) {
        role = 'user';
      }
      
      // Générer un nom pour la démonstration
      let fullName = 'Joseph Kabila';
      let givenName = 'Joseph';
      let familyName = 'Kabila';
      
      if (role === 'portfolio_manager') {
        fullName = 'Emmanuel Shadary';
        givenName = 'Emmanuel';
        familyName = 'Shadary';
      } else if (role === 'auditor') {
        fullName = 'Félix Tshisekedi';
        givenName = 'Félix';
        familyName = 'Tshisekedi';
      } else if (role === 'user') {
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
        isCompanyOwner: role === 'admin',
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
        // /users/me inaccessible — ne pas accorder d'accès silencieusement
        // L'utilisateur sera redirigé vers / par ProtectedRoute (contextStatus = 'error')
        console.warn('⚠️ /users/me non disponible après login, accès refusé');
        setError('Le service est temporairement indisponible. Veuillez réessayer.');
        setContextStatus('error');
        setIsContextLoaded(true);
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
    
    // IMPORTANT: Réinitialiser le flag d'échange de token pour permettre une nouvelle connexion
    resetTokenExchangeFlag();
    
    // IMPORTANT: Nettoyer le store Zustand global
    clearGlobalContext();
    
    console.log('✅ Contexte complètement nettoyé');
  };

  // Valeur du contexte - TOUJOURS inclure institutionId pour les autres endpoints
  const value = {
    user,
    institution,
    institutionProfile,
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
