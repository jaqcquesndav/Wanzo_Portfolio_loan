import { Address, ContactPerson } from './user';
import { addressSchema, contactPersonSchema } from './user';
import * as z from 'zod';

// Types d'institutions financières pour standardiser les options
export type FinancialInstitutionType = 
  | 'BANQUE'
  | 'MICROFINANCE'
  | 'COOPEC' // Coopérative d'Épargne et de Crédit
  | 'FOND_GARANTIE'
  | 'ENTREPRISE_FINANCIERE'
  | 'FOND_CAPITAL_INVESTISSEMENT'
  | 'FOND_IMPACT'
  | 'AUTRE';

// Types de secteurs
export type SectorType = 
  | 'PRIVE'
  | 'PUBLIC'
  | 'PUBLIC_PRIVE';

// Structure pour le capital social
export interface ShareCapital {
  amount: number;
  currency: 'USD' | 'CDF' | 'EUR';
}

// Structure principale pour une institution financière
export interface FinancialInstitution {
  id: string;
  userId: string; // Lien vers l'utilisateur propriétaire
  name: string;
  type: FinancialInstitutionType;
  sector?: SectorType; // Secteur: Privé, Public ou Public-Privé
  
  // Informations réglementaires
  approvalNumber?: string; // Numéro d'agrément
  taxId?: string; // N° Impôt
  natId?: string; // IDNAT
  rccm?: string; // RCCM

  // Détails de l'entreprise
  legalForm?: string; // Forme juridique (SA, SARL, etc.)
  creationDate?: string; // Date de création
  website?: string;
  logo?: string;
  
  // Capital et activités
  capital?: ShareCapital;
  primaryActivity?: string;
  secondaryActivities?: string[];

  // Adresses et contacts
  headquartersAddress?: Address; // Siège social (format legacy)
  branches?: Address[]; // Succursales (format legacy)
  
  // Nouveau format avec coordonnées géographiques
  locations?: {
    id: string;
    name: string;
    type: 'headquarters' | 'branch' | 'store' | 'warehouse' | 'factory' | 'other';
    address?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  }[];
  
  contactPerson?: ContactPerson; // Personne de contact principale
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

// Schéma de validation Zod pour FinancialInstitution
export const financialInstitutionSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  type: z.enum(['BANQUE', 'MICROFINANCE', 'COOPEC', 'FOND_GARANTIE', 'ENTREPRISE_FINANCIERE', 'FOND_CAPITAL_INVESTISSEMENT', 'FOND_IMPACT', 'AUTRE']),
  sector: z.enum(['PRIVE', 'PUBLIC', 'PUBLIC_PRIVE']).optional(),
  approvalNumber: z.string().optional(),
  taxId: z.string().optional(),
  natId: z.string().optional(),
  rccm: z.string().optional(),
  legalForm: z.string().optional(),
  creationDate: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  logo: z.string().url().optional(),
  capital: z.object({
    amount: z.number().positive(),
    currency: z.enum(['USD', 'CDF', 'EUR']),
  }).optional(),
  primaryActivity: z.string().optional(),
  secondaryActivities: z.array(z.string()).optional(),
  headquartersAddress: addressSchema.optional(), 
  branches: z.array(addressSchema).optional(),
  contactPerson: contactPersonSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
