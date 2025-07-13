import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';
import { ConfirmModal } from '../../ui/ConfirmModal';
import { BankAccountsPanel } from '../shared/BankAccountsPanel';
import { PortfolioManagementPanel } from '../shared/PortfolioManagementPanel';
import { ExportPortfolioData } from '../shared/ExportPortfolioData';
import type { Portfolio } from '../../../types/portfolio';
import { getPortfolioStatusLabel } from '../../../utils/portfolioStatus';

interface PortfolioSettingsDisplayProps {
  portfolio: Portfolio;
  onEdit: () => void;
  onDelete: () => void;
}

export function PortfolioSettingsDisplay({ portfolio, onEdit, onDelete }: PortfolioSettingsDisplayProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const handleExport = (format: string, dataType: string) => {
    console.log(`Exporting portfolio data in ${format} format, data type: ${dataType}`);
    // Implement actual export functionality here
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Paramètres du portefeuille</h2>
        <div className="flex gap-3">
          <ExportPortfolioData portfolio={portfolio} onExport={handleExport} />
          <Button variant="primary" onClick={onEdit}>
            Éditer les paramètres
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general" currentValue={activeTab} onValueChange={setActiveTab}>Général</TabsTrigger>
          <TabsTrigger value="accounts" currentValue={activeTab} onValueChange={setActiveTab}>Comptes bancaires</TabsTrigger>
          <TabsTrigger value="management" currentValue={activeTab} onValueChange={setActiveTab}>Gestion</TabsTrigger>
        </TabsList>

        <TabsContent value="general" currentValue={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-primary mb-2">Informations générales</h3>
              <div className="flex flex-col gap-1 text-base text-gray-800 dark:text-gray-100">
                <div><span className="font-semibold">Nom :</span> {portfolio.name}</div>
                {'description' in portfolio && (
                  <div><span className="font-semibold">Description :</span> {portfolio.description ? String(portfolio.description) : <span className="italic text-gray-400">Aucune</span>}</div>
                )}
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
          
          {/* Card suppression */}
          <div className="rounded-lg bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 p-6 mt-6 flex flex-col gap-2">
            <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-2">Supprimer ce portefeuille</h3>
            <p className="text-red-700 dark:text-red-300">Cette action supprimera définitivement ce portefeuille et toutes ses données. Cette opération est irréversible.</p>
            <div className="flex justify-end">
              <Button variant="danger" onClick={() => setShowConfirm(true)}>
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="accounts" currentValue={activeTab}>
          <BankAccountsPanel
            accounts={portfolio.bank_accounts || []}
            onAdd={() => onEdit()} // Redirect to edit mode to add accounts
            onEdit={() => onEdit()} // Redirect to edit mode to edit accounts
            onDelete={() => onEdit()} // Redirect to edit mode to delete accounts
            readOnly={true}
          />
        </TabsContent>

        <TabsContent value="management" currentValue={activeTab}>
          <PortfolioManagementPanel
            portfolio={portfolio}
            onUpdate={() => onEdit()} // Redirect to edit mode
            readOnly={true}
          />
        </TabsContent>
      </Tabs>
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
