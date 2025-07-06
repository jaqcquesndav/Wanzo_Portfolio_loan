import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import type { OperationStep } from '../types/operations';

export function useOperationWorkflow(initialStep = 'select_offer') {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<OperationStep | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validatedSteps, setValidatedSteps] = useState<string[]>([]);

  const handleStepClick = (stepId: string, steps: OperationStep[]) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex > currentIndex + 1) {
      showNotification('Complétez d\'abord les étapes précédentes', 'warning');
      return;
    }

    if (step.requiresToken) {
      setSelectedStep(step);
      setShowTokenModal(true);
    } else if (stepIndex === currentIndex + 1) {
      proceedToNextStep(step);
    }
  };

  const proceedToNextStep = async (step: OperationStep) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep(step.id);
      setValidatedSteps(prev => [...prev, step.id]);
      showNotification(`Étape "${step.label}" validée`, 'success');
    } catch (error) {
      showNotification('Erreur lors du changement d\'étape', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTokenValidation = async (token: string) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (token === '123456' && selectedStep) {
        setCurrentStep(selectedStep.id);
        setValidatedSteps(prev => [...prev, selectedStep.id]);
        showNotification('Token validé avec succès', 'success');
        setShowTokenModal(false);
      } else {
        throw new Error('Token invalide');
      }
    } catch (error) {
      showNotification('Token invalide', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const validateWorkflow = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showNotification('Workflow validé avec succès', 'success');
      return true;
    } catch (error) {
      showNotification('Erreur lors de la validation du workflow', 'error');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    currentStep,
    showTokenModal,
    selectedStep,
    isProcessing,
    validatedSteps,
    handleStepClick,
    handleTokenValidation,
    validateWorkflow,
    setShowTokenModal
  };
}