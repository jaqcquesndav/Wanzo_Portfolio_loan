import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
// import { InvestmentPortfolioSettingsPanel } from '../components/portfolio/investment/InvestmentPortfolioSettingsPanel';
import { InvestmentPortfolioSettingsEditModal } from '../components/portfolio/investment/InvestmentPortfolioSettingsEditModal';
import type { InvestmentPortfolio } from '../types/investment-portfolio';
// Removed unused hooks
import { PortfolioType } from '../lib/indexedDbPortfolioService';
import { mockInvestmentPortfolios } from '../data/mockInvestmentPortfolios';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export default function InvestmentPortfolioDetails() {
  const { id, portfolioType = 'investment' } = useParams();
  const navigate = useNavigate();
  // Par défaut, on affiche l'onglet "assets" (premier tab métier investment)
  const [tab, setTab] = React.useState('assets');
  const [showEditModal, setShowEditModal] = useState(false);
  // Gestion des assets (ajout dynamiquement comme dans traditionnel)
  // Removed unused asset form state
  // Seed automatique des mocks si la base est vide (aligné avec traditionnel)
  useEffect(() => {
    if (!id) return;
    import('../lib/indexedDbPortfolioService').then(({ seedMockInvestmentPortfoliosIfNeeded, indexedDbPortfolioService }) => {
      // Toujours seed les mocks si besoin (comme pour traditional)
      seedMockInvestmentPortfoliosIfNeeded().then(() => {
        indexedDbPortfolioService.getPortfolio(id).then((existing) => {
          // Si le mock existe et diffère, on le met à jour (dev only)
          const mock = mockInvestmentPortfolios.find(p => p.id === id);
          if (mock && (!existing || JSON.stringify(existing) !== JSON.stringify(mock))) {
            indexedDbPortfolioService.addOrUpdatePortfolio({ ...mock });
          }
        });
      });
    });
  }, [id]);
  const { portfolio, loading } = usePortfolio(id, portfolioType as PortfolioType);
  // Hooks métier investment
  // Removed unused hooks for company reports and investment requests
  // State pour la modale d'ajout de demande d'investissement
  // Removed unused state for investment request modal
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
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/app/dashboard' },
        { label: 'Capital Investissement', href: `/app/portfolio/${id}` }
      ]} />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/app/${portfolioType}/portfolios/investment`)}
            icon={<ArrowLeft className="h-5 w-5" />} 
          >
            Retour
          </Button>
          <h1 className="text-2xl font-semibold">{portfolio.name}</h1>
        </div>
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
                      {portfolio.target_sectors.map((sector) => (
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
