
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { PortfolioMetrics } from '../components/portfolio/PortfolioMetrics';
import { usePortfolio } from '../hooks/usePortfolio';
import { Tabs, TabsContent } from '../components/ui/Tabs';
import { TabsOverflow } from '../components/ui/TabsOverflow';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { AssetsTable } from '../components/portfolio/investment/AssetsTable';
import { SubscriptionsTable } from '../components/portfolio/investment/SubscriptionsTable';
import { ValuationsTable } from '../components/portfolio/investment/ValuationsTable';
import { ReportingTable } from '../components/portfolio/investment/ReportingTable';
import { InvestmentPortfolioSettingsDisplay } from '../components/portfolio/investment/InvestmentPortfolioSettingsDisplay';
import { InvestmentPortfolioSettingsEditModal } from '../components/portfolio/investment/InvestmentPortfolioSettingsEditModal';


import { usePortfolioType } from '../hooks/usePortfolioType';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { portfolioTypeConfig } from '../config/portfolioTypes';
import type { InvestmentPortfolio } from '../types/investment-portfolio';

export default function InvestmentPortfolioDetails() {


  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  let portfolioType = usePortfolioType();
  if (!portfolioType) portfolioType = 'investment';
  const { portfolio, loading } = usePortfolio(id || '', portfolioType);
  const [tab, setTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Gestion harmonisée des erreurs et du chargement (comme la page traditionnelle)
  if (!id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">ID de portefeuille manquant</h2>
        <Button
          variant="outline"
          onClick={() => navigate(`/app/${portfolioType}`)}
          className="mt-4"
        >
          Retour au dashboard
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-label="Chargement..." />
      </div>
    );
  }


  if (!portfolio && !loading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">Portefeuille introuvable</h2>
        <p className="text-gray-500 mt-2">Aucun portefeuille avec l'ID <span className="font-mono bg-gray-100 px-2 py-1 rounded">{id}</span> n'a été trouvé dans la base de données.</p>
        <div className="flex flex-col items-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/app/${portfolioType}`)}
          >
            Retour à la liste
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              localStorage.removeItem('mockDataInitialized');
              window.location.reload();
            }}
          >
            Réinitialiser les données mock
          </Button>
        </div>
      </div>
    );
  }


  // Ne pas afficher cette page si le portefeuille n'est pas de type investment
  if (!portfolio || portfolio.type !== 'investment') {
    navigate(`/app/${portfolioType}`, { replace: true });
    return null;
  }

  // Config dynamique selon le type de portefeuille (sécurise l'affichage des tabs)
  const config = portfolioTypeConfig[portfolioType] || portfolioTypeConfig['investment'];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: `/app/${portfolioType}` },
          { label: portfolio?.name || 'Portefeuille', href: `/app/${portfolioType}/${portfolioType}/${id}` },
        ]}
        portfolioType={portfolioType}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{portfolio.name}</h1>
      </div>
      {/* Onglet Aperçu */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsOverflow
          tabs={config.tabs.map((tab: { key: string; label: string }) => ({ key: tab.key, label: tab.label }))}
          value={tab}
          onValueChange={setTab}
        />
        <TabsContent value="overview" currentValue={tab}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4">Détails du portefeuille</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Montant cible</p>
                    <p className="font-medium">{portfolio.target_amount.toLocaleString()} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rendement cible</p>
                    <p className="font-medium">{portfolio.target_return}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Profil de risque</p>
                    <p className="font-medium capitalize">{portfolio.risk_profile}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Secteurs cibles</p>
                    <div className="flex flex-wrap gap-2">
                      {portfolio.target_sectors.map((sector: string) => (
                        <span key={sector} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {sector}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <PortfolioMetrics portfolio={portfolio} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="assets" currentValue={tab}>
          <AssetsTable
            assets={portfolio.type === 'investment' && Array.isArray((portfolio as InvestmentPortfolio).assets) ? (portfolio as InvestmentPortfolio).assets : []}
            loading={loading}
          />
        </TabsContent>
        <TabsContent value="subscriptions" currentValue={tab}>
          <SubscriptionsTable
            subscriptions={portfolio.type === 'investment' && Array.isArray((portfolio as InvestmentPortfolio).subscriptions) ? (portfolio as InvestmentPortfolio).subscriptions! : []}
            loading={loading}
          />
        </TabsContent>
        <TabsContent value="valuations" currentValue={tab}>
          <ValuationsTable
            valuations={portfolio.type === 'investment' && Array.isArray((portfolio as InvestmentPortfolio).valuations) ? (portfolio as InvestmentPortfolio).valuations! : []}
            loading={loading}
          />
        </TabsContent>
        <TabsContent value="reporting" currentValue={tab}>
          <ReportingTable loading={loading} />
        </TabsContent>
        <TabsContent value="settings" currentValue={tab}>
          <InvestmentPortfolioSettingsDisplay
            portfolio={portfolio as InvestmentPortfolio}
            onEdit={() => setShowEditModal(true)}
            onDelete={() => {/* TODO: brancher la suppression réelle ici */}}
          />
          <InvestmentPortfolioSettingsEditModal
            open={showEditModal}
            portfolio={portfolio as InvestmentPortfolio}
            onSave={() => setShowEditModal(false)}
            onClose={() => setShowEditModal(false)}
          />
        </TabsContent>
      </Tabs>
      {/* Confirm delete modal for investment request (à déplacer si besoin) */}
      <ConfirmModal
        open={!!confirmDeleteId}
        title="Confirmation"
        message="Supprimer cette demande ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={async () => {
          if (confirmDeleteId) {
            setConfirmDeleteId(null);
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
