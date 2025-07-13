export const formatCurrency = (amount: number, currency: 'CDF' | 'USD' | 'FCFA' = 'CDF'): string => {
  if (currency === 'FCFA') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' ' + currency;
  }
  
  const formatter = new Intl.NumberFormat(currency === 'CDF' ? 'fr-CD' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return formatter.format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('fr-FR').format(number);
};

/**
 * Formate un pourcentage
 * 
 * @param value La valeur à formater
 * @param decimals Le nombre de décimales à afficher
 * @returns La valeur formatée avec le symbole %
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals) + '%';
};

/**
 * Génère un numéro de transaction financière selon les standards
 * 
 * @param prefix Le préfixe du type de transaction (ex: TR-LS pour Transaction Leasing)
 * @param sequenceNumber Le numéro séquentiel de la transaction
 * @returns Un numéro de transaction au format standardisé
 */
export const generateTransactionId = (prefix: string, sequenceNumber: number): string => {
  const date = new Date();
  const year = date.getFullYear().toString().substring(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${prefix}-${year}${month}${day}${String(sequenceNumber).padStart(5, '0')}`;
};