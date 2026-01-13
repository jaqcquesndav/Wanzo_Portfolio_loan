import React, { useEffect, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ 
  open, 
  title, 
  message, 
  confirmLabel = 'Confirmer', 
  cancelLabel = 'Annuler',
  variant = 'danger',
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  
  // Fermer avec Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  }, [onCancel]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const iconColors = {
    danger: 'text-red-500 dark:text-red-400',
    warning: 'text-amber-500 dark:text-amber-400',
    info: 'text-blue-500 dark:text-blue-400'
  };

  const iconBgColors = {
    danger: 'bg-red-100 dark:bg-red-900/30',
    warning: 'bg-amber-100 dark:bg-amber-900/30',
    info: 'bg-blue-100 dark:bg-blue-900/30'
  };

  const confirmButtonVariant = variant === 'danger' ? 'danger' : 'primary';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl 
                   transform transition-all duration-200 ease-out
                   animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 
                     dark:text-gray-500 dark:hover:text-gray-300
                     hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${iconBgColors[variant]}`}>
              <AlertTriangle className={`h-6 w-6 sm:h-8 sm:w-8 ${iconColors[variant]}`} />
            </div>
          </div>

          {/* Title */}
          {title && (
            <h3 
              id="modal-title"
              className="text-lg sm:text-xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-2"
            >
              {title}
            </h3>
          )}

          {/* Message */}
          <p className="text-sm sm:text-base text-center text-gray-600 dark:text-gray-400 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 px-6 pb-6 sm:px-8 sm:pb-8">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={onConfirm}
            className="w-full sm:flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
