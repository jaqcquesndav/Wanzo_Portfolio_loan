import { useMemo } from 'react';
import { mockPortfolioCompanyReports } from '../data/mockInvestment';

export function usePortfolioCompanyReports(portfolioId?: string) {
  const reports = useMemo(() => {
    if (!portfolioId) return mockPortfolioCompanyReports;
    return mockPortfolioCompanyReports.filter(r => r.portfolioId === portfolioId);
  }, [portfolioId]);
  return { reports };
}
