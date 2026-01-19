// src/hooks/usePortfolios.ts
// Hook pour récupérer les portefeuilles via l'API backend (mode production)

import { useEffect, useState, useCallback } from 'react';
import { traditionalPortfolioApi } from '../services/api/traditional/portfolio.api';
import type { Portfolio as AnyPortfolio } from '../types/portfolio';

export type PortfolioType = 'traditional';

/**
 * Hook pour gérer la récupération des portefeuilles
 * Mode production: utilise uniquement l'API backend, pas de fallback
 */
export function usePortfolios(type: PortfolioType) {
  const [portfolios, setPortfolios] = useState<AnyPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [backendFailed, setBackendFailed] = useState(false);

  // Permet de forcer le rechargement depuis l'extérieur (ex: après création)
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📡 Chargement des portefeuilles ${type} depuis le backend...`);
      
      let backendData: AnyPortfolio[] = [];
      
      if (type === 'traditional') {
        // Utiliser la vraie API backend
        const response = await traditionalPortfolioApi.getAllPortfolios();
        // La réponse peut être un tableau directement ou avoir une structure { data: [...] }
        backendData = Array.isArray(response) ? response : (response as unknown as { data: AnyPortfolio[] }).data || [];
        console.log(`✅ ${backendData.length} portefeuilles chargés depuis le backend`);
      }
      
      setPortfolios(backendData);
      setBackendFailed(false);
      
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des portefeuilles:', err);
      setError(err instanceof Error ? err : new Error('Erreur de connexion au backend'));
      setBackendFailed(true);
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { portfolios, loading, error, backendFailed, refresh };
}
