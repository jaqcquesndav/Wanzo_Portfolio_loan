import React from 'react';
import { Check, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { OperationStep } from '../../types/operations';

interface OperationStepsProps {
  steps: OperationStep[];
  currentStep: string;
  onStepClick?: (stepId: string) => void;
}

export function OperationSteps({ steps, currentStep, onStepClick }: OperationStepsProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`relative flex items-start p-4 rounded-lg border ${
            step.status === 'current' ? 'bg-blue-50 border-blue-200' :
            step.status === 'completed' ? 'bg-green-50 border-green-200' :
            step.status === 'blocked' ? 'bg-red-50 border-red-200' :
            'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex-shrink-0 mr-4">
            {step.status === 'completed' && (
              <Check className="h-6 w-6 text-green-500" />
            )}
            {step.status === 'current' && (
              <Clock className="h-6 w-6 text-blue-500" />
            )}
            {step.status === 'blocked' && (
              <AlertTriangle className="h-6 w-6 text-red-500" />
            )}
            {step.status === 'pending' && (
              <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                {index + 1}. {step.label}
              </h3>
              {step.requiresToken && (
                <Badge variant="warning">Nécessite un token</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}