import { useMemo } from 'react';
import { mockInvestmentTransactions } from '../data/mockInvestment';

export function useInvestmentTransactions(portfolioId?: string) {
  const transactions = useMemo(() => {
    if (!portfolioId) return mockInvestmentTransactions;
    return mockInvestmentTransactions.filter(t => t.portfolioId === portfolioId);
  }, [portfolioId]);
  return { transactions };
}
