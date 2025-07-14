import { useContext } from 'react';
import { CurrencyContext } from '../contexts/CurrencyContext';

export const useCurrencyContext = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider');
  }
  return context;
};
