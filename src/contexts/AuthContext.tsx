import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Institution } from '../types/institution';

// Types pour l'utilisateur
export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionId?: string;
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
    // Simuler la vérification de l'authentification depuis localStorage
    const checkAuth = async () => {
      try {
        // Récupérer l'utilisateur
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
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
          
          setInstitution(mockInstitution);
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
      
      // Pour la démo, nous créons un utilisateur admin si l'email contient 'admin'
      const role: UserRole = email.toLowerCase().includes('admin') ? 'admin' : 
                             email.toLowerCase().includes('manager') ? 'manager' : 'user';
      
      const mockUser: User = {
        id: '12345',
        name: 'Utilisateur de démonstration',
        email,
        role
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
    localStorage.removeItem('user');
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
