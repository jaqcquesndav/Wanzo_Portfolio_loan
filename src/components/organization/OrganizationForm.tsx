import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, Input, Select, TextArea } from '../ui/Form';

const organizationSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  legalForm: z.enum(['sa', 'sarl', 'sas', 'other']),
  address: z.string().min(5, 'L\'adresse est requise'),
  phone: z.string().min(8, 'Le numéro de téléphone est requis'),
  email: z.string().email('Email invalide'),
  website: z.string().url().optional(),
  capital: z.number().min(0, 'Le capital doit être positif'),
  employeeCount: z.number().min(1, 'Le nombre d\'employés doit être positif'),
  subsidiaryCount: z.number().min(0, 'Le nombre de filiales doit être positif ou nul'),
  boardMembers: z.number().min(0, 'Le nombre de membres du CA doit être positif ou nul'),
  executiveCommitteeMembers: z.number().min(0, 'Le nombre de membres du comité de direction doit être positif ou nul'),
  specializedCommittees: z.number().min(0, 'Le nombre de comités spécialisés doit être positif ou nul')
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationFormProps {
  organization?: any;
  onSubmit: (data: OrganizationFormData) => Promise<void>;
  onClose: () => void;
}

export function OrganizationForm({ organization, onSubmit, onClose }: OrganizationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: organization || {
      legalForm: 'sa',
      capital: 0,
      employeeCount: 0,
      subsidiaryCount: 0,
      boardMembers: 0,
      executiveCommitteeMembers: 0,
      specializedCommittees: 0
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {organization ? 'Modifier l\'organisation' : 'Configurer l\'organisation'}
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
            <FormField label="Nom de l'organisation" error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>

            <FormField label="Forme juridique" error={errors.legalForm?.message}>
              <Select {...register('legalForm')}>
                <option value="sa">Société Anonyme (SA)</option>
                <option value="sarl">SARL</option>
                <option value="sas">SAS</option>
                <option value="other">Autre</option>
              </Select>
            </FormField>

            <FormField label="Adresse" error={errors.address?.message}>
              <Input {...register('address')} />
            </FormField>

            <FormField label="Téléphone" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormField>

            <FormField label="Email" error={errors.email?.message}>
              <Input type="email" {...register('email')} />
            </FormField>

            <FormField label="Site web" error={errors.website?.message}>
              <Input {...register('website')} />
            </FormField>

            <FormField label="Capital social" error={errors.capital?.message}>
              <Input
                type="number"
                {...register('capital', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Nombre d'employés" error={errors.employeeCount?.message}>
              <Input
                type="number"
                {...register('employeeCount', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Nombre de filiales" error={errors.subsidiaryCount?.message}>
              <Input
                type="number"
                {...register('subsidiaryCount', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Membres du CA" error={errors.boardMembers?.message}>
              <Input
                type="number"
                {...register('boardMembers', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Membres du comité de direction" error={errors.executiveCommitteeMembers?.message}>
              <Input
                type="number"
                {...register('executiveCommitteeMembers', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Comités spécialisés" error={errors.specializedCommittees?.message}>
              <Input
                type="number"
                {...register('specializedCommittees', { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Documents requis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Statuts</p>
                  <input type="file" className="hidden" accept=".pdf" />
                  <Button variant="outline" size="sm" className="mt-2">
                    Choisir un fichier
                  </Button>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">RCCM</p>
                  <input type="file" className="hidden" accept=".pdf" />
                  <Button variant="outline" size="sm" className="mt-2">
                    Choisir un fichier
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {organization ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}