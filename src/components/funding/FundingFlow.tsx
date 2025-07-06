import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input, Select, TextArea } from '../ui/Form';
import { Button } from '../ui/Button';

const fundingSchema = z.object({
  type: z.enum(['credit', 'leasing', 'equity', 'grant']),
  amount: z.number().positive(),
  duration: z.number().positive(),
  description: z.string().min(10),
  businessPlan: z.string().min(50),
  financialProjections: z.string().min(50)
});

type FundingFormData = z.infer<typeof fundingSchema>;

export default function FundingFlow() {
  const { register, handleSubmit, formState: { errors } } = useForm<FundingFormData>({
    resolver: zodResolver(fundingSchema)
  });

  const onSubmit = async (data: FundingFormData) => {
    // Implémentation de la soumission
    console.log(data);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Nouvelle demande de financement</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField label="Type de financement" error={errors.type?.message}>
          <Select {...register('type')}>
            <option value="credit">Crédit bancaire</option>
            <option value="leasing">Leasing</option>
            <option value="equity">Capital-investissement</option>
            <option value="grant">Subvention</option>
          </Select>
        </FormField>

        <FormField label="Montant demandé" error={errors.amount?.message}>
          <Input
            type="number"
            {...register('amount', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Durée (en mois)" error={errors.duration?.message}>
          <Input
            type="number"
            {...register('duration', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Description du projet" error={errors.description?.message}>
          <TextArea
            {...register('description')}
            rows={4}
          />
        </FormField>

        <FormField label="Business Plan" error={errors.businessPlan?.message}>
          <TextArea
            {...register('businessPlan')}
            rows={6}
          />
        </FormField>

        <FormField label="Projections financières" error={errors.financialProjections?.message}>
          <TextArea
            {...register('financialProjections')}
            rows={6}
          />
        </FormField>

        <Button type="submit" className="w-full">
          Soumettre la demande
        </Button>
      </form>
    </div>
  );
}