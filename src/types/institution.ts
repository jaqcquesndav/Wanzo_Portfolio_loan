export type InstitutionType = 'bank' | 'microfinance' | 'cooperative' | string;
export type InstitutionStatus = 'pending' | 'active' | 'suspended' | 'revoked' | string;

/**
 * Métadonnées additionnelles de l'institution
 */
export interface InstitutionMetadata {
  sigle?: string;
  typeInstitution?: string;
  denominationSociale?: string;
  [key: string]: unknown;
}

/**
 * Document institutionnel
 */
export interface InstitutionDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  status?: 'pending' | 'verified' | 'rejected';
  size?: number;
  uploadDate?: string;
  description?: string;
}

/**
 * Paramètres de l'institution
 */
export interface InstitutionSettings {
  currency?: string;
  timezone?: string;
  language?: string;
  [key: string]: string | undefined;
}

/**
 * Institution complète avec toutes les données
 */
export interface Institution {
  id: string;
  kiotaId?: string;  // ID Kiota si différent
  name: string;
  type: InstitutionType;
  status: InstitutionStatus;
  license_number?: string | null;
  license_type?: string | null;
  address?: string;
  phone?: string;
  email?: string;
  website?: string | null;
  fax?: string | null;
  legal_representative?: string | null;
  tax_id?: string | null;
  regulatory_status?: string;
  country?: string;
  city?: string;
  logo?: string;
  active?: boolean;
  documents?: InstitutionDocument[];
  settings?: InstitutionSettings;
  metadata?: InstitutionMetadata;
  // Subscription fields
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
  subscriptionEndDate?: string | null;
  lastSubscriptionChangeAt?: string | null;
  subscriptionExpiresAt?: string | null;
  tokenBalance?: number;
  tokensUsed?: number;
  tokenUsageHistory?: unknown[];
  createdBy?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Institution en version "lite" - optimisée pour le chargement rapide
 * Utilisée par l'endpoint GET /users/me
 * Ne contient pas la liste des utilisateurs (~5KB vs ~100KB+)
 */
export interface InstitutionLite {
  id: string;
  kiotaId?: string;
  name: string;
  type: InstitutionType;
  status: InstitutionStatus;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string | null;
  fax?: string | null;
  logo?: string;
  active?: boolean;
  documents?: InstitutionDocument[];
  settings?: InstitutionSettings;
  metadata?: InstitutionMetadata;
  // Regulatory fields
  license_number?: string | null;
  license_type?: string | null;
  tax_id?: string | null;
  legal_representative?: string | null;
  regulatory_status?: string;
  // Subscription/tokens fields from API
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
  subscriptionEndDate?: string | null;
  tokenBalance?: number;
  tokensUsed?: number;
  // Support both camelCase and snake_case from API
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}


export interface InstitutionManager {
  id: string;
  institution_id: string;
  user_id: string;
  role: 'admin' | 'manager';
  created_at: string;
}

/**
 * Profil de l'institution retourné par /users/me
 * Contient les informations détaillées de l'institution financière
 */
export interface InstitutionProfile {
  denominationSociale?: string;
  typeInstitution?: InstitutionType;
  numeroAgrement?: string | null;
  numeroNIF?: string | null;
  telephonePrincipal?: string | null;
  emailPrincipal?: string | null;
  siteWeb?: string | null;
  siegeSocial?: string | null;
  // Services offerts par l'institution
  servicesCredit?: string[];
  servicesInvestissement?: string[];
  servicesGarantie?: string[];
  servicesTransactionnels?: string[];
  servicesConseil?: string[];
  servicesPrioritaires?: string[];
  // Ciblage métier
  segmentsClienteleCibles?: string[];
  secteursActivitePrivilegies?: string[];
  zonesGeographiquesPrioritaires?: string[];
}