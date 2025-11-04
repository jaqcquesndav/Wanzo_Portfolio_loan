import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input, Select, TextArea } from '../../ui/Form';
import { Button } from '../../ui/Button';
import { TagInput } from '../../ui/TagInput';
import { businessSectors, acceptedGuarantees } from '../../../constants/sectors';
import type { FinancialProduct } from '../../../types/traditional-portfolio';

const productSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  type: z.enum(['credit', 'savings', 'investment']),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  minAmount: z.number().min(0),
  maxAmount: z.number().min(0),
  duration: z.object({
    min: z.number().min(1),
    max: z.number().min(1)
  }),
  interestRate: z.object({
    type: z.enum(['fixed', 'variable']),
    value: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional()
  }).refine(data => {
    if (data.type === 'fixed') {
      return data.value !== undefined;
    } else {
      return data.min !== undefined && data.max !== undefined;
    }
  }, {
    message: "Les taux d'intérêt sont requis selon le type choisi"
  }),
  requirements: z.array(z.string()).min(1, 'Sélectionnez au moins un secteur'),
  acceptedGuarantees: z.array(z.string()).optional(),
  isPublic: z.boolean()
});

export type ProductFormData = z.infer<typeof productSchema>;

interface FinancialProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: FinancialProduct;
}

export function FinancialProductForm({ onSubmit, onCancel, initialData }: FinancialProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: '',
      type: 'credit',
      description: '',
      minAmount: 0,
      maxAmount: 0,
      duration: {
        min: 1,
        max: 12
      },
      interestRate: {
        type: 'fixed'
      },
      isPublic: false,
      requirements: [],
      acceptedGuarantees: []
    }
  });

  const interestRateType = watch('interestRate.type');

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      // Assurez-vous que les valeurs numériques sont correctement converties
      const formattedData = {
        ...data,
        minAmount: Number(data.minAmount),
        maxAmount: Number(data.maxAmount),
        duration: {
          min: Number(data.duration.min),
          max: Number(data.duration.max)
        },
        interestRate: {
          type: data.interestRate.type,
          ...(data.interestRate.type === 'fixed' 
            ? { value: Number(data.interestRate.value) }
            : { 
                min: Number(data.interestRate.min), 
                max: Number(data.interestRate.max)
              }
          )
        }
      };
      
      await onSubmit(formattedData);
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormField label="Nom du produit" error={errors.name?.message}>
        <Input {...register('name')} />
      </FormField>

      <FormField label="Type de produit" error={errors.type?.message}>
        <Select {...register('type')}>
          <option value="credit">cRédit</option>
          <option value="savings">épargne</option>
          <option value="investment">Investissement</option>
        </Select>
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <TextArea {...register('description')} rows={4} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Montant minimum" error={errors.minAmount?.message}>
          <Input
            type="number"
            {...register('minAmount', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Montant maximum" error={errors.maxAmount?.message}>
          <Input
            type="number"
            {...register('maxAmount', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Durée minimum (mois)" error={errors.duration?.min?.message}>
          <Input
            type="number"
            {...register('duration.min', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Durée maximum (mois)" error={errors.duration?.max?.message}>
          <Input
            type="number"
            {...register('duration.max', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField label="Type de taux" error={errors.interestRate?.message}>
        <Select {...register('interestRate.type')}>
          <option value="fixed">Fixe</option>
          <option value="variable">Variable</option>
        </Select>
      </FormField>

      {interestRateType === 'fixed' ? (
        <FormField label="Taux d'intérêt (%)" error={errors.interestRate?.value?.message}>
          <Input
            type="number"
            step="0.01"
            {...register('interestRate.value', { valueAsNumber: true })}
          />
        </FormField>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Taux minimum (%)" error={errors.interestRate?.min?.message}>
            <Input
              type="number"
              step="0.01"
              {...register('interestRate.min', { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Taux maximum (%)" error={errors.interestRate?.max?.message}>
            <Input
              type="number"
              step="0.01"
              {...register('interestRate.max', { valueAsNumber: true })}
            />
          </FormField>
        </div>
      )}

      <FormField label="Secteurs cibles" error={errors.requirements?.message}>
        <Controller
          name="requirements"
          control={control}
          render={({ field }) => (
            <TagInput
              tags={businessSectors}
              selectedTags={field.value || []}
              onChange={field.onChange}
              placeholder="Rechercher un secteur..."
              error={errors.requirements?.message}
            />
          )}
        />
      </FormField>
      
      <FormField label="Garanties acceptées" error={errors.acceptedGuarantees?.message}>
        <Controller
          name="acceptedGuarantees"
          control={control}
          render={({ field }) => (
            <TagInput
              tags={acceptedGuarantees}
              selectedTags={field.value || []}
              onChange={field.onChange}
              placeholder="Rechercher une garantie..."
              error={errors.acceptedGuarantees?.message}
            />
          )}
        />
      </FormField>

      <FormField label="Produit public">
        <input
          type="checkbox"
          {...register('isPublic')}
          className="rounded border-gray-300"
        />
      </FormField>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {initialData ? 'Mettre à jour' : 'CRéer le produit'}
        </Button>
      </div>
    </form>
  );
}
