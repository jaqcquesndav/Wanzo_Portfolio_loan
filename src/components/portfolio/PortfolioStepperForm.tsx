import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DefaultPortfolioForm } from './DefaultPortfolioForm';
import { BankAccountStep } from './BankAccountStep';
import { Button } from '../ui/Button';

const stepSchemas = [
  z.object({
    name: z.string().min(3),
    description: z.string().min(20),
    target_amount: z.number().min(1000000),
    target_return: z.number().min(0).max(100),
    risk_profile: z.enum(['conservative', 'moderate', 'aggressive']),
    target_sectors: z.array(z.string()).min(1)
  }),
  z.object({
    bankName: z.string().min(2),
    accountNumber: z.string().min(3),
    accountHolder: z.string().min(2),
    iban: z.string().optional(),
    bic: z.string().optional(),
  })
];

const mergedSchema = stepSchemas.reduce((acc, s) => acc.merge(s), z.object({}));

export type PortfolioStepperFormData = z.infer<typeof mergedSchema>;

export interface PortfolioStepperFormProps {
  onSubmit: (data: PortfolioStepperFormData) => Promise<void>;
  onCancel: () => void;
}

export function PortfolioStepperForm({ onSubmit, onCancel }: PortfolioStepperFormProps) {
  const [step, setStep] = useState(0);
  const methods = useForm<PortfolioStepperFormData>({
    resolver: zodResolver(mergedSchema),
    defaultValues: { target_sectors: [] }
  });

  const next = async () => {
    if (step === 0) {
      const valid = await methods.trigger([
        'name',
        'description',
        'target_amount',
        'target_return',
        'risk_profile',
        'target_sectors',
      ] as Array<keyof PortfolioStepperFormData>);
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
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className={`h-2 w-2 rounded-full ${step === 0 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          <div className={`h-2 w-2 rounded-full ${step === 1 ? 'bg-primary' : 'bg-gray-300'}`}></div>
        </div>
        {step === 0 && <DefaultPortfolioForm />}
        {step === 1 && <BankAccountStep />}
        <div className="flex justify-between mt-8">
          <div>
            {step > 0 && (
              <Button type="button" variant="outline" onClick={prev}>
                Précédent
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onCancel} className="ml-2">
              Annuler
            </Button>
          </div>
          <div>
            {step === 1 ? (
              <Button type="submit" loading={methods.formState.isSubmitting}>
                Créer le portefeuille
              </Button>
            ) : (
              <Button type="button" onClick={next}>
                Suivant
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
