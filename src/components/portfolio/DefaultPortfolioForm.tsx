// src/components/portfolio/DefaultPortfolioForm.tsx
/**
 * Formulaire de création de portefeuille - Étape 1: Informations de base
 * Conforme aux standards OHADA/RDC
 */
import { z } from 'zod';
import { FormField, Input, Select, TextArea } from '../ui/Form';
import { PORTFOLIO_CURRENCIES } from '../../utils/portfolioStatus';
import type { PortfolioCurrency } from '../../types/portfolio';
import { Lightbulb } from 'lucide-react';

// Schema Zod pour la validation - SANS montant minimum arbitraire
export const defaultPortfolioSchema = z.object({
  name: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
  
  // Devise - obligatoire
  currency: z.enum(['CDF', 'USD', 'EUR'] as const, {
    required_error: 'Sélectionnez une devise'
  }),
  
  // Capital initial - pas de minimum arbitraire (même 1000 USD suffit)
  initial_capital: z.number({
    required_error: 'Le capital initial est requis',
    invalid_type_error: 'Le capital doit être un nombre'
  }).min(1, 'Le capital initial doit être positif'),
  
  // Période de validité
  start_date: z.string()
    .min(1, 'La date de démarrage est requise'),
  end_date: z.string().optional().or(z.literal('')),
  is_permanent: z.boolean().default(false),
});

// Helper pour extraire le message d'erreur
function getErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message?: string }).message;
  }
  return undefined;
}

export type DefaultPortfolioFormData = z.infer<typeof defaultPortfolioSchema>;

import { useFormContext, Controller } from 'react-hook-form';
import { useState } from 'react';

export function DefaultPortfolioForm() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<DefaultPortfolioFormData>();

  const isPermanent = watch('is_permanent');
  const selectedCurrency = watch('currency');
  
  // Quand on coche "permanent", on vide la date de fin
  const handlePermanentChange = (checked: boolean) => {
    setValue('is_permanent', checked);
    if (checked) {
      setValue('end_date', '');
    }
  };

  // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Nom du portefeuille */}
      <FormField 
        label="Nom du portefeuille *" 
        error={getErrorMessage(errors.name)}
      >
        <Input 
          {...register('name')} 
          placeholder="Ex: Portefeuille PME Kinshasa 2024"
        />
      </FormField>

      {/* Description optionnelle */}
      <FormField 
        label="Description" 
        error={getErrorMessage(errors.description)}
      >
        <TextArea 
          {...register('description')} 
          rows={2} 
          placeholder="Description optionnelle du portefeuille..."
        />
        <p className="text-xs text-gray-500 mt-1">Optionnel - Visible uniquement par l'équipe de gestion</p>
      </FormField>

      {/* Devise et Capital initial - côte à côte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField 
          label="Devise *" 
          error={getErrorMessage(errors.currency)}
        >
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select 
                {...field}
                onChange={(e) => field.onChange(e.target.value as PortfolioCurrency)}
              >
                <option value="">Sélectionner une devise</option>
                {Object.entries(PORTFOLIO_CURRENCIES).map(([code, config]) => (
                  <option key={code} value={code}>
                    {config.flag} {code} - {config.label}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>

        <FormField 
          label={`Capital initial${selectedCurrency ? ` (${PORTFOLIO_CURRENCIES[selectedCurrency as PortfolioCurrency]?.symbol || ''})` : ''} *`}
          error={getErrorMessage(errors.initial_capital)}
        >
          <Input
            type="number"
            min={1}
            step="0.01"
            {...register('initial_capital', { valueAsNumber: true })}
            placeholder="Ex: 50000"
          />
        </FormField>
      </div>

      {/* Période de validité */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">
          Période de validité
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField 
            label="Date de démarrage *" 
            error={getErrorMessage(errors.start_date)}
          >
            <Input
              type="date"
              min={today}
              {...register('start_date')}
            />
          </FormField>

          <FormField 
            label="Date de fin"
            error={getErrorMessage(errors.end_date)}
          >
            <Input
              type="date"
              {...register('end_date')}
              disabled={isPermanent}
              className={isPermanent ? 'bg-gray-100 dark:bg-gray-700' : ''}
            />
          </FormField>
        </div>

        {/* Checkbox portefeuille permanent */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('is_permanent')}
            onChange={(e) => handlePermanentChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Portefeuille permanent (sans date de fin)
          </span>
        </label>
      </div>

      {/* Note informative */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
        <p className="font-medium flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Conseil</p>
        <p>Les paramètres avancés (rendement cible, profil de risque, secteurs) pourront être configurés ultérieurement via les paramètres du portefeuille.</p>
      </div>
    </div>
  );
}