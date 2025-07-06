import { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { workflowApi } from '../services/api/workflow.api';

export function useWorkflowStep(operationId: string, stepId: string) {
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { showNotification } = useNotification();

  const validateStep = async (token?: string) => {
    setIsValidating(true);
    try {
      const result = await workflowApi.validateStep(operationId, stepId, token);
      
      if (result.success) {
        showNotification('Étape validée avec succès', 'success');
        if (result.generatedToken) {
          showNotification(
            `Token généré: ${result.generatedToken} - Conservez-le pour la suite`,
            'info'
          );
        }
      }

      return result;
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Erreur lors de la validation',
        'error'
      );
      throw error;
    } finally {
      setIsValidating(false);
    }
  };

  const uploadDocument = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await workflowApi.uploadStepDocument(operationId, stepId, file);
      showNotification('Document téléversé avec succès', 'success');
      return result;
    } catch (error) {
      showNotification('Erreur lors du téléversement du document', 'error');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const getStepDuration = async () => {
    try {
      return await workflowApi.getStepDuration(operationId, stepId);
    } catch (error) {
      console.error('Error getting step duration:', error);
      return { estimatedDuration: 3 * 24 * 60 * 60 * 1000 }; // 3 jours par défaut
    }
  };

  return {
    validateStep,
    uploadDocument,
    getStepDuration,
    isValidating,
    isUploading
  };
}