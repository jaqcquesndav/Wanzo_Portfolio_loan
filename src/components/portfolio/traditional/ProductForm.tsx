import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input, Select, TextArea } from '../../ui/Form';
import { Button } from '../../ui/Button';

const productSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  type: z.enum(['credit_personnel', 'credit_immobilier', 'credit_auto', 'credit_professionnel', 'microcredit', 'credit_consommation']),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  minAmount: z.number().min(0),
  maxAmount: z.number().min(0),
  duration: z.object({
    min: z.number().min(1),
    max: z.number().min(1)
  }),
  interestRate: z.object({
    type: z.enum(['fixed', 'variable']),
    value: z.number().min(0),
    min: z.number().optional(),
    max: z.number().optional()
  }),
  requirements: z.array(z.string()),
  isPublic: z.boolean()
});

type ProductFormData = z.infer<typeof productSchema>;

export type { ProductFormData };

interface ProductFormProps {
  product?: ProductFormData;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
  });

  const interestRateType = watch('interestRate.type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Nom du produit" error={errors.name?.message}>
          <Input {...register('name')} />
        </FormField>

        <FormField label="Type de crédit" error={errors.type?.message}>
          <Select {...register('type')}>
            <option value="">Sélectionner un type de crédit</option>
            <option value="credit_personnel">Crédit Personnel</option>
            <option value="credit_immobilier">Crédit Immobilier</option>
            <option value="credit_auto">Crédit Automobile</option>
            <option value="credit_professionnel">Crédit Professionnel</option>
            <option value="microcredit">Microcrédit</option>
            <option value="credit_consommation">Crédit à la Consommation</option>
          </Select>
        </FormField>

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

        <FormField label="Type de taux" error={errors.interestRate?.type?.message}>
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
          <>
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
          </>
        )}
      </div>

      <FormField label="Description" error={errors.description?.message}>
        <TextArea
          {...register('description')}
          rows={4}
        />
      </FormField>

      <FormField label="Produit public">
        <input
          type="checkbox"
          {...register('isPublic')}
          className="rounded border-gray-300"
        />
      </FormField>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {product ? 'Mettre à jour' : 'CRéer'}
        </Button>
      </div>
    </form>
  );
}
