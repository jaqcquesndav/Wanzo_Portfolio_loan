import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, Input, Select, TextArea } from '../ui/Form';

const companySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  sector: z.string().min(1, 'Sélectionnez un secteur'),
  size: z.enum(['micro', 'small', 'medium', 'large']),
  annual_revenue: z.number().min(0),
  employee_count: z.number().min(1),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  pitch_deck_url: z.string().url().optional()
});

type CompanyFormData = z.infer<typeof companySchema>;

interface NewCompanyModalProps {
  onClose: () => void;
  onSubmit: (data: CompanyFormData) => Promise<void>;
}

export function NewCompanyModal({ onClose, onSubmit }: NewCompanyModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema)
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Nouvelle entreprise
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="h-5 w-5" />}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Nom de l'entreprise" error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>

            <FormField label="Secteur d'activité" error={errors.sector?.message}>
              <Select {...register('sector')}>
                <option value="">Sélectionnez un secteur</option>
                <option value="tech">Technologies</option>
                <option value="health">Santé</option>
                <option value="education">Éducation</option>
                <option value="agriculture">Agriculture</option>
                <option value="energy">Énergie</option>
                <option value="transport">Transport</option>
                <option value="retail">Commerce</option>
                <option value="services">Services</option>
              </Select>
            </FormField>

            <FormField label="Taille" error={errors.size?.message}>
              <Select {...register('size')}>
                <option value="micro">Micro (1-9 employés)</option>
                <option value="small">Petite (10-49 employés)</option>
                <option value="medium">Moyenne (50-249 employés)</option>
                <option value="large">Grande (250+ employés)</option>
              </Select>
            </FormField>

            <FormField label="Nombre d'employés" error={errors.employee_count?.message}>
              <Input
                type="number"
                {...register('employee_count', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Chiffre d'affaires annuel" error={errors.annual_revenue?.message}>
              <Input
                type="number"
                {...register('annual_revenue', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Lien du pitch deck" error={errors.pitch_deck_url?.message}>
              <Input {...register('pitch_deck_url')} />
            </FormField>
          </div>

          <FormField label="Description" error={errors.description?.message}>
            <TextArea
              {...register('description')}
              rows={4}
              placeholder="Décrivez l'activité de l'entreprise..."
            />
          </FormField>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Créer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}