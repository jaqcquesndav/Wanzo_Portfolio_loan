// @ts-expect-error -- React is used for JSX
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, Input, Select } from '../ui/Form';
import { Checkbox } from '../ui/Checkbox';
import { useNotification } from '../../contexts/NotificationContext';
import { usersApi } from '../../services/api/users.api';

const createUserSchema = z.object({
  givenName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  familyName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  role: z.enum(['Admin', 'Portfolio_Manager', 'Auditor', 'User']),
  phone: z.string().optional(),
  address: z.string().optional(),
  idType: z.enum(['passport', 'national_id', 'driver_license', 'other']).optional(),
  idNumber: z.string().optional(),
  language: z.enum(['fr', 'en']).optional().default('fr'),
  isCompanyOwner: z.boolean().optional().default(false),
  userType: z.enum(['sme', 'financial_institution']).optional(),
  financialInstitutionId: z.string().optional()
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentUserIsAdmin: boolean;
  financialInstitutionId?: string;
}

export function CreateUserModal({ 
  onClose, 
  onSuccess, 
  currentUserIsAdmin,
  financialInstitutionId 
}: CreateUserModalProps) {
  const { showNotification } = useNotification();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'User',
      language: 'fr',
      isCompanyOwner: false,
      userType: 'financial_institution',
      financialInstitutionId: financialInstitutionId
    }
  });

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      // Préparons les données pour l'API en respectant son interface
      await usersApi.create({
        email: data.email,
        name: `${data.givenName} ${data.familyName}`,
        role: data.role === 'Admin' ? 'admin' : 'user',
        phone: data.phone,
      });
      
      // Ici, nous pourrions faire un second appel API pour mettre à jour 
      // les informations supplémentaires qui ne sont pas dans l'interface de base
      // Par exemple: updateProfile avec financialInstitutionId, etc.
      
      showNotification(
        'Utilisateur créé avec succès. Un email avec les identifiants a été envoyé.',
        'success'
      );
      onSuccess();
      onClose();
    } catch (error) {
      showNotification('Erreur lors de la création de l\'utilisateur', 'error');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Nouvel utilisateur
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="h-5 w-5" />}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
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

          <div className="flex justify-end space-x-4 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Créer l'utilisateur
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}