// src/hooks/useOperationFlow.ts
import { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import type { OperationDocument } from '../types/operations';

type OperationStep = 'details' | 'documents' | 'validation';

export function useOperationFlow() {
  const [currentStep, setCurrentStep] = useState<OperationStep>('details');
  const [documents, setDocuments] = useState<OperationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const addDocument = useCallback((document: OperationDocument) => {
    setDocuments(prev => [...prev, document]);
  }, []);

  const removeDocument = useCallback((documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  }, []);

  const validateStep = useCallback(async () => {
    setIsLoading(true);
    try {
      // Validation logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (currentStep === 'details') {
        setCurrentStep('documents');
      } else if (currentStep === 'documents') {
        setCurrentStep('validation');
      } else {
        showNotification('Opération validée avec succès', 'success');
      }
    } catch {
      showNotification('Erreur lors de la validation', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, showNotification]);

  const isStepValid = useCallback((step: OperationStep): boolean => {
    switch (step) {
      case 'details':
        return true; // Add validation logic
      case 'documents':
        return documents.length > 0;
      case 'validation':
        return true;
      default:
        return false;
    }
  }, [documents]);

  return {
    currentStep,
    setCurrentStep,
    documents,
    addDocument,
    removeDocument,
    validateStep,
    isStepValid,
    isLoading
  };
}