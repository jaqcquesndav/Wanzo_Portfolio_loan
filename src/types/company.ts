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

/** Type de détenteur pour l'actionnariat */
export type HolderType = 'physique' | 'morale';

/**
 * Personne de contact dans l'entreprise (dirigeant, actionnaire, employé)
 * Interface enrichie pour supporter tous les cas du formulaire
 */
export interface ContactPerson {
  id?: string;
  
  // Type de détenteur (personne physique ou morale)
  typeDetenteur?: HolderType;
  
  // Champs personne physique
  nom?: string;
  prenoms?: string;
  fonction?: string;
  nationalite?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  linkedin?: string;
  cv?: string; // URL du CV uploadé
  cvFileName?: string; // Nom du fichier CV
  
  // Champs personne morale (actionnaire)
  raisonSociale?: string;
  formeJuridique?: string;
  rccm?: string; // Numéro RCCM
  idnat?: string; // ID National
  siegeSocial?: string;
  representantLegal?: string; // Nom du représentant légal
  representantFonction?: string; // Fonction du représentant
  
  // Champs actionnariat
  nombreActions?: number; // Nombre d'actions ou de parts sociales
  pourcentageActions?: number; // Pourcentage du capital
  
  // Champs employé
  dateNomination?: string;
  typeContrat?: string;
  salaire?: number;
  diplomes?: string[];
  
  // Compatibilité legacy
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
 * Compte bancaire pour paiement - Interface enrichie
 */
export interface BankAccount {
  id?: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  currency: Currency;
  isPrimary: boolean;
  swiftCode?: string;
  iban?: string;
  typeCompte?: 'courant' | 'epargne' | 'professionnel' | 'devise';
  agence?: string;
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

/** Type d'assurance */
export type InsuranceType = 'responsabilite_civile' | 'incendie' | 'vol' | 'accidents_travail' | 'marchandises' | 'vehicules' | 'multirisque' | 'autre';

/**
 * Assurance de l'entreprise
 */
export interface Insurance {
  id?: string;
  compagnie: string;
  typeAssurance: InsuranceType;
  numeroPolice: string;
  montantCouverture?: number;
  devise?: Currency;
  dateDebut?: string;
  dateExpiration?: string;
  prime?: number;
  frequencePaiement?: 'mensuel' | 'trimestriel' | 'annuel';
  observations?: string;
}

/**
 * Informations de paiement - enrichi avec assurances
 */
export interface PaymentInfo {
  preferredMethod?: 'bank' | 'mobile_money';
  bankAccounts?: BankAccount[];
  mobileMoneyAccounts?: MobileMoneyAccount[];
  assurances?: Insurance[];
}

// ============================================================================
// INTERFACES ACTIFS (PATRIMOINE)
// ============================================================================

/** Type d'actif */
export type AssetType = 'immobilier' | 'vehicule' | 'equipement' | 'stock' | 'autre';

/** État d'un actif */
export type AssetCondition = 'neuf' | 'excellent' | 'bon' | 'moyen' | 'mauvais' | 'deteriore';

/** Type de propriété */
export type OwnershipType = 'propre' | 'location' | 'leasing' | 'emprunt';

/**
 * Asset (immobilisation ou bien patrimonial) - Interface enrichie
 */
export interface Asset {
  id?: string;
  designation?: string;
  type?: AssetType;
  description?: string;
  
  // Valeurs financières détaillées
  prixAchat?: number;
  valeurActuelle?: number;
  devise?: Currency;
  
  // Informations temporelles
  dateAcquisition?: string;
  
  // État et localisation
  etatActuel?: AssetCondition;
  localisation?: string;
  
  // Informations techniques
  numeroSerie?: string;
  marque?: string;
  modele?: string;
  quantite?: number;
  unite?: string;
  
  // Statut de propriété
  proprietaire?: OwnershipType;
  
  // Observations
  observations?: string;
}

/** Catégorie de stock */
export type StockCategory = 'matiere_premiere' | 'produit_semi_fini' | 'produit_fini' | 'fourniture' | 'emballage' | 'autre';

/** État du stock */
export type StockCondition = 'excellent' | 'bon' | 'moyen' | 'deteriore' | 'perime';

/**
 * Stock/Inventaire - Interface enrichie
 */
export interface Stock {
  id?: string;
  designation?: string;
  categorie?: StockCategory;
  description?: string;
  
  // Quantités et unités
  quantiteStock?: number;
  unite?: string;
  seuilMinimum?: number;
  seuilMaximum?: number;
  
  // Valeurs financières
  coutUnitaire?: number;
  valeurTotaleStock?: number;
  devise?: Currency;
  
  // Informations temporelles
  dateDernierInventaire?: string;
  dureeRotationMoyenne?: number;
  datePeremption?: string;
  
  // Localisation et stockage
  emplacement?: string;
  conditionsStockage?: string;
  
  // Suivi et gestion
  fournisseurPrincipal?: string;
  numeroLot?: string;
  codeArticle?: string;
  
  // État
  etatStock?: StockCondition;
  observations?: string;
}

// ============================================================================
// INTERFACES PITCH ET PRÉSENTATION
// ============================================================================

/**
 * Lien vers réseau social
 */
export interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

/**
 * Données de pitch et présentation
 */
export interface PitchData {
  elevator_pitch?: string;
  value_proposition?: string;
  target_market?: string;
  competitive_advantage?: string;
  pitch_deck_url?: string;
  demo_video_url?: string;
}

// ============================================================================
// INTERFACES INCUBATION ET SPÉCIFICITÉS
// ============================================================================

/**
 * Données d'incubation/accélération
 */
export interface IncubationData {
  enIncubation: boolean;
  typeAccompagnement?: 'incubation' | 'acceleration';
  nomIncubateur?: string;
  certificatAffiliation?: string;
}

/**
 * Spécificités pour les startups
 */
export interface StartupSpecifics {
  niveauMaturiteTechnologique?: string; // TRL
  modeleEconomique?: string;
  proprieteIntellectuelle?: string[];
}

/**
 * Spécificités pour les entreprises traditionnelles
 */
export interface TraditionalSpecifics {
  certificationQualite?: boolean;
  licencesExploitation?: string[];
}

// ============================================================================
// INTERFACES FINANCE ÉTENDUE ET JURIDIQUE
// ============================================================================

/**
 * Prêt ou concours financier en cours
 */
export interface Loan {
  id: string;
  type: string;
  amount: number;
  currency: Currency;
  lender: string;
  startDate: string;
  endDate?: string;
  interestRate?: number;
  status: 'active' | 'completed' | 'defaulted';
}

/**
 * Levée de fonds (funding round)
 */
export interface FundingRound {
  id: string;
  roundType: string; // Seed, Series A, Series B, etc.
  amount: number;
  currency: Currency;
  valuation?: number;
  investors?: string[];
  date: string;
}

/**
 * Aspects juridiques et réglementaires
 */
export interface LegalAspects {
  failliteAnterieure: boolean;
  detailsFaillite?: string;
  poursuiteJudiciaire: boolean;
  detailsPoursuites?: string;
  garantiePrets: boolean;
  detailsGaranties?: string;
  antecedentsFiscaux: boolean;
  detailsAntecedentsFiscaux?: string;
}

/**
 * Documents de l'entreprise par catégorie
 */
export interface CompanyDocuments {
  documentsEntreprise?: string[]; // URLs ou IDs
  documentsPersonnel?: string[];
  documentsFinanciers?: string[];
  documentsPatrimoine?: string[];
  documentsProprieteIntellectuelle?: string[];
  documentsSectoriels?: string[];
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
  logo_url?: string; // URL du logo de l'entreprise
  
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
  
  // PERSONNES - Enrichi avec dirigeants, actionnaires, employés
  owner?: Owner;
  contactPersons?: ContactPerson[];
  dirigeants?: ContactPerson[];
  actionnaires?: ContactPerson[];
  employes?: ContactPerson[];
  
  // PATRIMOINES ET ACTIFS - Séparé par catégorie
  assets?: Asset[];
  immobilisations?: Asset[];
  equipements?: Asset[];
  vehicules?: Asset[];
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
  
  // ========== NOUVEAUX CHAMPS ÉTENDUS ==========
  
  // IDENTIFICATION ÉTENDUE
  sigle?: string;
  typeEntreprise?: 'traditional' | 'startup';
  numeroIdentificationNationale?: string;
  secteursActiviteSecondaires?: string[];
  secteursPersonalises?: string[];
  descriptionActivites?: string;
  produitsServices?: string[];
  capitalSocial?: number;
  deviseCapital?: Currency;
  dateCreation?: string;
  dateDebutActivites?: string;
  
  // INCUBATION ET ACCOMPAGNEMENT
  incubation?: IncubationData;
  
  // SPÉCIFICITÉS SELON TYPE
  startupSpecifics?: StartupSpecifics;
  traditionalSpecifics?: TraditionalSpecifics;
  
  // PITCH ET PRÉSENTATION
  pitch?: PitchData;
  
  // LOCALISATION DÉTAILLÉE
  siegeSocial?: Location;
  siegeExploitation?: Location;
  unitesProduction?: Location[];
  pointsVente?: Location[];
  telephoneFixe?: string;
  telephoneMobile?: string;
  fax?: string;
  boitePostale?: string;
  reseauxSociaux?: SocialLink[];
  
  // PATRIMOINE ÉTENDU
  moyensTechniques?: string[];
  capaciteProduction?: string;
  
  // STRUCTURE ÉTENDUE
  organigramme?: string;
  
  // FINANCE ÉTENDUE
  pretsEnCours?: Loan[];
  leveeDeFonds?: FundingRound[];
  
  // ASPECTS JURIDIQUES
  legalAspects?: LegalAspects;
  
  // DOCUMENTS
  documents?: CompanyDocuments;
}

// ============================================================================
// INTERFACES SECONDAIRES ET CONTEXTE
// ============================================================================

/**
 * Réunion planifiée avec une entreprise
 */
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