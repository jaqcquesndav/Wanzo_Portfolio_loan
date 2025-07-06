import { useState, useEffect } from 'react';
import type { PortfolioMetrics } from '../types/portfolio';

const initialMetrics: PortfolioMetrics = {
  assets: {
    total: 25000000,
    change: 15.4,
    distribution: {
      credit: 40,
      microfinance: 25,
      leasing: 15,
      venture: 12,
      treasury: 8
    }
  },
  performance: {
    global: 12.5,
    change: 2.3,
    monthly: [
      { month: 'Jan', value: 5.2, benchmark: 4.8 },
      { month: 'Fév', value: 6.1, benchmark: 5.2 },
      { month: 'Mar', value: 5.8, benchmark: 5.5 },
      { month: 'Avr', value: 7.2, benchmark: 6.1 },
      { month: 'Mai', value: 8.4, benchmark: 6.8 },
      { month: 'Juin', value: 8.9, benchmark: 7.2 }
    ],
    ytd: 8.9,
    benchmarkDiff: 1.7
  },
  risk: {
    level: 'Modéré',
    sharpeRatio: 1.8,
    volatility: 12.5,
    var95: 2.3
  }
};

export function usePortfolioMetrics() {
  const [metrics, setMetrics] = useState<PortfolioMetrics>(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Dans un environnement réel, appeler l'API ici
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMetrics(initialMetrics);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
}