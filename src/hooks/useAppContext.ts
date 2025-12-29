/**
 * Hook pour vérifier si le contexte global de l'application est prêt
 * 
 * Ce hook permet aux composants de savoir si l'institutionId est disponible
 * avant de faire des appels API qui en dépendent.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isReady, institutionId, waitForContext } = useAppContext();
 *   
 *   useEffect(() => {
 *     if (isReady) {
 *       // Faire des appels API en toute sécurité
 *       loadData(institutionId);
 *     }
 *   }, [isReady, institutionId]);
 *   
 *   if (!isReady) {
 *     return <LoadingSpinner />;
 *   }
 *   
 *   return <div>...</div>;
 * }
 * ```
 */

import { useCallback, useEffect, useState } from 'react';
import { useAppContextStore } from '../stores/appContextStore';

export interface UseAppContextResult {
  /** Indique si le contexte est prêt (institutionId disponible) */
  isReady: boolean;
  
  /** L'ID de l'institution courante */
  institutionId: string | null;
  
  /** L'ID Auth0 de l'utilisateur */
  auth0Id: string | null;
  
  /** Les permissions de l'utilisateur */
  permissions: string[];
  
  /** Attend que le contexte soit prêt (avec timeout optionnel) */
  waitForContext: (timeoutMs?: number) => Promise<boolean>;
  
  /** Vérifie si l'utilisateur a une permission spécifique */
  hasPermission: (permission: string) => boolean;
}

export function useAppContext(): UseAppContextResult {
  const { 
    institutionId, 
    auth0Id, 
    permissions, 
    isContextLoaded,
    isContextReady 
  } = useAppContextStore();
  
  const [isReady, setIsReady] = useState(isContextReady());
  
  // Mettre à jour l'état isReady quand le store change
  useEffect(() => {
    setIsReady(isContextReady());
  }, [isContextLoaded, institutionId, isContextReady]);
  
  /**
   * Attend que le contexte soit prêt
   * Utile pour les cas où on doit attendre le chargement initial
   */
  const waitForContext = useCallback(async (timeoutMs = 5000): Promise<boolean> => {
    if (isContextReady()) return true;
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkInterval = setInterval(() => {
        if (isContextReady()) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (Date.now() - startTime > timeoutMs) {
          clearInterval(checkInterval);
          console.warn('⚠️ Timeout en attendant le contexte global');
          resolve(false);
        }
      }, 100);
    });
  }, [isContextReady]);
  
  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  const hasPermission = useCallback((permission: string): boolean => {
    return permissions.includes(permission);
  }, [permissions]);
  
  return {
    isReady,
    institutionId,
    auth0Id,
    permissions,
    waitForContext,
    hasPermission,
  };
}

export default useAppContext;
