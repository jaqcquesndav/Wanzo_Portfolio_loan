import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input, Select, TextArea } from '../ui/Form';
import { Button } from '../ui/Button';
import type { SecurityType } from '../../types/securities';

const securityOfferSchema = z.object({
  type: z.enum(['bond', 'share'] as const),
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  amount: z.number().positive('Le montant doit être positif'),
  unitPrice: z.number().positive('Le prix unitaire doit être positif'),
  quantity: z.number().int().positive('La quantité doit être un nombre entier positif'),
  maturityDate: z.string().optional(),
  interestRate: z.number().min(0).max(100).optional(),
  dividendYield: z.number().min(0).max(100).optional(),
  minInvestment: z.number().positive('L\'investissement minimum doit être positif')
});

type SecurityOfferFormData = z.infer<typeof securityOfferSchema>;

interface SecurityOfferFormProps {
  onSubmit: (data: SecurityOfferFormData) => Promise<void>;
  onCancel: () => void;
  type: SecurityType;
  companyValuation?: number;
}

export function SecurityOfferForm({ onSubmit, onCancel, type, companyValuation }: SecurityOfferFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SecurityOfferFormData>({
    resolver: zodResolver(securityOfferSchema),
    defaultValues: {
      type,
      unitPrice: type === 'share' && companyValuation ? companyValuation / 1000 : undefined
    }
  });

  const selectedType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Type de titre" error={errors.type?.message}>
        <Select {...register('type')} disabled>
          <option value="bond">Obligation</option>
          <option value="share">Action</option>
        </Select>
      </FormField>

      <FormField label="Titre de l'offre" error={errors.title?.message}>
        <Input {...register('title')} />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <TextArea {...register('description')} rows={4} />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Montant total" error={errors.amount?.message}>
          <Input
            type="number"
            {...register('amount', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Prix unitaire" error={errors.unitPrice?.message}>
          <Input
            type="number"
            {...register('unitPrice', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Quantité" error={errors.quantity?.message}>
          <Input
            type="number"
            {...register('quantity', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Investissement minimum" error={errors.minInvestment?.message}>
          <Input
            type="number"
            {...register('minInvestment', { valueAsNumber: true })}
          />
        </FormField>

        {selectedType === 'bond' && (
          <>
            <FormField label="Date d'échéance" error={errors.maturityDate?.message}>
              <Input
                type="date"
                {...register('maturityDate')}
              />
            </FormField>

            <FormField label="Taux d'intérêt (%)" error={errors.interestRate?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('interestRate', { valueAsNumber: true })}
              />
            </FormField>
          </>
        )}

        {selectedType === 'share' && (
          <FormField label="Rendement des dividendes (%)" error={errors.dividendYield?.message}>
            <Input
              type="number"
              step="0.01"
              {...register('dividendYield', { valueAsNumber: true })}
            />
          </FormField>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Créer l'offre
        </Button>
      </div>
    </form>
  );
}