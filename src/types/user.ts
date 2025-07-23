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
