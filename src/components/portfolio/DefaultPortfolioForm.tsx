// src/components/portfolio/DefaultPortfolioForm.tsx
import { useState, useRef } from 'react';
import { z } from 'zod';
import { FormField, Input, Select, TextArea } from '../ui/Form';

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

const SECTORS = [
  'Agriculture',
  'Agroalimentaire',
  'Artisanat',
  'BTP & Construction',
  'Commerce de détail',
  'Commerce de gros',
  'Éducation',
  'Énergie',
  'Finance & Assurance',
  'Hôtellerie & Tourisme',
  'Immobilier',
  'Industrie',
  'Informatique & Télécoms',
  'Logistique & Transport',
  'Mines & Carrières',
  'Pêche',
  'Pharmaceutique',
  'Santé',
  'Services',
  'Textile & Habillement',
  'Transformation',
  'Transports',
  'Distribution',
  'Environnement',
  'Sécurité',
  'Autres'
];



function SectorDropdown({
  sectors,
  value,
  onChange
}: {
  sectors: string[];
  value: string[];
  onChange: (val: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = sectors.filter(
    (s: string) => s.toLowerCase().includes(query.toLowerCase()) && !value.includes(s)
  );

  const handleSelect = (sector: string) => {
    onChange([...value, sector]);
    setQuery('');
    setOpen(true);
    inputRef.current?.focus();
  };
  const handleRemove = (sector: string) => {
    onChange(value.filter((s: string) => s !== sector));
  };
  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((sector: string) => (
          <span
            key={sector}
            className="inline-flex items-center bg-primary-light text-white rounded-full px-3 py-1 text-xs font-medium"
          >
            {sector}
            <button
              type="button"
              className="ml-2 text-white hover:text-red-300"
              onClick={() => handleRemove(sector)}
              aria-label="Retirer"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Rechercher un secteur..."
          className="w-full rounded border border-gray-300 dark:bg-gray-800 dark:text-white px-3 py-2 text-sm focus:ring-primary focus:border-primary"
        />
        {open && filtered.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg max-h-48 overflow-auto">
            {filtered.map((sector: string) => (
              <li
                key={sector}
                className="px-3 py-2 cursor-pointer hover:bg-primary-light hover:text-white text-sm"
                onMouseDown={() => handleSelect(sector)}
              >
                {sector}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


import { useFormContext } from 'react-hook-form';

export function DefaultPortfolioForm() {
  const {
    register,
    setValue,
    watch,
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
        <SectorDropdown
          sectors={SECTORS}
          value={watch('target_sectors')}
          onChange={(val: string[]) => setValue('target_sectors', val, { shouldValidate: true })}
        />
        {errors.target_sectors && (
          <p className="text-sm text-red-600">{getErrorMessage(errors.target_sectors)}</p>
        )}
      </div>
    </>
  );
}