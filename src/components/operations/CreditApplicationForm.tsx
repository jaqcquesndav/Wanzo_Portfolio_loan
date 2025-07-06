import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, Input, Select, TextArea } from '../ui/Form';
import { useNotification } from '../../contexts/NotificationContext';
import { uploadToCloudinary } from '../../utils/cloudinary';

const creditApplicationSchema = z.object({
  // Informations de l'entreprise
  companyName: z.string().min(2, 'Le nom de l\'entreprise est requis'),
  sector: z.string().min(1, 'Le secteur est requis'),
  registrationNumber: z.string().min(1, 'Le numéro RCCM est requis'),
  taxId: z.string().min(1, 'Le numéro d\'identification fiscale est requis'),
  
  // Informations financières
  annualRevenue: z.number().min(0, 'Le chiffre d\'affaires doit être positif'),
  netProfit: z.number(),
  existingLoans: z.number(),
  
  // Détails du crédit
  productId: z.string().min(1, 'Le produit est requis'),
  amount: z.number().min(1000000, 'Le montant minimum est de 1,000,000'),
  duration: z.number().min(1, 'La durée est requise'),
  purpose: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  
  // Garanties
  collateralType: z.string().min(1, 'Le type de garantie est requis'),
  collateralValue: z.number().min(0, 'La valeur de la garantie doit être positive'),
  collateralDescription: z.string().min(10, 'La description de la garantie est requise'),
  
  // Contact
  contactName: z.string().min(2, 'Le nom du contact est requis'),
  contactPhone: z.string().min(8, 'Le numéro de téléphone est requis'),
  contactEmail: z.string().email('Email invalide'),
  contactRole: z.string().min(2, 'Le rôle du contact est requis')
});

type CreditApplicationData = z.infer<typeof creditApplicationSchema>;

interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
  maxSize: number; // en MB
  acceptedFormats: string[];
}

const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  {
    id: 'business_plan',
    name: 'Business Plan',
    description: 'Plan d\'affaires détaillé avec projections financières',
    required: true,
    maxSize: 10,
    acceptedFormats: ['.pdf', '.doc', '.docx']
  },
  {
    id: 'financial_statements',
    name: 'États Financiers',
    description: 'États financiers des 3 derniers exercices',
    required: true,
    maxSize: 10,
    acceptedFormats: ['.pdf', '.xls', '.xlsx']
  },
  {
    id: 'tax_returns',
    name: 'Déclarations Fiscales',
    description: 'Déclarations fiscales des 3 derniers exercices',
    required: true,
    maxSize: 10,
    acceptedFormats: ['.pdf']
  },
  {
    id: 'collateral_documents',
    name: 'Documents des Garanties',
    description: 'Titres de propriété, évaluations, etc.',
    required: true,
    maxSize: 10,
    acceptedFormats: ['.pdf', '.jpg', '.png']
  },
  {
    id: 'company_documents',
    name: 'Documents Société',
    description: 'RCCM, statuts, PV des assemblées',
    required: true,
    maxSize: 10,
    acceptedFormats: ['.pdf']
  }
];

interface CreditApplicationFormProps {
  onSubmit: (data: CreditApplicationData & { documents: Record<string, string> }) => Promise<void>;
  onCancel: () => void;
  availableProducts: Array<{ id: string; name: string }>;
}

export function CreditApplicationForm({ onSubmit, onCancel, availableProducts }: CreditApplicationFormProps) {
  const [documents, setDocuments] = useState<Record<string, File>>({});
  const [uploading, setUploading] = useState(false);
  const { showNotification } = useNotification();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CreditApplicationData>({
    resolver: zodResolver(creditApplicationSchema)
  });

  const handleFileChange = (documentId: string, file: File | null) => {
    if (!file) {
      const newDocuments = { ...documents };
      delete newDocuments[documentId];
      setDocuments(newDocuments);
      return;
    }

    const doc = REQUIRED_DOCUMENTS.find(d => d.id === documentId);
    if (!doc) return;

    // Vérifier la taille du fichier
    if (file.size > doc.maxSize * 1024 * 1024) {
      showNotification(`Le fichier est trop volumineux. Taille maximum: ${doc.maxSize}MB`, 'error');
      return;
    }

    // Vérifier le format du fichier
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!doc.acceptedFormats.includes(fileExtension)) {
      showNotification(`Format de fichier non accepté. Formats acceptés: ${doc.acceptedFormats.join(', ')}`, 'error');
      return;
    }

    setDocuments(prev => ({
      ...prev,
      [documentId]: file
    }));
  };

  const handleFormSubmit = async (data: CreditApplicationData) => {
    try {
      setUploading(true);

      // Vérifier que tous les documents requis sont présents
      const missingDocuments = REQUIRED_DOCUMENTS
        .filter(doc => doc.required && !documents[doc.id])
        .map(doc => doc.name);

      if (missingDocuments.length > 0) {
        showNotification(`Documents manquants: ${missingDocuments.join(', ')}`, 'error');
        return;
      }

      // Uploader les documents
      const uploadedUrls: Record<string, string> = {};
      for (const [docId, file] of Object.entries(documents)) {
        const url = await uploadToCloudinary(file);
        uploadedUrls[docId] = url;
      }

      await onSubmit({
        ...data,
        documents: uploadedUrls
      });
    } catch (error) {
      showNotification('Erreur lors de la soumission de la demande', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Informations de l'entreprise */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Informations de l'entreprise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nom de l'entreprise" error={errors.companyName?.message}>
            <Input {...register('companyName')} />
          </FormField>

          <FormField label="Secteur d'activité" error={errors.sector?.message}>
            <Select {...register('sector')}>
              <option value="">Sélectionner un secteur</option>
              <option value="agriculture">Agriculture</option>
              <option value="commerce">Commerce</option>
              <option value="industrie">Industrie</option>
              <option value="services">Services</option>
              <option value="technologie">Technologie</option>
            </Select>
          </FormField>

          <FormField label="Numéro RCCM" error={errors.registrationNumber?.message}>
            <Input {...register('registrationNumber')} />
          </FormField>

          <FormField label="Numéro d'identification fiscale" error={errors.taxId?.message}>
            <Input {...register('taxId')} />
          </FormField>
        </div>
      </div>

      {/* Informations financières */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Informations financières</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Chiffre d'affaires annuel" error={errors.annualRevenue?.message}>
            <Input
              type="number"
              {...register('annualRevenue', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Bénéfice net" error={errors.netProfit?.message}>
            <Input
              type="number"
              {...register('netProfit', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Encours de crédits" error={errors.existingLoans?.message}>
            <Input
              type="number"
              {...register('existingLoans', { valueAsNumber: true })}
            />
          </FormField>
        </div>
      </div>

      {/* Détails du crédit */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Détails du crédit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Produit" error={errors.productId?.message}>
            <Select {...register('productId')}>
              <option value="">Sélectionner un produit</option>
              {availableProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
          </FormField>

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

          <FormField label="Objet du crédit" error={errors.purpose?.message}>
            <TextArea
              {...register('purpose')}
              rows={3}
            />
          </FormField>
        </div>
      </div>

      {/* Garanties */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Garanties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Type de garantie" error={errors.collateralType?.message}>
            <Select {...register('collateralType')}>
              <option value="">Sélectionner un type</option>
              <option value="real_estate">Immobilier</option>
              <option value="equipment">Équipement</option>
              <option value="inventory">Stock</option>
              <option value="financial">Garantie financière</option>
              <option value="personal">Caution personnelle</option>
            </Select>
          </FormField>

          <FormField label="Valeur de la garantie" error={errors.collateralValue?.message}>
            <Input
              type="number"
              {...register('collateralValue', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Description de la garantie" error={errors.collateralDescription?.message}>
            <TextArea
              {...register('collateralDescription')}
              rows={3}
            />
          </FormField>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nom du contact" error={errors.contactName?.message}>
            <Input {...register('contactName')} />
          </FormField>

          <FormField label="Fonction" error={errors.contactRole?.message}>
            <Input {...register('contactRole')} />
          </FormField>

          <FormField label="Téléphone" error={errors.contactPhone?.message}>
            <Input {...register('contactPhone')} />
          </FormField>

          <FormField label="Email" error={errors.contactEmail?.message}>
            <Input type="email" {...register('contactEmail')} />
          </FormField>
        </div>
      </div>

      {/* Documents requis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Documents requis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REQUIRED_DOCUMENTS.map((doc) => (
            <div key={doc.id} className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {doc.name}
                    {doc.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <p className="text-sm text-gray-500">{doc.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Formats acceptés: {doc.acceptedFormats.join(', ')} • Max: {doc.maxSize}MB
                  </p>
                </div>
                {documents[doc.id] && (
                  <button
                    type="button"
                    onClick={() => handleFileChange(doc.id, null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {documents[doc.id] ? (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Upload className="h-4 w-4" />
                  <span>{documents[doc.id].name}</span>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                    accept={doc.acceptedFormats.join(',')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-primary dark:hover:border-primary-light transition-colors">
                    <Upload className="h-6 w-6 mx-auto text-gray-400" />
                    <p className="mt-1 text-sm text-gray-500">Cliquez pour sélectionner</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          loading={isSubmitting || uploading}
          disabled={isSubmitting || uploading}
        >
          Soumettre la demande
        </Button>
      </div>
    </form>
  );
}