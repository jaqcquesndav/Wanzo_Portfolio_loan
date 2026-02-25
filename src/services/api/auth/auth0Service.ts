// src/services/auth/auth0Service.ts
import { User } from '../../../contexts/AuthContext';
import { UserRole, UserType } from '../../../types/users';

// Clés de stockage centralisées pour l'authentification
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth0_access_token',
  ID_TOKEN: 'auth0_id_token',
  REFRESH_TOKEN: 'auth0_refresh_token',
  USER: 'auth0_user',
  STATE: 'auth0_state',
  CODE_VERIFIER: 'auth0_code_verifier'
};

interface Auth0User {
  sub: string;
  name?: string;
  email: string;
  picture?: string;
  nickname?: string;
  given_name?: string;
  family_name?: string;
  role?: string;
  user_type?: string;
  institution_id?: string;
  company_id?: string;
  is_company_owner?: boolean;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Service pour gérer l'authentification Auth0
 */
class Auth0Service {
  /**
   * Vérifie si l'utilisateur est actuellement authentifié
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Récupère le token d'accès stocké
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || 
           localStorage.getItem('token') || // Pour compatibilité
           localStorage.getItem('auth0_token') || // Pour compatibilité
           localStorage.getItem('accessToken'); // Pour compatibilité
  }

  /**
   * Récupère les informations de l'utilisateur stockées
   */
  getUser(): User | null {
    // Essayer d'abord avec la clé principale
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) {
      try {
        const auth0User = JSON.parse(storedUser) as Auth0User;
        return this.mapAuth0UserToAppUser(auth0User);
      } catch (error) {
        console.error('Erreur lors de la lecture des données utilisateur:', error);
      }
    }
    
    // Fallback sur l'ancienne clé
    const legacyUser = localStorage.getItem('user');
    if (legacyUser) {
      try {
        return JSON.parse(legacyUser) as User;
      } catch (error) {
        console.error('Erreur lors de la lecture des données utilisateur legacy:', error);
      }
    }
    
    return null;
  }

  /**
   * Enregistre les jetons d'authentification
   */
  saveTokens(accessToken: string, idToken?: string, refreshToken?: string): void {
    // Stocker avec les nouvelles clés
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    
    // Stocker avec les anciennes clés pour compatibilité
    localStorage.setItem('token', accessToken);
    localStorage.setItem('auth0_token', accessToken);
    localStorage.setItem('accessToken', accessToken);
    
    // Stocker les autres tokens si présents
    if (idToken) {
      localStorage.setItem(STORAGE_KEYS.ID_TOKEN, idToken);
      localStorage.setItem('id_token', idToken); // Pour compatibilité
    }
    
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem('refresh_token', refreshToken); // Pour compatibilité
    }
  }

  /**
   * Enregistre les informations utilisateur
   */
  saveUser(auth0User: Auth0User): User {
    const appUser = this.mapAuth0UserToAppUser(auth0User);
    
    // Stocker avec les nouvelles clés
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(auth0User));
    
    // Stocker avec les anciennes clés pour compatibilité
    localStorage.setItem('user', JSON.stringify(appUser));
    localStorage.setItem('auth0_user', JSON.stringify(auth0User));
    
    return appUser;
  }

  /**
   * Supprime toutes les données d'authentification
   */
  clearAuth(): void {
    console.log('🧹 Nettoyage complet des données d\'authentification...');
    
    // Supprimer les tokens - nouvelles clés
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ID_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.STATE);
    localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
    
    // Supprimer les anciennes clés pour compatibilité
    localStorage.removeItem('token');
    localStorage.removeItem('auth0_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth0_user');
    
    // Supprimer les données Wanzo spécifiques
    localStorage.removeItem('wanzo_no_institution');
    localStorage.removeItem('wanzo_backend_unavailable');
    localStorage.removeItem('portfolioType');
    
    // Nettoyer sessionStorage aussi
    sessionStorage.removeItem('auth_callback_in_progress');
    
    // Nettoyer le store Zustand persisté
    localStorage.removeItem('app-context-storage');
    
    console.log('✅ Nettoyage terminé');
  }

  /**
   * Convertit un utilisateur Auth0 en utilisateur de l'application
   */
  private mapAuth0UserToAppUser(auth0User: Auth0User): User {
    // Valider le rôle pour s'assurer qu'il est l'un des types acceptés
    const userRole = this.validateUserRole(auth0User.role);
    
    // Construire un utilisateur avec les nouveaux champs
    return {
      id: auth0User.sub,
      name: auth0User.name || auth0User.nickname || `${auth0User.given_name || ''} ${auth0User.family_name || ''}`.trim() || 'Utilisateur',
      givenName: auth0User.given_name,
      familyName: auth0User.family_name,
      email: auth0User.email || '',
      role: userRole,
      picture: auth0User.picture,
      userType: (auth0User.user_type as UserType) || 'financial_institution',
      financialInstitutionId: auth0User.institution_id,
      companyId: auth0User.company_id,
      isCompanyOwner: auth0User.is_company_owner || userRole === 'Admin',
      // Ajouter d'autres champs selon les besoins
      permissions: ['manage_users', 'view_reports', 'edit_settings'] // Permissions par défaut
    };
  }
  
  /**
   * Valide que le rôle est l'un des rôles autorisés
   * Si le rôle n'est pas valide ou non défini, le rôle Admin est attribué par défaut
   */
  private validateUserRole(role?: string): UserRole {
    // Conversion des anciens rôles vers les nouveaux formats
    if (role === 'admin') return 'Admin';
    if (role === 'manager') return 'Portfolio_Manager';
    if (role === 'user') return 'User';
    
    // Vérification des nouveaux formats de rôle
    if (role === 'Admin' || role === 'Portfolio_Manager' || role === 'Auditor' || role === 'User') {
      return role as UserRole;
    }
    
    // Rôle Admin par défaut si le rôle n'est pas valide ou n'est pas spécifié
    // Comme demandé, nous définissons l'utilisateur comme Admin par défaut
    return 'Admin';
  }

  /**
   * Sauvegarde le code verifier pour le flux PKCE
   */
  saveCodeVerifier(codeVerifier: string): void {
    localStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
  }

  /**
   * Sauvegarde l'état pour le flux d'authentification
   */
  saveState(state: string): void {
    localStorage.setItem(STORAGE_KEYS.STATE, state);
  }

  /**
   * Récupère le code verifier stocké
   */
  getCodeVerifier(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
  }

  /**
   * Récupère l'état stocké
   */
  getState(): string | null {
    return localStorage.getItem(STORAGE_KEYS.STATE);
  }

  /**
   * Nettoie les données temporaires d'authentification
   */
  clearAuthTemp(): void {
    localStorage.removeItem(STORAGE_KEYS.STATE);
    localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
  }

  /**
   * Génère l'URL de déconnexion Auth0 pour une déconnexion complète.
   * Utilise VITE_AUTH0_ALLOWED_LOGOUT_URLS (défini dans .env / .env.production)
   * comme URL de retour — cette valeur doit correspondre exactement à ce qui est
   * enregistré dans "Allowed Logout URLs" du dashboard Auth0.
   */
  getLogoutUrl(): string {
    const domain = import.meta.env.VITE_AUTH0_DOMAIN;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

    // Priorité : utiliser VITE_AUTH0_ALLOWED_LOGOUT_URLS s'il est défini,
    // car il correspond exactement à la valeur enregistrée dans le dashboard Auth0
    // sous "Allowed Logout URLs". Auth0 fait une correspondance exacte — toute
    // divergence (protocole, domaine, trailing slash) provoque l'erreur "Oops!".
    // Fallback : window.location.origin + '/' (utile en développement local).
    const configuredUrl = import.meta.env.VITE_AUTH0_ALLOWED_LOGOUT_URLS as string | undefined;
    const returnToUrl = configuredUrl
      ? configuredUrl.split(',')[0].trim() // prendre la première URL si liste CSV
      : window.location.origin + '/';

    const returnTo = encodeURIComponent(returnToUrl);

    if (!domain || !clientId) {
      console.warn('[Auth0] Variables d\'environnement manquantes pour la déconnexion');
      window.location.href = returnToUrl;
      return returnToUrl;
    }

    console.log('[Auth0] Logout returnTo:', returnToUrl);
    return `https://${domain}/v2/logout?client_id=${clientId}&returnTo=${returnTo}`;
  }

  /**
   * Effectue une déconnexion complète :
   * 1. Nettoie toutes les données locales (tokens, flags, stores)
   * 2. Redirige vers Auth0 /v2/logout qui invalide la session SSO,
   *    puis renvoie l'utilisateur vers VITE_AUTH0_ALLOWED_LOGOUT_URLS (la page de login).
   */
  performFullLogout(): void {
    console.log('🚪 Déconnexion complète Auth0 en cours...');

    // Nettoyer toutes les données locales
    this.clearAuth();
    this.clearAuthTemp();
    localStorage.removeItem('wanzo_no_institution');
    localStorage.removeItem('wanzo_backend_unavailable');
    localStorage.removeItem('app-context-storage');
    localStorage.removeItem('portfolioType');

    // Obtenir l'URL de déconnexion Auth0 avec le bon returnTo
    const logoutUrl = this.getLogoutUrl();

    console.log('🔗 Redirection vers Auth0 pour invalidation de session SSO...', logoutUrl);

    // Rediriger vers Auth0 — Auth0 invalide la session puis renvoie sur la page de login
    window.location.href = logoutUrl;
  }
}

// Exporter une instance unique du service
export const auth0Service = new Auth0Service();
