import { useEffect, useState, useCallback } from 'react';
import type { InvestmentTransaction } from '../types/investment-portfolio';

export function useInvestmentTransactions(portfolioId?: string) {
  const [transactions, setTransactions] = useState<InvestmentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Chargement initial depuis IndexedDB
  const fetchTransactions = useCallback(() => {
    if (!portfolioId) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    import('../lib/indexedDbPortfolioService').then(({ indexedDbPortfolioService }) => {
      indexedDbPortfolioService.getPortfolio(portfolioId).then((portfolio) => {
        if (portfolio && portfolio.type === 'investment' && Array.isArray((portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio).transactions)) {
          setTransactions((portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio).transactions ?? []);
        } else {
          setTransactions([]);
        }
        setLoading(false);
      });
    });
  }, [portfolioId]);

  useEffect(() => {
    setLoading(true);
    fetchTransactions();
  }, [fetchTransactions]);

  // CRUD operations
  const addTransaction = async (transaction: InvestmentTransaction) => {
    if (!portfolioId) return;
    const { indexedDbPortfolioService } = await import('../lib/indexedDbPortfolioService');
    const portfolio = await indexedDbPortfolioService.getPortfolio(portfolioId);
    if (portfolio && portfolio.type === 'investment') {
      const investmentPortfolio = portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio;
      const currentTransactions = Array.isArray(investmentPortfolio.transactions) ? investmentPortfolio.transactions : [];
      const updatedTransactions = [...currentTransactions, transaction];
      await indexedDbPortfolioService.addOrUpdatePortfolio({ ...investmentPortfolio, transactions: updatedTransactions });
      setTransactions(updatedTransactions);
    }
  };

  const updateTransaction = async (transaction: InvestmentTransaction) => {
    if (!portfolioId) return;
    const { indexedDbPortfolioService } = await import('../lib/indexedDbPortfolioService');
    const portfolio = await indexedDbPortfolioService.getPortfolio(portfolioId);
    if (portfolio && portfolio.type === 'investment') {
      const investmentPortfolio = portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio;
      const currentTransactions = Array.isArray(investmentPortfolio.transactions) ? investmentPortfolio.transactions : [];
      const updatedTransactions = currentTransactions.map((t: typeof transaction) => (t.id === transaction.id ? transaction : t));
      await indexedDbPortfolioService.addOrUpdatePortfolio({ ...investmentPortfolio, transactions: updatedTransactions });
      setTransactions(updatedTransactions);
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    if (!portfolioId) return;
    const { indexedDbPortfolioService } = await import('../lib/indexedDbPortfolioService');
    const portfolio = await indexedDbPortfolioService.getPortfolio(portfolioId);
    if (portfolio && portfolio.type === 'investment') {
      const investmentPortfolio = portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio;
      const currentTransactions = Array.isArray(investmentPortfolio.transactions) ? investmentPortfolio.transactions : [];
      const updatedTransactions = currentTransactions.filter((t: typeof currentTransactions[number]) => t.id !== transactionId);
      await indexedDbPortfolioService.addOrUpdatePortfolio({ ...investmentPortfolio, transactions: updatedTransactions });
      setTransactions(updatedTransactions);
    }
  };

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction, refetch: fetchTransactions };
}
