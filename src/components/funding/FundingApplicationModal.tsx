import React from 'react';
import { X, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { FormField, Input, TextArea } from '../ui/Form';
import type { FundingOffer } from '../../types/funding';

interface FundingApplicationModalProps {
  offer: FundingOffer;
  onClose: () => void;
}

const applicationSchema = z.object({
  amount: z.number().min(1),
  duration: z.number().min(1),
  projectDescription: z.string().min(100),
  companyName: z.string().min(2),
  contactPerson: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export function FundingApplicationModal({ offer, onClose }: FundingApplicationModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema)
  });

  const onSubmit = async (data: ApplicationFormData) => {
    // Logique de soumission
    console.log(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Demande de financement - {offer.title}</h2>
          <Button
            variant="ghost"
            size="sm"
            icon={<X className="h-5 w-5" />}
            onClick={onClose}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Montant demandé" error={errors.amount?.message}>
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

            <FormField label="Nom de l'entreprise" error={errors.companyName?.message}>
              <Input {...register('companyName')} />
            </FormField>

            <FormField label="Personne de contact" error={errors.contactPerson?.message}>
              <Input {...register('contactPerson')} />
            </FormField>

            <FormField label="Email" error={errors.email?.message}>
              <Input type="email" {...register('email')} />
            </FormField>

            <FormField label="Téléphone" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormField>
          </div>

          <FormField label="Description du projet" error={errors.projectDescription?.message}>
            <TextArea
              {...register('projectDescription')}
              rows={6}
            />
          </FormField>

          <div className="space-y-4">
            <h3 className="font-medium">Documents requis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Business Plan</p>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                  <Button variant="outline" size="sm" className="mt-2">
                    Choisir un fichier
                  </Button>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">États financiers</p>
                  <input type="file" className="hidden" accept=".pdf,.xls,.xlsx" />
                  <Button variant="outline" size="sm" className="mt-2">
                    Choisir un fichier
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Soumettre la demande
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}