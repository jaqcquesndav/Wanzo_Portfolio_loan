/**
 * Hook pour garantir la disponibilité de l'institutionId
 * 
 * Ce hook fournit une stratégie robuste pour obtenir l'institutionId:
 * 1. Vérifie d'abord dans le store Zustand (source de vérité)
 * 2. Si manquant et authentifié, déclenche un refresh de /users/me
 * 3. Utilise un système de retry avec backoff exponentiel
 * 4. Protège contre les boucles infinies avec des flags et limites
 * 
 * @see CRITICAL: L'institutionId est requis pour toutes les connexions WebSocket
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppContextStore } from '../stores/appContextStore';
import { useAuth } from '../contexts/useAuth';

// Configuration des retries
const RETRY_CONFIG = {
  maxRetries: 3,              // Nombre max de tentatives
  initialDelay: 1000,         // Délai initial (1s)
  maxDelay: 10000,            // Délai max (10s)
  backoffMultiplier: 2,       // Multiplicateur exponentiel
};

interface UseInstitutionIdOptions {
  /** Activer le refresh automatique si institutionId manquant */
  autoRefresh?: boolean;
  /** Callback appelé quand institutionId devient disponible */
  onAvailable?: (institutionId: string) => void;
  /** Callback appelé si toutes les tentatives échouent */
  onUnavailable?: () => void;
}

interface UseInstitutionIdResult {
  /** L'institutionId actuel (ou null si pas encore disponible) */
  institutionId: string | null;
  /** Indique si le contexte a été chargé */
  isContextLoaded: boolean;
  /** Indique si un refresh est en cours */
  isRefreshing: boolean;
  /** Indique si l'institutionId est définitivement disponible */
  isReady: boolean;
  /** Déclencher manuellement un refresh */
  refresh: () => Promise<void>;
  /** Nombre de tentatives effectuées */
  retryCount: number;
  /** Erreur éventuelle */
  error: string | null;
}

/**
 * Hook pour garantir la disponibilité de l'institutionId
 * Gère automatiquement les retries et le refresh du contexte
 */
export function useInstitutionId(options: UseInstitutionIdOptions = {}): UseInstitutionIdResult {
  const { autoRefresh = true, onAvailable, onUnavailable } = options;
  
  // Store Zustand
  const institutionId = useAppContextStore(state => state.institutionId);
  const isContextLoaded = useAppContextStore(state => state.isContextLoaded);
  
  // Auth context pour le refresh
  const { isAuthenticated, refreshContext, contextStatus } = useAuth();
  
  // États locaux
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Refs pour éviter les problèmes de closure et les races conditions
  const isRefreshingRef = useRef(false);
  const hasCalledOnAvailable = useRef(false);
  const hasCalledOnUnavailable = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Calculer le délai de retry avec backoff exponentiel
  const getRetryDelay = useCallback((attempt: number): number => {
    const delay = RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
    return Math.min(delay, RETRY_CONFIG.maxDelay);
  }, []);
  
  // Fonction de refresh avec protection contre les appels multiples
  const refresh = useCallback(async () => {
    // Protection contre les appels simultanés
    if (isRefreshingRef.current) {
      console.log('[useInstitutionId] ⏳ Refresh déjà en cours, skip...');
      return;
    }
    
    // Protection contre les retries excessifs
    if (retryCount >= RETRY_CONFIG.maxRetries) {
      console.warn('[useInstitutionId] ⚠️ Nombre max de retries atteint');
      setError('Impossible de charger le contexte après plusieurs tentatives');
      return;
    }
    
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setError(null);
    
    try {
      console.log(`[useInstitutionId] 🔄 Refresh du contexte (tentative ${retryCount + 1}/${RETRY_CONFIG.maxRetries})...`);
      await refreshContext();
      
      // Vérifier si institutionId est maintenant disponible
      const newInstitutionId = useAppContextStore.getState().institutionId;
      
      if (newInstitutionId) {
        console.log('[useInstitutionId] ✅ institutionId obtenu après refresh:', newInstitutionId);
        setRetryCount(0); // Reset le compteur
      } else {
        console.warn('[useInstitutionId] ⚠️ institutionId toujours manquant après refresh');
        setRetryCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('[useInstitutionId] ❌ Erreur lors du refresh:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      setRetryCount(prev => prev + 1);
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [refreshContext, retryCount]);
  
  // Effet pour le refresh automatique si institutionId manquant
  useEffect(() => {
    // Ne pas faire de refresh auto si désactivé
    if (!autoRefresh) return;
    
    // Ne pas faire de refresh si pas authentifié
    if (!isAuthenticated) return;
    
    // Ne pas faire de refresh si le contexte n'est pas encore chargé (premier chargement)
    // Attendre que le système ait fait son premier essai
    if (!isContextLoaded && contextStatus === 'loading') return;
    
    // Si institutionId est disponible, tout va bien
    if (institutionId) {
      // Appeler le callback onAvailable une seule fois
      if (!hasCalledOnAvailable.current && onAvailable) {
        hasCalledOnAvailable.current = true;
        onAvailable(institutionId);
      }
      return;
    }
    
    // InstitutionId manquant - déclencher un retry avec délai
    if (retryCount < RETRY_CONFIG.maxRetries && !isRefreshingRef.current) {
      const delay = getRetryDelay(retryCount);
      console.log(`[useInstitutionId] ⏱️ institutionId manquant, retry dans ${delay}ms (tentative ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
      
      // Nettoyer le timeout précédent
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      retryTimeoutRef.current = setTimeout(() => {
        refresh();
      }, delay);
    } else if (retryCount >= RETRY_CONFIG.maxRetries) {
      // Toutes les tentatives échouées
      if (!hasCalledOnUnavailable.current && onUnavailable) {
        hasCalledOnUnavailable.current = true;
        onUnavailable();
      }
    }
    
    // Cleanup
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [
    autoRefresh,
    isAuthenticated,
    isContextLoaded,
    contextStatus,
    institutionId,
    retryCount,
    getRetryDelay,
    refresh,
    onAvailable,
    onUnavailable
  ]);
  
  // Reset les flags quand institutionId change
  useEffect(() => {
    if (!institutionId) {
      hasCalledOnAvailable.current = false;
    } else {
      hasCalledOnUnavailable.current = false;
    }
  }, [institutionId]);
  
  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    institutionId,
    isContextLoaded,
    isRefreshing,
    isReady: !!institutionId && isContextLoaded,
    refresh,
    retryCount,
    error
  };
}

/**
 * Hook simplifié pour juste vérifier si institutionId est prêt
 * Utile pour les conditions de rendu
 */
export function useIsInstitutionReady(): boolean {
  const institutionId = useAppContextStore(state => state.institutionId);
  const isContextLoaded = useAppContextStore(state => state.isContextLoaded);
  return !!institutionId && isContextLoaded;
}

/**
 * Hook pour attendre que institutionId soit disponible
 * Retourne une Promise qui se résout quand institutionId est disponible
 */
export function useWaitForInstitutionId(timeout = 10000): Promise<string | null> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    // Vérifier immédiatement
    const immediate = useAppContextStore.getState().institutionId;
    if (immediate) {
      resolve(immediate);
      return;
    }
    
    // S'abonner aux changements
    const unsubscribe = useAppContextStore.subscribe((state) => {
      if (state.institutionId) {
        unsubscribe();
        resolve(state.institutionId);
      } else if (Date.now() - startTime > timeout) {
        unsubscribe();
        resolve(null);
      }
    });
    
    // Timeout de sécurité
    setTimeout(() => {
      unsubscribe();
      resolve(useAppContextStore.getState().institutionId);
    }, timeout);
  });
}
