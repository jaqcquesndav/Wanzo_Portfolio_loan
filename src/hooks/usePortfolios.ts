// src/hooks/usePortfolios.ts
// Hook pour récupérer les portefeuilles via l'API backend (mode production)
// Avec cache global pour éviter les appels en double

import { useEffect, useState, useCallback, useRef } from 'react';
import { traditionalPortfolioApi } from '../services/api/traditional/portfolio.api';
import type { Portfolio as AnyPortfolio } from '../types/portfolio';

export type PortfolioType = 'traditional';

// Cache global partagé entre toutes les instances du hook
interface PortfolioCache {
  data: AnyPortfolio[];
  timestamp: number;
  loading: boolean;
  error: Error | null;
}

const portfolioCache: Map<PortfolioType, PortfolioCache> = new Map();
const CACHE_TTL = 60000; // 60 secondes de cache

// Pending promises pour déduplication
const pendingFetches: Map<PortfolioType, Promise<AnyPortfolio[]>> = new Map();

/**
 * Hook pour gérer la récupération des portefeuilles
 * Mode production: utilise uniquement l'API backend, pas de fallback
 * Avec cache global et déduplication des appels
 */
export function usePortfolios(type: PortfolioType) {
  const [portfolios, setPortfolios] = useState<AnyPortfolio[]>(() => {
    // Initialiser depuis le cache si disponible
    const cached = portfolioCache.get(type);
    return cached?.data || [];
  });
  const [loading, setLoading] = useState(() => {
    const cached = portfolioCache.get(type);
    return !cached || (Date.now() - cached.timestamp > CACHE_TTL);
  });
  const [error, setError] = useState<Error | null>(null);
  const [backendFailed, setBackendFailed] = useState(false);
  
  // Ref pour éviter les appels multiples au montage
  const hasFetched = useRef(false);

  // Permet de forcer le rechargement depuis l'extérieur (ex: après création)
  const refresh = useCallback(async (forceRefresh = false) => {
    // Vérifier le cache d'abord (sauf si force refresh)
    const cached = portfolioCache.get(type);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`📦 Utilisation du cache pour ${type} (${Math.round((CACHE_TTL - (Date.now() - cached.timestamp)) / 1000)}s restantes)`);
      setPortfolios(cached.data);
      setLoading(false);
      setError(cached.error);
      setBackendFailed(!!cached.error);
      return;
    }
    
    // Vérifier si un fetch est déjà en cours (déduplication)
    const pendingFetch = pendingFetches.get(type);
    if (pendingFetch) {
      console.log(`⏳ Réutilisation de la requête en cours pour ${type}`);
      try {
        const data = await pendingFetch;
        setPortfolios(data);
        setLoading(false);
        setBackendFailed(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur'));
        setBackendFailed(true);
        setLoading(false);
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Créer une nouvelle promesse et l'enregistrer
    const fetchPromise = (async () => {
      console.log(`📡 Chargement des portefeuilles ${type} depuis le backend...`);
      
      let backendData: AnyPortfolio[] = [];
      
      if (type === 'traditional') {
        // Utiliser la vraie API backend
        const response = await traditionalPortfolioApi.getAllPortfolios();
        // La réponse peut être un tableau directement ou avoir une structure { data: [...] }
        backendData = Array.isArray(response) ? response : (response as unknown as { data: AnyPortfolio[] }).data || [];
        console.log(`✅ ${backendData.length} portefeuilles chargés depuis le backend`);
      }
      
      return backendData;
    })();
    
    pendingFetches.set(type, fetchPromise);
    
    try {
      const backendData = await fetchPromise;
      
      // Mettre à jour le cache
      portfolioCache.set(type, {
        data: backendData,
        timestamp: Date.now(),
        loading: false,
        error: null
      });
      
      setPortfolios(backendData);
      setBackendFailed(false);
      
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des portefeuilles:', err);
      const errorObj = err instanceof Error ? err : new Error('Erreur de connexion au backend');
      
      // Mettre l'erreur en cache aussi (pour éviter de retenter immédiatement)
      portfolioCache.set(type, {
        data: [],
        timestamp: Date.now(),
        loading: false,
        error: errorObj
      });
      
      setError(errorObj);
      setBackendFailed(true);
      setPortfolios([]);
    } finally {
      setLoading(false);
      pendingFetches.delete(type);
    }
  }, [type]);

  useEffect(() => {
    // Éviter les appels multiples au montage (React 18 StrictMode)
    if (hasFetched.current) {
      return;
    }
    hasFetched.current = true;
    
    refresh();
    
    // Cleanup: reset hasFetched au démontage pour permettre un nouveau fetch au remontage
    return () => {
      hasFetched.current = false;
    };
  }, [refresh]);

  return { 
    portfolios, 
    loading, 
    error, 
    backendFailed, 
    refresh: () => refresh(true) // Force refresh invalide le cache
  };
}

/**
 * Invalide le cache des portefeuilles (à appeler après création/modification/suppression)
 */
export function invalidatePortfolioCache(type?: PortfolioType) {
  if (type) {
    portfolioCache.delete(type);
  } else {
    portfolioCache.clear();
  }
  console.log(`🗑️ Cache portefeuilles invalidé${type ? ` pour ${type}` : ''}`);
}
