import React, { useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import type { Portfolio } from '../../../types/portfolio';

interface PortfolioManagerData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  department?: string;
}

interface ManagementFeesData {
  setup_fee?: number;
  annual_fee?: number;
  performance_fee?: number;
}

interface PortfolioManagementPanelProps {
  portfolio: Portfolio;
  onUpdate: (data: Partial<Portfolio>) => void;
  readOnly?: boolean;
}

export function PortfolioManagementPanel({ portfolio, onUpdate, readOnly = false }: PortfolioManagementPanelProps) {
  const [editing, setEditing] = useState(false);
  
  // Initialize with portfolio data or empty objects
  const [managerData, setManagerData] = useState<PortfolioManagerData>(
    portfolio.manager || {
      id: '',
      name: '',
      email: '',
      phone: '',
      role: '',
      department: ''
    }
  );
  
  const [feesData, setFeesData] = useState<ManagementFeesData>(
    portfolio.management_fees || {
      setup_fee: 0,
      annual_fee: 0,
      performance_fee: 0
    }
  );
  
  const handleManagerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setManagerData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFeesData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      manager: managerData,
      management_fees: feesData
    });
    setEditing(false);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Gestion du portefeuille</h3>
        {!readOnly && !editing && (
          <Button 
            onClick={() => setEditing(true)} 
            variant="ghost"
            size="sm"
          >
            <PencilIcon className="w-4 h-4 mr-1" />
            Modifier
          </Button>
        )}
      </div>
      
      {editing ? (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-primary">Gestionnaire du portefeuille</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom complet</label>
                <input
                  name="name"
                  value={managerData.name}
                  onChange={handleManagerChange}
                  className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={managerData.email}
                  onChange={handleManagerChange}
                  className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <input
                  name="phone"
                  value={managerData.phone || ''}
                  onChange={handleManagerChange}
                  className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rôle</label>
                <input
                  name="role"
                  value={managerData.role || ''}
                  onChange={handleManagerChange}
                  className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Département</label>
                <input
                  name="department"
                  value={managerData.department || ''}
                  onChange={handleManagerChange}
                  className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-primary">Frais de gestion</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Frais d'ouverture (%)</label>
                <input
                  type="number"
                  name="setup_fee"
                  value={feesData.setup_fee || 0}
                  onChange={handleFeesChange}
                  className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Frais annuels (%)</label>
                <input
                  type="number"
                  name="annual_fee"
                  value={feesData.annual_fee || 0}
                  onChange={handleFeesChange}
                  className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Frais de performance (%)</label>
                <input
                  type="number"
                  name="performance_fee"
                  value={feesData.performance_fee || 0}
                  onChange={handleFeesChange}
                  className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer
            </Button>
          </div>
        </form>
      ) : (
        <div>
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-primary">Gestionnaire du portefeuille</h4>
            {portfolio.manager ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</p>
                  <p className="mt-1">{portfolio.manager.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <p className="mt-1">{portfolio.manager.email}</p>
                </div>
                {portfolio.manager.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</p>
                    <p className="mt-1">{portfolio.manager.phone}</p>
                  </div>
                )}
                {portfolio.manager.role && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rôle</p>
                    <p className="mt-1">{portfolio.manager.role}</p>
                  </div>
                )}
                {portfolio.manager.department && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Département</p>
                    <p className="mt-1">{portfolio.manager.department}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucun gestionnaire assigné</p>
            )}
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-3 text-primary">Frais de gestion</h4>
            {portfolio.management_fees ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Frais d'ouverture</p>
                  <p className="mt-1">{portfolio.management_fees.setup_fee || 0}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Frais annuels</p>
                  <p className="mt-1">{portfolio.management_fees.annual_fee || 0}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Frais de performance</p>
                  <p className="mt-1">{portfolio.management_fees.performance_fee || 0}%</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucun frais défini</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
