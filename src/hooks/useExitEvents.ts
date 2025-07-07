import { useEffect, useState, useCallback } from 'react';
import type { ExitEvent } from '../types/investment-portfolio';

export function useExitEvents(portfolioId?: string) {
  const [exits, setExits] = useState<ExitEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Chargement initial depuis IndexedDB
  const fetchExits = useCallback(() => {
    if (!portfolioId) {
      setExits([]);
      setLoading(false);
      return;
    }
    import('../lib/indexedDbPortfolioService').then(({ indexedDbPortfolioService }) => {
      indexedDbPortfolioService.getPortfolio(portfolioId).then((portfolio) => {
        if (portfolio && portfolio.type === 'investment' && Array.isArray((portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio).exitEvents)) {
          setExits((portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio).exitEvents ?? []);
        } else {
          setExits([]);
        }
        setLoading(false);
      });
    });
  }, [portfolioId]);

  useEffect(() => {
    setLoading(true);
    fetchExits();
  }, [fetchExits]);

  // CRUD operations
  const addExit = async (exit: ExitEvent) => {
    if (!portfolioId) return;
    const { indexedDbPortfolioService } = await import('../lib/indexedDbPortfolioService');
    const portfolio = await indexedDbPortfolioService.getPortfolio(portfolioId);
    if (portfolio && portfolio.type === 'investment') {
      const investmentPortfolio = portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio;
      const currentExits = Array.isArray(investmentPortfolio.exitEvents) ? investmentPortfolio.exitEvents : [];
      const updatedExits = [...currentExits, exit];
      await indexedDbPortfolioService.addOrUpdatePortfolio({ ...investmentPortfolio, exitEvents: updatedExits });
      setExits(updatedExits);
    }
  };

  const updateExit = async (exit: ExitEvent) => {
    if (!portfolioId) return;
    const { indexedDbPortfolioService } = await import('../lib/indexedDbPortfolioService');
    const portfolio = await indexedDbPortfolioService.getPortfolio(portfolioId);
    if (portfolio && portfolio.type === 'investment') {
      const investmentPortfolio = portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio;
      const currentExits = Array.isArray(investmentPortfolio.exitEvents) ? investmentPortfolio.exitEvents : [];
      const updatedExits = currentExits.map((e: typeof exit) => (e.id === exit.id ? exit : e));
      await indexedDbPortfolioService.addOrUpdatePortfolio({ ...investmentPortfolio, exitEvents: updatedExits });
      setExits(updatedExits);
    }
  };

  const deleteExit = async (exitId: string) => {
    if (!portfolioId) return;
    const { indexedDbPortfolioService } = await import('../lib/indexedDbPortfolioService');
    const portfolio = await indexedDbPortfolioService.getPortfolio(portfolioId);
    if (portfolio && portfolio.type === 'investment') {
      const investmentPortfolio = portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio;
      const currentExits = Array.isArray(investmentPortfolio.exitEvents) ? investmentPortfolio.exitEvents : [];
      const updatedExits = currentExits.filter((e: typeof currentExits[number]) => e.id !== exitId);
      await indexedDbPortfolioService.addOrUpdatePortfolio({ ...investmentPortfolio, exitEvents: updatedExits });
      setExits(updatedExits);
    }
  };

  return { exits, loading, addExit, updateExit, deleteExit, refetch: fetchExits };
}
