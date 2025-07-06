import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, Input, Select } from '../ui/Form';
import { useNotification } from '../../contexts/NotificationContext';
import { usersApi } from '../../services/api/users.api';

const createUserSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  role: z.enum(['admin', 'user']),
  phone: z.string().optional()
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
  const { showNotification } = useNotification();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema)
  });

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await usersApi.create(data);
      showNotification(
        'Utilisateur créé avec succès. Un email avec les identifiants a été envoyé.',
        'success'
      );
      onSuccess();
      onClose();
    } catch (error) {
      showNotification('Erreur lors de la création de l\'utilisateur', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
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
          <FormField label="Nom complet" error={errors.name?.message}>
            <Input {...register('name')} />
          </FormField>

          <FormField label="Email" error={errors.email?.message}>
            <Input type="email" {...register('email')} />
          </FormField>

          <FormField label="Rôle" error={errors.role?.message}>
            <Select {...register('role')}>
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </Select>
          </FormField>

          <FormField label="Téléphone" error={errors.phone?.message}>
            <Input {...register('phone')} />
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