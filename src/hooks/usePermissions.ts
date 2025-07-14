import { useAuth } from '../contexts/useAuth';

export function usePermissions() {
  const { user, isAuthenticated } = useAuth();
  
  // Vérifier si l'utilisateur est administrateur
  const isAdmin = isAuthenticated && user?.role === 'admin';
  
  // Vérifier si l'utilisateur est manager
  const isManager = isAuthenticated && user?.role === 'manager';
  
  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: string | string[]) => {
    if (!isAuthenticated || !user?.role) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    } else {
      return user.role === role;
    }
  };
  
  // Vérifier si l'utilisateur a le droit de modifier les taux de change
  const canEditExchangeRates = isAdmin;
  
  return {
    isAuthenticated,
    isAdmin,
    isManager,
    hasRole,
    canEditExchangeRates
  };
}
