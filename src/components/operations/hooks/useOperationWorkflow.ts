import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../contexts/NotificationContext';
import type { OperationStep } from '../../../types/operations';

export function useOperationWorkflow(initialStep = 'select_offer') {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<OperationStep | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStepClick = (stepId: string, steps: OperationStep[]) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex > currentIndex + 1) {
      showNotification('Complete previous steps first', 'warning');
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
      showNotification(`Step "${step.label}" activated`, 'success');

      if (step.id === 'select_offer') {
        navigate('/funding-offers');
      }
    } catch (error) {
      showNotification('Error changing step', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTokenValidation = async (token: string) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (token === '123456') {
        if (selectedStep) {
          setCurrentStep(selectedStep.id);
          showNotification('Token validated successfully', 'success');
        }
        setShowTokenModal(false);
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      showNotification('Invalid token', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    currentStep,
    showTokenModal,
    selectedStep,
    isProcessing,
    handleStepClick,
    handleTokenValidation,
    setShowTokenModal
  };
}