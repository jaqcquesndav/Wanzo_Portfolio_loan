import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';
import { getPortfolioStatusLabel } from '../../../utils/portfolioStatus';
import type { InvestmentPortfolio } from '../../../types/investment-portfolio';
import { ConfirmModal } from '../../ui/ConfirmModal';
import { BankAccountsDisplay } from '../../portfolio/shared/BankAccountsDisplay';
import { PortfolioManagementDisplay } from '../../portfolio/shared/PortfolioManagementDisplay';
import { PortfolioDocumentsSection } from '../../portfolio/shared/PortfolioDocumentsSection';

interface InvestmentPortfolioSettingsDisplayProps {
  portfolio: InvestmentPortfolio;
  onEdit: () => void;
  onDelete: () => void;
}

export function InvestmentPortfolioSettingsDisplay({ portfolio, onEdit, onDelete }: InvestmentPortfolioSettingsDisplayProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentTab, setCurrentTab] = useState('general');
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">Paramètres du portefeuille</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            Modifier
          </Button>
          <Button variant="destructive" onClick={() => setShowConfirm(true)}>
            Supprimer
          </Button>
        </div>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general" currentValue={currentTab} onValueChange={setCurrentTab}>
            Général
          </TabsTrigger>
          <TabsTrigger value="accounts" currentValue={currentTab} onValueChange={setCurrentTab}>
            Comptes bancaires
          </TabsTrigger>
          <TabsTrigger value="management" currentValue={currentTab} onValueChange={setCurrentTab}>
            Gestion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" currentValue={currentTab}>
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
            
            {/* Section des documents */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <PortfolioDocumentsSection portfolioId={portfolio.id} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="accounts" currentValue={currentTab}>
          <BankAccountsDisplay accounts={portfolio.bank_accounts || []} />
        </TabsContent>

        <TabsContent value="management" currentValue={currentTab}>
          <PortfolioManagementDisplay portfolio={portfolio} />
        </TabsContent>
      </Tabs>

      <ConfirmModal 
        open={showConfirm}
        title="Supprimer le portefeuille"
        message="Êtes-vous sûr de vouloir supprimer ce portefeuille ? Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={() => {
          onDelete();
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
