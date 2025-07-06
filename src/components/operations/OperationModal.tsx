import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { OperationForm } from './OperationForm';
import type { Operation } from '../../types/operations';

interface OperationModalProps {
  operation?: Operation;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function OperationModal({ operation, onClose, onSubmit }: OperationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {operation ? 'Modifier l\'opération' : 'Nouvelle opération'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="h-5 w-5" />}
          />
        </div>

        <div className="p-6">
          <OperationForm
            operation={operation}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}