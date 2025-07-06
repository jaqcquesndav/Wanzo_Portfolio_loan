import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X } from 'lucide-react';
import { FormField, Input, Select, TextArea } from '../../ui/Form'; // normalized to match actual file casing
import { Button } from '../../ui/Button';
import { uploadToCloudinary } from '../../../utils/cloudinary';
import { useNotification } from '../../../contexts/NotificationContext';

const equipmentSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  category: z.string().min(1, 'La catégorie est requise'),
  manufacturer: z.string().min(2, 'Le fabricant est requis'),
  model: z.string().min(2, 'Le modèle est requis'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().min(0, 'Le prix doit être positif'),
  condition: z.enum(['new', 'used']),
  specifications: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  maintenanceIncluded: z.boolean(),
  warrantyDuration: z.number().min(0).optional(),
  deliveryTime: z.number().min(0).optional(),
  availability: z.boolean(),
  dealer: z.string().min(2, 'Le concessionnaire est requis'),
  technicalSpecs: z.object({
    dimensions: z.string().optional(),
    weight: z.string().optional(),
    power: z.string().optional(),
    capacity: z.string().optional(),
    fuelType: z.string().optional(),
    additionalFeatures: z.array(z.string()).optional()
  }).optional()
});

export type EquipmentFormData = z.infer<typeof equipmentSchema>;

const CATEGORIES = [
  'Véhicules utilitaires',
  'Machines industrielles',
  'Équipement BTP',
  'Matériel agricole',
  'Équipement médical',
  'Matériel informatique',
  'Équipement logistique'
];

interface EquipmentFormProps {
  onSubmit: (data: EquipmentFormData & { images: string[] }) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<EquipmentFormData>;
}

export function EquipmentForm({ onSubmit, onCancel, initialData }: EquipmentFormProps) {
  const [images, setImages] = useState<File[]>([]);
  // Removed unused uploadedUrls state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    // watch, // removed unused variable
    formState: { errors, isSubmitting }
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      condition: 'new',
      maintenanceIncluded: false,
      availability: true,
      ...initialData
    }
  });

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      setImages(prev => [...prev, ...files]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      );
      setImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: EquipmentFormData) => {
    if (images.length === 0) {
      showNotification('Veuillez ajouter au moins une image', 'error');
      return;
    }

    try {
      setIsUploading(true);
      const uploadPromises = images.map(file => uploadToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      // setUploadedUrls(urls); // removed unused state update
      
      await onSubmit({ ...data, images: urls });
    } catch (error) {
      console.error('Error uploading images:', error);
      showNotification('Erreur lors du téléchargement des images', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Zone de drag & drop pour les images */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Images de l'équipement</h3>
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            isDragging 
              ? 'border-primary bg-primary-light' 
              : 'border-gray-300 hover:border-primary'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Glissez et déposez vos images ici, ou
            </p>
            <label className="mt-2 inline-block">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="text-primary hover:text-primary-dark cursor-pointer">
                parcourez vos fichiers
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, GIF jusqu'à 10MB
            </p>
          </div>
        </div>

        {/* Prévisualisation des images */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {images.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informations générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Nom de l'équipement" error={errors.name?.message}>
          <Input {...register('name')} />
        </FormField>

        <FormField label="Catégorie" error={errors.category?.message}>
          <Select {...register('category')}>
            <option value="">Sélectionner une catégorie</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Fabricant" error={errors.manufacturer?.message}>
          <Input {...register('manufacturer')} />
        </FormField>

        <FormField label="Modèle" error={errors.model?.message}>
          <Input {...register('model')} />
        </FormField>

        <FormField label="Année" error={errors.year?.message}>
          <Input
            type="number"
            {...register('year', { valueAsNumber: true })}
            min={1900}
            max={new Date().getFullYear() + 1}
          />
        </FormField>

        <FormField label="Prix" error={errors.price?.message}>
          <Input
            type="number"
            {...register('price', { valueAsNumber: true })}
            min={0}
          />
        </FormField>

        <FormField label="État" error={errors.condition?.message}>
          <Select {...register('condition')}>
            <option value="new">Neuf</option>
            <option value="used">Occasion</option>
          </Select>
        </FormField>

        <FormField label="Concessionnaire" error={errors.dealer?.message}>
          <Input {...register('dealer')} />
        </FormField>
      </div>

      {/* Description */}
      <FormField label="Description" error={errors.description?.message}>
        <TextArea
          {...register('description')}
          rows={4}
          placeholder="Description détaillée de l'équipement..."
        />
      </FormField>

      {/* Spécifications techniques */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Spécifications techniques</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Dimensions">
            <Input {...register('technicalSpecs.dimensions')} placeholder="L x l x h" />
          </FormField>

          <FormField label="Poids">
            <Input {...register('technicalSpecs.weight')} placeholder="En kg" />
          </FormField>

          <FormField label="Puissance">
            <Input {...register('technicalSpecs.power')} placeholder="En kW/CV" />
          </FormField>

          <FormField label="Capacité">
            <Input {...register('technicalSpecs.capacity')} placeholder="Volume/Charge utile" />
          </FormField>

          <FormField label="Type de carburant">
            <Select {...register('technicalSpecs.fuelType')}>
              <option value="">Sélectionner</option>
              <option value="diesel">Diesel</option>
              <option value="essence">Essence</option>
              <option value="electric">Électrique</option>
              <option value="hybrid">Hybride</option>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Options et services */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Options et services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Durée de garantie (mois)" error={errors.warrantyDuration?.message}>
            <Input
              type="number"
              {...register('warrantyDuration', { valueAsNumber: true })}
              min={0}
            />
          </FormField>

          <FormField label="Délai de livraison (jours)" error={errors.deliveryTime?.message}>
            <Input
              type="number"
              {...register('deliveryTime', { valueAsNumber: true })}
              min={0}
            />
          </FormField>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('maintenanceIncluded')}
              className="rounded border-gray-300"
            />
            <span>Maintenance incluse</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('availability')}
              className="rounded border-gray-300"
            />
            <span>Disponible</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          loading={isSubmitting || isUploading}
          disabled={images.length === 0}
        >
          {isUploading ? 'Téléchargement des images...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}