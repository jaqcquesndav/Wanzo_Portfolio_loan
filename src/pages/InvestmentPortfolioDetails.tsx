
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
import type { InvestmentPortfolio } from '../types/investment-portfolio';
import { usePortfolioType } from '../hooks/usePortfolioType';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export default function InvestmentPortfolioDetails() {


  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  let portfolioType = usePortfolioType();
  if (!portfolioType) portfolioType = 'investment';
  const { portfolio, loading } = usePortfolio(id || '', portfolioType);
  const [tab, setTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Portefeuille non trouvé</h2>
        <Button
          variant="outline"
          onClick={() => navigate(`/app/${portfolioType}/portfolios/investment`)}
          className="mt-4"
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: `/app/${portfolioType}` },
          { label: portfolio?.name || 'Portefeuille', href: `/app/${portfolioType}/${id}` },
        ]}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{portfolio.name}</h1>
      </div>
      {/* Onglet Aperçu */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsOverflow
          tabs={[
            { key: 'overview', label: 'Aperçu' },
            { key: 'assets', label: 'Actifs' },
            { key: 'subscriptions', label: 'Souscriptions' },
            { key: 'valuations', label: 'Valorisation' },
            { key: 'reporting', label: 'Reporting' },
            { key: 'settings', label: 'Paramètres' },
          ]}
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
          <AssetsTable assets={portfolio.type === 'investment' ? (portfolio as InvestmentPortfolio).assets : []} />
        </TabsContent>
        <TabsContent value="subscriptions" currentValue={tab}>
          <SubscriptionsTable subscriptions={portfolio.type === 'investment' && Array.isArray((portfolio as InvestmentPortfolio).subscriptions) ? (portfolio as InvestmentPortfolio).subscriptions! : []} />
        </TabsContent>
        <TabsContent value="valuations" currentValue={tab}>
          <ValuationsTable valuations={portfolio.type === 'investment' && Array.isArray((portfolio as InvestmentPortfolio).valuations) ? (portfolio as InvestmentPortfolio).valuations! : []} />
        </TabsContent>
        <TabsContent value="reporting" currentValue={tab}>
          <ReportingTable />
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
