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
export type UserRole = 'Admin' | 'Portfolio_Manager' | 'Auditor' | 'User';
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
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;  // URL de photo de profil (Cloudinary)
  profilePicture?: string;  // URL de photo profil (legacy, Cloudinary)
  phone?: string;
  phoneVerified?: boolean;
  address?: string;
  
  // Documents d'identité et vérification
  idNumber?: string;
  idType?: IdType;
  idStatus?: IdStatus;
  idDocument?: string;  // URL du recto du document d'identité (Cloudinary)
  idDocumentBack?: string;  // URL du verso du document d'identité (Cloudinary)
  verificationSubmittedAt?: string;  // Date de soumission de la vérification
  verificationReviewedAt?: string;  // Date de revue de la vérification
  verificationReviewedBy?: string;  // ID de l'administrateur ayant vérifié
  rejectionReason?: string;  // Raison du rejet si idStatus === 'rejected'
  
  role?: UserRole;
  birthdate?: string;
  bio?: string;
  
  // Type d'entité de l'utilisateur
  userType?: UserType;

  // Liens vers les entités associées
  companyId?: string; 
  financialInstitutionId?: string;

  isCompanyOwner?: boolean;
  createdAt: string;
  updatedAt?: string;
  settings?: UserSettings;
  language?: Language;
  permissions?: string[];
  plan?: string;
  tokenBalance?: number;
  tokenTotal?: number;
  // Champ optionnel pour l'ID de l'institution associée
  institutionId?: string;
  // Champ optionnel pour le statut de l'utilisateur
  status?: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  // Département de l'utilisateur (optionnel)
  department?: string;
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
    institutionId?: string;  // ID de l'institution même si institution est null
    auth0Id?: string;        // Auth0 ID peut être présent directement dans user
    firstName?: string;      // API peut renvoyer firstName au lieu de givenName
    lastName?: string;       // API peut renvoyer lastName au lieu de familyName
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
    documents?: Array<{
      id: string;
      type: string;
      name: string;
      status?: string;
    }>;
    settings?: {
      currency?: string;
      timezone?: string;
    };
    // Champs supplémentaires de l'API réelle
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
    metadata?: {
      sigle?: string;
      typeInstitution?: string;
      denominationSociale?: string;
      [key: string]: unknown;
    };
    createdAt?: string;
    updatedAt?: string;
    created_at?: string;  // API peut utiliser snake_case
    updated_at?: string;  // API peut utiliser snake_case
  } | null;  // IMPORTANT: peut être null, utiliser user.institutionId comme fallback
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
  role: z.enum(['Admin', 'Portfolio_Manager', 'Auditor', 'User']).optional().default('User'),
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
  status: z.enum(['active', 'inactive', 'suspended', 'pending_verification']).optional(),
  department: z.string().optional(),
});
