// src/hooks/useOperation.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Operation } from '../types/operations';

export function useOperation(operation?: Operation) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleNext = async (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Submit operation
      navigate('/operations');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return {
    step,
    formData,
    handleNext,
    handleBack
  };
}
