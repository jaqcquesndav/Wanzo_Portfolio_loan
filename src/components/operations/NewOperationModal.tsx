import React from 'react';
import { X, DollarSign, Landmark, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { useSecurityOffer } from './hooks/useSecurityOffer';
import { SecurityOfferModal } from './SecurityOfferModal';

interface NewOperationModalProps {
  onClose: () => void;
  onSelectType: (type: string) => void;
}

export function NewOperationModal({ onClose, onSelectType }: NewOperationModalProps) {
  const { showModal, selectedType, handleNewOffer, handleSubmit, closeModal } = useSecurityOffer();

  const operationTypes = [
    {
      id: 'funding',
      title: 'Demande de financement',
      description: 'Crédit, leasing, subvention ou investissement en capital',
      icon: DollarSign,
      action: () => onSelectType('funding')
    },
    {
      id: 'bond',
      title: 'Émission obligataire',
      description: 'Lever des fonds en émettant des obligations',
      icon: Landmark,
      action: () => handleNewOffer('bond')
    },
    {
      id: 'share',
      title: 'Émission d\'actions',
      description: 'Ouvrir le capital aux investisseurs',
      icon: FileText,
      action: () => handleNewOffer('share')
    }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4">
          <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Nouvelle opération
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X className="h-5 w-5" />}
            />
          </div>

          <div className="p-6 grid gap-4">
            {operationTypes.map(type => (
              <button
                key={type.id}
                onClick={type.action}
                className="flex items-start p-4 border rounded-lg hover:border-primary dark:border-gray-700 dark:hover:border-primary transition-colors"
              >
                <type.icon className="h-6 w-6 text-primary mt-1" />
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {type.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {type.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showModal && selectedType && (
        <SecurityOfferModal
          type={selectedType}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}