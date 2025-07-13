/**
 * Types for bank accounts
 */

export interface BankAccount {
  id: string;
  account_number: string;
  account_name: string;
  bank_name: string;
  branch?: string;
  swift_code?: string;
  iban?: string;
  currency: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  portfolio_id?: string;
  institution_id?: string;
  purpose?: 'disbursement' | 'collection' | 'general' | 'investment' | 'escrow' | 'reserve';
  balance?: number;
}
