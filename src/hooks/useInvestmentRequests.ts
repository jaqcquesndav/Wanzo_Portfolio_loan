
import { useEffect, useState, useCallback } from 'react';
import type { InvestmentRequest } from '../types/investment-portfolio';

export function useInvestmentRequests(portfolioId?: string) {
  const [requests, setRequests] = useState<InvestmentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Chargement initial depuis IndexedDB
  const fetchRequests = useCallback(() => {
    if (!portfolioId) {
      setRequests([]);
      setLoading(false);
      return;
    }
    import('../lib/indexedDbPortfolioService').then(({ indexedDbPortfolioService }) => {
      indexedDbPortfolioService.getPortfolio(portfolioId).then((portfolio) => {
        if (portfolio && portfolio.type === 'investment' && Array.isArray((portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio).requests)) {
          setRequests((portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio).requests ?? []);
        } else {
          setRequests([]);
        }
        setLoading(false);
      });
    });
  }, [portfolioId]);

  useEffect(() => {
    setLoading(true);
    fetchRequests();
  }, [fetchRequests]);

  // CRUD operations
  const addRequest = async (request: InvestmentRequest) => {
    if (!portfolioId) return;
    const { indexedDbPortfolioService } = await import('../lib/indexedDbPortfolioService');
    const portfolio = await indexedDbPortfolioService.getPortfolio(portfolioId);
    if (portfolio && portfolio.type === 'investment') {
      const investmentPortfolio = portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio;
      const currentRequests = Array.isArray(investmentPortfolio.requests) ? investmentPortfolio.requests : [];
      const updatedRequests = [...currentRequests, request];
      await indexedDbPortfolioService.addOrUpdatePortfolio({ ...investmentPortfolio, requests: updatedRequests });
      setRequests(updatedRequests);
    }
  };

  const updateRequest = async (request: InvestmentRequest) => {
    if (!portfolioId) return;
    const { indexedDbPortfolioService } = await import('../lib/indexedDbPortfolioService');
    const portfolio = await indexedDbPortfolioService.getPortfolio(portfolioId);
    if (portfolio && portfolio.type === 'investment') {
      const investmentPortfolio = portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio;
      const currentRequests = Array.isArray(investmentPortfolio.requests) ? investmentPortfolio.requests : [];
      const updatedRequests = currentRequests.map((r: typeof request) => (r.id === request.id ? request : r));
      await indexedDbPortfolioService.addOrUpdatePortfolio({ ...investmentPortfolio, requests: updatedRequests });
      setRequests(updatedRequests);
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!portfolioId) return;
    const { indexedDbPortfolioService } = await import('../lib/indexedDbPortfolioService');
    const portfolio = await indexedDbPortfolioService.getPortfolio(portfolioId);
    if (portfolio && portfolio.type === 'investment') {
      const investmentPortfolio = portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio;
      const currentRequests = Array.isArray(investmentPortfolio.requests) ? investmentPortfolio.requests : [];
      const updatedRequests = currentRequests.filter((r: typeof currentRequests[number]) => r.id !== requestId);
      await indexedDbPortfolioService.addOrUpdatePortfolio({ ...investmentPortfolio, requests: updatedRequests });
      setRequests(updatedRequests);
    }
  };

  return { requests, loading, addRequest, updateRequest, deleteRequest, refetch: fetchRequests };
}
