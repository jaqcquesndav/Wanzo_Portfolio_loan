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
  picture?: string;
  phone?: string;
  phoneVerified?: boolean;
  address?: string;
  idNumber?: string;
  idType?: IdType;
  idStatus?: IdStatus;
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
  status?: 'active' | 'inactive' | 'suspended';
  // Département de l'utilisateur (optionnel)
  department?: string;
}

/**
 * Réponse de l'endpoint GET /users/me
 * Retourne l'utilisateur courant avec son institution (version lite)
 * Optimisé pour le login, dashboard, header (~5KB vs ~100KB+)
 */
export interface UserWithInstitutionResponse {
  user: User;
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
    createdAt?: string;
    updatedAt?: string;
  };
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
  phone: z.string().optional(),
  phoneVerified: z.boolean().optional(),
  address: z.string().optional(),
  idNumber: z.string().optional(),
  idType: z.enum(['passport', 'national_id', 'driver_license', 'other']).optional(),
  idStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
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
});
