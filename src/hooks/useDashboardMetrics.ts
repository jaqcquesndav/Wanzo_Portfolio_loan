import { useState, useEffect } from 'react';
import type { 
  DashboardMetrics, 
  TraditionalDashboardMetrics, 
  InvestmentDashboardMetrics, 
  LeasingDashboardMetrics 
} from '../types/dashboard';
import { dashboardOHADAApi } from '../services/api/shared/dashboard-ohada.api';

const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

/** Mapping OHADA → TraditionalDashboardMetrics pour exploiter les données réelles du backend */
async function fetchTraditionalMetrics(): Promise<TraditionalDashboardMetrics> {
  const ohadaResp = await dashboardOHADAApi.getOHADAMetrics();
  const all = ohadaResp.data;
  const count = all.length || 1;

  // Agrégation multi-portefeuilles
  const totalAmount = all.reduce((s, p) => s + p.totalAmount, 0);
  const avgGrowth  = all.reduce((s, p) => s + p.growthRate, 0) / count;
  const avgNpl     = all.reduce((s, p) => s + p.nplRatio, 0) / count;
  const avgProv    = all.reduce((s, p) => s + p.provisionRate, 0) / count;
  const avgYield   = all.reduce((s, p) => s + p.portfolioYield, 0) / count;
  const avgRoa     = all.reduce((s, p) => s + p.roa, 0) / count;
  const avgCollect = all.reduce((s, p) => s + p.collectionEfficiency, 0) / count;
  const avgBalAGE  = {
    current:   all.reduce((s,p) => s + p.balanceAGE.current,   0) / count,
    days30:    all.reduce((s,p) => s + p.balanceAGE.days30,    0) / count,
    days60:    all.reduce((s,p) => s + p.balanceAGE.days60,    0) / count,
    days90Plus:all.reduce((s,p) => s + p.balanceAGE.days90Plus,0) / count,
  };

  // Performance mensuelle (agréger sur 12 mois)
  const monthly = MONTHS_FR.map((month, i) => ({
    month,
    value: all.reduce((s, p) => s + (p.monthlyPerformance[i] ?? 0), 0) / count,
    benchmark: 14.5 // Benchmark marché CEMAC
  }));

  return {
    assets: {
      total: totalAmount,
      change: avgGrowth,
      distribution: { credit: avgBalAGE.current, microfinance: avgBalAGE.days30, treasury: 100 - avgBalAGE.current - avgBalAGE.days30 },
      creditUtilization: avgCollect
    },
    performance: {
      global: avgYield,
      change: avgGrowth,
      monthly
    },
    risk: {
      level: all[0]?.riskLevel as string ?? 'Faible',
      sharpeRatio: avgRoa,
      delinquencyRate: avgNpl,
      provisionRate: avgProv,
      concentrationRisk: 0
    },
    clients: {
      active: all.reduce((s, p) => s + p.activeContracts, 0),
      change: avgGrowth,
      newThisMonth: 0,
      churnRate: 0
    },
    paymentStatus: {
      onTime: avgBalAGE.current,
      late30Days: avgBalAGE.days30,
      late60Days: avgBalAGE.days60,
      late90Days: avgBalAGE.days90Plus
    }
  } as TraditionalDashboardMetrics;
}

const mockInvestmentMetrics: InvestmentDashboardMetrics = {
  assets: { total: 15000000, change: 18.7, distribution: { equities: 45, bonds: 30, alternatives: 15, cash: 10 }, liquidity: 85 },
  performance: { global: 15.2, change: 3.1, monthly: MONTHS_FR.map((m, i) => ({ month: m, value: 6.2 + i * 0.3, benchmark: 5.8 + i * 0.3 })) },
  risk: { level: 'Élevé', sharpeRatio: 1.2, volatility: 18.5, var95: 3.2, beta: 1.1, maxDrawdown: 12.5 },
  clients: { active: 12, change: 1.2, newThisMonth: 2, churnRate: 0.8 }
} as InvestmentDashboardMetrics;

const mockLeasingMetrics: LeasingDashboardMetrics = {
  assets: { total: 25000000, change: 15.4, distribution: { vehicles: 45, machinery: 30, it: 15, office: 10 }, residualValue: 15.8, utilizationRate: 82.5 },
  performance: { global: 12.5, change: 2.3, monthly: MONTHS_FR.map((m, i) => ({ month: m, value: 5.2 + i * 0.3, benchmark: 4.8 + i * 0.3 })) },
  risk: { level: 'Modéré', sharpeRatio: 1.8, delinquencyRate: 3.5, provisionRate: 2.8, concentrationRisk: 15.2, maintenanceRisk: 8.2, defaultRate: 4.3, assetDepreciation: 12.7 },
  clients: { active: 48, change: 5.2, newThisMonth: 3, churnRate: 0.5 }
} as LeasingDashboardMetrics;

import { isValidPortfolioType, getDefaultPortfolioType } from '../config/portfolioTypes';

export function useDashboardMetrics(portfolioType?: string) {
  const validType = isValidPortfolioType(portfolioType)
    ? (portfolioType as 'traditional' | 'investment' | 'leasing')
    : getDefaultPortfolioType(portfolioType);

  const [metrics, setMetrics] = useState<DashboardMetrics>(() => {
    if (validType === 'investment') return mockInvestmentMetrics;
    if (validType === 'leasing') return mockLeasingMetrics;
    // Placeholder traditionnel vide en attendant le fetch
    return {
      assets: { total: 0, change: 0, distribution: { credit: 0, microfinance: 0, treasury: 0 }, creditUtilization: 0 },
      performance: { global: 0, change: 0, monthly: [] },
      risk: { level: 'Faible', sharpeRatio: 0, delinquencyRate: 0, provisionRate: 0, concentrationRisk: 0 },
      clients: { active: 0, change: 0, newThisMonth: 0, churnRate: 0 }
    } as TraditionalDashboardMetrics;
  });
  const [loading, setLoading] = useState(validType === 'traditional');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        if (validType === 'traditional') {
          const data = await fetchTraditionalMetrics();
          setMetrics(data);
        } else if (validType === 'investment') {
          setMetrics(mockInvestmentMetrics);
        } else {
          setMetrics(mockLeasingMetrics);
        }
      } catch (err) {
        console.error(`Erreur lors du chargement des métriques pour ${validType}:`, err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validType]);

  return { metrics, loading, error };
}
