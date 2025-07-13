import React, { useState } from 'react';
// Import individual icons to avoid path issues
import { PlusIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';
import { PencilIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import type { BankAccount } from '../../../types/bankAccount';

interface BankAccountsPanelProps {
  accounts: BankAccount[];
  onAdd: (account: BankAccount) => void;
  onEdit: (account: BankAccount) => void;
  onDelete: (accountId: string) => void;
  readOnly?: boolean;
}

export function BankAccountsPanel({ 
  accounts = [], 
  onAdd, 
  onEdit, 
  onDelete, 
  readOnly = false 
}: BankAccountsPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<BankAccount>>({
    account_number: '',
    account_name: '',
    bank_name: '',
    branch: '',
    swift_code: '',
    iban: '',
    currency: 'XOF',
    is_primary: false,
    is_active: true,
    purpose: 'general'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAccount = {
      ...formData,
      id: editingId || `account-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as BankAccount;
    
    if (editingId) {
      onEdit(newAccount);
      setEditingId(null);
    } else {
      onAdd(newAccount);
      setShowAddForm(false);
    }
    
    // Reset form
    setFormData({
      account_number: '',
      account_name: '',
      bank_name: '',
      branch: '',
      swift_code: '',
      iban: '',
      currency: 'XOF',
      is_primary: false,
      is_active: true,
      purpose: 'general'
    });
  };

  const handleEdit = (account: BankAccount) => {
    setFormData(account);
    setEditingId(account.id);
    setShowAddForm(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Comptes bancaires</h3>
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
          <h4 className="font-medium mb-3">{editingId ? 'Modifier le compte' : 'Nouveau compte bancaire'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom du compte</label>
              <input
                name="account_name"
                value={formData.account_name}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Numéro de compte</label>
              <input
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom de la banque</label>
              <input
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Branche/Agence</label>
              <input
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code SWIFT/BIC</label>
              <input
                name="swift_code"
                value={formData.swift_code}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IBAN</label>
              <input
                name="iban"
                value={formData.iban}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Devise</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              >
                <option value="XOF">XOF</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Objectif</label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
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
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_primary"
                name="is_primary"
                checked={!!formData.is_primary}
                onChange={handleChange}
                className="mr-2 h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="is_primary" className="text-sm">Compte principal</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={!!formData.is_active}
                onChange={handleChange}
                className="mr-2 h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="is_active" className="text-sm">Compte actif</label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => {
              setShowAddForm(false);
              setEditingId(null);
              setFormData({
                account_number: '',
                account_name: '',
                bank_name: '',
                branch: '',
                swift_code: '',
                iban: '',
                currency: 'XOF',
                is_primary: false,
                is_active: true,
                purpose: 'general'
              });
            }}>
              Annuler
            </Button>
            <Button type="submit">
              {editingId ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </div>
        </form>
      )}
      
      {accounts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun compte bancaire enregistré</p>            {!readOnly && (
            <Button onClick={() => setShowAddForm(true)} variant="secondary" size="sm" className="mt-2">
              Ajouter un compte maintenant
            </Button>
          )}
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
              {accounts.map(account => (
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
                  <td className="px-4 py-3 whitespace-nowrap">{account.account_number}</td>
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
                        onClick={() => handleEdit(account)}
                        variant="ghost"
                        size="sm"
                        className="mr-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => onDelete(account.id)}
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
  );
}
