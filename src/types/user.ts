import * as z from 'zod';

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface ContactPerson {
  name: string;
  title: string;
  email: string;
  phone: string;
  department?: string;
}

export type UserType = 'sme' | 'financial_institution';
/**
 * Rôles en minuscules — format canonique du backend (portfolio-institution-service)
 */
export type UserRole =
  | 'admin'
  | 'portfolio_manager'
  | 'auditor'
  | 'user'
  | 'manager'
  | 'analyst'
  | 'viewer';

export type IdType = 'passport' | 'national_id' | 'driver_license' | 'other';
export type IdStatus = 'pending' | 'verified' | 'rejected';
export type Language = 'fr' | 'en';

export interface UserSettings {
  notifications?: {
    email?: boolean;
    sms?: boolean;
    app?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
  dashboard?: {
    defaultView?: string;
    widgets?: string[];
  };
}

// Définition du type Permission
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface User {
  id: string;
  email: string;
  emailVerified?: boolean;
  isEmailVerified?: boolean;   // champ backend
  isTwoFactorEnabled?: boolean; // champ backend
  // Prénom / nom — le backend renvoie firstName/lastName
  firstName?: string;
  lastName?: string;
  // Alias Auth0 / legacy
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;          // URL photo de profil (Cloudinary)
  profilePicture?: string;   // alias legacy
  phone?: string;
  phoneVerified?: boolean;
  address?: string;
  // Identité
  idNumber?: string;
  idType?: IdType;
  idStatus?: IdStatus;
  idDocument?: string;
  idDocumentBack?: string;
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  verificationReviewedBy?: string;
  rejectionReason?: string;
  // Rôle et métadonnées
  role?: UserRole;
  birthdate?: string;
  bio?: string;
  department?: string;
  language?: Language;
  userType?: UserType;
  // Liens entités
  companyId?: string;
  financialInstitutionId?: string;
  institutionId?: string;
  isCompanyOwner?: boolean;
  // Identifiants back
  kiotaId?: string;     // ex: "KT-USR-20260225-0001"
  auth0Id?: string;     // ex: "auth0|64a1b2c3..."
  // Dates
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  // Paramètres et accès
  settings?: UserSettings;
  permissions?: string[];
  // Abonnement / tokens
  plan?: string;
  tokenBalance?: number;
  tokenTotal?: number;
  // Statut — aligné avec le backend (pas 'pending_verification')
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
}

/**
 * Réponse de l'endpoint GET /users/me
 * Retourne l'utilisateur courant avec son institution (version lite)
 * Optimisé pour le login, dashboard, header (~5KB vs ~100KB+)
 * 
 * NOTE: institution peut être null si l'utilisateur n'a pas encore d'institution
 * Dans ce cas, user.institutionId contient l'ID de l'institution à charger séparément
 */
export interface UserWithInstitutionResponse {
  user: User & {
    institutionId?: string;
    auth0Id?: string;
    firstName?: string;
    lastName?: string;
  };
  institution: {
    id: string;
    name: string;
    type: string;
    status: string;
    country?: string;
    city?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    documents?: Array<{ id: string; type: string; name: string; status?: string }>;
    settings?: { currency?: string; timezone?: string };
    license_number?: string | null;
    license_type?: string | null;
    legal_representative?: string | null;
    tax_id?: string | null;
    regulatory_status?: string;
    kiotaId?: string;
    active?: boolean;
    createdBy?: string | null;
    subscriptionPlan?: string | null;
    subscriptionStatus?: string | null;
    subscriptionEndDate?: string | null;
    lastSubscriptionChangeAt?: string | null;
    subscriptionExpiresAt?: string | null;
    tokenBalance?: number;
    tokensUsed?: number;
    tokenUsageHistory?: unknown[];
    metadata?: { sigle?: string; typeInstitution?: string; denominationSociale?: string; [key: string]: unknown };
    createdAt?: string;
    updatedAt?: string;
    created_at?: string;
    updated_at?: string;
  } | null;
  /**
   * Profil enrichi depuis customer-service (70+ champs OHADA/BCC)
   * Présent uniquement sur GET /users/me (peut être null)
   */
  institutionProfile?: {
    denominationSociale?: string;
    sigle?: string;
    typeInstitution?: string;
    sousCategorie?: string;
    statutJuridique?: string;
    autoriteSupervision?: string;
    numeroAgrement?: string;
    numeroNIF?: string;
    capitalSocialActuel?: number;
    nombreAgences?: number;
    devise?: string;
    servicesCredit?: string[];
    secteursActivitePrivilegies?: string[];
    zonesGeographiquesPrioritaires?: string[];
    statutValidation?: string;
    logo?: string;
    [key: string]: unknown;
  } | null;
  auth0Id: string;
  role: UserRole;
  permissions: string[];
}

// Schémas Zod pour la validation
export const addressSchema = z.object({
  street: z.string().min(1, "L'adresse est requise"),
  city: z.string().min(1, "La ville est requise"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Le pays est requis"),
});

export const contactPersonSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  title: z.string().min(1, "Le titre est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(5, "Le téléphone est requis"),
  department: z.string().optional(),
});

export const userSettingsSchema = z.object({
  notifications: z.object({
    email: z.boolean().optional().default(true),
    sms: z.boolean().optional().default(false),
    app: z.boolean().optional().default(true),
  }).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional().default('system'),
  dashboard: z.object({
    defaultView: z.string().optional(),
    widgets: z.array(z.string()).optional(),
  }).optional(),
}).optional();

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email("Email invalide"),
  emailVerified: z.boolean().optional(),
  name: z.string().optional(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  picture: z.string().url("URL invalide").optional(),
  profilePicture: z.string().url("URL invalide").optional(),
  phone: z.string().optional(),
  phoneVerified: z.boolean().optional(),
  address: z.string().optional(),
  idNumber: z.string().optional(),
  idType: z.enum(['passport', 'national_id', 'driver_license', 'voter_card', 'other']).optional(),
  idStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
  idDocument: z.string().url("URL invalide").optional(),
  idDocumentBack: z.string().url("URL invalide").optional(),
  verificationSubmittedAt: z.string().optional(),
  verificationReviewedAt: z.string().optional(),
  verificationReviewedBy: z.string().optional(),
  rejectionReason: z.string().optional(),
  role: z.enum(['admin', 'portfolio_manager', 'auditor', 'user', 'manager', 'analyst', 'viewer']).optional().default('user'),
  birthdate: z.string().optional(),
  bio: z.string().optional(),
  userType: z.enum(['sme', 'financial_institution']).optional(),
  companyId: z.string().optional(),
  financialInstitutionId: z.string().optional(),
  isCompanyOwner: z.boolean().optional().default(false),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  settings: userSettingsSchema,
  language: z.enum(['fr', 'en']).optional().default('fr'),
  permissions: z.array(z.string()).optional(),
  plan: z.string().optional(),
  tokenBalance: z.number().optional(),
  tokenTotal: z.number().optional(),
  institutionId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
  department: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  kiotaId: z.string().optional(),
  auth0Id: z.string().optional(),
  isEmailVerified: z.boolean().optional(),
  isTwoFactorEnabled: z.boolean().optional(),
  lastLogin: z.string().optional(),
});
