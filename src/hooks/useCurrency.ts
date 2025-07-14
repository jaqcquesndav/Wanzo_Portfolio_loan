import { useState, useEffect } from 'react';
import { useCurrencyContext } from './useCurrencyContext';

type CurrencyType = 'CDF' | 'USD' | 'EUR';

interface UseCurrencyOptions {
  originalCurrency?: CurrencyType;
  displayFormatted?: boolean;
}

/**
 * Hook pour gérer les montants avec conversion automatique
 * 
 * @param initialAmount - Le montant initial
 * @param options - Options de configuration
 * @returns Un objet avec le montant converti, fonctions de mise à jour, et formattage
 */
export function useCurrency(
  initialAmount: number, 
  options: UseCurrencyOptions = {}
) {
  const { 
    currency: contextCurrency,
    convertAmount, 
    formatAmount,
    refreshCounter
  } = useCurrencyContext();

  // Devise d'origine du montant (par défaut CDF)
  const originalCurrency = options.originalCurrency || 'CDF';
  
  // État local pour stocker le montant d'origine
  const [originalAmount, setOriginalAmount] = useState<number>(initialAmount);
  
  // État local pour stocker le montant converti dans la devise actuelle
  const [convertedAmount, setConvertedAmount] = useState<number>(
    convertAmount(initialAmount, originalCurrency)
  );

  // État pour stocker le montant formaté
  const [formattedAmount, setFormattedAmount] = useState<string>(
    options.displayFormatted ? formatAmount(convertedAmount) : ''
  );

  // Mettre à jour le montant converti lorsque la devise du contexte change ou que les taux sont mis à jour
  useEffect(() => {
    const newConvertedAmount = convertAmount(originalAmount, originalCurrency);
    setConvertedAmount(newConvertedAmount);
    
    if (options.displayFormatted) {
      setFormattedAmount(formatAmount(newConvertedAmount));
    }
  }, [contextCurrency, originalAmount, originalCurrency, convertAmount, formatAmount, options.displayFormatted, refreshCounter]);

  // Fonction pour mettre à jour le montant
  const updateAmount = (newAmount: number) => {
    setOriginalAmount(newAmount);
    const newConvertedAmount = convertAmount(newAmount, originalCurrency);
    setConvertedAmount(newConvertedAmount);
    
    if (options.displayFormatted) {
      setFormattedAmount(formatAmount(newConvertedAmount));
    }
  };

  // Fonction pour obtenir le montant dans une devise spécifique
  const getAmountInCurrency = (targetCurrency: CurrencyType) => {
    return convertAmount(originalAmount, originalCurrency, targetCurrency);
  };

  return {
    amount: convertedAmount,
    formattedAmount,
    originalAmount,
    updateAmount,
    getAmountInCurrency,
    currency: contextCurrency,
    formatAmount: (amount: number) => formatAmount(amount),
  };
}
