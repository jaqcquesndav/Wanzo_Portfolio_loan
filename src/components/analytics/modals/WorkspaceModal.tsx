import React from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../ui/Button';
import { FormField, Input, TextArea } from '../../ui/Form';
import type { Workspace } from '../../../types/analytics';

const workspaceSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().optional()
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

interface WorkspaceModalProps {
  workspace?: Workspace;
  onClose: () => void;
  onSubmit: (data: WorkspaceFormData) => void;
}

export function WorkspaceModal({ workspace, onClose, onSubmit }: WorkspaceModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: workspace
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {workspace ? 'Modifier le workspace' : 'Nouveau workspace'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X className="h-5 w-5" />} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <FormField label="Nom" error={errors.name?.message}>
            <Input {...register('name')} placeholder="Mon dashboard analytique" />
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <TextArea 
              {...register('description')} 
              rows={4}
              placeholder="Description du dashboard et de son utilisation..."
            />
          </FormField>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {workspace ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
