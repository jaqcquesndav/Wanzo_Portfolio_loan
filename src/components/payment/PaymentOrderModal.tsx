import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon, DocumentArrowDownIcon, BuildingLibraryIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/formatters';
import { useCurrencyContext } from '../../hooks/useCurrencyContext';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { useToastStore } from '../../stores/toastStore';
import type { Company } from '../../types/company';

// Logos Mobile Money
import orangeLogo from '../../assets/images/ORANGE.png';
import mpesaLogo from '../../assets/images/MPESA.png';
import airtelLogo from '../../assets/images/AIRTEL.png';

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
    bankName?: string;
    swiftCode?: string;
    address?: string;
    phoneNumber?: string;
    provider?: string;
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
  company?: Company;
}

const MOBILE_MONEY_PROVIDERS = [
  { id: 'orange', name: 'Orange Money', logo: orangeLogo },
  { id: 'mpesa', name: 'M-Pesa', logo: mpesaLogo },
  { id: 'airtel', name: 'Airtel Money', logo: airtelLogo },
];

export const PaymentOrderModal: React.FC<PaymentOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onExport,
  initialData,
  readOnly = false,
  company,
}) => {
  const [formData, setFormData] = useState<PaymentOrderData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { currency } = useCurrencyContext();
  const addToast = useToastStore((state) => state.addToast);

  // Comptes disponibles depuis company
  const bankAccounts = company?.payment_info?.bankAccounts || [];
  const mobileMoneyAccounts = company?.payment_info?.mobileMoneyAccounts || [];

  // Mettre à jour les données du formulaire lorsque initialData change
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Auto-remplir avec le compte par défaut de la company
  useEffect(() => {
    if (company && isOpen) {
      const preferredMethod = company.payment_info?.preferredMethod || 'bank';
      
      if (preferredMethod === 'bank' && bankAccounts.length > 0) {
        const primaryAccount = bankAccounts.find(acc => acc.isPrimary) || bankAccounts[0];
        setFormData(prev => ({
          ...prev,
          paymentMethod: 'bank',
          beneficiary: {
            ...prev.beneficiary,
            name: primaryAccount.accountName || company.name,
            accountNumber: primaryAccount.accountNumber,
            bankName: primaryAccount.bankName,
            swiftCode: primaryAccount.swiftCode,
          }
        }));
      } else if (preferredMethod === 'mobile_money' && mobileMoneyAccounts.length > 0) {
        const primaryAccount = mobileMoneyAccounts.find(acc => acc.isPrimary) || mobileMoneyAccounts[0];
        setFormData(prev => ({
          ...prev,
          paymentMethod: 'mobile_money',
          beneficiary: {
            ...prev.beneficiary,
            name: primaryAccount.accountName || company.name,
            phoneNumber: primaryAccount.phoneNumber,
            provider: primaryAccount.provider,
          }
        }));
      }
    }
  }, [company, isOpen, bankAccounts, mobileMoneyAccounts]);

  const handlePaymentMethodChange = (method: 'bank' | 'mobile_money') => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: method,
      beneficiary: {
        name: prev.beneficiary.name,
        accountNumber: '',
        bankName: undefined,
        swiftCode: undefined,
        phoneNumber: undefined,
        provider: undefined,
      }
    }));
    
    // Auto-sélectionner le premier compte disponible
    if (method === 'bank' && bankAccounts.length > 0) {
      const primaryAccount = bankAccounts.find(acc => acc.isPrimary) || bankAccounts[0];
      handleBankAccountSelect(primaryAccount.accountNumber);
    } else if (method === 'mobile_money' && mobileMoneyAccounts.length > 0) {
      const primaryAccount = mobileMoneyAccounts.find(acc => acc.isPrimary) || mobileMoneyAccounts[0];
      handleMobileMoneyAccountSelect(primaryAccount.phoneNumber);
    }
  };

  const handleBankAccountSelect = (accountNumber: string) => {
    const account = bankAccounts.find(acc => acc.accountNumber === accountNumber);
    if (account) {
      setFormData(prev => ({
        ...prev,
        beneficiary: {
          ...prev.beneficiary,
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          bankName: account.bankName,
          swiftCode: account.swiftCode,
        }
      }));
    }
  };

  const handleMobileMoneyAccountSelect = (phoneNumber: string) => {
    const account = mobileMoneyAccounts.find(acc => acc.phoneNumber === phoneNumber);
    if (account) {
      setFormData(prev => ({
        ...prev,
        beneficiary: {
          ...prev.beneficiary,
          phoneNumber: account.phoneNumber,
          accountName: account.accountName,
          provider: account.provider,
        }
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
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
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
        currency
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
    
    if (!formData.beneficiary.name) {
      newErrors['beneficiary.name'] = 'Le nom du bénéficiaire est requis';
    }
    
    if (formData.paymentMethod === 'bank') {
      if (!formData.beneficiary.accountNumber) {
        newErrors['beneficiary.accountNumber'] = 'Le numéro de compte est requis';
      }
      if (!formData.beneficiary.bankName) {
        newErrors['beneficiary.bankName'] = 'Le nom de la banque est requis';
      }
    } else if (formData.paymentMethod === 'mobile_money') {
      if (!formData.beneficiary.phoneNumber) {
        newErrors['beneficiary.phoneNumber'] = 'Le numéro de téléphone est requis';
      }
      if (!formData.beneficiary.provider) {
        newErrors['beneficiary.provider'] = 'Le fournisseur Mobile Money est requis';
      }
    }
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors['amount'] = 'Le montant doit être supérieur à 0';
    }
    
    if (!formData.description) {
      newErrors['description'] = 'La description est requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (readOnly) return;
    
    if (validate()) {
      try {
        onSave(formData);
        addToast('success', 'Ordre de paiement créé avec succès');
        onClose();
      } catch (error) {
        addToast('error', 'Erreur lors de la création de l\'ordre de paiement');
      }
    } else {
      addToast('warning', 'Veuillez corriger les erreurs dans le formulaire');
    }
  };

  const handleExport = () => {
    try {
      onExport(formData);
      addToast('success', 'Export PDF généré avec succès');
    } catch (error) {
      addToast('error', 'Erreur lors de l\'export PDF');
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
                    {/* Switch Méthode de paiement */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Méthode de paiement</label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => handlePaymentMethodChange('bank')}
                          disabled={readOnly}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                            formData.paymentMethod === 'bank'
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <BuildingLibraryIcon className="h-5 w-5" />
                          <span className="font-medium">Virement bancaire</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handlePaymentMethodChange('mobile_money')}
                          disabled={readOnly}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                            formData.paymentMethod === 'mobile_money'
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <DevicePhoneMobileIcon className="h-5 w-5" />
                          <span className="font-medium">Mobile Money</span>
                        </button>
                      </div>
                    </div>

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
                      
                      {/* Section Bénéficiaire - Banque */}
                      {formData.paymentMethod === 'bank' && (
                        <div className="space-y-3 border-l pl-4">
                          <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Informations bancaires</h4>
                          
                          {bankAccounts.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Compte bancaire</label>
                              <select
                                value={formData.beneficiary.accountNumber}
                                onChange={(e) => handleBankAccountSelect(e.target.value)}
                                disabled={readOnly}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              >
                                <option value="">Sélectionner un compte</option>
                                {bankAccounts.map((account) => (
                                  <option key={account.accountNumber} value={account.accountNumber}>
                                    {account.bankName} - {account.accountNumber} {account.isPrimary && '(Principal)'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Nom du bénéficiaire</label>
                            <Input
                              type="text"
                              name="beneficiary.name"
                              value={formData.beneficiary.name}
                              onChange={handleChange}
                              disabled={readOnly}
                              className={`mt-1 font-medium text-base ${
                                errors['beneficiary.name'] ? 'border-red-300' : ''
                              }`}
                            />
                            {errors['beneficiary.name'] && (
                              <p className="mt-1 text-sm text-red-600">{errors['beneficiary.name']}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Numéro de compte</label>
                            <Input
                              type="text"
                              name="beneficiary.accountNumber"
                              value={formData.beneficiary.accountNumber}
                              onChange={handleChange}
                              disabled={readOnly || bankAccounts.length > 0}
                              className={`mt-1 font-mono text-base ${
                                errors['beneficiary.accountNumber'] ? 'border-red-300' : ''
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
                              value={formData.beneficiary.bankName || ''}
                              onChange={handleChange}
                              disabled={readOnly || bankAccounts.length > 0}
                              className={`mt-1 font-medium ${
                                errors['beneficiary.bankName'] ? 'border-red-300' : ''
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
                              value={formData.beneficiary.swiftCode || ''}
                              onChange={handleChange}
                              disabled={readOnly}
                              className="mt-1 font-mono text-base"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Section Bénéficiaire - Mobile Money */}
                      {formData.paymentMethod === 'mobile_money' && (
                        <div className="space-y-3 border-l pl-4">
                          <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Informations Mobile Money</h4>
                          
                          {mobileMoneyAccounts.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Compte Mobile Money</label>
                              <select
                                value={formData.beneficiary.phoneNumber || ''}
                                onChange={(e) => handleMobileMoneyAccountSelect(e.target.value)}
                                disabled={readOnly}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              >
                                <option value="">Sélectionner un compte</option>
                                {mobileMoneyAccounts.map((account) => (
                                  <option key={account.phoneNumber} value={account.phoneNumber}>
                                    {account.provider} - {account.phoneNumber} {account.isPrimary && '(Principal)'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Nom du bénéficiaire</label>
                            <Input
                              type="text"
                              name="beneficiary.name"
                              value={formData.beneficiary.name}
                              onChange={handleChange}
                              disabled={readOnly}
                              className={`mt-1 font-medium text-base ${
                                errors['beneficiary.name'] ? 'border-red-300' : ''
                              }`}
                            />
                            {errors['beneficiary.name'] && (
                              <p className="mt-1 text-sm text-red-600">{errors['beneficiary.name']}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
                            <Input
                              type="tel"
                              name="beneficiary.phoneNumber"
                              value={formData.beneficiary.phoneNumber || ''}
                              onChange={handleChange}
                              disabled={readOnly || mobileMoneyAccounts.length > 0}
                              placeholder="+243 XX XXX XXXX"
                              className={`mt-1 font-mono text-base ${
                                errors['beneficiary.phoneNumber'] ? 'border-red-300' : ''
                              }`}
                            />
                            {errors['beneficiary.phoneNumber'] && (
                              <p className="mt-1 text-sm text-red-600">{errors['beneficiary.phoneNumber']}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Fournisseur</label>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {MOBILE_MONEY_PROVIDERS.map((provider) => (
                                <button
                                  key={provider.id}
                                  type="button"
                                  onClick={() => {
                                    if (!readOnly) {
                                      setFormData(prev => ({
                                        ...prev,
                                        beneficiary: {
                                          ...prev.beneficiary,
                                          provider: provider.name
                                        }
                                      }));
                                    }
                                  }}
                                  disabled={readOnly || mobileMoneyAccounts.length > 0}
                                  className={`relative p-2 border-2 rounded-lg transition-all ${
                                    formData.beneficiary.provider === provider.name
                                      ? 'border-indigo-600 bg-indigo-50'
                                      : 'border-gray-300 bg-white hover:border-gray-400'
                                  }`}
                                >
                                  <img 
                                    src={provider.logo} 
                                    alt={provider.name}
                                    className="h-8 w-full object-contain"
                                  />
                                </button>
                              ))}
                            </div>
                            {errors['beneficiary.provider'] && (
                              <p className="mt-1 text-sm text-red-600">{errors['beneficiary.provider']}</p>
                            )}
                          </div>
                        </div>
                      )}
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
                            className={`rounded-l-none font-mono text-base ${
                              errors.amount ? 'border-red-300' : ''
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
                          errors.description ? 'border-red-300' : ''
                        }`}
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                      )}
                    </div>
                    
                    {/* Montant en lettres */}
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
