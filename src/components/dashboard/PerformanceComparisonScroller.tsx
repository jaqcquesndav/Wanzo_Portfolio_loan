import React, { useRef } from 'react';
import type { Portfolio } from '../../types/portfolio';
import { PerformanceComparisonCard } from './PerformanceComparisonCard';
import { getMockPortfoliosByType, getCurrentPortfolio } from './mockPortfolios';

interface PerformanceComparisonScrollerProps {
  currentPortfolio?: Portfolio;
  performanceType?: 'performance_curve' | 'return' | 'benchmark';
  portfolios?: Portfolio[];
  portfolioType?: 'traditional' | 'investment' | 'leasing';
}

export const PerformanceComparisonScroller: React.FC<PerformanceComparisonScrollerProps> = ({ 
  currentPortfolio, 
  performanceType = 'performance_curve', 
  portfolios,
  portfolioType
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  
  // Si on n'a que le type de portefeuille, utiliser les mocks
  const mockCurrentPortfolio = portfolioType ? getCurrentPortfolio(portfolioType) : undefined;
  const mockPortfolios = portfolioType ? getMockPortfoliosByType(portfolioType) : [];
  
  // Utiliser les valeurs fournies ou les mocks
  const effectiveCurrentPortfolio = currentPortfolio || mockCurrentPortfolio;
  const effectivePortfolios = portfolios || mockPortfolios;
  
  if (!effectiveCurrentPortfolio) {
    console.warn('PerformanceComparisonScroller: Aucun portefeuille actuel disponible');
    return null;
  }
  // Filtrer les portefeuilles du même type (hors sélectionné)
  const sameTypePortfolios = effectivePortfolios.filter(
    (p) => p && p.type === effectiveCurrentPortfolio.type && p.id !== effectiveCurrentPortfolio.id && p.metrics
  );
  // Valeur du portefeuille courant (dernier point de la courbe)
  const currentValue = getPerfValue(effectiveCurrentPortfolio, performanceType);

  // Générer les cards à afficher
  const cards = [
    ...sameTypePortfolios.map(p => {
      if (!p || !p.name) return null;
      const value = getPerfValue(p, performanceType);
      const trend = value > currentValue ? 'up' : value < currentValue ? 'down' : 'neutral';
      return (
        <PerformanceComparisonCard
          key={p.id || Math.random()}
          portfolioName={p.name || 'Portefeuille inconnu'}
          value={value}
          trend={trend}
        />
      );
    }).filter(Boolean),
    // Card du portefeuille courant, toujours à la fin
    effectiveCurrentPortfolio && effectiveCurrentPortfolio.name ? (
      <PerformanceComparisonCard
        key={effectiveCurrentPortfolio.id}
        portfolioName={effectiveCurrentPortfolio.name + ' (vous)'}
        value={currentValue}
        trend="neutral"
        highlight
      />
    ) : null
  ];

  // Scroll horizontal fluide
  const scroll = (dir: 'left' | 'right') => {
    if (scrollerRef.current) {
      const { scrollLeft, clientWidth } = scrollerRef.current;
      scrollerRef.current.scrollTo({
        left: dir === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative">
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 rounded-full shadow p-1 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        style={{ display: sameTypePortfolios.length > 0 ? 'block' : 'none' }}
        onClick={() => scroll('left')}
        aria-label="Défiler à gauche"
      >
        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-8"
        style={{ scrollBehavior: 'smooth' }}
      >
        {cards}
      </div>
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 rounded-full shadow p-1 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        style={{ display: sameTypePortfolios.length > 0 ? 'block' : 'none' }}
        onClick={() => scroll('right')}
        aria-label="Défiler à droite"
      >
        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
};

function getPerfValue(portfolio: Portfolio | undefined, type: 'performance_curve' | 'return' | 'benchmark'): number {
  if (!portfolio || !portfolio.metrics) return 0;
  if (type === 'performance_curve') {
    return Array.isArray(portfolio.metrics.performance_curve) ? portfolio.metrics.performance_curve.slice(-1)[0] : 0;
  } else if (type === 'return') {
    return Array.isArray(portfolio.metrics.returns) ? portfolio.metrics.returns.slice(-1)[0] : 0;
  } else if (type === 'benchmark') {
    return Array.isArray(portfolio.metrics.benchmark) ? portfolio.metrics.benchmark.slice(-1)[0] : 0;
  }
  return 0;
}
