
import { useEffect, useState, useCallback } from 'react';
import { portfolioStorageService } from '../services/storage/localStorage';
import type { Portfolio as AnyPortfolio } from '../types/portfolio';
export type PortfolioType = 'traditional';

export function usePortfolios(type: PortfolioType) {
  const [portfolios, setPortfolios] = useState<AnyPortfolio[]>([]);
  const [loading, setLoading] = useState(true);

  // Permet de forcer le rechargement depuis l'extérieur (ex: après création)
  const refresh = useCallback(() => {
    setLoading(true);
    portfolioStorageService.getPortfoliosByType(type)
      .then(setPortfolios)
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => {
    refresh();
    // (removed unused eslint-disable-next-line)
  }, [refresh]);

  return { portfolios, loading, refresh };
}
