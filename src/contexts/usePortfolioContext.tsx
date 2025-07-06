import { useContext } from 'react';
import { PortfolioContext } from './PortfolioContext';

export const usePortfolioContext = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolioContext must be used within PortfolioProvider');
  return ctx;
};
