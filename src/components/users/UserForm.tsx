import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input, Select } from '../ui/Form';
import { Button } from '../ui/Button';
import type { User } from '../../types/users';

const userSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  role: z.enum(['admin', 'manager', 'user'] as const),
  phone: z.string().optional()
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Nom" error={errors.name?.message}>
        <Input {...register('name')} />
      </FormField>

      <FormField label="Email" error={errors.email?.message}>
        <Input type="email" {...register('email')} />
      </FormField>

      <FormField label="Rôle" error={errors.role?.message}>
        <Select {...register('role')}>
          <option value="user">Utilisateur</option>
          <option value="manager">Manager</option>
          <option value="admin">Administrateur</option>
        </Select>
      </FormField>

      <FormField label="Téléphone" error={errors.phone?.message}>
        <Input {...register('phone')} />
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