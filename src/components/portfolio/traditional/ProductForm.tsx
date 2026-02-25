// src/components/portfolio/traditional/ProductForm.tsx
// Formulaire de création / modification d'un produit financier
// -- champs alignés sur l'API backend /portfolios/traditional/products --

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { FormField, Input, Select, TextArea } from '../../ui/Form';
import { Button } from '../../ui/Button';
import { PRODUCT_TYPE_LABELS } from '../../../types/traditional-portfolio';
import type { FinancialProduct } from '../../../types/traditional-portfolio';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';

// ─── Zod schema ──────────────────────────────────────────────────────────────

const feeSchema = z.object({
  type:          z.string().min(1, 'Type requis'),
  amount:        z.number({ invalid_type_error: 'Montant requis' }).min(0),
  is_percentage: z.boolean(),
});

const criterionSchema = z.object({
  criterion:   z.string().min(1, 'Critère requis'),
  description: z.string().min(1, 'Description requise'),
});

const productSchema = z.object({
  name:                        z.string().min(3, 'Au moins 3 caractères'),
  type:                        z.enum([
    'business_loan',
    'equipment_loan',
    'working_capital',
    'expansion_loan',
    'line_of_credit',
    'microcredit',
  ]),
  description:                 z.string().optional(),
  base_interest_rate:          z.number({ invalid_type_error: 'Taux requis' }).min(0).max(100),
  interest_type:               z.enum(['fixed', 'variable']),
  interest_calculation_method: z.enum(['declining_balance', 'flat', 'annuity']),
  min_amount:                  z.number({ invalid_type_error: 'Requis' }).min(0),
  max_amount:                  z.number({ invalid_type_error: 'Requis' }).min(0),
  min_term:                    z.number({ invalid_type_error: 'Requis' }).min(1),
  max_term:                    z.number({ invalid_type_error: 'Requis' }).min(1),
  term_unit:                   z.enum(['days', 'months', 'years']),
  required_documents:          z.array(z.object({ value: z.string().min(1) })),
  fees:                        z.array(feeSchema),
  eligibility_criteria:        z.array(criterionSchema),
}).refine((d) => d.max_amount >= d.min_amount, {
  message: 'Le montant max doit être ≥ montant min',
  path: ['max_amount'],
}).refine((d) => d.max_term >= d.min_term, {
  message: 'La durée max doit être ≥ durée min',
  path: ['max_term'],
});

export type ProductFormData = z.infer<typeof productSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductFormProps {
  /** Produit à éditer (absent = mode création) */
  product?: FinancialProduct;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDefaults(product?: FinancialProduct): Partial<ProductFormData> {
  if (!product) {
    return {
      interest_type:               'fixed',
      interest_calculation_method: 'declining_balance',
      term_unit:                   'months',
      required_documents:          [],
      fees:                        [],
      eligibility_criteria:        [],
    };
  }
  return {
    name:                        product.name,
    type:                        product.type,
    description:                 product.description ?? '',
    base_interest_rate:          typeof product.base_interest_rate === 'string'
                                   ? parseFloat(product.base_interest_rate) || 0
                                   : product.base_interest_rate,
    interest_type:               product.interest_type,
    interest_calculation_method: (product.interest_calculation_method as ProductFormData['interest_calculation_method']) ?? 'declining_balance',
    min_amount:                  typeof product.min_amount === 'string'
                                   ? parseFloat(product.min_amount) || 0
                                   : product.min_amount,
    max_amount:                  typeof product.max_amount === 'string'
                                   ? parseFloat(product.max_amount) || 0
                                   : product.max_amount,
    min_term:                    product.min_term,
    max_term:                    product.max_term,
    term_unit:                   product.term_unit,
    required_documents:          (product.required_documents ?? []).map((v) => ({ value: v })),
    fees:                        product.fees ?? [],
    eligibility_criteria:        product.eligibility_criteria ?? [],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const { currency: ctxCurrency } = useCurrencyContext();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: buildDefaults(product),
  });

  const { fields: docFields, append: appendDoc, remove: removeDoc }
    = useFieldArray({ control, name: 'required_documents' });

  const { fields: feeFields, append: appendFee, remove: removeFee }
    = useFieldArray({ control, name: 'fees' });

  const { fields: criterionFields, append: appendCriterion, remove: removeCriterion }
    = useFieldArray({ control, name: 'eligibility_criteria' });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto pr-1"
    >
      {/* ── 1. Informations générales ── */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Informations générales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nom du produit *" error={errors.name?.message}>
            <Input {...register('name')} placeholder="Ex : Prêt PME Standard" />
          </FormField>

          <FormField label="Type de produit *" error={errors.type?.message}>
            <Select {...register('type')}>
              <option value="">-- Sélectionner --</option>
              {(Object.entries(PRODUCT_TYPE_LABELS) as [ProductFormData['type'], string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Description" error={errors.description?.message}>
          <TextArea
            {...register('description')}
            rows={3}
            placeholder="Description du produit financier…"
          />
        </FormField>
      </section>

      {/* ── 2. Taux d'intérêt ── */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Taux d&apos;intérêt
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Taux de base (%) *" error={errors.base_interest_rate?.message}>
            <Input
              type="number" step="0.01" min="0" max="100"
              {...register('base_interest_rate', { valueAsNumber: true })}
              placeholder="18.5"
            />
          </FormField>

          <FormField label="Type de taux *" error={errors.interest_type?.message}>
            <Select {...register('interest_type')}>
              <option value="fixed">Fixe</option>
              <option value="variable">Variable</option>
            </Select>
          </FormField>

          <FormField label="Méthode de calcul *" error={errors.interest_calculation_method?.message}>
            <Select {...register('interest_calculation_method')}>
              <option value="declining_balance">Solde dégressif</option>
              <option value="flat">Taux fixe (flat)</option>
              <option value="annuity">Annuités constantes</option>
            </Select>
          </FormField>
        </div>
      </section>

      {/* ── 3. Montants & durées ── */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Montants &amp; durées
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label={`Montant minimum (${ctxCurrency}) *`} error={errors.min_amount?.message}>
            <Input
              type="number" step="1000" min="0"
              {...register('min_amount', { valueAsNumber: true })}
              placeholder="500000"
            />
          </FormField>

          <FormField label={`Montant maximum (${ctxCurrency}) *`} error={errors.max_amount?.message}>
            <Input
              type="number" step="1000" min="0"
              {...register('max_amount', { valueAsNumber: true })}
              placeholder="50000000"
            />
          </FormField>

          <FormField label="Durée minimum *" error={errors.min_term?.message}>
            <Input
              type="number" min="1"
              {...register('min_term', { valueAsNumber: true })}
              placeholder="3"
            />
          </FormField>

          <FormField label="Durée maximum *" error={errors.max_term?.message}>
            <Input
              type="number" min="1"
              {...register('max_term', { valueAsNumber: true })}
              placeholder="36"
            />
          </FormField>
        </div>

        <FormField label="Unité de durée *" error={errors.term_unit?.message} className="max-w-xs mt-4">
          <Select {...register('term_unit')}>
            <option value="days">Jours</option>
            <option value="months">Mois</option>
            <option value="years">Années</option>
          </Select>
        </FormField>
      </section>

      {/* ── 4. Documents requis ── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Documents requis
          </h3>
          <button
            type="button"
            onClick={() => appendDoc({ value: '' })}
            className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus className="h-3 w-3" /> Ajouter
          </button>
        </div>
        {docFields.length === 0 && (
          <p className="text-xs text-gray-400 italic">Aucun document requis défini</p>
        )}
        <div className="space-y-2">
          {docFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                {...register(`required_documents.${index}.value`)}
                placeholder="Ex : piece_identite"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeDoc(index)}
                className="text-red-500 hover:text-red-700 flex-shrink-0"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Frais ── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Frais
          </h3>
          <button
            type="button"
            onClick={() => appendFee({ type: '', amount: 0, is_percentage: true })}
            className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus className="h-3 w-3" /> Ajouter
          </button>
        </div>
        {feeFields.length === 0 && (
          <p className="text-xs text-gray-400 italic">Aucun frais défini</p>
        )}
        <div className="space-y-3">
          {feeFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto_auto] gap-2 items-end">
              <FormField label={index === 0 ? 'Type de frais' : ''} error={errors.fees?.[index]?.type?.message}>
                <Input
                  {...register(`fees.${index}.type`)}
                  placeholder="dossier / assurance"
                />
              </FormField>
              <FormField label={index === 0 ? 'Montant' : ''} error={errors.fees?.[index]?.amount?.message}>
                <Input
                  type="number" step="0.01" min="0"
                  {...register(`fees.${index}.amount`, { valueAsNumber: true })}
                  placeholder="2.5"
                />
              </FormField>
              <div className={index === 0 ? 'mt-5' : ''}>
                <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" {...register(`fees.${index}.is_percentage`)} className="rounded" />
                  %
                </label>
              </div>
              <div className={index === 0 ? 'mt-5' : ''}>
                <button type="button" onClick={() => removeFee(index)}
                  className="text-red-500 hover:text-red-700" aria-label="Supprimer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Critères d'éligibilité ── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Critères d&apos;éligibilité
          </h3>
          <button
            type="button"
            onClick={() => appendCriterion({ criterion: '', description: '' })}
            className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus className="h-3 w-3" /> Ajouter
          </button>
        </div>
        {criterionFields.length === 0 && (
          <p className="text-xs text-gray-400 italic">Aucun critère défini</p>
        )}
        <div className="space-y-3">
          {criterionFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-end">
              <FormField label={index === 0 ? 'Critère' : ''} error={errors.eligibility_criteria?.[index]?.criterion?.message}>
                <Input
                  {...register(`eligibility_criteria.${index}.criterion`)}
                  placeholder="anciennete"
                />
              </FormField>
              <FormField label={index === 0 ? 'Description' : ''} error={errors.eligibility_criteria?.[index]?.description?.message}>
                <Input
                  {...register(`eligibility_criteria.${index}.description`)}
                  placeholder="Au moins 2 ans d'activité"
                />
              </FormField>
              <div className={index === 0 ? 'mt-5' : ''}>
                <button type="button" onClick={() => removeCriterion(index)}
                  className="text-red-500 hover:text-red-700" aria-label="Supprimer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {product ? 'Mettre à jour' : 'Créer le produit'}
        </Button>
      </div>
    </form>
  );
}
