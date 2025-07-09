import { useState } from 'react';
import { Button } from '../../ui/Button';
import { getPortfolioStatusLabel } from '../../../utils/portfolioStatus';
import type { InvestmentPortfolio } from '../../../types/investment-portfolio';
import { ConfirmModal } from '../../ui/ConfirmModal';

interface InvestmentPortfolioSettingsDisplayProps {
  portfolio: InvestmentPortfolio;
  onEdit: () => void;
  onDelete: () => void;
}

export function InvestmentPortfolioSettingsDisplay({ portfolio, onEdit, onDelete }: InvestmentPortfolioSettingsDisplayProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
          <h3 className="text-lg font-bold text-primary mb-2">Informations générales</h3>
          <div className="flex flex-col gap-1 text-base text-gray-800 dark:text-gray-100">
            <div><span className="font-semibold">Nom :</span> {portfolio.name}</div>
            <div>
              <span className="font-semibold">Statut :</span> 
              <span className="ml-1">{getPortfolioStatusLabel(portfolio.status)}</span>
            </div>
            <div><span className="font-semibold">Profil de risque :</span> {portfolio.risk_profile}</div>
            <div><span className="font-semibold">Étape d'investissement :</span> {portfolio.investment_stage ? portfolio.investment_stage : <span className="italic text-gray-400">Non renseignée</span>}</div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
          <h3 className="text-lg font-bold text-primary mb-2">Objectifs</h3>
          <div className="flex flex-col gap-1 text-base text-gray-800 dark:text-gray-100">
            <div><span className="font-semibold">Objectif de collecte :</span> {portfolio.target_amount?.toLocaleString()} FCFA</div>
            <div><span className="font-semibold">Objectif de rendement :</span> {portfolio.target_return}%</div>
            <div><span className="font-semibold">Secteurs visés :</span> {portfolio.target_sectors?.length ? portfolio.target_sectors.join(', ') : <span className="italic text-gray-400">Aucun</span>}</div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="primary" onClick={onEdit} className="px-6 py-2 rounded-lg shadow hover:bg-primary-dark transition">Éditer les paramètres</Button>
      </div>
      {/* Card suppression */}
      <div className="rounded-lg bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 p-6 mt-6 flex flex-col gap-2">
        <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-2">Supprimer ce portefeuille</h3>
        <p className="text-red-700 dark:text-red-300">Cette action supprimera définitivement ce portefeuille et toutes ses données. Cette opération est irréversible.</p>
        <div className="flex justify-end">
          <Button variant="danger" onClick={() => setShowConfirm(true)} className="px-6 py-2 rounded-lg hover:bg-red-700 transition">Supprimer définitivement</Button>
        </div>
      </div>
      <ConfirmModal
        open={showConfirm}
        title="Supprimer définitivement le portefeuille ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement le portefeuille "${portfolio.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={() => { setShowConfirm(false); onDelete(); }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
