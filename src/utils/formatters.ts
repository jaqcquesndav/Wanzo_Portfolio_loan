export const formatCurrency = (amount: number, currency: 'CDF' | 'USD' = 'CDF'): string => {
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