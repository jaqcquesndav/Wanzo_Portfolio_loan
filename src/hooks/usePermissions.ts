import { useAuth } from '../contexts/useAuth';

export function usePermissions() {
  const { user, isAuthenticated, permissions, institutionId, isContextLoaded } = useAuth();
  
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

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (permission: string | string[]) => {
    if (!isAuthenticated || !permissions || permissions.length === 0) return false;
    
    if (Array.isArray(permission)) {
      return permission.some(p => permissions.includes(p));
    } else {
      return permissions.includes(permission);
    }
  };

  // Vérifier si toutes les permissions sont présentes
  const hasAllPermissions = (requiredPermissions: string[]) => {
    if (!isAuthenticated || !permissions || permissions.length === 0) return false;
    return requiredPermissions.every(p => permissions.includes(p));
  };
  
  // Vérifier si l'utilisateur a le droit de modifier les taux de change
  const canEditExchangeRates = isAdmin || hasPermission('exchange_rates:write');

  // Vérifier si le contexte global est prêt (institutionId chargé)
  const isContextReady = isAuthenticated && isContextLoaded && !!institutionId;
  
  return {
    isAuthenticated,
    isAdmin,
    isManager,
    hasRole,
    hasPermission,
    hasAllPermissions,
    canEditExchangeRates,
    institutionId,
    isContextReady
  };
}
