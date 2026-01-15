import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, Upload, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FormField, Input, Select } from '../components/ui/Form';

const validationSchema = z.object({
  institutionType: z.enum(['bank', 'microfinance', 'investment_fund', 'cooperative']),
  licenseNumber: z.string().min(3, 'Numéro de licence requis'),
  licenseAuthority: z.string().min(3, 'Autorité de délivrance requise'),
  licenseDate: z.string().min(1, 'Date de délivrance requise')
});

type ValidationFormData = z.infer<typeof validationSchema>;

// TODO: Remplacer par un vrai appel API de validation
const validateInstitution = async () => { return true; };

export default function InstitutionValidation() {
  const [documents, setDocuments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ValidationFormData>({
    resolver: zodResolver(validationSchema)
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const onSubmit = async () => {
    if (documents.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await validateInstitution();
      // Ajoutez ici la logique de succès (ex: notification, redirection, etc.)
    } catch (error) {
      console.error('Validation failed:', error);
      // Ajoutez ici la gestion d'erreur utilisateur si besoin
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Building className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Validation de l'institution
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Veuillez fournir les informations nécessaires pour valider votre institution
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Type d'institution" error={errors.institutionType?.message}>
              <Select {...register('institutionType')}>
                <option value="bank">Banque</option>
                <option value="microfinance">Institution de Microfinance</option>
                <option value="investment_fund">Fonds d'Investissement</option>
                <option value="cooperative">Coopérative d'Épargne et de Crédit</option>
              </Select>
            </FormField>

            <FormField label="Numéro de licence" error={errors.licenseNumber?.message}>
              <Input {...register('licenseNumber')} />
            </FormField>

            <FormField label="Autorité de délivrance" error={errors.licenseAuthority?.message}>
              <Input {...register('licenseAuthority')} />
            </FormField>

            <FormField label="Date de délivrance" error={errors.licenseDate?.message}>
              <Input type="date" {...register('licenseDate')} />
            </FormField>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Documents requis
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <span>Télécharger des fichiers</span>
                      <input
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, JPG, PNG jusqu'à 10MB
                  </p>
                </div>
              </div>
              {documents.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {documents.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      {file.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {documents.length === 0 && (
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Documents requis
                    </h3>
                    <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                      Veuillez télécharger les documents suivants :
                      <ul className="list-disc list-inside mt-1">
                        <li>Licence bancaire ou agrément</li>
                        <li>Document d'identification fiscale</li>
                        <li>Statuts de l'institution</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={documents.length === 0}
            >
              Soumettre pour validation
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}