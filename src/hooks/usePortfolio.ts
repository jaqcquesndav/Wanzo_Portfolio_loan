// src/hooks/usePortfolio.ts
import { useEffect, useState, useCallback } from 'react';
import { portfolioStorageService } from '../services/storage/localStorage';
import type { Portfolio as AnyPortfolio } from '../types/portfolio';
export type PortfolioType = 'traditional' | 'leasing' | 'investment';

export function usePortfolio(id: string | undefined, type: PortfolioType) {
  const [portfolio, setPortfolio] = useState<AnyPortfolio | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    console.log(`Loading portfolio ${id} of type ${type}`);
    
    portfolioStorageService.getPortfolio(id)
      .then((p) => {
        if (p && p.type === type) {
          console.log(`Portfolio ${id} loaded successfully, type: ${p.type}`);
          setPortfolio(p);
        } else if (p) {
          console.warn(`Portfolio ${id} found but with incorrect type: expected ${type}, got ${p.type}`);
          setPortfolio(undefined);
        } else {
          console.warn(`Portfolio ${id} not found`);
          setPortfolio(undefined);
        }
      })
      .catch(err => console.error(`Error loading portfolio ${id}:`, err))
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
    addOrUpdate,
    // ...autres actions génériques (delete, etc.)
  };
}
