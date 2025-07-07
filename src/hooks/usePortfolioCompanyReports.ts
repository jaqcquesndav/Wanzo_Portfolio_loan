import { useEffect, useState, useCallback } from 'react';
import type { PortfolioCompanyReport } from '../types/investment-portfolio';

export function usePortfolioCompanyReports(portfolioId?: string) {
  const [reports, setReports] = useState<PortfolioCompanyReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Chargement initial depuis IndexedDB
  const fetchReports = useCallback(() => {
    if (!portfolioId) {
      setReports([]);
      setLoading(false);
      return;
    }
    import('../lib/indexedDbPortfolioService').then(({ indexedDbPortfolioService }) => {
      indexedDbPortfolioService.getPortfolio(portfolioId).then((portfolio) => {
        if (portfolio && portfolio.type === 'investment' && Array.isArray((portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio).reports)) {
          setReports((portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio).reports ?? []);
        } else {
          setReports([]);
        }
        setLoading(false);
      });
    });
  }, [portfolioId]);

  useEffect(() => {
    setLoading(true);
    fetchReports();
  }, [fetchReports]);

  // CRUD operations
  const addReport = async (report: PortfolioCompanyReport) => {
    if (!portfolioId) return;
    const { indexedDbPortfolioService } = await import('../lib/indexedDbPortfolioService');
    const portfolio = await indexedDbPortfolioService.getPortfolio(portfolioId);
    if (portfolio && portfolio.type === 'investment') {
      const investmentPortfolio = portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio;
      const currentReports = Array.isArray(investmentPortfolio.reports) ? investmentPortfolio.reports : [];
      const updatedReports = [...currentReports, report];
      await indexedDbPortfolioService.addOrUpdatePortfolio({ ...investmentPortfolio, reports: updatedReports });
      setReports(updatedReports);
    }
  };

  const updateReport = async (report: PortfolioCompanyReport) => {
    if (!portfolioId) return;
    const { indexedDbPortfolioService } = await import('../lib/indexedDbPortfolioService');
    const portfolio = await indexedDbPortfolioService.getPortfolio(portfolioId);
    if (portfolio && portfolio.type === 'investment') {
      const investmentPortfolio = portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio;
      const currentReports = Array.isArray(investmentPortfolio.reports) ? investmentPortfolio.reports : [];
      const updatedReports = currentReports.map((r: typeof report) => (r.id === report.id ? report : r));
      await indexedDbPortfolioService.addOrUpdatePortfolio({ ...investmentPortfolio, reports: updatedReports });
      setReports(updatedReports);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!portfolioId) return;
    const { indexedDbPortfolioService } = await import('../lib/indexedDbPortfolioService');
    const portfolio = await indexedDbPortfolioService.getPortfolio(portfolioId);
    if (portfolio && portfolio.type === 'investment') {
      const investmentPortfolio = portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio;
      const currentReports = Array.isArray(investmentPortfolio.reports) ? investmentPortfolio.reports : [];
      const updatedReports = currentReports.filter((r: typeof currentReports[number]) => r.id !== reportId);
      await indexedDbPortfolioService.addOrUpdatePortfolio({ ...investmentPortfolio, reports: updatedReports });
      setReports(updatedReports);
    }
  };

  return { reports, loading, addReport, updateReport, deleteReport, refetch: fetchReports };
}
