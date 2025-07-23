// src/services/auth/auth0Service.ts
import { User, UserRole } from '../../contexts/AuthContext';

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
  name: string;
  email: string;
  picture?: string;
  nickname?: string;
  role?: string;
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
    // Supprimer les tokens
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ID_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    // Supprimer les anciennes clés aussi
    localStorage.removeItem('token');
    localStorage.removeItem('auth0_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth0_user');
  }

  /**
   * Convertit un utilisateur Auth0 en utilisateur de l'application
   */
  private mapAuth0UserToAppUser(auth0User: Auth0User): User {
    // Valider le rôle pour s'assurer qu'il est l'un des types acceptés
    const userRole = this.validateUserRole(auth0User.role);
    
    return {
      id: auth0User.sub,
      name: auth0User.name || auth0User.nickname || 'Utilisateur',
      email: auth0User.email || '',
      role: userRole,
      picture: auth0User.picture
    };
  }
  
  /**
   * Valide que le rôle est l'un des rôles autorisés
   */
  private validateUserRole(role?: string): UserRole {
    if (role === 'admin' || role === 'manager' || role === 'user') {
      return role;
    }
    // Rôle par défaut si le rôle n'est pas valide
    return 'manager';
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
}

// Exporter une instance unique du service
export const auth0Service = new Auth0Service();
