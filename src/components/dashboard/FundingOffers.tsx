import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, TrendingUp, TrendingDown, Minus, MoreVertical } from 'lucide-react';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui';
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart';
import { PerformanceIndicatorCard } from './PerformanceIndicatorCard';
import { PerformanceComparisonScroller } from './PerformanceComparisonScroller';
import { formatCurrency } from '../../utils/formatters';
import type { Company } from '../../types/company';
import type { Portfolio } from '../../types/portfolio';
// Utiliser les entreprises partagées pour toutes les opportunités
import { mockPMCompanies } from '../../data/mockPMCompanies';
import { indexedDbPortfolioService, seedMockInvestmentPortfoliosIfNeeded, seedMockLeasingPortfoliosIfNeeded, seedMockTraditionalPortfoliosIfNeeded } from '../../lib/indexedDbPortfolioService';
import { usePortfolioType } from '../../hooks/usePortfolioType';

const FundingOffers = () => {
  const navigate = useNavigate();
  const portfolioType = usePortfolioType();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [performanceType, setPerformanceType] = useState<'performance_curve' | 'return' | 'benchmark'>('performance_curve');

  useEffect(() => {
    // Seed et charge dynamiquement selon le type courant
    let seedPromise: Promise<void>;
    if (portfolioType === 'investment') seedPromise = seedMockInvestmentPortfoliosIfNeeded();
    else if (portfolioType === 'leasing') seedPromise = seedMockLeasingPortfoliosIfNeeded();
    else if (portfolioType === 'traditional') seedPromise = seedMockTraditionalPortfoliosIfNeeded();
    else seedPromise = Promise.resolve();

    seedPromise.then(() => {
      if (!portfolioType) return setPortfolios([]);
      indexedDbPortfolioService.getPortfoliosByType(portfolioType).then((data) => {
        setPortfolios(data);
        if (!selectedPortfolio && data.length > 0) setSelectedPortfolio(data[0]);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioType]);

  useEffect(() => {
    if (!selectedPortfolio && portfolios.length > 0) {
      setSelectedPortfolio(portfolios[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolios]);

  // Labels et données dynamiques selon le type sélectionné
  const performanceLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'];
  let performanceData: number[] = [];
  if (selectedPortfolio && performanceType === 'performance_curve') {
    performanceData = Array.isArray(selectedPortfolio.metrics.performance_curve)
      ? selectedPortfolio.metrics.performance_curve
      : [100, 110, 120, 115, 130, 128, 140];
  } else if (selectedPortfolio && performanceType === 'return') {
    performanceData = Array.isArray(selectedPortfolio.metrics.returns)
      ? selectedPortfolio.metrics.returns
      : [2, 3, 2.5, 4, 3.2, 3.8, 4.1];
  } else if (selectedPortfolio && performanceType === 'benchmark') {
    performanceData = Array.isArray(selectedPortfolio.metrics.benchmark)
      ? selectedPortfolio.metrics.benchmark
      : [1.5, 2.2, 2.1, 2.8, 2.5, 2.9, 3.0];
  }

  // Indicateurs selon le type de portefeuille
  let indicators: Array<{ label: string; value: string | number; trend?: 'up' | 'down' | 'neutral'; tag?: string; color?: string }> = [];
  if (selectedPortfolio) {
    if (selectedPortfolio.type === 'investment') {
      indicators = [
        { label: 'Valeur nette', value: `${selectedPortfolio.metrics.net_value || 0} CDF`, trend: 'up', tag: 'Net', color: '#2563eb' },
        { label: 'Rendement', value: `${selectedPortfolio.metrics.average_return || 0}%`, trend: 'up', tag: 'YTD', color: '#059669' },
        { label: 'Volatilité', value: `${selectedPortfolio.metrics.volatility || 0}%`, trend: 'down', tag: 'Risk', color: '#f59e42' },
        { label: 'Sharpe', value: selectedPortfolio.metrics.sharpe_ratio || 0, trend: 'up', tag: 'Sharpe', color: '#a21caf' },
        { label: 'Tickets', value: selectedPortfolio.metrics.nb_requests ?? '-', trend: 'neutral', tag: 'Demandes', color: '#0ea5e9' },
        { label: 'Investissements', value: selectedPortfolio.metrics.nb_transactions ?? '-', trend: 'neutral', tag: 'Trx', color: '#6366f1' },
        { label: 'Total investi', value: selectedPortfolio.metrics.total_invested ? `${selectedPortfolio.metrics.total_invested.toLocaleString()} CDF` : '-', trend: 'up', tag: 'Investi', color: '#22c55e' },
        { label: 'Total sorti', value: selectedPortfolio.metrics.total_exited ? `${selectedPortfolio.metrics.total_exited.toLocaleString()} CDF` : '-', trend: 'down', tag: 'Sorti', color: '#ef4444' },
        { label: 'IRR', value: selectedPortfolio.metrics.irr ? `${selectedPortfolio.metrics.irr}%` : '-', trend: 'up', tag: 'IRR', color: '#fbbf24' },
        { label: 'Multiple', value: selectedPortfolio.metrics.multiple ?? '-', trend: 'up', tag: 'Multiple', color: '#a21caf' },
        { label: 'Ticket moyen', value: selectedPortfolio.metrics.avg_ticket ? `${selectedPortfolio.metrics.avg_ticket.toLocaleString()} CDF` : '-', trend: 'neutral', tag: 'Ticket', color: '#059669' },
        { label: 'Sociétés', value: selectedPortfolio.metrics.nb_companies ?? '-', trend: 'neutral', tag: 'Sociétés', color: '#2563eb' }
      ];
    } else if (selectedPortfolio.type === 'traditional') {
      indicators = [
        { label: 'Valeur nette', value: `${selectedPortfolio.metrics.net_value || 0} CDF`, trend: 'up', tag: 'Net', color: '#2563eb' },
        { label: 'Rendement', value: `${selectedPortfolio.metrics.average_return || 0}%`, trend: 'up', tag: 'YTD', color: '#059669' },
        { label: 'Taux impayés', value: `${selectedPortfolio.metrics.taux_impayes || 0}%`, trend: 'down', tag: 'Impayés', color: '#f59e42' },
        { label: 'Taux couverture', value: `${selectedPortfolio.metrics.taux_couverture || 0}%`, trend: 'up', tag: 'Couverture', color: '#a21caf' },
        { label: 'Nombre de crédits', value: selectedPortfolio.metrics.nb_credits ?? '-', trend: 'neutral', tag: 'Crédits', color: '#6366f1' },
        { label: 'Total crédits', value: selectedPortfolio.metrics.total_credits ? `${selectedPortfolio.metrics.total_credits.toLocaleString()} CDF` : '-', trend: 'up', tag: 'Total crédits', color: '#22c55e' },
        { label: 'Crédit moyen', value: selectedPortfolio.metrics.avg_credit ? `${selectedPortfolio.metrics.avg_credit.toLocaleString()} CDF` : '-', trend: 'neutral', tag: 'Moyen', color: '#059669' },
        { label: 'Clients', value: selectedPortfolio.metrics.nb_clients ?? '-', trend: 'neutral', tag: 'Clients', color: '#0ea5e9' },
        { label: 'Taux rotation', value: selectedPortfolio.metrics.taux_rotation ? `${selectedPortfolio.metrics.taux_rotation}%` : '-', trend: 'up', tag: 'Rotation', color: '#fbbf24' },
        { label: 'Taux provision', value: selectedPortfolio.metrics.taux_provision ? `${selectedPortfolio.metrics.taux_provision}%` : '-', trend: 'down', tag: 'Provision', color: '#ef4444' },
        { label: 'Taux recouvrement', value: selectedPortfolio.metrics.taux_recouvrement ? `${selectedPortfolio.metrics.taux_recouvrement}%` : '-', trend: 'up', tag: 'Recouvrement', color: '#10b981' }
      ];
    } else if (selectedPortfolio.type === 'leasing') {
      indicators = [
        { label: 'Valeur nette', value: `${selectedPortfolio.metrics.net_value || 0} CDF`, trend: 'up', tag: 'Net', color: '#2563eb' },
        { label: 'Rendement', value: `${selectedPortfolio.metrics.average_return || 0}%`, trend: 'up', tag: 'YTD', color: '#059669' },
        { label: 'Taux d’utilisation', value: `${selectedPortfolio.metrics.asset_utilization_rate || 0}%`, trend: 'up', tag: 'Utilisation', color: '#0ea5e9' },
        { label: 'Valeur résiduelle', value: `${selectedPortfolio.metrics.average_residual_value?.toLocaleString() || 0} CDF`, trend: 'neutral', tag: 'Résiduelle', color: '#f59e42' },
        { label: 'Taux de défaut', value: `${selectedPortfolio.metrics.default_rate || 0}%`, trend: 'down', tag: 'Défaut', color: '#ef4444' },
        { label: 'Durée moyenne', value: `${selectedPortfolio.metrics.avg_contract_duration_months || 0} mois`, trend: 'neutral', tag: 'Durée', color: '#6366f1' },
        { label: 'Actifs gérés', value: selectedPortfolio.metrics.assets_under_management || 0, trend: 'neutral', tag: 'Actifs', color: '#a21caf' },
        { label: 'Taux de renouvellement', value: `${selectedPortfolio.metrics.contract_renewal_rate || 0}%`, trend: 'up', tag: 'Renouvellement', color: '#22c55e' },
        { label: 'Loyers facturés', value: `${selectedPortfolio.metrics.total_rent_billed?.toLocaleString() || 0} CDF`, trend: 'up', tag: 'Loyers', color: '#fbbf24' },
        { label: 'Taux de recouvrement', value: `${selectedPortfolio.metrics.collection_rate || 0}%`, trend: 'up', tag: 'Recouvrement', color: '#10b981' }
      ];
    }
  }

  // Rassembler toutes les opportunités recommandées dans un seul tableau
  const allMatches: Array<{
    portfolio: Portfolio;
    company: Company;
    score: number;
  }> = [];

  function calculateMatchScore(company: Company, portfolio: Portfolio): number {
    let score = 0;
    if (portfolio.target_sectors && portfolio.target_sectors.includes(company.sector)) {
      score += 40;
    }
    const revenueScore = Math.min(company.annual_revenue / (portfolio.target_amount || 1), 1) * 30;
    score += revenueScore;
    if (company.financial_metrics.revenue_growth > 20) {
      score += 30;
    } else if (company.financial_metrics.revenue_growth > 10) {
      score += 20;
    } else {
      score += 10;
    }
    return score;
  }

  portfolios.forEach((portfolio: Portfolio) => {
    mockPMCompanies
      .map(company => ({
        company,
        score: calculateMatchScore(company, portfolio)
      }))
      .filter(match => match.score > 50)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .forEach(match => {
        allMatches.push({
          portfolio,
          company: match.company,
          score: match.score
        });
      });
  });

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="inline h-4 w-4 text-green-500 ml-1" />;
    } else if (trend < 0) {
      return <TrendingDown className="inline h-4 w-4 text-red-500 ml-1" />;
    } else {
      return <Minus className="inline h-4 w-4 text-gray-400 ml-1" />;
    }
  };

  const getRandomTrend = () => [1, 0, -1][Math.floor(Math.random() * 3)];

  return (
    <div className="space-y-6">
      {/* Section performance portefeuille */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="flex-1 min-w-[300px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Performance portefeuille</span>
              <div className="relative">
                <Button variant="ghost" size="md" onClick={() => setMenuOpen(v => !v)} aria-label="Sélectionner portefeuille">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{selectedPortfolio?.name ?? ''}</span>
                  <MoreVertical className="ml-2 h-4 w-4" />
                </Button>
                {menuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-20">
                    {portfolios.map((p: Portfolio) => (
                      <button
                        key={p.id}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedPortfolio && selectedPortfolio.id === p.id ? 'font-bold text-primary' : ''}`}
                        onClick={() => { setSelectedPortfolio(p); setMenuOpen(false); }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <select
                className="ml-2 px-2 py-1 rounded border border-gray-300 dark:bg-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={performanceType}
                onChange={e => setPerformanceType(e.target.value as 'performance_curve' | 'return' | 'benchmark')}
                aria-label="Sélectionner la métrique de performance"
              >
                <option value="performance_curve">Valeur</option>
                <option value="return">Rendement</option>
                <option value="benchmark">Benchmark</option>
              </select>
            </div>
          </div>
          <PortfolioPerformanceChart data={performanceData} labels={performanceLabels} />
        </div>
        <div className="relative h-full" style={{ minHeight: '0' }}>
          <div
            className="flex flex-col gap-4 overflow-y-auto max-h-[320px] pr-1 scrollbar-hide"
            style={{ WebkitOverflowScrolling: 'touch', maxHeight: '320px', minHeight: '0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {indicators.map((ind, i) => (
              <div
                key={i}
                role="button"
                tabIndex={0}
                className="focus:outline-none"
                onClick={() => selectedPortfolio && navigate(`/reports/kpi/${selectedPortfolio.id}/${encodeURIComponent(ind.label)}`)}
                onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && selectedPortfolio) navigate(`/reports/kpi/${selectedPortfolio.id}/${encodeURIComponent(ind.label)}`); }}
                style={{ cursor: 'pointer' }}
                aria-label={`Voir le détail de l'indicateur ${ind.label}`}
              >
                <PerformanceIndicatorCard {...ind} />
              </div>
            ))}
          </div>
          {/* Fade en bas si scrollable */}
          {indicators.length > 4 && (
            <div className="pointer-events-none absolute left-0 bottom-0 w-full h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" style={{ zIndex: 2 }} />
          )}
        </div>
      </div>

      {/* Comparaison des performances */}
      <div className="mt-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
          Comparaison avec les autres portefeuilles —
          <span className="ml-2 font-normal text-sm text-gray-600 dark:text-gray-300">
            {performanceType === 'performance_curve' && 'Valeur finale'}
            {performanceType === 'return' && 'Rendement (dernier mois)'}
            {performanceType === 'benchmark' && 'Benchmark (dernier mois)'}
          </span>
        </h3>
        <PerformanceComparisonScroller
          currentPortfolio={selectedPortfolio ?? portfolios[0]}
          performanceType={performanceType}
          portfolios={portfolios}
        />
      </div>

      {/* Opportunités recommandées */}
      <div className="flex justify-between items-center mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Opportunités Recommandées
        </h2>
        <Button 
          variant="outline"
          onClick={() => navigate('/prospection')}
        >
          Voir toutes les opportunités
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      <div className="w-full overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm min-w-[900px]">
            <Table className="min-w-full">
            <TableHead>
              <TableRow>
                <TableHeader>Portefeuille</TableHeader>
                <TableHeader>Entreprise</TableHeader>
                <TableHeader>Secteur</TableHeader>
                <TableHeader>Employés</TableHeader>
                <TableHeader>Valeur (CA)</TableHeader>
                <TableHeader>Croissance</TableHeader>
                <TableHeader>MBE (EBITDA)</TableHeader>
                <TableHeader>Cote crédit</TableHeader>
                <TableHeader>Note ESG</TableHeader>
                <TableHeader>Action</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {allMatches.map(({ portfolio, company }) => {
                // Simuler des tendances pour la démo
                const caTrend = getRandomTrend();
                const creditTrend = getRandomTrend();
                const mbeTrend = getRandomTrend();
                return (
                  <TableRow key={portfolio.id + '-' + company.id}>
                    <TableCell>{portfolio.name}</TableCell>
                    <TableCell>{company.name}</TableCell>
                    <TableCell><Badge variant="primary">{company.sector}</Badge></TableCell>
                    <TableCell>{company.employee_count}</TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        {formatCurrency(company.annual_revenue)}
                        {getTrendIcon(caTrend)}
                      </span>
                    </TableCell>
                    <TableCell>{company.financial_metrics.revenue_growth}%</TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        {company.financial_metrics.ebitda ? formatCurrency(company.financial_metrics.ebitda) : '-'}
                        {getTrendIcon(mbeTrend)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        {company.financial_metrics.credit_score}
                        {getTrendIcon(creditTrend)}
                      </span>
                    </TableCell>
                    <TableCell>{company.esg_metrics?.esg_rating || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/prospection?company=${company.id}`)}
                      >
                        Voir détails
                        <Eye className="h-4 w-4 ml-2" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundingOffers;