import React, { useState } from 'react';
import { X, CreditCard, Smartphone } from 'lucide-react';
import { Button } from '../ui/Button';
import { PaymentMethodForm } from './PaymentMethodForm';
import { usePayment } from '../../hooks/usePayment';
import { useNotification } from '../../contexts/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

interface PaymentModalProps {
  amount: number;
  currency: 'USD' | 'CDF';
  description: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ amount, currency, description, onClose, onSuccess }: PaymentModalProps) {
  const { processPayment, isProcessing } = usePayment();
  const { showNotification } = useNotification();
  const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');

  const handlePayment = async (paymentData: any) => {
    try {
      setStep('processing');
      await processPayment(amount, currency, paymentData.type, paymentData.details);
      setStep('success');
      showNotification('Paiement effectué avec succès', 'success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      setStep('method');
      showNotification(
        error instanceof Error ? error.message : 'Erreur lors du paiement',
        'error'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Paiement
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          </div>
          {step === 'method' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X className="h-5 w-5" />}
            />
          )}
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(amount, currency)}
            </p>
          </div>

          {step === 'method' && (
            <PaymentMethodForm
              onSubmit={handlePayment}
              onCancel={onClose}
            />
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Traitement du paiement en cours...
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Paiement réussi
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Votre paiement a été traité avec succès.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}