import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input, Select, TextArea } from '../ui/form';
import { Button } from '../ui/Button';
import type { Operation, OperationType } from '../../types/operations';

const operationSchema = z.object({
  type: z.enum(['credit', 'leasing', 'equity', 'grant'] as const),
  amount: z.number().positive('Le montant doit être positif'),
  duration: z.number().positive('La durée doit être positive'),
  interestRate: z.number().min(0).max(100).optional(),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  startDate: z.string()
});

type OperationFormData = z.infer<typeof operationSchema>;

interface OperationFormProps {
  operation?: Operation;
  onSubmit: (data: OperationFormData) => Promise<void>;
  onCancel: () => void;
}

export function OperationForm({ operation, onSubmit, onCancel }: OperationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues: operation
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Type d'opération" error={errors.type?.message}>
        <Select {...register('type')}>
          <option value="credit">Crédit</option>
          <option value="leasing">Leasing</option>
          <option value="equity">Capital</option>
          <option value="grant">Subvention</option>
        </Select>
      </FormField>

      <FormField label="Montant" error={errors.amount?.message}>
        <Input
          type="number"
          {...register('amount', { valueAsNumber: true })}
        />
      </FormField>

      <FormField label="Durée (mois)" error={errors.duration?.message}>
        <Input
          type="number"
          {...register('duration', { valueAsNumber: true })}
        />
      </FormField>

      <FormField label="Taux d'intérêt (%)" error={errors.interestRate?.message}>
        <Input
          type="number"
          step="0.01"
          {...register('interestRate', { valueAsNumber: true })}
        />
      </FormField>

      <FormField label="Date de début" error={errors.startDate?.message}>
        <Input
          type="date"
          {...register('startDate')}
        />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <TextArea
          {...register('description')}
          rows={4}
        />
      </FormField>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {operation ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}