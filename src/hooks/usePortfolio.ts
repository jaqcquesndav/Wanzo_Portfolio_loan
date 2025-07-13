// src/hooks/usePortfolio.ts
import { useEffect, useState, useCallback } from 'react';
import { portfolioStorageService } from '../services/storage/localStorage';
import type { Portfolio as AnyPortfolio } from '../types/portfolio';
export type PortfolioType = 'traditional' | 'leasing' | 'investment';

export function usePortfolio(id: string | undefined, type: PortfolioType) {
  const [portfolio, setPortfolio] = useState<AnyPortfolio | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    
    console.log(`Loading portfolio ${id} of type ${type}`);
    
    // Vérifier si les données mock ont été initialisées
    const isMockInitialized = localStorage.getItem('mockDataInitialized') === 'true';
    if (!isMockInitialized) {
      console.warn('Mock data is not initialized. This might cause issues with portfolio loading.');
    }
    
    portfolioStorageService.getPortfolio(id)
      .then((p) => {
        if (p && p.type === type) {
          console.log(`Portfolio ${id} loaded successfully, type: ${p.type}`);
          setPortfolio(p);
        } else if (p) {
          console.warn(`Portfolio ${id} found but with incorrect type: expected ${type}, got ${p.type}`);
          setError(new Error(`Portfolio type mismatch: expected ${type}, got ${p.type}`));
          setPortfolio(undefined);
        } else {
          console.warn(`Portfolio ${id} not found`);
          setError(new Error(`Portfolio ${id} not found`));
          setPortfolio(undefined);
        }
      })
      .catch(err => {
        console.error(`Error loading portfolio ${id}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => setLoading(false));
  }, [id, type]);


  const addOrUpdate = useCallback(async (data: Partial<AnyPortfolio>) => {
    if (!id) return;
    const updated = { ...portfolio, ...data, id, type, updated_at: new Date().toISOString() } as AnyPortfolio;
    await portfolioStorageService.addOrUpdatePortfolio(updated as import('../types/portfolio').PortfolioWithType);
    // Relire la donnée depuis localStorage pour garantir la cohérence
    const fresh = await portfolioStorageService.getPortfolio(id);
    setPortfolio(fresh);
  }, [id, type, portfolio]);

  return {
    portfolio,
    loading,
    error,
    addOrUpdate,
    // ...autres actions génériques (delete, etc.)
  };
}
