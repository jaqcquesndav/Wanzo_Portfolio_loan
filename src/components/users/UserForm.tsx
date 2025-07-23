// @ts-expect-error -- React is used for JSX
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input, Select } from '../ui/Form';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { User } from '../../types/users';

// Nous utilisons un schéma réduit pour le formulaire, 
// car tous les champs ne sont pas modifiables dans le formulaire
const userFormSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  email: z.string().email('Email invalide'),
  role: z.enum(['Admin', 'Portfolio_Manager', 'Auditor', 'User']),
  phone: z.string().optional(),
  address: z.string().optional(),
  idType: z.enum(['passport', 'national_id', 'driver_license', 'other']).optional(),
  idNumber: z.string().optional(),
  language: z.enum(['fr', 'en']).optional(),
  isCompanyOwner: z.boolean().optional(),
  userType: z.enum(['sme', 'financial_institution']).optional(),
  financialInstitutionId: z.string().optional()
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  currentUserIsAdmin: boolean;
}

export function UserForm({ user, onSubmit, onCancel, currentUserIsAdmin }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user ? {
      ...user,
      // Ensure the form values match the expected types
      name: user.name || '',
      givenName: user.givenName || '',
      familyName: user.familyName || '',
      email: user.email,
      role: user.role || 'User',
      phone: user.phone || '',
      address: user.address || '',
      idType: user.idType,
      idNumber: user.idNumber || '',
      language: user.language || 'fr',
      isCompanyOwner: user.isCompanyOwner || false,
      userType: user.userType,
      financialInstitutionId: user.financialInstitutionId
    } : {
      role: 'User',
      language: 'fr',
      isCompanyOwner: false
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Prénom" error={errors.givenName?.message}>
          <Input {...register('givenName')} />
        </FormField>

        <FormField label="Nom" error={errors.familyName?.message}>
          <Input {...register('familyName')} />
        </FormField>
      </div>

      <FormField label="Email" error={errors.email?.message}>
        <Input type="email" {...register('email')} />
      </FormField>

      <FormField label="Téléphone" error={errors.phone?.message}>
        <Input {...register('phone')} />
      </FormField>

      <FormField label="Adresse" error={errors.address?.message}>
        <Input {...register('address')} />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Type de pièce d'identité" error={errors.idType?.message}>
          <Select {...register('idType')}>
            <option value="">Sélectionner...</option>
            <option value="passport">Passeport</option>
            <option value="national_id">Carte d'identité</option>
            <option value="driver_license">Permis de conduire</option>
            <option value="other">Autre</option>
          </Select>
        </FormField>

        <FormField label="Numéro de pièce d'identité" error={errors.idNumber?.message}>
          <Input {...register('idNumber')} />
        </FormField>
      </div>

      {currentUserIsAdmin && (
        <>
          <FormField label="Rôle" error={errors.role?.message}>
            <Select {...register('role')}>
              <option value="User">Utilisateur</option>
              <option value="Portfolio_Manager">Gestionnaire de Portefeuille</option>
              <option value="Auditor">Auditeur</option>
              <option value="Admin">Administrateur</option>
            </Select>
          </FormField>

          <FormField label="Type d'utilisateur" error={errors.userType?.message}>
            <Select {...register('userType')}>
              <option value="">Sélectionner...</option>
              <option value="financial_institution">Institution Financière</option>
              <option value="sme">PME</option>
            </Select>
          </FormField>

          <FormField label="Propriétaire de l'entreprise" error={errors.isCompanyOwner?.message}>
            <div className="flex items-center">
              <Checkbox {...register('isCompanyOwner')} />
              <span className="ml-2">L'utilisateur est propriétaire de l'entreprise</span>
            </div>
          </FormField>
        </>
      )}

      <FormField label="Langue" error={errors.language?.message}>
        <Select {...register('language')}>
          <option value="fr">Français</option>
          <option value="en">Anglais</option>
        </Select>
      </FormField>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {user ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}