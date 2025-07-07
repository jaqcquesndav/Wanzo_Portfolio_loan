import { useMemo } from 'react';
import { mockInvestmentRequests } from '../data/mockInvestment';

export function useInvestmentRequests(portfolioId?: string) {
  const requests = useMemo(() => {
    if (!portfolioId) return mockInvestmentRequests;
    return mockInvestmentRequests.filter(r => r.portfolioId === portfolioId);
  }, [portfolioId]);
  return { requests };
}
