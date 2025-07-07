import { useMemo } from 'react';
import { mockExitEvents } from '../data/mockInvestment';

export function useExitEvents(portfolioId?: string) {
  // Filtre les sorties par portfolioId si fourni
  const exits = useMemo(() => {
    if (!portfolioId) return mockExitEvents;
    return mockExitEvents.filter(e => e.portfolioId === portfolioId);
  }, [portfolioId]);
  return { exits };
}
