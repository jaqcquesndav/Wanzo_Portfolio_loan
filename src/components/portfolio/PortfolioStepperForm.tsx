// src/components/portfolio/PortfolioStepperForm.tsx
/**
 * Formulaire de création de portefeuille en 2 étapes
 * Étape 1: Informations de base (nom, devise, capital, période)
 * Étape 2: Compte associé (bancaire ou Mobile Money)
 */
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DefaultPortfolioForm } from './DefaultPortfolioForm';
import { BankAccountStep } from './BankAccountStep';
import { Button } from '../ui/Button';
import { CheckCircle } from 'lucide-react';

// Schema complet avec validation conditionnelle
const portfolioFormSchema = z.object({
  // Étape 1: Informations de base
  name: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
  currency: z.enum(['CDF', 'USD', 'EUR'] as const, {
    required_error: 'Sélectionnez une devise'
  }),
  initial_capital: z.number({
    required_error: 'Le capital initial est requis',
    invalid_type_error: 'Le capital doit être un nombre'
  }).min(1, 'Le capital initial doit être positif'),
  start_date: z.string().min(1, 'La date de démarrage est requise'),
  end_date: z.string().optional().or(z.literal('')),
  is_permanent: z.boolean().default(false),
  
  // Étape 2: Compte associé
  primary_account_type: z.enum(['bank', 'mobile_money'], {
    required_error: 'Sélectionnez un type de compte'
  }),
  // Champs compte bancaire (conditionnels)
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  // Champs Mobile Money (conditionnels)
  momo_provider: z.string().optional(),
  momo_phone: z.string().optional(),
  momo_name: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validation conditionnelle selon le type de compte
  if (data.primary_account_type === 'bank') {
    if (!data.bankName || data.bankName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sélectionnez une banque',
        path: ['bankName']
      });
    }
    if (!data.accountNumber || data.accountNumber.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Numéro de compte requis',
        path: ['accountNumber']
      });
    }
    if (!data.accountHolder || data.accountHolder.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Titulaire du compte requis',
        path: ['accountHolder']
      });
    }
  } else if (data.primary_account_type === 'mobile_money') {
    if (!data.momo_provider) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sélectionnez un opérateur',
        path: ['momo_provider']
      });
    }
    if (!data.momo_phone || data.momo_phone.length < 9) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Numéro de téléphone requis',
        path: ['momo_phone']
      });
    }
    if (!data.momo_name || data.momo_name.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nom du compte requis',
        path: ['momo_name']
      });
    }
  }
});

export type PortfolioStepperFormData = z.infer<typeof portfolioFormSchema>;

export interface PortfolioStepperFormProps {
  onSubmit: (data: PortfolioStepperFormData) => Promise<void>;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, title: 'Informations', description: 'Détails du portefeuille' },
  { id: 2, title: 'Compte', description: 'Association bancaire/MoMo' },
];

export function PortfolioStepperForm({ onSubmit, onCancel }: PortfolioStepperFormProps) {
  const [step, setStep] = useState(0);
  
  // Date d'aujourd'hui pour la valeur par défaut
  const today = new Date().toISOString().split('T')[0];
  
  const methods = useForm<PortfolioStepperFormData>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: { 
      currency: 'USD',
      start_date: today,
      is_permanent: false,
      primary_account_type: undefined,
    },
    mode: 'onBlur'
  });

  const next = async () => {
    if (step === 0) {
      const valid = await methods.trigger([
        'name',
        'currency',
        'initial_capital',
        'start_date',
      ]);
      if (valid) setStep((s) => s + 1);
    } else {
      setStep((s) => s + 1);
    }
  };
  
  const prev = () => setStep((s) => s - 1);

  const handleFinalSubmit = methods.handleSubmit(onSubmit);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleFinalSubmit} className="space-y-6">
        {/* Stepper Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    transition-all duration-200
                    ${idx < step 
                      ? 'bg-green-500 text-white' 
                      : idx === step 
                        ? 'bg-primary text-white ring-4 ring-primary/20' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  {idx < step ? <CheckCircle className="w-5 h-5" /> : s.id}
                </div>
                <span className={`text-xs mt-1 font-medium ${idx === step ? 'text-primary' : 'text-gray-500'}`}>
                  {s.title}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div 
                  className={`w-16 h-0.5 mx-2 transition-colors ${idx < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} 
                />
              )}
            </div>
          ))}
        </div>

        {/* Titre de l'étape */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {STEPS[step].description}
          </h3>
        </div>

        {/* Contenu de l'étape */}
        <div className="min-h-[400px]">
          {step === 0 && <DefaultPortfolioForm />}
          {step === 1 && <BankAccountStep />}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t dark:border-gray-700">
          <div className="flex gap-2">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={prev}>
                ← Précédent
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
          </div>
          <div>
            {step === STEPS.length - 1 ? (
              <Button type="submit" loading={methods.formState.isSubmitting}>
                ✓ Créer le portefeuille
              </Button>
            ) : (
              <Button type="button" onClick={next}>
                Suivant →
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
