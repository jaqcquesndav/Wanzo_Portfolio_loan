import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { SecurityOfferForm } from '../securities/SecurityOfferForm';
import { CompanyValuationForm } from '../securities/CompanyValuationForm';
import type { SecurityType } from '../../types/securities';

interface SecurityOfferModalProps {
  type: SecurityType;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function SecurityOfferModal({ type, onClose, onSubmit }: SecurityOfferModalProps) {
  const [step, setStep] = useState<'valuation' | 'offer'>(type === 'share' ? 'valuation' : 'offer');
  const [companyValuation, setCompanyValuation] = useState<number>();

  const handleValuationSubmit = async (data: any) => {
    // Ici, vous implémenteriez la logique de calcul de la valorisation
    const calculatedValuation = 1000000; // Exemple
    setCompanyValuation(calculatedValuation);
    setStep('offer');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {type === 'bond' ? 'Nouvelle émission obligataire' : 'Nouvelle émission d\'actions'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="h-5 w-5" />}
          />
        </div>

        <div className="p-6">
          {step === 'valuation' ? (
            <CompanyValuationForm
              onSubmit={handleValuationSubmit}
              onCancel={onClose}
            />
          ) : (
            <SecurityOfferForm
              type={type}
              onSubmit={onSubmit}
              onCancel={onClose}
              companyValuation={companyValuation}
            />
          )}
        </div>
      </div>
    </div>
  );
}