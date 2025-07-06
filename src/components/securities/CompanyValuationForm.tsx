import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input, Select, TextArea } from '../ui/Form';
import { Button } from '../ui/Button';

const valuationSchema = z.object({
  method: z.enum(['DCF', 'Multiple', 'Asset']),
  revenueMultiple: z.number().optional(),
  ebitdaMultiple: z.number().optional(),
  discountRate: z.number().min(0).max(100).optional(),
  terminalGrowthRate: z.number().min(-100).max(100).optional(),
  details: z.string().min(20, 'Les détails doivent contenir au moins 20 caractères')
});

type ValuationFormData = z.infer<typeof valuationSchema>;

interface CompanyValuationFormProps {
  onSubmit: (data: ValuationFormData) => Promise<void>;
  onCancel: () => void;
}

export function CompanyValuationForm({ onSubmit, onCancel }: CompanyValuationFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ValuationFormData>({
    resolver: zodResolver(valuationSchema)
  });

  const selectedMethod = watch('method');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Méthode d'évaluation" error={errors.method?.message}>
        <Select {...register('method')}>
          <option value="DCF">Flux de trésorerie actualisés (DCF)</option>
          <option value="Multiple">Multiples de marché</option>
          <option value="Asset">Actif net réévalué</option>
        </Select>
      </FormField>

      {selectedMethod === 'Multiple' && (
        <>
          <FormField label="Multiple du chiffre d'affaires" error={errors.revenueMultiple?.message}>
            <Input
              type="number"
              step="0.1"
              {...register('revenueMultiple', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Multiple de l'EBITDA" error={errors.ebitdaMultiple?.message}>
            <Input
              type="number"
              step="0.1"
              {...register('ebitdaMultiple', { valueAsNumber: true })}
            />
          </FormField>
        </>
      )}

      {selectedMethod === 'DCF' && (
        <>
          <FormField label="Taux d'actualisation (%)" error={errors.discountRate?.message}>
            <Input
              type="number"
              step="0.1"
              {...register('discountRate', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Taux de croissance terminal (%)" error={errors.terminalGrowthRate?.message}>
            <Input
              type="number"
              step="0.1"
              {...register('terminalGrowthRate', { valueAsNumber: true })}
            />
          </FormField>
        </>
      )}

      <FormField label="Détails de l'évaluation" error={errors.details?.message}>
        <TextArea
          {...register('details')}
          rows={4}
          placeholder="Expliquez les hypothèses et la méthodologie utilisées..."
        />
      </FormField>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Calculer la valorisation
        </Button>
      </div>
    </form>
  );
}