// src/components/portfolio/DefaultPortfolioForm.tsx
import { z } from 'zod';
import { FormField, Input, Select, TextArea } from '../ui/Form';
import { getMainSectors } from '../../constants/sectors';
import { TagInput } from '../ui/TagInput';

// Utilisé uniquement pour le typage
export const defaultPortfolioSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  target_amount: z.number().min(1000000, 'Le montant minimum est de 1,000,000'),
  target_return: z.number().min(0).max(100),
  risk_profile: z.enum(['conservative', 'moderate', 'aggressive']),
  target_sectors: z.array(z.string()).min(1, 'Sélectionnez au moins un secteur')
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

// Utiliser les secteurs d'activité définis dans constants/sectors.ts
const SECTORS = getMainSectors();


import { useFormContext, Controller } from 'react-hook-form';

export function DefaultPortfolioForm() {
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext();

  // Ce formulaire est utilisé dans le stepper, donc on ne doit pas afficher les boutons ici
  return (
    <>
      <FormField label="Nom du portefeuille" error={getErrorMessage(errors.name)}>
        <Input {...register('name')} />
      </FormField>

      <FormField label="Description" error={getErrorMessage(errors.description)}>
        <TextArea {...register('description')} rows={4} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Montant cible" error={getErrorMessage(errors.target_amount)}>
          <Input
            type="number"
            {...register('target_amount', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Rendement cible (%)" error={getErrorMessage(errors.target_return)}>
          <Input
            type="number"
            {...register('target_return', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField label="Profil de risque" error={getErrorMessage(errors.risk_profile)}>
        <Select {...register('risk_profile')}>
          <option value="conservative">Conservateur</option>
          <option value="moderate">Modéré</option>
          <option value="aggressive">Agressif</option>
        </Select>
      </FormField>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Secteurs cibles
        </label>
        <Controller
          control={control}
          name="target_sectors"
          render={({ field }) => (
            <TagInput
              tags={SECTORS}
              selectedTags={field.value || []}
              onChange={field.onChange}
              placeholder="Rechercher un secteur..."
              error={getErrorMessage(errors.target_sectors)}
            />
          )}
        />
      </div>
    </>
  );
}