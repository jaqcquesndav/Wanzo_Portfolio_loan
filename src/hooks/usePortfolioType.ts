import { useContext } from 'react';
import { PortfolioContext } from '../contexts/PortfolioContext';

export function usePortfolioType() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('PortfolioContext not found');
  return ctx.portfolioType;
}
