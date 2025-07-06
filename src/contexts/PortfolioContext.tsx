import React, { createContext, useState, useEffect } from 'react';


import type { PortfolioType } from './portfolioTypes';

interface PortfolioContextProps {
  portfolioType: PortfolioType;
  setPortfolioType: (type: PortfolioType) => void;
  resetPortfolioType: () => void;
  currentPortfolioId: string | null;
  setCurrentPortfolioId: (id: string | null) => void;
}

export const PortfolioContext = createContext<PortfolioContextProps | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portfolioType, setPortfolioTypeState] = useState<PortfolioType>(null);
  const [currentPortfolioId, setCurrentPortfolioIdState] = useState<string | null>(null);

  useEffect(() => {
    const storedType = localStorage.getItem('portfolioType');
    if (storedType) setPortfolioTypeState(storedType as PortfolioType);
    const storedId = localStorage.getItem('currentPortfolioId');
    if (storedId) setCurrentPortfolioIdState(storedId);
  }, []);

  const setPortfolioType = (type: PortfolioType) => {
    setPortfolioTypeState(type);
    if (type) localStorage.setItem('portfolioType', type);
    else localStorage.removeItem('portfolioType');
  };

  const setCurrentPortfolioId = (id: string | null) => {
    setCurrentPortfolioIdState(id);
    if (id) localStorage.setItem('currentPortfolioId', id);
    else localStorage.removeItem('currentPortfolioId');
  };

  const resetPortfolioType = () => setPortfolioType(null);

  return (
    <PortfolioContext.Provider value={{ portfolioType, setPortfolioType, resetPortfolioType, currentPortfolioId, setCurrentPortfolioId }}>
      {children}
    </PortfolioContext.Provider>
  );
};


// Move hook to its own file for fast refresh compliance
