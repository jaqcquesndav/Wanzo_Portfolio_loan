import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';
import { BankAccountsPanel } from '../shared/BankAccountsPanel';
import { PortfolioManagementPanel } from '../shared/PortfolioManagementPanel';
import type { Portfolio } from '../../../types/portfolio';
import type { BankAccount } from '../../../types/bankAccount';

interface PortfolioSettingsEditModalProps {
  open: boolean;
  portfolio: Portfolio;
  onSave: (data: Partial<Portfolio>) => void;
  onClose: () => void;
}

export function PortfolioSettingsEditModal({ open, portfolio, onSave, onClose }: PortfolioSettingsEditModalProps) {
  const [form, setForm] = useState({
    name: portfolio.name,
    description: 'description' in portfolio ? portfolio.description || '' : '',
    target_amount: portfolio.target_amount,
    target_return: portfolio.target_return,
    target_sectors: portfolio.target_sectors || [],
    risk_profile: portfolio.risk_profile,
    investment_stage: portfolio.investment_stage || '',
    status: portfolio.status,
    bank_accounts: portfolio.bank_accounts || [],
    manager: portfolio.manager || null,
    management_fees: portfolio.management_fees || null,
  });
  const [saving, setSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState('general');

  const handleChange = (field: keyof typeof form, value: string | number | string[] | BankAccount[] | Portfolio['manager'] | Portfolio['management_fees'] | null) => {
    setForm(f => ({ ...f, [field]: value }));
  };
  
  const handleBankAccountAdd = (account: BankAccount) => {
    setForm(f => ({
      ...f,
      bank_accounts: [...(f.bank_accounts || []), account]
    }));
  };
  
  const handleBankAccountEdit = (account: BankAccount) => {
    setForm(f => ({
      ...f,
      bank_accounts: (f.bank_accounts || []).map(acc => 
        acc.id === account.id ? account : acc
      )
    }));
  };
  
  const handleBankAccountDelete = (accountId: string) => {
    setForm(f => ({
      ...f,
      bank_accounts: (f.bank_accounts || []).filter(acc => acc.id !== accountId)
    }));
  };
  
  const handleManagementUpdate = (data: Partial<Portfolio>) => {
    setForm(f => ({
      ...f,
      ...data
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      // Convert null to undefined for manager and management_fees fields
      const formData = {
        ...form,
        manager: form.manager === null ? undefined : form.manager,
        management_fees: form.management_fees === null ? undefined : form.management_fees
      };
      onSave(formData);
      setSaving(false);
      onClose();
    }, 800);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl p-6 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-primary">Éditer les paramètres du portefeuille</h2>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general" currentValue={currentTab} onValueChange={setCurrentTab}>Général</TabsTrigger>
            <TabsTrigger value="accounts" currentValue={currentTab} onValueChange={setCurrentTab}>Comptes bancaires</TabsTrigger>
            <TabsTrigger value="management" currentValue={currentTab} onValueChange={setCurrentTab}>Gestion</TabsTrigger>
          </TabsList>

          <TabsContent value="general" currentValue={currentTab}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Bloc 1 : Informations de base */}
              <div>
                <h3 className="text-base font-semibold mb-2 text-primary">Informations de base</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Nom</label>
                    <input 
                      className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={form.name} 
                      onChange={e => handleChange('name', e.target.value)} 
                      required 
                    />
                  </div>
                  {'description' in portfolio && typeof form.description === 'string' && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <input 
                        className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" 
                        value={form.description} 
                        onChange={e => handleChange('description', e.target.value)} 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-dashed border-primary/30 my-2" />
              
              {/* Bloc 2 : Objectifs */}
              <div>
                <h3 className="text-base font-semibold mb-2 text-primary">Objectifs</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Objectif de collecte (FCFA)</label>
                    <input 
                      type="number" 
                      className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={form.target_amount} 
                      onChange={e => handleChange('target_amount', Number(e.target.value))} 
                      min={0} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Objectif de rendement (%)</label>
                    <input 
                      type="number" 
                      className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={form.target_return} 
                      onChange={e => handleChange('target_return', Number(e.target.value))} 
                      min={0} 
                      step={0.01} 
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Secteurs visés</label>
                  <input 
                    className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" 
                    value={form.target_sectors.join(', ')} 
                    onChange={e => handleChange('target_sectors', e.target.value.split(',').map((s: string) => s.trim()))} 
                    placeholder="Séparez par des virgules" 
                  />
                </div>
              </div>
              
              <div className="border-t border-dashed border-primary/30 my-2" />
              
              {/* Bloc 3 : Compléments */}
              <div>
                <h3 className="text-base font-semibold mb-2 text-primary">Compléments</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Profil de risque</label>
                    <select
                      className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={form.risk_profile}
                      onChange={e => handleChange('risk_profile', e.target.value)}
                    >
                      <option value="conservative">Conservateur</option>
                      <option value="moderate">Modéré</option>
                      <option value="aggressive">Agressif</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Étape d'investissement</label>
                    <input 
                      className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={form.investment_stage} 
                      onChange={e => handleChange('investment_stage', e.target.value)} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Statut</label>
                    <select 
                      className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={form.status} 
                      onChange={e => handleChange('status', e.target.value)}
                    >
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                      <option value="pending">En attente</option>
                      <option value="archived">Archivé</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 mt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
                <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="accounts" currentValue={currentTab}>
            <BankAccountsPanel
              accounts={form.bank_accounts || []}
              onAdd={handleBankAccountAdd}
              onEdit={handleBankAccountEdit}
              onDelete={handleBankAccountDelete}
            />
            
            <div className="flex justify-end gap-2 pt-4 mt-6">
              <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
              <Button 
                type="button" 
                variant="primary" 
                disabled={saving}
                onClick={handleSubmit}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="management" currentValue={currentTab}>
            <PortfolioManagementPanel
              portfolio={form as unknown as Portfolio}
              onUpdate={handleManagementUpdate}
            />
            
            <div className="flex justify-end gap-2 pt-4 mt-6">
              <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
              <Button 
                type="button" 
                variant="primary" 
                disabled={saving}
                onClick={handleSubmit}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
