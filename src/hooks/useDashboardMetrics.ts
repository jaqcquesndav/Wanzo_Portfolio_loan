import { useState, useEffect } from 'react';
import type { 
  DashboardMetrics, 
  TraditionalDashboardMetrics, 
  InvestmentDashboardMetrics, 
  LeasingDashboardMetrics 
} from '../types/dashboard';


const metricsByType: Record<string, DashboardMetrics> = {
  traditional: {
    assets: {
      total: 10000000,
      change: 10.2,
      distribution: {
        credit: 60,
        microfinance: 20,
        treasury: 20
      },
      creditUtilization: 75
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
      delinquencyRate: 3.2,
      provisionRate: 2.5,
      concentrationRisk: 12.4
    },
    clients: {
      active: 30,
      change: 2.2,
      newThisMonth: 1,
      churnRate: 0.2
    },
    paymentStatus: {
      onTime: 82,
      late30Days: 12,
      late60Days: 4,
      late90Days: 2
    }
  } as TraditionalDashboardMetrics,
  investment: {
    assets: {
      total: 15000000,
      change: 18.7,
      distribution: {
        equities: 45,
        bonds: 30,
        alternatives: 15,
        cash: 10
      },
      liquidity: 85
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
      var95: 3.2,
      beta: 1.1,
      maxDrawdown: 12.5
    },
    clients: {
      active: 12,
      change: 1.2,
      newThisMonth: 2,
      churnRate: 0.8
    },
    benchmarkComparison: {
      ytd: 2.1,
      oneYear: 5.3,
      threeYears: 18.7,
      fiveYears: 35.2
    }
  } as InvestmentDashboardMetrics,
  leasing: {
    assets: {
      total: 25000000,
      change: 15.4,
      distribution: {
        vehicles: 45,
        machinery: 30,
        it: 15,
        office: 10
      },
      residualValue: 15.8,
      utilizationRate: 82.5
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
      delinquencyRate: 3.5,
      provisionRate: 2.8,
      concentrationRisk: 15.2,
      maintenanceRisk: 8.2,
      defaultRate: 4.3,
      assetDepreciation: 12.7
    },
    clients: {
      active: 48,
      change: 5.2,
      newThisMonth: 3,
      churnRate: 0.5
    },
    equipmentStatus: {
      excellent: 35,
      good: 45,
      fair: 15,
      poor: 5
    }
  } as LeasingDashboardMetrics
};

import { isValidPortfolioType, getDefaultPortfolioType } from '../config/portfolioTypes';

export function useDashboardMetrics(portfolioType?: string) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => {
    const validType = isValidPortfolioType(portfolioType) 
      ? portfolioType as 'traditional' | 'investment' | 'leasing'
      : getDefaultPortfolioType(portfolioType);
      
    return metricsByType[validType];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (isValidPortfolioType(portfolioType)) {
          const validType = portfolioType as 'traditional' | 'investment' | 'leasing';
          console.log(`Chargement des métriques pour le type: ${validType}`);
          setMetrics(metricsByType[validType]);
        } else {
          const defaultType = getDefaultPortfolioType(portfolioType);
          console.warn(`Type de portefeuille non reconnu ou invalide: ${portfolioType}, utilisation du type ${defaultType}`);
          setMetrics(metricsByType[defaultType]);
        }
      } catch (err) {
        console.error(`Erreur lors du chargement des métriques pour ${portfolioType}:`, err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [portfolioType]);

  return { metrics, loading, error };
}