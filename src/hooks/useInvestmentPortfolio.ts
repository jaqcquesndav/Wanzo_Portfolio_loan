// src/hooks/useInvestmentPortfolio.ts
import { usePortfolio } from './usePortfolio';
import type { PortfolioType } from '../lib/indexedDbPortfolioService';

export function useInvestmentPortfolio(id: string) {
  // On force le type pour le hook factorisé
  return usePortfolio(id, 'investment' as PortfolioType);
}
