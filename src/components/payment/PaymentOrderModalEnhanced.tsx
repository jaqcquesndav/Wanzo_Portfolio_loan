import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon, DocumentArrowDownIcon, BuildingLibraryIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/formatters';
import { useCurrencyContext } from '../../hooks/useCurrencyContext';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { useToastStore } from '../../stores/toastStore';
import type { Company } from '../../types/company';

/**
 * Interface pour les données d'un ordre de paiement
 */
export interface PaymentOrderData {
  id: string;
  orderNumber: string;
  date: string;
  amount: number;
  currency: string;
  paymentMethod: 'bank' | 'mobile_money';
  beneficiary: {
    name: string;
    accountNumber: string;
    bankName: string;
    swiftCode?: string;
    address?: string;
  } | {
    name: string;
    phoneNumber: string;
    provider: string;
    accountName?: string;
  };
  reference: string;
  description: string;
  portfolioId: string;
  portfolioName: string;
  companyId?: string;
  companyData?: Company;
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

// Opérateurs Mobile Money disponibles en RDC
const MOBILE_MONEY_PROVIDERS = [
  { id: 'orange', name: 'Orange Money', color: '#FF7900' },
  { id: 'm-pesa', name: 'M-Pesa (Vodacom)', color: '#E60000' },
  { id: 'airtel', name: 'Airtel Money', color: '#ED1C24' },
  { id: 'africell', name: 'Africell Money', color: '#0066CC' },
];

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
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'mobile_money'>(
    initialData.paymentMethod || 'bank'
  );
  const { currency } = useCurrencyContext();
  const addToast = useToastStore((state) => state.addToast);

  // Extraire les comptes disponibles depuis companyData
  const availableBankAccounts = useMemo(() => {
    if (!formData.companyData?.payment_info?.bankAccounts) return [];
    return formData.companyData.payment_info.bankAccounts;
  }, [formData.companyData]);

  const availableMobileAccounts = useMemo(() => {
    if (!formData.companyData?.payment_info?.mobileMoneyAccounts) return [];
    return formData.companyData.payment_info.mobileMoneyAccounts;
  }, [formData.companyData]);

  // Mettre à jour les données du formulaire lorsque initialData change
  useEffect(() => {
    setFormData(initialData);
    setPaymentMethod(initialData.paymentMethod || 'bank');
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
    } else if (name === 'amount') {
      // Pour le montant, on s'assure que c'est un nombre
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
        currency // Utiliser la devise du contexte
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

  const handlePaymentMethodChange = (method: 'bank' | 'mobile_money') => {
    setPaymentMethod(method);
    setFormData(prev => ({
      ...prev,
      paymentMethod: method,
      beneficiary: method === 'bank'
        ? {
            name: prev.beneficiary.name || '',
            accountNumber: '',
            bankName: '',
            swiftCode: '',
            address: '',
          }
        : {
            name: prev.beneficiary.name || '',
            phoneNumber: '',
            provider: '',
            accountName: '',
          }
    }));
    setErrors({});
  };

  const handleAccountSelection = (accountIndex: number) => {
    if (paymentMethod === 'bank') {
      const account = availableBankAccounts[accountIndex];
      if (account) {
        setFormData(prev => ({
          ...prev,
          beneficiary: {
            name: account.accountName,
            accountNumber: account.accountNumber,
            bankName: account.bankName,
            swiftCode: account.swiftCode,
            address: formData.companyData?.contact_info?.address || '',
          }
        }));
        addToast('success', `Compte bancaire ${account.bankName} sélectionné`);
      }
    } else {
      const account = availableMobileAccounts[accountIndex];
      if (account) {
        setFormData(prev => ({
          ...prev,
          beneficiary: {
            name: account.accountName,
            phoneNumber: account.phoneNumber,
            provider: account.provider,
            accountName: account.accountName,
          }
        }));
        addToast('success', `Compte Mobile Money ${account.provider} sélectionné`);
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validation commune
    if (!formData.beneficiary.name) newErrors['beneficiary.name'] = 'Le nom du bénéficiaire est requis';
    if (!formData.amount || formData.amount <= 0) newErrors['amount'] = 'Le montant doit être supérieur à 0';
    if (!formData.description) newErrors['description'] = 'La description est requise';
    
    // Validation spécifique par méthode de paiement
    if (paymentMethod === 'bank') {
      const bankBeneficiary = formData.beneficiary as { accountNumber: string; bankName: string };
      if (!bankBeneficiary.accountNumber) newErrors['beneficiary.accountNumber'] = 'Le numéro de compte est requis';
      if (!bankBeneficiary.bankName) newErrors['beneficiary.bankName'] = 'Le nom de la banque est requis';
    } else {
      const mobileBeneficiary = formData.beneficiary as { phoneNumber: string; provider: string };
      if (!mobileBeneficiary.phoneNumber) newErrors['beneficiary.phoneNumber'] = 'Le numéro de téléphone est requis';
      if (!mobileBeneficiary.provider) newErrors['beneficiary.provider'] = 'L\'opérateur Mobile Money est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (readOnly) return;
    
    if (validate()) {
      try {
        onSave(formData);
        addToast('success', 'Ordre de paiement enregistré avec succès');
      } catch (error) {
        addToast('error', 'Erreur lors de l\'enregistrement de l\'ordre de paiement');
        console.error(error);
      }
    } else {
      addToast('warning', 'Veuillez corriger les erreurs dans le formulaire');
    }
  };

  const handleExport = () => {
    try {
      onExport(formData);
      addToast('info', 'Export PDF en cours de génération...');
    } catch (error) {
      addToast('error', 'Erreur lors de l\'export PDF');
      console.error(error);
    }
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
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
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
                  
                  <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 border border-gray-200 rounded-md shadow-sm">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Section Informations générales */}
                      <div className="space-y-3">
                        <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Informations générales</h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Numéro d'ordre</label>
                          <Input
                            type="text"
                            name="orderNumber"
                            value={formData.orderNumber}
                            onChange={handleChange}
                            disabled={true}
                            className="mt-1 font-mono bg-gray-50"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date</label>
                          <Input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            disabled={readOnly}
                            className="mt-1 font-mono"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Portefeuille</label>
                          <Input
                            type="text"
                            value={formData.portfolioName}
                            disabled={true}
                            className="mt-1 bg-gray-50 font-medium"
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
                      
                      {/* Section Méthode de paiement et Bénéficiaire */}
                      <div className="space-y-3 border-l pl-4">
                        <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Méthode de paiement</h4>
                        
                        {/* Switch Banque / Mobile Money */}
                        <div className="flex space-x-2 mb-4">
                          <button
                            type="button"
                            onClick={() => handlePaymentMethodChange('bank')}
                            disabled={readOnly}
                            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                              paymentMethod === 'bank'
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <BuildingLibraryIcon className="h-5 w-5 mr-2" />
                            <span className="font-medium">Virement bancaire</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handlePaymentMethodChange('mobile_money')}
                            disabled={readOnly}
                            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                              paymentMethod === 'mobile_money'
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <DevicePhoneMobileIcon className="h-5 w-5 mr-2" />
                            <span className="font-medium">Mobile Money</span>
                          </button>
                        </div>

                        {/* Sélection de compte prédéfini */}
                        {paymentMethod === 'bank' && availableBankAccounts.length > 0 && !readOnly && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Comptes bancaires disponibles
                            </label>
                            <div className="space-y-2">
                              {availableBankAccounts.map((account, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleAccountSelection(index)}
                                  className="w-full text-left px-3 py-2 rounded border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{account.bankName}</p>
                                      <p className="text-xs text-gray-500 font-mono">{account.accountNumber}</p>
                                    </div>
                                    {account.isPrimary && (
                                      <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                                        Principal
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'mobile_money' && availableMobileAccounts.length > 0 && !readOnly && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Comptes Mobile Money disponibles
                            </label>
                            <div className="space-y-2">
                              {availableMobileAccounts.map((account, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleAccountSelection(index)}
                                  className="w-full text-left px-3 py-2 rounded border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{account.provider}</p>
                                      <p className="text-xs text-gray-500 font-mono">{account.phoneNumber}</p>
                                    </div>
                                    {account.isPrimary && (
                                      <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                                        Principal
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <h5 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Informations du bénéficiaire</h5>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nom du bénéficiaire</label>
                          <Input
                            type="text"
                            name="beneficiary.name"
                            value={formData.beneficiary.name}
                            onChange={handleChange}
                            disabled={readOnly}
                            className={`mt-1 font-medium text-base ${
                              errors['beneficiary.name'] ? 'border-red-300 focus-visible:ring-red-500' : ''
                            }`}
                          />
                          {errors['beneficiary.name'] && (
                            <p className="mt-1 text-sm text-red-600">{errors['beneficiary.name']}</p>
                          )}
                        </div>
                        
                        {paymentMethod === 'bank' ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Numéro de compte</label>
                              <Input
                                type="text"
                                name="beneficiary.accountNumber"
                                value={(formData.beneficiary as { accountNumber?: string }).accountNumber || ''}
                                onChange={handleChange}
                                disabled={readOnly}
                                className={`mt-1 font-mono text-base ${
                                  errors['beneficiary.accountNumber'] ? 'border-red-300 focus-visible:ring-red-500' : ''
                                }`}
                              />
                              {errors['beneficiary.accountNumber'] && (
                                <p className="mt-1 text-sm text-red-600">{errors['beneficiary.accountNumber']}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Banque</label>
                              <Input
                                type="text"
                                name="beneficiary.bankName"
                                value={(formData.beneficiary as { bankName?: string }).bankName || ''}
                                onChange={handleChange}
                                disabled={readOnly}
                                className={`mt-1 font-medium ${
                                  errors['beneficiary.bankName'] ? 'border-red-300 focus-visible:ring-red-500' : ''
                                }`}
                              />
                              {errors['beneficiary.bankName'] && (
                                <p className="mt-1 text-sm text-red-600">{errors['beneficiary.bankName']}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Code SWIFT (optionnel)</label>
                              <Input
                                type="text"
                                name="beneficiary.swiftCode"
                                value={(formData.beneficiary as { swiftCode?: string }).swiftCode || ''}
                                onChange={handleChange}
                                disabled={readOnly}
                                className="mt-1 font-mono text-base"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
                              <Input
                                type="tel"
                                name="beneficiary.phoneNumber"
                                value={(formData.beneficiary as { phoneNumber?: string }).phoneNumber || ''}
                                onChange={handleChange}
                                disabled={readOnly}
                                placeholder="+243 XXX XXX XXX"
                                className={`mt-1 font-mono text-base ${
                                  errors['beneficiary.phoneNumber'] ? 'border-red-300 focus-visible:ring-red-500' : ''
                                }`}
                              />
                              {errors['beneficiary.phoneNumber'] && (
                                <p className="mt-1 text-sm text-red-600">{errors['beneficiary.phoneNumber']}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Opérateur Mobile Money</label>
                              <select
                                name="beneficiary.provider"
                                value={(formData.beneficiary as { provider?: string }).provider || ''}
                                onChange={handleChange}
                                disabled={readOnly}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                  errors['beneficiary.provider'] ? 'border-red-300 focus-visible:ring-red-500' : ''
                                }`}
                              >
                                <option value="">Sélectionnez un opérateur</option>
                                {MOBILE_MONEY_PROVIDERS.map((provider) => (
                                  <option key={provider.id} value={provider.name}>
                                    {provider.name}
                                  </option>
                                ))}
                              </select>
                              {errors['beneficiary.provider'] && (
                                <p className="mt-1 text-sm text-red-600">{errors['beneficiary.provider']}</p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Section Montant et Description */}
                    <div className="grid grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Montant</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-gray-50 px-3 text-gray-500 font-medium">
                            {currency}
                          </span>
                          <Input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            disabled={readOnly}
                            step="0.01"
                            className={`rounded-l-none font-mono text-base ${
                              errors.amount ? 'border-red-300 focus-visible:ring-red-500' : ''
                            }`}
                          />
                        </div>
                        {errors.amount && (
                          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Référence</label>
                        <Input
                          type="text"
                          name="reference"
                          value={formData.reference}
                          onChange={handleChange}
                          disabled={readOnly}
                          className="mt-1 font-medium"
                        />
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description / Motif du paiement</label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={readOnly}
                        rows={3}
                        className={`mt-1 font-medium text-base resize-vertical ${
                          errors.description ? 'border-red-300 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                      )}
                    </div>
                    
                    {/* Montant en lettres (automatique) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Montant en lettres</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-300 shadow-inner">
                        <p className="text-base font-medium uppercase">
                          {formatCurrency(formData.amount, currency, true)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-8 sm:mt-6 sm:flex sm:flex-row-reverse space-x-2 space-x-reverse border-t pt-4">
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
