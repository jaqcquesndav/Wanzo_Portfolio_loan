```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OperationSteps } from './OperationSteps';
import { OperationDetails } from './OperationDetails';
import { OperationDocuments } from './OperationDocuments';
import { OperationValidation } from './OperationValidation';
import { useOperationFlow } from '../../../hooks/useOperationFlow';
import type { Operation } from '../../../types/operations';

interface OperationFlowProps {
  operation: Operation;
}

export function OperationFlow({ operation }: OperationFlowProps) {
  const {
    currentStep,
    setCurrentStep,
    documents,
    addDocument,
    removeDocument,
    validateStep,
    isStepValid,
    isLoading
  } = useOperationFlow(operation);

  return (
    <div className="space-y-6">
      <OperationSteps 
        operation={operation}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        isStepValid={isStepValid}
      />

      <div className="bg-white rounded-lg shadow-sm p-6">
        {currentStep === 'details' && (
          <OperationDetails 
            operation={operation}
            onValidate={validateStep}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'documents' && (
          <OperationDocuments
            documents={documents}
            onAddDocument={addDocument}
            onRemoveDocument={removeDocument}
            onValidate={validateStep}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'validation' && (
          <OperationValidation
            operation={operation}
            documents={documents}
            onValidate={validateStep}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
```