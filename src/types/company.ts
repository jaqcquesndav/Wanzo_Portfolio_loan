// ============================================================================
// ÉNUMÉRATIONS ET TYPES PRIMITIFS
// ============================================================================

/** Taille d'entreprise selon classification standard */
export type CompanySize = 'micro' | 'small' | 'medium' | 'large';

/** Statut de l'entreprise dans le pipeline commercial */
export type CompanyStatus = 'lead' | 'contacted' | 'qualified' | 'active' | 'funded' | 'pending' | 'rejected';

/** Rating financier conforme à la notation de crédit (AAA à E) */
export type FinancialRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'C' | 'D' | 'E' | 'NR';

/** Types de comptes de trésorerie selon SYSCOHADA */
export type TreasuryAccountType = 'bank' | 'cash' | 'investment' | 'transit';

/** Devises supportées */
export type Currency = 'CDF' | 'USD' | 'EUR';

/** Échelle temporelle pour les séries de trésorerie */
export type TimeseriesScale = 'weekly' | 'monthly' | 'quarterly' | 'annual';

/** Forme juridique de l'entreprise */
export type LegalForm = 'SARL' | 'SA' | 'SAS' | 'EIRL' | 'SPRL' | 'Autres';

/** Rating ESG */
export type ESGRating = 'A' | 'B' | 'C' | 'D' | 'NR';

// ============================================================================
// INTERFACES FINANCIÈRES
// ============================================================================

/**
 * Compte de trésorerie SYSCOHADA
 * Classes : 521 (banques), 53 (caisse), 54 (placements), 57 (virements)
 */
export interface TreasuryAccount {
  code: string;
  name: string;
  type: TreasuryAccountType;
  balance: number;
  currency: Currency;
  bankName?: string;
  accountNumber?: string;
}

/**
 * Période temporelle pour la trésorerie
 */
export interface TreasuryPeriod {
  periodId: string;
  startDate: string;
  endDate: string;
  totalBalance: number;
  accountsCount: number;
  treasuryAccounts?: TreasuryAccount[];
}

/**
 * Séries temporelles multi-échelles de trésorerie
 */
export interface TreasuryTimeseries {
  weekly: TreasuryPeriod[];
  monthly: TreasuryPeriod[];
  quarterly: TreasuryPeriod[];
  annual: TreasuryPeriod[];
}

/**
 * Données complètes de trésorerie
 */
export interface TreasuryData {
  total_treasury_balance: number;
  accounts: TreasuryAccount[];
  timeseries?: TreasuryTimeseries;
}

/**
 * Métriques financières de l'entreprise
 */
export interface FinancialMetrics {
  annual_revenue: number;
  revenue_growth: number;
  profit_margin: number;
  cash_flow: number;
  debt_ratio: number;
  working_capital: number;
  credit_score: number;
  financial_rating: FinancialRating;
  ebitda?: number;
  treasury_data?: TreasuryData;
}

/**
 * Métriques financières de l'entreprise
 */
export interface FinancialMetrics {
  annual_revenue: number;
  revenue_growth: number;
  profit_margin: number;
  cash_flow: number;
  debt_ratio: number;
  working_capital: number;
  credit_score: number;
  financial_rating: FinancialRating;
  ebitda?: number;
  treasury_data?: TreasuryData;
}

// ============================================================================
// INTERFACES DE CONTACT ET LOCALISATION
// ============================================================================

/**
 * Informations de contact
 */
export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

/**
 * Localisation d'un site (siège ou succursale)
 */
export interface Location {
  id: string;
  address: string;
  city: string;
  country: string;
  isPrimary: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Personne de contact dans l'entreprise
 */
export interface ContactPerson {
  id?: string;
  nom?: string;
  prenoms?: string;
  fonction?: string;
  email?: string;
  telephone?: string;
  pourcentageActions?: number;
  role?: string;
}

/**
 * Propriétaire ou dirigeant
 */
export interface Owner {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
}

// ============================================================================
// INTERFACES LÉGALES ET PAIEMENT
// ============================================================================

/**
 * Informations légales
 */
export interface LegalInfo {
  legalForm?: LegalForm;
  rccm?: string;
  taxId?: string;
  yearFounded?: number;
}

/**
 * Compte bancaire pour paiement
 */
export interface BankAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  currency: Currency;
  isPrimary: boolean;
  swiftCode?: string;
  iban?: string;
}

/**
 * Compte Mobile Money pour paiement
 */
export interface MobileMoneyAccount {
  phoneNumber: string;
  accountName: string;
  provider: string;
  currency: Currency;
  isPrimary: boolean;
}

/**
 * Informations de paiement
 */
export interface PaymentInfo {
  preferredMethod?: 'bank' | 'mobile_money';
  bankAccounts?: BankAccount[];
  mobileMoneyAccounts?: MobileMoneyAccount[];
}

// ============================================================================
// INTERFACES ACTIFS (PATRIMOINE)
// ============================================================================

/**
 * Asset (immobilisation ou bien patrimonial)
 */
export interface Asset {
  designation?: string;
  type?: string;
  valeurActuelle?: number;
  etatActuel?: string;
  observations?: string;
}

/**
 * Stock/Inventaire
 */
export interface Stock {
  designation?: string;
  categorie?: string;
  quantiteStock?: number;
  valeurTotaleStock?: number;
  etatStock?: string;
}

// ============================================================================
// INTERFACES ESG
// ============================================================================

/**
 * Métriques ESG (Environnement, Social, Gouvernance)
 */
export interface ESGMetrics {
  esg_rating?: string;
  carbon_footprint: number;
  environmental_rating: ESGRating;
  social_rating: ESGRating;
  governance_rating: ESGRating;
  gender_ratio?: {
    male: number;
    female: number;
  };
}

// ============================================================================
// INTERFACE PRINCIPALE: COMPANY
// ============================================================================

/**
 * Représentation complète d'une entreprise
 * Regroupe identité, financials, contact, patrimoine, et métriques ESG
 */
export interface Company {
  // IDENTITÉ ET CONTEXTE
  id: string;
  name: string;
  sector: string;
  size: CompanySize;
  status: CompanyStatus;
  
  // DONNÉES OPÉRATIONNELLES
  employee_count: number;
  website_url?: string;
  pitch_deck_url?: string;
  lastContact?: string;
  
  // DONNÉES FINANCIÈRES
  annual_revenue: number;
  financial_metrics: FinancialMetrics;
  
  // DONNÉES DE CONTACT ET LOCALISATION
  contact_info?: ContactInfo;
  locations?: Location[];
  latitude?: number;
  longitude?: number;
  
  // DONNÉES LÉGALES ET PAIEMENT
  legal_info?: LegalInfo;
  payment_info?: PaymentInfo;
  
  // PERSONNES
  owner?: Owner;
  contactPersons?: ContactPerson[];
  
  // PATRIMOINES ET ACTIFS
  assets?: Asset[];
  stocks?: Stock[];
  
  // MÉTRIQUES ESG
  esg_metrics: ESGMetrics;
  
  // MÉTADONNÉES DE SYNCHRONISATION
  profileCompleteness?: number;
  lastSyncFromAccounting?: string;
  lastSyncFromCustomer?: string;
  
  // TIMESTAMPS
  created_at: string;
  updated_at: string;
}

// ============================================================================
// INTERFACES SECONDAIRES ET CONTEXTE
// ============================================================================
  id: string;
  company_id: string;
  portfolio_manager_id: string;
  meeting_date: string;
  meeting_type: 'physical' | 'virtual';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface SecurityOpportunity {
  type: 'bond' | 'share';
  details: {
    totalAmount: number;
    unitPrice: number;
    quantity: number;
    maturityDate?: string; // Pour les obligations
    interestRate?: number; // Pour les obligations
    dividendYield?: number; // Pour les actions
    minimumInvestment: number;
    status: 'upcoming' | 'active' | 'closed';
  };
  documents: CompanyDocument[];
}

export interface CompanyDocument {
  id: string;
  type: 'financial_report' | 'audit_report' | 'annual_report' | 'prospectus';
  title: string;
  date: string;
  url: string;
  size: string;
}