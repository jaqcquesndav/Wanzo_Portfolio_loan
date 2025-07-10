



import { usePortfolio } from './usePortfolio';


/**
 * Hook leasing robuste :
 * - Si id absent ou vide, loading reste true et portfolio undefined
 * - Si id fourni, lit le portefeuille de type 'leasing' depuis IndexedDB
 * - Ne retourne que les portefeuilles de type 'leasing' (filtrage dans usePortfolioDetails)
 */
export function useLeasingPortfolio(id: string | undefined) {
  // Utilise le hook factorisé pour la persistance IndexedDB
  return usePortfolio(id, 'leasing');
}