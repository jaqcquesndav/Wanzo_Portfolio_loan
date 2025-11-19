/**
 * Types for Mobile Money accounts
 */

export interface MobileMoneyAccount {
  id: string;
  account_name: string; // Nom du détenteur du compte
  phone_number: string; // Numéro de téléphone
  provider: 'Orange Money' | 'M-Pesa' | 'Airtel Money'; // Fournisseur
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
