import { useState, useEffect } from 'react';
import type { DashboardMetrics } from '../types/dashboard';


const metricsByType: Record<string, DashboardMetrics> = {
  traditional: {
    assets: {
      total: 10000000,
      change: 10.2,
      distribution: {
        credit: 60,
        microfinance: 20,
        leasing: 0,
        venture: 10,
        treasury: 10
      }
    },
    performance: {
      global: 8.5,
      change: 1.2,
      monthly: [
        { month: 'Jan', value: 3.2, benchmark: 2.8 },
        { month: 'Fév', value: 4.1, benchmark: 3.2 },
        { month: 'Mar', value: 4.8, benchmark: 3.5 },
        { month: 'Avr', value: 5.2, benchmark: 4.1 },
        { month: 'Mai', value: 6.4, benchmark: 4.8 },
        { month: 'Juin', value: 6.9, benchmark: 5.2 }
      ]
    },
    risk: {
      level: 'Faible',
      sharpeRatio: 2.1,
      volatility: 8.5,
      var95: 1.2
    },
    clients: {
      active: 30,
      change: 2.2,
      newThisMonth: 1,
      churnRate: 0.2
    }
  },
  investment: {
    assets: {
      total: 15000000,
      change: 18.7,
      distribution: {
        credit: 10,
        microfinance: 10,
        leasing: 0,
        venture: 60,
        treasury: 20
      }
    },
    performance: {
      global: 15.2,
      change: 3.1,
      monthly: [
        { month: 'Jan', value: 6.2, benchmark: 5.8 },
        { month: 'Fév', value: 7.1, benchmark: 6.2 },
        { month: 'Mar', value: 7.8, benchmark: 6.5 },
        { month: 'Avr', value: 8.2, benchmark: 7.1 },
        { month: 'Mai', value: 9.4, benchmark: 7.8 },
        { month: 'Juin', value: 9.9, benchmark: 8.2 }
      ]
    },
    risk: {
      level: 'Élevé',
      sharpeRatio: 1.2,
      volatility: 18.5,
      var95: 3.2
    },
    clients: {
      active: 12,
      change: 1.2,
      newThisMonth: 2,
      churnRate: 0.8
    }
  },
  leasing: {
    assets: {
      total: 25000000,
      change: 15.4,
      distribution: {
        credit: 0,
        microfinance: 0,
        leasing: 100,
        venture: 0,
        treasury: 0
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
      ]
    },
    risk: {
      level: 'Modéré',
      sharpeRatio: 1.8,
      volatility: 12.5,
      var95: 2.3
    },
    clients: {
      active: 48,
      change: 5.2,
      newThisMonth: 3,
      churnRate: 0.5
    }
  }
};

export function useDashboardMetrics(portfolioType?: string) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => {
    if (portfolioType && metricsByType[portfolioType]) {
      return metricsByType[portfolioType];
    }
    return metricsByType['leasing']; // fallback
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (portfolioType && metricsByType[portfolioType]) {
          setMetrics(metricsByType[portfolioType]);
        } else {
          setMetrics(metricsByType['leasing']);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [portfolioType]);

  return { metrics, loading, error };
}