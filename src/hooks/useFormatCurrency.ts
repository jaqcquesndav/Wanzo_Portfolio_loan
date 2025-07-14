import { useCurrencyContext } from './useCurrencyContext';
import { formatCurrency as formatCurrencyUtil } from '../utils/formatters';

/**
 * Hook pour formater les montants en utilisant la devise du contexte
 * et les options de formatage avancées
 */
export function useFormatCurrency() {
  const { currency, convertAmount } = useCurrencyContext();
  
  /**
   * Formate un montant selon la devise actuelle ou une devise spécifiée
   * @param amount Le montant à formater
   * @param toCurrency Devise optionnelle (si différente de celle du contexte)
   * @param fromCurrency Devise source optionnelle (par défaut, celle du contexte)
   * @returns Le montant formaté sous forme de chaîne
   */
  const formatCurrency = (
    amount: number, 
    toCurrency?: 'CDF' | 'USD' | 'EUR' | 'FCFA',
    fromCurrency?: 'CDF' | 'USD' | 'EUR'
  ): string => {
    // Si une conversion est nécessaire
    if (fromCurrency && fromCurrency !== (toCurrency || currency)) {
      // Convertir uniquement si la devise cible est valide pour la conversion (CDF, USD ou EUR)
      if (toCurrency && ['CDF', 'USD', 'EUR'].includes(toCurrency)) {
        const convertedAmount = convertAmount(amount, fromCurrency, toCurrency as 'CDF' | 'USD' | 'EUR');
        return formatCurrencyUtil(convertedAmount, toCurrency);
      } else {
        const convertedAmount = convertAmount(amount, fromCurrency);
        return formatCurrencyUtil(convertedAmount, toCurrency);
      }
    }
    
    // Sinon, formater directement
    return formatCurrencyUtil(amount, toCurrency || currency);
  };
  
  return {
    formatCurrency,
    convertAmount,
    currentCurrency: currency
  };
}
