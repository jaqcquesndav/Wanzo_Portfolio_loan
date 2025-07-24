import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Institution } from '../types/institution';
import { auth0Service } from '../services/api/auth/auth0Service';
import { UserRole, UserType } from '../types/users';

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
}

// Interface pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  institution: Institution | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Créer le contexte avec une valeur par défaut
export const AuthContext = createContext<AuthContextType>({
  user: null,
  institution: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: false,
  error: null
});

// Hook personnalisé déplacé dans useAuth.ts

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Effet pour vérifier si l'utilisateur est déjà connecté au chargement de l'application
  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié via Auth0
    const checkAuth = async () => {
      try {
        // Vérifier s'il y a un utilisateur authentifié via Auth0
        if (auth0Service.isAuthenticated()) {
          const storedUser = auth0Service.getUser();
          
          if (storedUser) {
            setUser(storedUser);
            
            // Simuler la récupération des données de l'institution
            const mockInstitution: Institution = {
              id: "123456",
              name: "Banque Congolaise de Développement",
              type: "bank",
              status: "active",
              license_number: "BCC-20250101",
              license_type: "Full Banking License",
              address: "25 Boulevard Nyiragongo, Goma",
              phone: "+243970456789",
              email: "contact@bancongo.cd",
              website: "https://www.bancongo.cd",
              legal_representative: "Patrice Lumumba",
              tax_id: "TX123456789",
              regulatory_status: "Approved",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
              documents: [
                {
                  name: "Licence bancaire",
                  type: "pdf",
                  url: "/documents/licence.pdf"
                },
                {
                  name: "Statuts",
                  type: "pdf",
                  url: "/documents/statuts.pdf"
                }
              ]
            };
            
            setInstitution(mockInstitution);
          }
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'authentification:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Pour l'instant, nous simulons une connexion réussie
      // À remplacer par un vrai appel API dans le futur
      
      // Dans une implémentation réelle, nous utiliserions le mot de passe ici
      console.log(`Tentative de connexion avec le mot de passe: ${password.substring(0, 1)}${'*'.repeat(password.length - 1)}`);
      
      // Pour la démo, nous créons un utilisateur avec le rôle Admin par défaut
      // comme vous l'avez demandé, le superadmin aura le rôle Admin s'il n'a pas de rôle
      let role: UserRole = 'Admin'; // Rôle par défaut
      
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
      
      const mockUser: User = {
        id: '12345',
        name: fullName,
        givenName: givenName,
        familyName: familyName,
        email,
        role,
        institutionId: '123456',
        financialInstitutionId: 'fin-001',
        userType: 'financial_institution',
        isCompanyOwner: role === 'Admin', // L'admin est propriétaire par défaut
        picture: '/avatars/profile.jpg',
        permissions: ['manage_users', 'view_reports', 'edit_settings'],
        language: 'fr'
      };
      
      // Simuler la récupération des données de l'institution
      const mockInstitution: Institution = {
        id: "123456",
        name: "Banque Nationale de Développement",
        type: "bank",
        status: "active",
        license_number: "BCC-20250101",
        license_type: "Full Banking License",
        address: "123 Avenue des Finances, Kinshasa",
        phone: "+243123456789",
        email: "contact@banquedev.cd",
        website: "https://www.banquedev.cd",
        legal_representative: "Jean Dupont",
        tax_id: "TX123456789",
        regulatory_status: "Approved",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
        documents: [
          {
            name: "Licence bancaire",
            type: "pdf",
            url: "/documents/licence.pdf"
          },
          {
            name: "Statuts",
            type: "pdf",
            url: "/documents/statuts.pdf"
          }
        ]
      };
      
      // Stocker l'utilisateur dans localStorage pour persistance
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setInstitution(mockInstitution);
    } catch (err) {
      setError('Échec de la connexion. Veuillez vérifier vos identifiants.');
      console.error('Erreur de connexion:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    setUser(null);
    setInstitution(null);
    auth0Service.clearAuth();
  };

  // Valeur du contexte
  const value = {
    user,
    institution,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
