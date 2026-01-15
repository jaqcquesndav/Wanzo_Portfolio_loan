import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../contexts/useAuth';
import { Button } from '../ui/Button';
import { LogoutModal } from './LogoutModal';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { auth0Service } from '../../services/api/auth/auth0Service';
import { resetTokenExchangeFlag } from '../../pages/AuthCallback';

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { logout: contextLogout } = useAuth();

  // Récupérer l'utilisateur connecté via le service Auth0
  let user = { name: 'Utilisateur', email: '', picture: '' };
  const storedUser = auth0Service.getUser();
  
  if (storedUser) {
    user = {
      name: storedUser.name || 'Utilisateur',
      email: storedUser.email || '',
      picture: storedUser.picture || ''
    };
  } else {
    console.warn('[Auth0] Aucun utilisateur trouvé via auth0Service');
  }
  
  const navigate = useNavigate();

  useOnClickOutside(menuRef, () => setIsOpen(false));

  const handleLogout = async () => {
    try {
      console.log('🚪 Déconnexion complète en cours...');
      
      // Utiliser la fonction logout du contexte pour nettoyer l'état React
      contextLogout();
      
      // Réinitialiser le flag d'échange de token
      resetTokenExchangeFlag();
      
      // Effectuer une déconnexion complète via Auth0 (nettoie le storage + redirige vers Auth0)
      auth0Service.performFullLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      // En cas d'erreur, au moins rediriger vers la page d'accueil
      navigate('/');
    }
  };

  // Purge localStorage if user profile is corrupted (missing name or email)
  if (!user.name && !user.email) {
    localStorage.removeItem('auth0_user');
    user = { name: 'Utilisateur', email: '', picture: '' };
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 !px-2 sm:!px-3"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover border-2 border-primary"
          />
        ) : (
          <span className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold border-2 border-primary">
            {user.name?.[0] || '?'}
          </span>
        )}
        <span className="hidden sm:inline text-sm font-medium">
          {user?.name || 'Mon compte'}
        </span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <span className="block font-semibold">{user.name}</span>
              {user.email && <span className="block">{user.email}</span>}
            </div>
            <button
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </button>
            
            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Mode sombre
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Mode clair
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                setShowLogoutModal(true);
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmation de déconnexion */}
      <LogoutModal
        open={showLogoutModal}
        onConfirm={() => {
          setShowLogoutModal(false);
          handleLogout();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}