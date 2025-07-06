```tsx
import React from 'react';
import { Check, Clock, AlertTriangle } from 'lucide-react';
import type { Operation } from '../../../types/operations';

interface OperationStepsProps {
  operation: Operation;
  currentStep: string;
  onStepChange: (step: string) => void;
  isStepValid: (step: string) => boolean;
}

const steps = [
  { id: 'details', label: 'Détails', description: 'Informations de base' },
  { id: 'documents', label: 'Documents', description: 'Pièces justificatives' },
  { id: 'validation', label: 'Validation', description: 'Vérification finale' }
];

export function OperationSteps({ 
  operation, 
  currentStep,
  onStepChange,
  isStepValid 
}: OperationStepsProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = isStepValid(step.id);
        const isPending = !isActive && !isCompleted;

        return (
          <button
            key={step.id}
            onClick={() => onStepChange(step.id)}
            disabled={!isCompleted && !isActive}
            className={`
              relative flex items-start w-full p-4 rounded-lg border
              ${isActive ? 'bg-blue-50 border-blue-200' :
                isCompleted ? 'bg-green-50 border-green-200' :
                'bg-gray-50 border-gray-200'}
            `}
          >
            <div className="flex-shrink-0 mr-4">
              {isCompleted && <Check className="h-6 w-6 text-green-500" />}
              {isActive && <Clock className="h-6 w-6 text-blue-500" />}
              {isPending && <AlertTriangle className="h-6 w-6 text-gray-400" />}
            </div>
            
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                {index + 1}. {step.label}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{step.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
```