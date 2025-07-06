import { usePortfolio } from './usePortfolio';
import type { PortfolioType } from '../lib/indexedDbPortfolioService';

export function useLeasingPortfolio(id: string) {
  // Utilise le hook factorisé pour la persistance IndexedDB
  return usePortfolio(id, 'leasing' as PortfolioType);
}