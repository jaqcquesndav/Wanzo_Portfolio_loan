/**
 * Types for Mobile Money accounts - RDC
 */

export type MobileMoneyProvider = 'Orange Money' | 'M-Pesa' | 'Airtel Money' | 'Africell Money' | 'Vodacom M-Pesa';

export interface MobileMoneyAccount {
  id: string;
  account_name: string; // Nom du détenteur du compte
  phone_number: string; // Numéro de téléphone
  provider: MobileMoneyProvider; // Fournisseur
  pin_code?: string; // Code PIN (chiffré en production)
  account_holder_id?: string; // Numéro d'identification du titulaire
  currency: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  portfolio_id?: string;
  institution_id?: string;
  purpose?: 'disbursement' | 'collection' | 'general' | 'investment' | 'escrow' | 'reserve';
  balance?: number;
  // Informations supplémentaires selon la messagerie financière
  service_number?: string; // Numéro du service (ex: *150# pour Orange Money)
  account_status?: 'verified' | 'pending' | 'suspended';
  daily_limit?: number;
  monthly_limit?: number;
}

/**
 * Liste des opérateurs Mobile Money disponibles en RDC
 */
export const MOBILE_MONEY_PROVIDERS = [
  { code: 'Orange Money', name: 'Orange Money', prefix: '85', ussd: '*150#' },
  { code: 'M-Pesa', name: 'M-Pesa (Vodacom)', prefix: '81', ussd: '*151#' },
  { code: 'Airtel Money', name: 'Airtel Money', prefix: '99', ussd: '*501#' },
  { code: 'Africell Money', name: 'Africell Money', prefix: '90', ussd: '*140#' },
] as const;
