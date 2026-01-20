import { useState, useEffect } from 'react';
// ✅ Utilisation des hooks React Query professionnels
import { useTraditionalPortfoliosQuery } from './queries';

// Métriques professionnelles pour un portefeuille de crédit
export interface CreditPortfolioMetrics {
  id: string;
  name: string;
  // Ratios de qualité du portefeuille
  nplRatio: number; // Non-Performing Loans (> 90 jours)
  par30: number; // Portfolio at Risk > 30 jours
  writeOffRatio: number; // Taux de passage en perte
  
  // Ratios de rendement
  roi: number; // Return on Investment
  yield: number; // Rendement du portefeuille
  netInterestMargin: number; // Marge d'intérêt nette
  
  // Ratios de croissance
  portfolioGrowth: number; // Croissance du portefeuille
  disbursementVolume: number; // Volume de décaissements
  
  // Autres indicateurs
  averageLoanSize: number; // Taille moyenne des prêts
  maturityDistribution: {
    short: number; // < 1 an
    medium: number; // 1-3 ans
    long: number; // > 3 ans
  };
  
  // Données temporelles pour les graphiques
  performance: Array<{
    month: string;
    npl: number;
    yield: number;
    growth: number;
  }>;
}

// Indices de référence du marché
export interface MarketBenchmarks {
  avgNplRatio: number; // Moyenne du marché
  avgYield: number;
  avgGrowth: number;
  centralBankRate: number; // Taux directeur
  inflationRate: number;
}

export function useCreditPortfolioMetrics() {
  // ✅ Utilisation de React Query - données extraites du cache
  const { data: portfolioData, isLoading: portfoliosLoading } = useTraditionalPortfoliosQuery();
  const portfolios = portfolioData?.data || [];
  
  const [portfolioMetrics, setPortfolioMetrics] = useState<CreditPortfolioMetrics[]>([]);
  const [benchmarks, setBenchmarks] = useState<MarketBenchmarks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        
        // Simuler le calcul de métriques pour chaque portefeuille réel
        const metrics: CreditPortfolioMetrics[] = portfolios.map(portfolio => {
          // Simuler des données réalistes basées sur les vrais portefeuilles
          const baseNpl = Math.random() * 8 + 2; // NPL entre 2% et 10%
          const baseYield = Math.random() * 5 + 12; // Rendement entre 12% et 17%
          
          return {
            id: portfolio.id,
            name: portfolio.name,
            nplRatio: Number(baseNpl.toFixed(2)),
            par30: Number((baseNpl * 1.5).toFixed(2)),
            writeOffRatio: Number((baseNpl * 0.3).toFixed(2)),
            roi: Number((baseYield - 3).toFixed(2)),
            yield: Number(baseYield.toFixed(2)),
            netInterestMargin: Number((baseYield - 8).toFixed(2)),
            portfolioGrowth: Number((Math.random() * 30 + 5).toFixed(1)),
            disbursementVolume: Math.floor(Math.random() * 500000000 + 100000000),
            averageLoanSize: Math.floor(Math.random() * 50000 + 10000),
            maturityDistribution: {
              short: Math.floor(Math.random() * 40 + 30),
              medium: Math.floor(Math.random() * 40 + 30),
              long: Math.floor(Math.random() * 30 + 10)
            },
            performance: generateMonthlyPerformance(baseNpl, baseYield)
          };
        });
        
        // Données de référence du marché
        const marketBenchmarks: MarketBenchmarks = {
          avgNplRatio: 5.2,
          avgYield: 14.5,
          avgGrowth: 15.8,
          centralBankRate: 6.5,
          inflationRate: 3.2
        };
        
        setPortfolioMetrics(metrics);
        setBenchmarks(marketBenchmarks);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (!portfoliosLoading && portfolios.length > 0) {
      loadMetrics();
    } else if (!portfoliosLoading) {
      setLoading(false);
    }
  }, [portfolios, portfoliosLoading]);

  return {
    portfolioMetrics,
    benchmarks,
    loading: loading || portfoliosLoading,
    error
  };
}

// Fonction utilitaire pour générer des données de performance mensuelle
function generateMonthlyPerformance(baseNpl: number, baseYield: number) {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  
  return months.map(month => ({
    month,
    npl: Number((baseNpl + (Math.random() - 0.5) * 2).toFixed(2)),
    yield: Number((baseYield + (Math.random() - 0.5) * 1).toFixed(2)),
    growth: Number((Math.random() * 10 + 10).toFixed(1))
  }));
}
