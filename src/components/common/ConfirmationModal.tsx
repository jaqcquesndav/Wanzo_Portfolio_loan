import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  variant = 'warning'
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center">
            <AlertTriangle className={`h-6 w-6 mr-2 ${
              variant === 'danger' ? 'text-red-500' :
              variant === 'warning' ? 'text-yellow-500' :
              'text-blue-500'
            }`} />
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            icon={<X className="h-5 w-5" />}
          />
        </div>

        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-4">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}