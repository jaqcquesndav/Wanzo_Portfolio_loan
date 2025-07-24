export const formatCurrency = (amount: number, currency: string = 'FCFA', asText: boolean = false): string => {
  if (asText) {
    // Conversion en texte pour les montants (en français)
    // Cette implémentation est simplifiée et pourrait être améliorée
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    const amountStr = formatter.format(amount);
    return `${amountStr} ${currency} (montant en lettres)`;
  }
  
  // Mapper les devises à leurs locales et symboles
  const localeMap = {
    'CDF': 'fr-CD',
    'USD': 'en-US',
    'EUR': 'fr-FR',
    'FCFA': 'fr-FR',
    'XOF': 'fr-FR'
  };
  
  // Si c'est FCFA ou XOF, format personnalisé car non standard dans Intl
  if (currency === 'FCFA' || currency === 'XOF') {
    const formatted = new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    
    return `${formatted} ${currency}`;
  }
  
  // Pour les autres devises, utiliser Intl.NumberFormat avec style currency
  const formatter = new Intl.NumberFormat(localeMap[currency as keyof typeof localeMap] || 'fr-CD', {
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

/**
 * Convertit un nombre en texte (en français)
 * Exemple: 1234 -> "mille deux cent trente-quatre"
 * 
 * @param num Le nombre à convertir en texte
 * @returns Le nombre écrit en toutes lettres en français
 */
export function convertNumberToWords(num: number): string {
  if (num === 0) return 'zéro';

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

  // Fonction pour convertir un nombre inférieur à 1000
  function convertLessThanOneThousand(n: number): string {
    if (n < 20) return units[n];
    
    const unit = n % 10;
    const ten = Math.floor(n / 10) % 10;
    const hundred = Math.floor(n / 100) % 10;
    
    let result = '';
    
    if (hundred > 0) {
      if (hundred === 1) {
        result = 'cent ';
      } else {
        result = units[hundred] + ' cents ';
      }
    }
    
    if (ten > 0 || unit > 0) {
      if (ten === 1) {
        result += units[10 + unit];
      } else if (ten === 7 || ten === 9) {
        result += tens[ten - 1] + '-' + (unit === 1 ? 'et-' : '') + units[10 + unit];
      } else {
        result += tens[ten];
        if (unit === 1 && ten > 0) {
          result += '-et-un';
        } else if (unit > 0) {
          result += '-' + units[unit];
        }
      }
    }
    
    return result.trim();
  }

  if (num < 1000) {
    return convertLessThanOneThousand(num);
  }

  let result = '';
  let remainder = num;

  if (remainder >= 1000000000) {
    const billions = Math.floor(remainder / 1000000000);
    result += (billions === 1 ? 'un milliard ' : convertLessThanOneThousand(billions) + ' milliards ');
    remainder %= 1000000000;
  }

  if (remainder >= 1000000) {
    const millions = Math.floor(remainder / 1000000);
    result += (millions === 1 ? 'un million ' : convertLessThanOneThousand(millions) + ' millions ');
    remainder %= 1000000;
  }

  if (remainder >= 1000) {
    const thousands = Math.floor(remainder / 1000);
    if (thousands === 1) {
      result += 'mille ';
    } else {
      result += convertLessThanOneThousand(thousands) + ' mille ';
    }
    remainder %= 1000;
  }

  if (remainder > 0) {
    result += convertLessThanOneThousand(remainder);
  }

  return result.trim();
}