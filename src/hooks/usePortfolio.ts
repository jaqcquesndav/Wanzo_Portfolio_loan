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
    portfolioStorageService.getPortfolio(id)
      .then((p) => setPortfolio(p))
      .finally(() => setLoading(false));
  }, [id]);


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
