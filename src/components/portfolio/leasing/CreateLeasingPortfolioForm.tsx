import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input, Select, TextArea } from '../../ui/Form';
import { Button } from '../../ui/Button';

const leasingPortfolioSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  target_amount: z.number().min(1000000, 'Le montant minimum est de 1,000,000'),
  target_return: z.number().min(0).max(100),
  risk_profile: z.enum(['conservative', 'moderate', 'aggressive']),
  target_sectors: z.array(z.string()).min(1, 'Sélectionnez au moins un secteur'),
  leasing_terms: z.object({
    min_duration: z.number().min(1),
    max_duration: z.number().min(1),
    interest_rate_min: z.number().min(0),
    interest_rate_max: z.number().min(0),
    maintenance_included: z.boolean(),
    insurance_required: z.boolean()
  })
});

export type LeasingPortfolioFormData = z.infer<typeof leasingPortfolioSchema>;

const SECTORS = [
  'Industrie',
  'BTP',
  'Transport',
  'Logistique',
  'Agriculture',
  'Santé'
];

interface CreateLeasingPortfolioFormProps {
  onSubmit: (data: LeasingPortfolioFormData) => Promise<void>;
  onCancel: () => void;
}

export function CreateLeasingPortfolioForm({ onSubmit, onCancel }: CreateLeasingPortfolioFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<LeasingPortfolioFormData>({
    resolver: zodResolver(leasingPortfolioSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Nom du portefeuille" error={errors.name?.message}>
        <Input {...register('name')} />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <TextArea {...register('description')} rows={4} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Montant cible" error={errors.target_amount?.message}>
          <Input
            type="number"
            {...register('target_amount', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Rendement cible (%)" error={errors.target_return?.message}>
          <Input
            type="number"
            {...register('target_return', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField label="Profil de risque" error={errors.risk_profile?.message}>
        <Select {...register('risk_profile')}>
          <option value="conservative">Conservateur</option>
          <option value="moderate">Modéré</option>
          <option value="aggressive">Agressif</option>
        </Select>
      </FormField>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Conditions de leasing</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Durée minimum (mois)" error={errors.leasing_terms?.min_duration?.message}>
            <Input
              type="number"
              {...register('leasing_terms.min_duration', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Durée maximum (mois)" error={errors.leasing_terms?.max_duration?.message}>
            <Input
              type="number"
              {...register('leasing_terms.max_duration', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Taux d'intérêt min (%)" error={errors.leasing_terms?.interest_rate_min?.message}>
            <Input
              type="number"
              step="0.1"
              {...register('leasing_terms.interest_rate_min', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Taux d'intérêt max (%)" error={errors.leasing_terms?.interest_rate_max?.message}>
            <Input
              type="number"
              step="0.1"
              {...register('leasing_terms.interest_rate_max', { valueAsNumber: true })}
            />
          </FormField>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('leasing_terms.maintenance_included')}
              className="rounded border-gray-300"
            />
            <span>Maintenance incluse par défaut</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('leasing_terms.insurance_required')}
              className="rounded border-gray-300"
            />
            <span>Assurance obligatoire</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Secteurs cibles</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SECTORS.map(sector => (
            <label key={sector} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={sector}
                {...register('target_sectors')}
                className="rounded border-gray-300"
              />
              <span>{sector}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          Créer le portefeuille
        </Button>
      </div>
    </form>
  );
}
