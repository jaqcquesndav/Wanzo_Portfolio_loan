import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, Input, Select, TextArea } from '../ui/Form';
import type { Institution } from '../../types/institution';

const baseSchema = {
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  type: z.enum(['bank', 'microfinance', 'investment_fund', 'cooperative']),
  address: z.string().min(5, 'L\'adresse est requise'),
  phone: z.string().min(8, 'Le numéro de téléphone est requis'),
  email: z.string().email('Email invalide'),
  website: z.string().url().optional(),
  legal_representative: z.string().min(2, 'Le représentant légal est requis'),
  tax_id: z.string().min(2, 'L\'identifiant fiscal est requis')
};

const bankSchema = z.object({
  ...baseSchema,
  type: z.literal('bank'),
  license_number: z.string().min(3, 'Numéro d\'agrément requis'),
  license_type: z.string().min(3, 'Type d\'agrément requis'),
  swift_code: z.string().min(8, 'Code SWIFT requis'),
  clearing_code: z.string().min(3, 'Code de compensation requis')
});

const microfinanceSchema = z.object({
  ...baseSchema,
  type: z.literal('microfinance'),
  license_number: z.string().min(3, 'Numéro d\'agrément requis'),
  license_type: z.string().min(3, 'Type d\'agrément requis'),
  mfi_category: z.enum(['1', '2', '3']),
  operation_zones: z.array(z.string()).min(1, 'Au moins une zone d\'opération')
});

const investmentFundSchema = z.object({
  ...baseSchema,
  type: z.literal('investment_fund'),
  registration_number: z.string().min(3, 'Numéro d\'enregistrement requis'),
  fund_type: z.enum(['private_equity', 'venture_capital', 'sovereign', 'angel_network']),
  aum: z.number().min(0, 'AUM doit être positif'),
  investment_strategy: z.string().min(10, 'Stratégie d\'investissement requise')
});

const cooperativeSchema = z.object({
  ...baseSchema,
  type: z.literal('cooperative'),
  license_number: z.string().min(3, 'Numéro d\'agrément requis'),
  license_type: z.string().min(3, 'Type d\'agrément requis'),
  cooperative_type: z.string().min(2, 'Type de coopérative requis'),
  member_count: z.number().min(0, 'Nombre de membres invalide')
});

const institutionSchema = z.discriminatedUnion('type', [
  bankSchema,
  microfinanceSchema,
  investmentFundSchema,
  cooperativeSchema
]);

type InstitutionFormData = z.infer<typeof institutionSchema>;

interface InstitutionFormProps {
  institution?: Institution;
  onSubmit: (data: InstitutionFormData) => Promise<void>;
  onClose: () => void;
}

export function InstitutionForm({ institution, onSubmit, onClose }: InstitutionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: institution
  });

  const institutionType = watch('type');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {institution ? 'Modifier l\'institution' : 'Configurer l\'institution'}
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
            <FormField label="Nom de l'institution" error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>

            <FormField label="Type d'institution" error={errors.type?.message}>
              <Select {...register('type')}>
                <option value="bank">Banque</option>
                <option value="microfinance">Institution de Microfinance</option>
                <option value="investment_fund">Fonds d'Investissement</option>
                <option value="cooperative">Coopérative d'Épargne et de Crédit</option>
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

            <FormField label="Représentant légal" error={errors.legal_representative?.message}>
              <Input {...register('legal_representative')} />
            </FormField>

            <FormField label="Identifiant fiscal" error={errors.tax_id?.message}>
              <Input {...register('tax_id')} />
            </FormField>

            {/* Champs spécifiques selon le type d'institution */}
            {institutionType === 'bank' && (
              <>
                <FormField label="Numéro d'agrément" error={errors.license_number?.message}>
                  <Input {...register('license_number')} />
                </FormField>

                <FormField label="Type d'agrément" error={errors.license_type?.message}>
                  <Input {...register('license_type')} />
                </FormField>

                <FormField label="Code SWIFT" error={errors.swift_code?.message}>
                  <Input {...register('swift_code')} />
                </FormField>

                <FormField label="Code de compensation" error={errors.clearing_code?.message}>
                  <Input {...register('clearing_code')} />
                </FormField>
              </>
            )}

            {institutionType === 'microfinance' && (
              <>
                <FormField label="Numéro d'agrément" error={errors.license_number?.message}>
                  <Input {...register('license_number')} />
                </FormField>

                <FormField label="Type d'agrément" error={errors.license_type?.message}>
                  <Input {...register('license_type')} />
                </FormField>

                <FormField label="Catégorie IMF" error={errors.mfi_category?.message}>
                  <Select {...register('mfi_category')}>
                    <option value="1">Catégorie 1</option>
                    <option value="2">Catégorie 2</option>
                    <option value="3">Catégorie 3</option>
                  </Select>
                </FormField>
              </>
            )}

            {institutionType === 'investment_fund' && (
              <>
                <FormField label="Numéro d'enregistrement" error={errors.registration_number?.message}>
                  <Input {...register('registration_number')} />
                </FormField>

                <FormField label="Type de fonds" error={errors.fund_type?.message}>
                  <Select {...register('fund_type')}>
                    <option value="private_equity">Private Equity</option>
                    <option value="venture_capital">Venture Capital</option>
                    <option value="sovereign">Fonds Souverain</option>
                    <option value="angel_network">Réseau de Business Angels</option>
                  </Select>
                </FormField>

                <FormField label="Actifs sous gestion (AUM)" error={errors.aum?.message}>
                  <Input
                    type="number"
                    {...register('aum', { valueAsNumber: true })}
                  />
                </FormField>

                <FormField label="Stratégie d'investissement" error={errors.investment_strategy?.message}>
                  <TextArea
                    {...register('investment_strategy')}
                    rows={3}
                  />
                </FormField>
              </>
            )}

            {institutionType === 'cooperative' && (
              <>
                <FormField label="Numéro d'agrément" error={errors.license_number?.message}>
                  <Input {...register('license_number')} />
                </FormField>

                <FormField label="Type d'agrément" error={errors.license_type?.message}>
                  <Input {...register('license_type')} />
                </FormField>

                <FormField label="Type de coopérative" error={errors.cooperative_type?.message}>
                  <Input {...register('cooperative_type')} />
                </FormField>

                <FormField label="Nombre de membres" error={errors.member_count?.message}>
                  <Input
                    type="number"
                    {...register('member_count', { valueAsNumber: true })}
                  />
                </FormField>
              </>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Documents requis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Agrément / Licence</p>
                  <input type="file" className="hidden" accept=".pdf" />
                  <Button variant="outline" size="sm" className="mt-2">
                    Choisir un fichier
                  </Button>
                </div>
              </div>

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
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {institution ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}