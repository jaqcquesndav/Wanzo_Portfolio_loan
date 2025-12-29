export type InstitutionType = 'bank' | 'microfinance' | 'cooperative';
export type InstitutionStatus = 'pending' | 'active' | 'suspended' | 'revoked';

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
  [key: string]: string | undefined;
}

/**
 * Institution complète avec toutes les données
 */
export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  status: InstitutionStatus;
  license_number: string;
  license_type: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  legal_representative: string;
  tax_id: string;
  regulatory_status: string;
  country?: string;
  city?: string;
  logo?: string;
  documents?: InstitutionDocument[];
  settings?: InstitutionSettings;
  created_at: string;
  updated_at: string;
}

/**
 * Institution en version "lite" - optimisée pour le chargement rapide
 * Utilisée par l'endpoint GET /users/me
 * Ne contient pas la liste des utilisateurs (~5KB vs ~100KB+)
 */
export interface InstitutionLite {
  id: string;
  name: string;
  type: InstitutionType;
  status: InstitutionStatus;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  documents?: InstitutionDocument[];
  settings?: InstitutionSettings;
  createdAt?: string;
  updatedAt?: string;
}


export interface InstitutionManager {
  id: string;
  institution_id: string;
  user_id: string;
  role: 'admin' | 'manager';
  created_at: string;
}