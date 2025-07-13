// src/hooks/useInvestmentPortfolio.ts
import { usePortfolio } from './usePortfolio';

/**
 * Hook investment robuste :
 * - Si id absent ou vide, loading reste true et portfolio undefined
 * - Si id fourni, lit le portefeuille de type 'investment' depuis localStorage
 * - Ne retourne que les portefeuilles de type 'investment' (filtrage dans usePortfolioDetails)
 */
export function useInvestmentPortfolio(id: string) {
  // On force le type pour le hook factorisé
  return usePortfolio(id, 'investment');
}
