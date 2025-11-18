/**
 * Utilitaires de validation pour les transactions financières
 * Conforme aux normes ISO 4217, SWIFT/BIC, IBAN et formats bancaires
 */

/**
 * Codes de devises supportés (ISO 4217)
 * https://www.iso.org/iso-4217-currency-codes.html
 */
export const SUPPORTED_CURRENCIES = [
  'CDF', // Franc Congolais
  'USD', // Dollar Américain
  'XOF', // Franc CFA BCEAO
  'XAF', // Franc CFA BEAC
  'EUR', // Euro
  'GBP', // Livre Sterling
  'CHF', // Franc Suisse
  'JPY', // Yen Japonais
  'CNY', // Yuan Chinois
] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

/**
 * Valide un code devise selon ISO 4217
 */
export function isValidCurrency(currency: string): boolean {
  return SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency);
}

/**
 * Valide un code SWIFT/BIC
 * Format: 8 ou 11 caractères alphanumériques
 * Structure: AAAA BB CC [DDD]
 * - AAAA: Code banque (4 lettres)
 * - BB: Code pays (2 lettres ISO 3166-1)
 * - CC: Code localisation (2 caractères alphanumériques)
 * - DDD: Code branche (optionnel, 3 caractères alphanumériques)
 */
export function isValidSwiftCode(swift: string): boolean {
  // Format SWIFT: 8 ou 11 caractères
  const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  return swiftRegex.test(swift.toUpperCase());
}

/**
 * Valide un numéro IBAN
 * Format variable selon pays, mais structure standardisée
 * Exemple: FR76 3000 6000 0112 3456 7890 189
 */
export function isValidIBAN(iban: string): boolean {
  // Supprimer les espaces
  const cleanIban = iban.replace(/\s/g, '');
  
  // Vérifier la longueur (15 à 34 caractères)
  if (cleanIban.length < 15 || cleanIban.length > 34) {
    return false;
  }
  
  // Vérifier le format: 2 lettres (pays) + 2 chiffres (clé) + reste alphanumérique
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
  if (!ibanRegex.test(cleanIban.toUpperCase())) {
    return false;
  }
  
  // Validation du checksum IBAN (algorithme mod-97)
  const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);
  const numeric = rearranged
    .toUpperCase()
    .split('')
    .map(char => {
      const code = char.charCodeAt(0);
      return code >= 65 && code <= 90 ? (code - 55).toString() : char;
    })
    .join('');
  
  // Calculer mod 97
  let remainder = numeric.slice(0, 2);
  for (let i = 2; i < numeric.length; i += 7) {
    remainder = (parseInt(remainder + numeric.slice(i, i + 7), 10) % 97).toString();
  }
  
  return parseInt(remainder, 10) === 1;
}

/**
 * Valide un numéro de compte bancaire générique
 * Accepte différents formats selon les pays
 */
export function isValidAccountNumber(accountNumber: string): boolean {
  // Supprimer espaces et tirets
  const clean = accountNumber.replace(/[\s-]/g, '');
  
  // Vérifier qu'il contient au moins 8 caractères alphanumériques
  if (clean.length < 8 || clean.length > 34) {
    return false;
  }
  
  // Vérifier qu'il contient au moins quelques chiffres
  const hasDigits = /\d/.test(clean);
  
  return hasDigits;
}

/**
 * Formate un montant selon les standards financiers
 * @param amount Montant à formater
 * @param currency Code devise ISO 4217
 * @param locale Locale pour le formatage (défaut: fr-FR)
 */
export function formatFinancialAmount(
  amount: number,
  currency: SupportedCurrency,
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Valide le format d'une date ISO 8601
 */
export function isValidISO8601Date(dateString: string): boolean {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!iso8601Regex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Valide une référence de transaction
 * Format: Préfixe (3-4 lettres) + Année (4 chiffres) + Séquence (4-6 chiffres)
 * Exemples: PAY-2025-001, DISB-2025-0001, VIR-2025-000042
 */
export function isValidTransactionReference(reference: string): boolean {
  const refRegex = /^[A-Z]{3,4}-\d{4}-\d{4,6}$/;
  return refRegex.test(reference);
}

/**
 * Génère une référence de transaction unique
 * @param prefix Préfixe (PAY, DISB, VIR, etc.)
 * @param sequence Numéro de séquence
 */
export function generateTransactionReference(
  prefix: string,
  sequence: number
): string {
  const year = new Date().getFullYear();
  const paddedSequence = sequence.toString().padStart(6, '0');
  return `${prefix.toUpperCase()}-${year}-${paddedSequence}`;
}

/**
 * Valide un code bancaire
 * Format variable selon pays, généralement 3-11 caractères alphanumériques
 */
export function isValidBankCode(bankCode: string): boolean {
  // Codes bancaires: entre 3 et 11 caractères alphanumériques
  const bankCodeRegex = /^[A-Z0-9]{3,11}$/;
  return bankCodeRegex.test(bankCode.toUpperCase());
}

/**
 * Valide toutes les données d'un ordre de paiement
 */
export interface PaymentOrderValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validatePaymentOrder(order: {
  amount: number;
  currency: string;
  beneficiary: {
    name: string;
    accountNumber: string;
    bankName: string;
    swiftCode?: string;
  };
  date?: string;
  reference?: string;
}): PaymentOrderValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Valider le montant
  if (order.amount <= 0) {
    errors.push('Le montant doit être supérieur à zéro');
  }
  
  // Valider la devise
  if (!isValidCurrency(order.currency)) {
    errors.push(`Code devise invalide: ${order.currency}. Doit être un code ISO 4217 supporté.`);
  }
  
  // Valider le bénéficiaire
  if (!order.beneficiary.name || order.beneficiary.name.trim().length < 2) {
    errors.push('Le nom du bénéficiaire est requis (minimum 2 caractères)');
  }
  
  if (!isValidAccountNumber(order.beneficiary.accountNumber)) {
    errors.push('Numéro de compte bénéficiaire invalide');
  }
  
  if (!order.beneficiary.bankName || order.beneficiary.bankName.trim().length < 2) {
    errors.push('Le nom de la banque bénéficiaire est requis');
  }
  
  // Valider le code SWIFT si fourni
  if (order.beneficiary.swiftCode && !isValidSwiftCode(order.beneficiary.swiftCode)) {
    warnings.push(`Code SWIFT potentiellement invalide: ${order.beneficiary.swiftCode}`);
  }
  
  // Valider la date si fournie
  if (order.date && !isValidISO8601Date(order.date)) {
    errors.push('Format de date invalide. Utilisez ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)');
  }
  
  // Valider la référence si fournie
  if (order.reference && !isValidTransactionReference(order.reference)) {
    warnings.push('Format de référence non standard. Recommandé: PREFIX-YYYY-NNNNNN');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valide les données d'un virement/décaissement
 */
export function validateDisbursement(disbursement: {
  amount: number;
  currency: string;
  debitAccount: {
    accountNumber: string;
    bankCode: string;
  };
  beneficiary: {
    accountNumber: string;
    bankName: string;
    swiftCode?: string;
  };
}): PaymentOrderValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Valider le montant
  if (disbursement.amount <= 0) {
    errors.push('Le montant doit être supérieur à zéro');
  }
  
  // Valider la devise
  if (!isValidCurrency(disbursement.currency)) {
    errors.push(`Code devise invalide: ${disbursement.currency}`);
  }
  
  // Valider le compte débiteur
  if (!isValidAccountNumber(disbursement.debitAccount.accountNumber)) {
    errors.push('Numéro de compte débiteur invalide');
  }
  
  if (!isValidBankCode(disbursement.debitAccount.bankCode)) {
    warnings.push('Code bancaire débiteur potentiellement invalide');
  }
  
  // Valider le bénéficiaire
  if (!isValidAccountNumber(disbursement.beneficiary.accountNumber)) {
    errors.push('Numéro de compte bénéficiaire invalide');
  }
  
  if (disbursement.beneficiary.swiftCode && !isValidSwiftCode(disbursement.beneficiary.swiftCode)) {
    warnings.push('Code SWIFT bénéficiaire potentiellement invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
