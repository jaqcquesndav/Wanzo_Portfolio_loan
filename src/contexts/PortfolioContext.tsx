import React, { createContext, useState, useEffect } from 'react';
import { storageManager } from '../utils/storageManager';

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
  const [portfolioType, setPortfolioTypeState] = useState<PortfolioType>('traditional');
  const [currentPortfolioId, setCurrentPortfolioIdState] = useState<string | null>(null);

  useEffect(() => {
    // Toujours mettre à jour le localStorage pour qu'il contienne 'traditional'
    storageManager.setItem('portfolioType', 'traditional');
    
    // On lit quand même le portfolioId stocké
    const storedId = storageManager.getItem('currentPortfolioId');
    if (storedId) setCurrentPortfolioIdState(storedId);
  }, []);

  const setPortfolioType = (type: PortfolioType) => {
    setPortfolioTypeState(type);
    if (type) storageManager.setItem('portfolioType', type);
    else storageManager.removeItem('portfolioType');
  };

  const setCurrentPortfolioId = (id: string | null) => {
    setCurrentPortfolioIdState(id);
    if (id) storageManager.setItem('currentPortfolioId', id);
    else storageManager.removeItem('currentPortfolioId');
  };

  const resetPortfolioType = () => setPortfolioType(null);

  return (
    <PortfolioContext.Provider value={{ portfolioType, setPortfolioType, resetPortfolioType, currentPortfolioId, setCurrentPortfolioId }}>
      {children}
    </PortfolioContext.Provider>
  );
};


// Move hook to its own file for fast refresh compliance
