export type CompanySize = 'micro' | 'small' | 'medium' | 'large';
export type CompanyStatus = 'active' | 'pending' | 'rejected' | 'funded' | 'contacted' | 'qualified';

// Rating financier conforme à la documentation (AAA à E)
export type FinancialRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'C' | 'D' | 'E';

// Types de comptes de trésorerie selon SYSCOHADA
export type TreasuryAccountType = 'bank' | 'cash' | 'investment' | 'transit';

// Devise supportée
export type Currency = 'CDF' | 'USD' | 'EUR';

// Échelle temporelle pour les séries de trésorerie
export type TimeseriesScale = 'weekly' | 'monthly' | 'quarterly' | 'annual';

/**
 * Compte de trésorerie SYSCOHADA
 * Classes SYSCOHADA : 521 (banques), 53 (caisse), 54 (placements), 57 (virements internes)
 */
export interface TreasuryAccount {
  code: string;                    // Code comptable SYSCOHADA (521*, 53*, 54*, 57*)
  name: string;                    // Libellé du compte
  type: TreasuryAccountType;       // Type de compte
  balance: number;                 // Solde actuel
  currency: Currency;              // Devise
  bankName?: string;               // Nom de la banque (pour type=bank)
  accountNumber?: string;          // Numéro de compte (pour type=bank)
}

/**
 * Résumé d'une période temporelle
 */
export interface TreasuryPeriod {
  periodId: string;                // Identifiant période (2025-W46, 2025-11, 2025-Q4, 2025)
  startDate: string;               // Date début période (ISO 8601)
  endDate: string;                 // Date fin période (ISO 8601)
  totalBalance: number;            // Solde total pour la période
  accountsCount: number;           // Nombre de comptes actifs
  treasuryAccounts?: TreasuryAccount[]; // Détails des comptes (optionnel)
}

/**
 * Séries temporelles multi-échelles
 */
export interface TreasuryTimeseries {
  weekly: TreasuryPeriod[];        // 12 dernières semaines
  monthly: TreasuryPeriod[];       // 12 derniers mois
  quarterly: TreasuryPeriod[];     // 4 derniers trimestres
  annual: TreasuryPeriod[];        // 3 dernières années
}

/**
 * Données complètes de trésorerie
 */
export interface TreasuryData {
  total_treasury_balance: number;  // Solde total trésorerie
  accounts: TreasuryAccount[];     // Liste des comptes de trésorerie
  timeseries?: TreasuryTimeseries; // Séries temporelles (optionnel)
}

export interface Company {
  id: string;
  name: string;
  sector: string;
  size: CompanySize;
  annual_revenue: number;
  employee_count: number;
  website_url?: string;
  pitch_deck_url?: string;
  status: CompanyStatus;
  lastContact?: string;
  
  // Métriques financières (conformes à ProspectDto)
  financial_metrics: {
    annual_revenue: number;      // CA annuel (peut différer du champ racine si consolidé)
    revenue_growth: number;      // Croissance YoY (%)
    profit_margin: number;       // Marge bénéficiaire (%)
    cash_flow: number;           // Flux de trésorerie
    debt_ratio: number;          // Ratio d'endettement (0.0-1.0)
    working_capital: number;     // Fonds de roulement
    credit_score: number;        // Score de crédit (0-100)
    financial_rating: FinancialRating; // Rating financier (AAA-E)
    ebitda?: number;             // EBITDA (optionnel)
    treasury_data?: TreasuryData; // Données de trésorerie SYSCOHADA (optionnel)
  };
  
  // Informations de contact (essentielles pour prospection)
  contact_info?: {
    email?: string;              // Email de contact
    phone?: string;              // Téléphone
    address?: string;            // Adresse physique
    website?: string;            // Site web (peut dupliquer website_url)
  };
  
  // Informations de paiement (pour ordres de paiement)
  payment_info?: {
    preferredMethod?: 'bank' | 'mobile_money'; // Méthode de paiement préférée
    bankAccounts?: Array<{        // Comptes bancaires
      accountNumber: string;      // Numéro de compte
      accountName: string;        // Titulaire du compte
      bankName: string;           // Nom de la banque
      swiftCode?: string;         // Code SWIFT/BIC
      iban?: string;              // IBAN (si applicable)
      currency: Currency;         // Devise du compte
      isPrimary: boolean;         // Compte principal
    }>;
    mobileMoneyAccounts?: Array<{ // Comptes Mobile Money
      phoneNumber: string;        // Numéro de téléphone
      accountName: string;        // Nom du titulaire
      provider: string;           // Opérateur (Orange Money, M-Pesa, Airtel Money, etc.)
      currency: Currency;         // Devise
      isPrimary: boolean;         // Compte principal
    }>;
  };
  
  // Informations légales (pour vérification conformité)
  legal_info?: {
    legalForm?: string;          // Forme juridique (SARL, SA, SAS, etc.)
    rccm?: string;               // Numéro RCCM
    taxId?: string;              // Numéro fiscal
    yearFounded?: number;        // Année de création
  };
  
  // Géolocalisation (pour recherche nearby)
  latitude?: number;             // Latitude GPS (-90 à 90)
  longitude?: number;            // Longitude GPS (-180 à 180)
  
  // Emplacements multiples (optionnel, pour entreprises multi-sites)
  locations?: Array<{
    id: string;
    address: string;
    city: string;
    country: string;
    isPrimary: boolean;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }>;
  
  // Propriétaire principal (optionnel, pour contexte décisionnel)
  owner?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  
  // Personnes de contact (optionnel, pour faciliter la prospection)
  contactPersons?: Array<{
    name: string;
    role: string;
    email: string;
    phone: string;
  }>;
  
  // Métadonnées de synchronisation (indicateurs de fraîcheur des données)
  profileCompleteness?: number;        // Complétude du profil (0-100%)
  lastSyncFromAccounting?: string;     // Dernière sync accounting-service (ISO 8601)
  lastSyncFromCustomer?: string;       // Dernière sync customer-service (ISO 8601)
  
  // Métriques ESG (conservées pour compatibilité)
  esg_metrics: {
    esg_rating?: string;
    carbon_footprint: number;
    environmental_rating: 'A' | 'B' | 'C' | 'D';
    social_rating: 'A' | 'B' | 'C' | 'D';
    governance_rating: 'A' | 'B' | 'C' | 'D';
    gender_ratio?: {
      male: number;
      female: number;
    };
  };
  
  created_at: string;
  updated_at: string;
}

export interface Meeting {
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