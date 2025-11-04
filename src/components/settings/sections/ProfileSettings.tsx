import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input } from '../../ui/Form';
import { Button } from '../../ui/Button';
import { useNotification } from '../../../contexts/useNotification';

const profileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  company: z.string().optional()
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const { showNotification } = useNotification();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  });

  const onSubmit = async () => {
    try {
      // API call would go here
      showNotification('Profil mis à jour avec succès', 'success');
    } catch {
      showNotification('Erreur lors de la mise à jour du profil', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Nom complet" error={errors.name?.message}>
        <Input {...register('name')} />
      </FormField>

      <FormField label="Email" error={errors.email?.message}>
        <Input type="email" {...register('email')} />
      </FormField>

      <FormField label="Téléphone" error={errors.phone?.message}>
        <Input {...register('phone')} />
      </FormField>

      <FormField label="Entreprise" error={errors.company?.message}>
        <Input {...register('company')} />
      </FormField>

      <Button type="submit" loading={isSubmitting}>
        Enregistrer les modifications
      </Button>
    </form>
  );
}