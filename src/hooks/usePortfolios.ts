
import { useEffect, useState, useCallback } from 'react';
import { indexedDbPortfolioService, AnyPortfolio, PortfolioType } from '../lib/indexedDbPortfolioService';

export function usePortfolios(type: PortfolioType) {
  const [portfolios, setPortfolios] = useState<AnyPortfolio[]>([]);
  const [loading, setLoading] = useState(true);

  // Permet de forcer le rechargement depuis l'extérieur (ex: après création)
  const refresh = useCallback(() => {
    setLoading(true);
    indexedDbPortfolioService.getPortfoliosByType(type)
      .then(setPortfolios)
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => {
    refresh();
    // (removed unused eslint-disable-next-line)
  }, [refresh]);

  return { portfolios, loading, refresh };
}
