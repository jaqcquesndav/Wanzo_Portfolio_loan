import React, { useState } from 'react';
// Import individual icons to avoid path issues
import { PlusIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';
import { PencilIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import type { BankAccount } from '../../../types/bankAccount';
import type { MobileMoneyAccount } from '../../../types/mobileMoneyAccount';

// Logos Mobile Money
import orangeLogo from '../../../assets/images/ORANGE.png';
import mpesaLogo from '../../../assets/images/MPESA.png';
import airtelLogo from '../../../assets/images/AIRTEL.png';

interface AccountsPanelProps {
  bankAccounts: BankAccount[];
  mobileMoneyAccounts: MobileMoneyAccount[];
  onAddBank: (account: BankAccount) => void;
  onEditBank: (account: BankAccount) => void;
  onDeleteBank: (accountId: string) => void;
  onAddMobileMoney: (account: MobileMoneyAccount) => void;
  onEditMobileMoney: (account: MobileMoneyAccount) => void;
  onDeleteMobileMoney: (accountId: string) => void;
  readOnly?: boolean;
}

const MOBILE_MONEY_PROVIDERS = [
  { id: 'orange', name: 'Orange Money' as const, logo: orangeLogo, serviceNumber: '*150#' },
  { id: 'mpesa', name: 'M-Pesa' as const, logo: mpesaLogo, serviceNumber: '*555#' },
  { id: 'airtel', name: 'Airtel Money' as const, logo: airtelLogo, serviceNumber: '*501#' },
];

export function AccountsPanel({ 
  bankAccounts = [], 
  mobileMoneyAccounts = [],
  onAddBank, 
  onEditBank, 
  onDeleteBank,
  onAddMobileMoney,
  onEditMobileMoney,
  onDeleteMobileMoney,
  readOnly = false 
}: AccountsPanelProps) {
  const [accountType, setAccountType] = useState<'bank' | 'mobile_money'>('bank');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'bank' | 'mobile_money' | null>(null);
  
  const [bankFormData, setBankFormData] = useState<Partial<BankAccount>>({
    account_number: '',
    account_name: '',
    bank_name: '',
    branch: '',
    swift_code: '',
    iban: '',
    currency: 'CDF',
    is_primary: false,
    is_active: true,
    purpose: 'general'
  });

  const [mobileMoneyFormData, setMobileMoneyFormData] = useState<Partial<MobileMoneyAccount>>({
    account_name: '',
    phone_number: '',
    provider: 'Orange Money',
    pin_code: '',
    account_holder_id: '',
    currency: 'CDF',
    is_primary: false,
    is_active: true,
    purpose: 'general',
    service_number: '*150#',
    account_status: 'verified'
  });

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setBankFormData({
      ...bankFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleMobileMoneyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setMobileMoneyFormData({
      ...mobileMoneyFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleProviderSelect = (provider: typeof MOBILE_MONEY_PROVIDERS[0]) => {
    setMobileMoneyFormData({
      ...mobileMoneyFormData,
      provider: provider.name,
      service_number: provider.serviceNumber
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accountType === 'bank') {
      const newAccount = {
        ...bankFormData,
        id: editingId || `bank-account-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as BankAccount;
      
      if (editingId && editingType === 'bank') {
        onEditBank(newAccount);
      } else {
        onAddBank(newAccount);
      }
      
      setBankFormData({
        account_number: '',
        account_name: '',
        bank_name: '',
        branch: '',
        swift_code: '',
        iban: '',
        currency: 'CDF',
        is_primary: false,
        is_active: true,
        purpose: 'general'
      });
    } else {
      const newAccount = {
        ...mobileMoneyFormData,
        id: editingId || `mm-account-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as MobileMoneyAccount;
      
      if (editingId && editingType === 'mobile_money') {
        onEditMobileMoney(newAccount);
      } else {
        onAddMobileMoney(newAccount);
      }
      
      setMobileMoneyFormData({
        account_name: '',
        phone_number: '',
        provider: 'Orange Money',
        pin_code: '',
        account_holder_id: '',
        currency: 'CDF',
        is_primary: false,
        is_active: true,
        purpose: 'general',
        service_number: '*150#',
        account_status: 'verified'
      });
    }
    
    setShowAddForm(false);
    setEditingId(null);
    setEditingType(null);
  };

  const handleEditBank = (account: BankAccount) => {
    setBankFormData(account);
    setEditingId(account.id);
    setEditingType('bank');
    setAccountType('bank');
    setShowAddForm(true);
  };

  const handleEditMobileMoney = (account: MobileMoneyAccount) => {
    setMobileMoneyFormData(account);
    setEditingId(account.id);
    setEditingType('mobile_money');
    setAccountType('mobile_money');
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setEditingType(null);
    setBankFormData({
      account_number: '',
      account_name: '',
      bank_name: '',
      branch: '',
      swift_code: '',
      iban: '',
      currency: 'CDF',
      is_primary: false,
      is_active: true,
      purpose: 'general'
    });
    setMobileMoneyFormData({
      account_name: '',
      phone_number: '',
      provider: 'Orange Money',
      pin_code: '',
      account_holder_id: '',
      currency: 'CDF',
      is_primary: false,
      is_active: true,
      purpose: 'general',
      service_number: '*150#',
      account_status: 'verified'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Comptes</h3>
        {!readOnly && (
          <Button 
            onClick={() => setShowAddForm(!showAddForm)} 
            variant="secondary" 
            size="sm"
          >
            {showAddForm ? 'Annuler' : 'Ajouter un compte'}
            {!showAddForm && <PlusIcon className="w-4 h-4 ml-1" />}
          </Button>
        )}
      </div>
      
      {showAddForm && !readOnly && (
        <form onSubmit={handleSubmit} className="mb-6 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <h4 className="font-medium mb-3">{editingId ? 'Modifier le compte' : 'Nouveau compte'}</h4>
          
          {/* Type de compte selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Type de compte</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setAccountType('bank')}
                disabled={!!editingId}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  accountType === 'bank'
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary/30'
                } ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="font-medium">Compte bancaire</span>
              </button>
              
              <button
                type="button"
                onClick={() => setAccountType('mobile_money')}
                disabled={!!editingId}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  accountType === 'mobile_money'
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary/30'
                } ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="font-medium">Mobile Money</span>
              </button>
            </div>
          </div>

          {/* Formulaire Compte Bancaire */}
          {accountType === 'bank' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom du compte *</label>
                <input
                  name="account_name"
                  value={bankFormData.account_name}
                  onChange={handleBankChange}
                  className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Numéro de compte *</label>
                <input
                  name="account_number"
                  value={bankFormData.account_number}
                  onChange={handleBankChange}
                  className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom de la banque *</label>
                <input
                  name="bank_name"
                  value={bankFormData.bank_name}
                  onChange={handleBankChange}
                  className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Branche/Agence</label>
                <input
                  name="branch"
                  value={bankFormData.branch}
                  onChange={handleBankChange}
                  className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code SWIFT/BIC</label>
                <input
                  name="swift_code"
                  value={bankFormData.swift_code}
                  onChange={handleBankChange}
                  className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">IBAN</label>
                <input
                  name="iban"
                  value={bankFormData.iban}
                  onChange={handleBankChange}
                  className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Devise</label>
                <select
                  name="currency"
                  value={bankFormData.currency}
                  onChange={handleBankChange}
                  className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                >
                  <option value="CDF">CDF (Franc congolais)</option>
                  <option value="USD">USD (Dollar américain)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Objectif</label>
                <select
                  name="purpose"
                  value={bankFormData.purpose}
                  onChange={handleBankChange}
                  className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                >
                  <option value="general">Général</option>
                  <option value="disbursement">Décaissements</option>
                  <option value="collection">Recouvrements</option>
                  <option value="investment">Investissement</option>
                  <option value="escrow">Séquestre</option>
                  <option value="reserve">Réserve</option>
                </select>
              </div>
            </div>
          )}

          {/* Formulaire Mobile Money */}
          {accountType === 'mobile_money' && (
            <div className="space-y-4 mb-4">
              {/* Sélection du fournisseur */}
              <div>
                <label className="block text-sm font-medium mb-2">Fournisseur *</label>
                <div className="grid grid-cols-3 gap-2">
                  {MOBILE_MONEY_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => handleProviderSelect(provider)}
                      className={`relative p-3 border-2 rounded-lg transition-all ${
                        mobileMoneyFormData.provider === provider.name
                          ? 'border-primary bg-primary-light'
                          : 'border-gray-300 bg-white hover:border-primary/30'
                      }`}
                    >
                      <img 
                        src={provider.logo} 
                        alt={provider.name}
                        className="h-10 w-full object-contain mb-1"
                      />
                      <p className="text-xs text-center font-medium">{provider.name}</p>
                      <p className="text-xs text-center text-gray-500">{provider.serviceNumber}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom du détenteur *</label>
                  <input
                    name="account_name"
                    value={mobileMoneyFormData.account_name}
                    onChange={handleMobileMoneyChange}
                    placeholder="Nom complet"
                    className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Numéro de téléphone *</label>
                  <input
                    name="phone_number"
                    value={mobileMoneyFormData.phone_number}
                    onChange={handleMobileMoneyChange}
                    placeholder="+243 XXX XXX XXX"
                    className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Code PIN</label>
                  <input
                    type="password"
                    name="pin_code"
                    value={mobileMoneyFormData.pin_code}
                    onChange={handleMobileMoneyChange}
                    placeholder="••••"
                    maxLength={4}
                    className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">Code confidentiel (stocké de manière sécurisée)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Numéro d'identification</label>
                  <input
                    name="account_holder_id"
                    value={mobileMoneyFormData.account_holder_id}
                    onChange={handleMobileMoneyChange}
                    placeholder="Numéro CNI ou autre"
                    className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Devise</label>
                  <select
                    name="currency"
                    value={mobileMoneyFormData.currency}
                    onChange={handleMobileMoneyChange}
                    className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                  >
                    <option value="CDF">CDF (Franc congolais)</option>
                    <option value="USD">USD (Dollar américain)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Objectif</label>
                  <select
                    name="purpose"
                    value={mobileMoneyFormData.purpose}
                    onChange={handleMobileMoneyChange}
                    className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                  >
                    <option value="general">Général</option>
                    <option value="disbursement">Décaissements</option>
                    <option value="collection">Recouvrements</option>
                    <option value="investment">Investissement</option>
                    <option value="escrow">Séquestre</option>
                    <option value="reserve">Réserve</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Options communes */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_primary"
                name="is_primary"
                checked={accountType === 'bank' ? !!bankFormData.is_primary : !!mobileMoneyFormData.is_primary}
                onChange={accountType === 'bank' ? handleBankChange : handleMobileMoneyChange}
                className="mr-2 h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="is_primary" className="text-sm">Compte principal</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={accountType === 'bank' ? !!bankFormData.is_active : !!mobileMoneyFormData.is_active}
                onChange={accountType === 'bank' ? handleBankChange : handleMobileMoneyChange}
                className="mr-2 h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="is_active" className="text-sm">Compte actif</label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </div>
        </form>
      )}
      
      {/* Tables des comptes */}
      <div className="space-y-6">
        {/* Comptes bancaires */}
        <div>
          <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">Comptes bancaires</h4>
          {bankAccounts.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed">
              <p>Aucun compte bancaire enregistré</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Compte</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Banque</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Objectif</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                    {!readOnly && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                  {bankAccounts.map(account => (
                    <tr key={account.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {account.account_name}
                          {account.is_primary && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                              Principal
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">{account.account_number}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{account.bank_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {account.purpose === 'general' && 'Général'}
                        {account.purpose === 'disbursement' && 'Décaissements'}
                        {account.purpose === 'collection' && 'Recouvrements'}
                        {account.purpose === 'investment' && 'Investissement'}
                        {account.purpose === 'escrow' && 'Séquestre'}
                        {account.purpose === 'reserve' && 'Réserve'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {account.is_active ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            Actif
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                            Inactif
                          </span>
                        )}
                      </td>
                      {!readOnly && (
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <Button
                            onClick={() => handleEditBank(account)}
                            variant="ghost"
                            size="sm"
                            className="mr-1"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => onDeleteBank(account.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Comptes Mobile Money */}
        <div>
          <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">Comptes Mobile Money</h4>
          {mobileMoneyAccounts.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed">
              <p>Aucun compte Mobile Money enregistré</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Détenteur</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Téléphone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fournisseur</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Objectif</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                    {!readOnly && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                  {mobileMoneyAccounts.map(account => (
                    <tr key={account.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {account.account_name}
                          {account.is_primary && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                              Principal
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">{account.phone_number}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img 
                            src={MOBILE_MONEY_PROVIDERS.find(p => p.name === account.provider)?.logo} 
                            alt={account.provider}
                            className="h-6 w-6 object-contain"
                          />
                          <span>{account.provider}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {account.purpose === 'general' && 'Général'}
                        {account.purpose === 'disbursement' && 'Décaissements'}
                        {account.purpose === 'collection' && 'Recouvrements'}
                        {account.purpose === 'investment' && 'Investissement'}
                        {account.purpose === 'escrow' && 'Séquestre'}
                        {account.purpose === 'reserve' && 'Réserve'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {account.is_active ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            Actif
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                            Inactif
                          </span>
                        )}
                      </td>
                      {!readOnly && (
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <Button
                            onClick={() => handleEditMobileMoney(account)}
                            variant="ghost"
                            size="sm"
                            className="mr-1"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => onDeleteMobileMoney(account.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
