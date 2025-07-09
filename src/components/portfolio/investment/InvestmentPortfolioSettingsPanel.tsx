import { useState } from 'react';
import type { InvestmentPortfolio } from '../../../types/investment-portfolio';
import { Button } from '../../ui/Button';
import { getPortfolioStatusLabel } from '../../../utils/portfolioStatus';

const riskProfiles = [
  { value: 'conservative', label: 'Conservateur' },
  { value: 'moderate', label: 'Modéré' },
  { value: 'aggressive', label: 'Agressif' },
];

const statusOptions = [
  { value: 'active', label: getPortfolioStatusLabel('active') },
  { value: 'inactive', label: getPortfolioStatusLabel('inactive') },
  { value: 'pending', label: getPortfolioStatusLabel('pending') },
  { value: 'archived', label: getPortfolioStatusLabel('archived') },
];

const sectorOptions = [
  'Agriculture', 'Industrie', 'Services', 'Technologie', 'Santé', 'Éducation', 'Immobilier', 'Énergie', 'Finance', 'Autre'
];

interface InvestmentPortfolioSettingsPanelProps {
  portfolio: InvestmentPortfolio;
  onSave: (data: Partial<InvestmentPortfolio>) => void;
}

export const InvestmentPortfolioSettingsPanel: React.FC<InvestmentPortfolioSettingsPanelProps> = ({ portfolio, onSave }) => {
  const [name, setName] = useState(portfolio.name);
  const [status, setStatus] = useState<InvestmentPortfolio['status']>(portfolio.status);
  const [targetAmount, setTargetAmount] = useState(portfolio.target_amount);
  const [targetReturn, setTargetReturn] = useState(portfolio.target_return);
  const [targetSectors, setTargetSectors] = useState<string[]>(portfolio.target_sectors || []);
  const [riskProfile, setRiskProfile] = useState<InvestmentPortfolio['risk_profile']>(portfolio.risk_profile);
  const [investmentStage, setInvestmentStage] = useState(portfolio.investment_stage || '');
  const [saving, setSaving] = useState(false);

  const handleSectorChange = (sector: string) => {
    setTargetSectors((prev) =>
      prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      const data: Partial<InvestmentPortfolio> = {
        name,
        status,
        target_amount: Number(targetAmount),
        target_return: Number(targetReturn),
        target_sectors: targetSectors,
        risk_profile: riskProfile,
        investment_stage: investmentStage,
      };
      onSave(data);
      setSaving(false);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8 space-y-6">
      <h2 className="text-xl font-semibold mb-2">Paramètres du portefeuille</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom du portefeuille</label>
          <input
            className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Statut</label>
          <select
            className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
            value={status}
            onChange={e => setStatus(e.target.value as InvestmentPortfolio['status'])}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Objectif de collecte (FCFA)</label>
          <input
            type="number"
            className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
            value={targetAmount}
            onChange={e => setTargetAmount(Number(e.target.value))}
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Objectif de rendement (%)</label>
          <input
            type="number"
            className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
            value={targetReturn}
            onChange={e => setTargetReturn(Number(e.target.value))}
            min={0}
            step={0.01}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Secteurs visés</label>
          <div className="flex flex-wrap gap-2">
            {sectorOptions.map(sector => (
              <label key={sector} className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={targetSectors.includes(sector)}
                  onChange={() => handleSectorChange(sector)}
                />
                <span className="text-xs">{sector}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Profil de risque</label>
          <select
            className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
            value={riskProfile}
            onChange={e => setRiskProfile(e.target.value as InvestmentPortfolio['risk_profile'])}
          >
            {riskProfiles.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Étape d'investissement</label>
          <input
            className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
            value={investmentStage}
            onChange={e => setInvestmentStage(e.target.value)}
            placeholder="ex: Amorçage, Croissance, Maturité"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
      </div>
    </form>
  );
};
