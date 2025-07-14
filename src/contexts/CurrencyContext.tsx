import React, { createContext, useState, useEffect, ReactNode } from 'react';

type CurrencyType = 'CDF' | 'USD' | 'EUR';

// Interface pour représenter un taux de change
export interface ExchangeRate {
  from: CurrencyType;
  to: CurrencyType;
  rate: number;
  lastUpdated: Date;
}

interface CurrencyContextType {
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
  formatAmount: (amount: number) => string;
  convertAmount: (amount: number, fromCurrency: CurrencyType, toCurrency?: CurrencyType) => number;
  getExchangeRates: () => { from: string, to: string, rate: number }[];
  updateExchangeRate: (from: CurrencyType, to: CurrencyType, newRate: number) => void;
  lastUpdated: Date | null;
  // Compteur d'actualisation pour forcer la mise à jour des composants qui utilisent des montants
  refreshCounter: number;
}

const defaultContext: CurrencyContextType = {
  currency: 'CDF',
  setCurrency: () => {},
  formatAmount: () => '',
  convertAmount: (amount) => amount,
  getExchangeRates: () => [],
  updateExchangeRate: () => {},
  lastUpdated: null,
  refreshCounter: 0,
};

export const CurrencyContext = createContext<CurrencyContextType>(defaultContext);

// Taux de conversion par défaut (initiaux) utilisés comme valeurs initiales
const DEFAULT_RATES: Record<CurrencyType, number> = {
  'CDF': 1,
  'USD': 0.0004, // 1 CDF = 0.0004 USD (ou 1 USD = 2500 CDF)
  'EUR': 0.00037, // 1 CDF = 0.00037 EUR (ou 1 EUR = 2700 CDF)
};

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  // État pour stocker la devise actuelle
  const [currency, setCurrencyState] = useState<CurrencyType>(() => {
    try {
      const savedPreferences = localStorage.getItem('userPreferences');
      if (savedPreferences) {
        const { currency } = JSON.parse(savedPreferences);
        if (currency && ['CDF', 'USD', 'EUR'].includes(currency)) {
          return currency as CurrencyType;
        }
      }
    } catch (error) {
      console.error('Error loading currency preference:', error);
    }
    return 'CDF';
  });

  // État pour stocker les taux de conversion
  const [conversionRates, setConversionRates] = useState<Record<CurrencyType, number>>(() => {
    try {
      const savedRates = localStorage.getItem('currencyRates');
      if (savedRates) {
        return JSON.parse(savedRates);
      }
    } catch (error) {
      console.error('Error loading currency rates:', error);
    }
    return DEFAULT_RATES;
  });

  // État pour la dernière mise à jour des taux
  const [lastUpdated, setLastUpdated] = useState<Date | null>(() => {
    try {
      const lastUpdate = localStorage.getItem('currencyRatesLastUpdated');
      if (lastUpdate) {
        return new Date(lastUpdate);
      }
    } catch (error) {
      console.error('Error loading last update date:', error);
    }
    return null;
  });
  
  // Compteur pour forcer la mise à jour des composants qui utilisent les taux de change
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  // Enregistrer la préférence de devise dans localStorage
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('userPreferences');
      const preferences = savedPreferences ? JSON.parse(savedPreferences) : {};
      preferences.currency = currency;
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving currency preference:', error);
    }
  }, [currency]);

  // Fonction pour changer la devise
  const setCurrency = (newCurrency: CurrencyType) => {
    setCurrencyState(newCurrency);
  };

  // Fonction pour mettre à jour un taux de change
  const updateExchangeRate = (from: CurrencyType, to: CurrencyType, newRate: number) => {
    if (from === to) return; // Pas de mise à jour si même devise
    
    const newRates = { ...conversionRates };
    
    if (from === 'CDF') {
      // Mise à jour directe si la devise de base est CDF
      newRates[to] = newRate;
    } else if (to === 'CDF') {
      // Si la devise cible est CDF, on met à jour l'inverse
      newRates[from] = 1 / newRate;
    } else {
      // Pour les autres paires, on calcule via CDF
      // Par exemple, pour USD vers EUR, on calcule d'abord CDF/USD puis EUR/CDF
      const cdfToFrom = 1 / conversionRates[from]; // Taux CDF/From
      const cdfToTo = cdfToFrom * newRate; // Taux CDF/To
      newRates[to] = 1 / cdfToTo; // Stockage du taux To/CDF
    }
    
    setConversionRates(newRates);
    const now = new Date();
    setLastUpdated(now);
    
    // Incrémenter le compteur de rafraîchissement pour forcer la mise à jour des composants
    setRefreshCounter(prev => prev + 1);
    
    // Sauvegarder dans localStorage
    try {
      localStorage.setItem('currencyRates', JSON.stringify(newRates));
      localStorage.setItem('currencyRatesLastUpdated', now.toISOString());
    } catch (error) {
      console.error('Error saving currency rates:', error);
    }
  };

  // Fonction de formatage des montants
  const formatAmount = (amount: number): string => {
    const localeMap: Record<CurrencyType, string> = {
      'CDF': 'fr-CD',
      'USD': 'en-US',
      'EUR': 'fr-FR'
    };
    
    const formatter = new Intl.NumberFormat(localeMap[currency], {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  };

  // Fonction de conversion entre devises
  const convertAmount = (amount: number, fromCurrency: CurrencyType, toCurrency?: CurrencyType): number => {
    // Si la devise cible n'est pas spécifiée, utiliser la devise du contexte
    const targetCurrency = toCurrency || currency;
    
    // Si c'est la même devise, pas de conversion nécessaire
    if (fromCurrency === targetCurrency) {
      return amount;
    }
    
    // Convertir d'abord en CDF (valeur de base), puis dans la devise cible
    const amountInCDF = amount / conversionRates[fromCurrency];
    return amountInCDF * conversionRates[targetCurrency];
  };

  // Fonction pour obtenir les taux de change formatés pour l'affichage
  const getExchangeRates = () => {
    const rates = [];
    
    // USD vers CDF
    rates.push({
      from: 'USD',
      to: 'CDF',
      rate: 1 / conversionRates.USD
    });
    
    // EUR vers CDF
    rates.push({
      from: 'EUR',
      to: 'CDF',
      rate: 1 / conversionRates.EUR
    });
    
    // EUR vers USD
    const eurToUsd = conversionRates.EUR / conversionRates.USD;
    rates.push({
      from: 'EUR',
      to: 'USD',
      rate: eurToUsd
    });
    
    return rates;
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      formatAmount, 
      convertAmount,
      getExchangeRates,
      updateExchangeRate,
      lastUpdated,
      refreshCounter
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Hook déplacé dans hooks/useCurrencyContext.ts
