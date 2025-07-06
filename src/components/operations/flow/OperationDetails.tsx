import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input, Select, TextArea } from '../../ui/Form';
import { Button } from '../../ui/Button';
import type { Operation } from '../../../types/operations';

const detailsSchema = z.object({
  amount: z.number().min(1, 'Le montant est requis'),
  duration: z.number().min(1, 'La durée est requise'),
  purpose: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  sector: z.string().min(1, 'Le secteur est requis')
});

interface OperationDetailsProps {
  operation: Operation;
  onValidate: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function OperationDetails({ 
  operation, 
  onValidate,
  isLoading 
}: OperationDetailsProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      amount: operation.amount,
      duration: operation.duration,
      purpose: operation.description,
      sector: ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onValidate)} className="space-y-6">
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

      <FormField label="Secteur d'activité" error={errors.sector?.message}>
        <Select {...register('sector')}>
          <option value="">Sélectionner un secteur</option>
          <option value="agriculture">Agriculture</option>
          <option value="industry">Industrie</option>
          <option value="services">Services</option>
        </Select>
      </FormField>

      <FormField label="Objet du financement" error={errors.purpose?.message}>
        <TextArea
          {...register('purpose')}
          rows={4}
        />
      </FormField>

      <div className="flex justify-end">
        <Button type="submit" loading={isLoading}>
          Continuer
        </Button>
      </div>
    </form>
  );
}