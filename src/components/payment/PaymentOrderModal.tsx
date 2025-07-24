import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/formatters';

/**
 * Interface pour les données d'un ordre de paiement
 */
export interface PaymentOrderData {
  id: string;
  orderNumber: string;
  date: string;
  amount: number;
  currency: string;
  beneficiary: {
    name: string;
    accountNumber: string;
    bankName: string;
    swiftCode?: string;
    address?: string;
  };
  reference: string;
  description: string;
  portfolioId: string;
  portfolioName: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  paidBy?: string;
  paidAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PaymentOrderData) => void;
  onExport: (data: PaymentOrderData) => void;
  initialData: PaymentOrderData;
  readOnly?: boolean;
}

export const PaymentOrderModal: React.FC<PaymentOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onExport,
  initialData,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<PaymentOrderData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mettre à jour les données du formulaire lorsque initialData change
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Gérer les propriétés imbriquées comme beneficiary.name
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof PaymentOrderData] as Record<string, string | number>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Effacer l'erreur pour ce champ s'il y en a une
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validation de base
    if (!formData.beneficiary.name) newErrors['beneficiary.name'] = 'Le nom du bénéficiaire est requis';
    if (!formData.beneficiary.accountNumber) newErrors['beneficiary.accountNumber'] = 'Le numéro de compte est requis';
    if (!formData.beneficiary.bankName) newErrors['beneficiary.bankName'] = 'Le nom de la banque est requis';
    if (!formData.amount || formData.amount <= 0) newErrors['amount'] = 'Le montant doit être supérieur à 0';
    if (!formData.description) newErrors['description'] = 'La description est requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (readOnly) return;
    
    if (validate()) {
      onSave(formData);
    }
  };

  const handleExport = () => {
    onExport(formData);
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Ordre de Paiement {readOnly ? '(Lecture seule)' : ''}
                    </Dialog.Title>
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      <span className="sr-only">Fermer</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Section Informations générales */}
                      <div className="space-y-3">
                        <h4 className="text-md font-medium text-gray-700">Informations générales</h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Numéro d'ordre</label>
                          <input
                            type="text"
                            name="orderNumber"
                            value={formData.orderNumber}
                            onChange={handleChange}
                            disabled={true} // Le numéro d'ordre est généré et non modifiable
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date</label>
                          <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            disabled={readOnly}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Portefeuille</label>
                          <input
                            type="text"
                            value={formData.portfolioName}
                            disabled={true} // Le portefeuille est choisi en amont
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Statut</label>
                          <div className="mt-1 flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${formData.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                              ${formData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${formData.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                              ${formData.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                              ${formData.status === 'paid' ? 'bg-blue-100 text-blue-800' : ''}
                            `}>
                              {formData.status === 'draft' && 'Brouillon'}
                              {formData.status === 'pending' && 'En attente'}
                              {formData.status === 'approved' && 'Approuvé'}
                              {formData.status === 'rejected' && 'Rejeté'}
                              {formData.status === 'paid' && 'Payé'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Section Informations bénéficiaire */}
                      <div className="space-y-3">
                        <h4 className="text-md font-medium text-gray-700">Informations du bénéficiaire</h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nom du bénéficiaire</label>
                          <input
                            type="text"
                            name="beneficiary.name"
                            value={formData.beneficiary.name}
                            onChange={handleChange}
                            disabled={readOnly}
                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                              errors['beneficiary.name'] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors['beneficiary.name'] && (
                            <p className="mt-1 text-sm text-red-600">{errors['beneficiary.name']}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Numéro de compte</label>
                          <input
                            type="text"
                            name="beneficiary.accountNumber"
                            value={formData.beneficiary.accountNumber}
                            onChange={handleChange}
                            disabled={readOnly}
                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                              errors['beneficiary.accountNumber'] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors['beneficiary.accountNumber'] && (
                            <p className="mt-1 text-sm text-red-600">{errors['beneficiary.accountNumber']}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Banque</label>
                          <input
                            type="text"
                            name="beneficiary.bankName"
                            value={formData.beneficiary.bankName}
                            onChange={handleChange}
                            disabled={readOnly}
                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                              errors['beneficiary.bankName'] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors['beneficiary.bankName'] && (
                            <p className="mt-1 text-sm text-red-600">{errors['beneficiary.bankName']}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Code SWIFT (optionnel)</label>
                          <input
                            type="text"
                            name="beneficiary.swiftCode"
                            value={formData.beneficiary.swiftCode || ''}
                            onChange={handleChange}
                            disabled={readOnly}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Montant et Description */}
                    <div className="grid grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Montant</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                            {formData.currency}
                          </span>
                          <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            disabled={readOnly}
                            className={`block w-full flex-1 rounded-none rounded-r-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                              errors.amount ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors.amount && (
                          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Référence</label>
                        <input
                          type="text"
                          name="reference"
                          value={formData.reference}
                          onChange={handleChange}
                          disabled={readOnly}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description / Motif du paiement</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={readOnly}
                        rows={3}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          errors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                      )}
                    </div>
                    
                    {/* Montant en lettres (automatique) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Montant en lettres</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-sm italic">
                          {formatCurrency(formData.amount, formData.currency, true)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse space-x-2 space-x-reverse">
                      {!readOnly && (
                        <button
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mr-2"
                        >
                          <CheckIcon className="h-5 w-5 mr-2" />
                          Enregistrer
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={handleExport}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                        Exporter PDF
                      </button>
                      
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Fermer
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
