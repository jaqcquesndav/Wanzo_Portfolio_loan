import { z } from 'zod';

export type UserType = 'sme' | 'financial_institution';
/**
 * Rôles en minuscules — format canonique du backend (portfolio-institution-service)
 * Les rôles 'admin' et 'super_admin' ne peuvent être créés via l'API /admin/users.
 */
export type UserRole =
  | 'admin'
  | 'portfolio_manager'
  | 'auditor'
  | 'user'
  | 'manager'
  | 'analyst'
  | 'viewer';

/** Labels d'affichage FR pour chaque rôle */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin:              'Administrateur',
  portfolio_manager:  'Gestionnaire de Portefeuille',
  auditor:            'Auditeur',
  user:               'Utilisateur',
  manager:            'Manager',
  analyst:            'Analyste',
  viewer:             'Lecteur',
};

/** Rôles créables par un admin via POST /admin/users */
export const CREATABLE_ROLES: UserRole[] = [
  'portfolio_manager', 'auditor', 'user', 'manager', 'analyst', 'viewer',
];

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

export interface User {
  id: string;
  email: string;
  emailVerified?: boolean;
  isEmailVerified?: boolean;
  isTwoFactorEnabled?: boolean;
  // Prénom/nom — backend utilise firstName/lastName
  firstName?: string;
  lastName?: string;
  // Alias Auth0 / legacy
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
  department?: string;
  userType?: UserType;
  companyId?: string;
  financialInstitutionId?: string;
  institutionId?: string;
  isCompanyOwner?: boolean;
  kiotaId?: string;
  auth0Id?: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  settings?: UserSettings;
  language?: Language;
  permissions?: string[];
  plan?: string;
  tokenBalance?: number;
  tokenTotal?: number;
  /** Statut aligné backend: pas 'pending_verification' */
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
}

// Pour la rétrocompatibilité avec le code existant
export const created_at = 'createdAt';

// Schéma Zod pour la validation
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
});