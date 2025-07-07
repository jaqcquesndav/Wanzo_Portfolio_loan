import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PortfolioMetrics } from '../components/portfolio/PortfolioMetrics';
import { usePortfolio } from '../hooks/usePortfolio';
import { Tabs, TabsContent } from '../components/ui/Tabs';
import { TabsOverflow } from '../components/ui/TabsOverflow';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { PortfolioCompanyReportsTable } from '../components/portfolio/investment/PortfolioCompanyReportsTable';
import { InvestmentRequestsTable } from '../components/portfolio/investment/InvestmentRequestsTable';
import { usePortfolioCompanyReports } from '../hooks/usePortfolioCompanyReports';
import { useInvestmentRequests } from '../hooks/useInvestmentRequests';
import { PortfolioType } from '../lib/indexedDbPortfolioService';
import { mockInvestmentPortfolios } from '../data/mockPortfolios';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export default function InvestmentPortfolioDetails() {
  const { id, portfolioType = 'investment' } = useParams();
  const navigate = useNavigate();
  // Par défaut, on affiche l'onglet "assets" (premier tab métier investment)
  const [tab, setTab] = React.useState('assets');
  // Gestion des assets (ajout dynamiquement comme dans traditionnel)
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  // Seed automatique des mocks si la base est vide (aligné avec traditionnel)
  useEffect(() => {
    if (!id) return;
    import('../lib/indexedDbPortfolioService').then(({ indexedDbPortfolioService }) => {
      indexedDbPortfolioService.getPortfolio(id).then((existing) => {
        if (!existing) {
          // On seed uniquement si l'ID correspond à notre mock pro (conforme financial data engineering)
          const mock = mockInvestmentPortfolios.find(p => p.id === 'INVEST-2024-CI-001');
          if (mock && id === 'INVEST-2024-CI-001') {
            indexedDbPortfolioService.addOrUpdatePortfolio({ ...mock });
          }
        }
      });
    });
  }, [id]);
  const { portfolio, loading, addOrUpdate } = usePortfolio(id, portfolioType as PortfolioType);
  // Hooks métier investment
  const { reports, loading: loadingReports } = usePortfolioCompanyReports(id);
  const { requests, loading: loadingRequests, addRequest, updateRequest, deleteRequest } = useInvestmentRequests(id);
  // State pour la modale d'ajout de demande d'investissement
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<null | import('../types/investment-portfolio').InvestmentRequest>(null);
  const [requestForm, setRequestForm] = useState({
    companyId: '',
    stage: 'amorcage',
    amountRequested: 0,
    status: 'en instruction',
  });
  const [saving, setSaving] = useState(false);
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
      <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsOverflow
        tabs={[
          { key: 'assets', label: 'Actifs' },
          { key: 'subscriptions', label: 'Souscriptions' },
          { key: 'valuations', label: 'Valorisation' },
          { key: 'reporting', label: 'Reporting' },
          { key: 'settings', label: 'Paramètres' },
        ]}
        value={tab}
        onValueChange={setTab}
      />
      {/* Onglet Actifs (tableau des assets du portefeuille) */}
      <TabsContent value="assets" currentValue={tab}>
        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={() => setShowAssetForm(true)} aria-label="Ajouter un actif">Nouvel actif</Button>
        </div>
        {('assets' in portfolio) && Array.isArray((portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio).assets)
          ? <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    <th className="px-4 py-2 text-left">Nom de l'actif</th>
                    <th className="px-4 py-2 text-left">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {(portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio).assets.length > 0 ? (
                    (portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio).assets.map(asset => (
                      <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <td className="px-4 py-2">{asset.name}</td>
                        <td className="px-4 py-2">{asset.id}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="text-center py-8 text-gray-400">Aucun actif à afficher</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          : <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    <th className="px-4 py-2 text-left">Nom de l'actif</th>
                    <th className="px-4 py-2 text-left">ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={2} className="text-center py-8 text-gray-400">Aucun actif à afficher</td>
                  </tr>
                </tbody>
              </table>
            </div>
        }

        {/* Modal d'ajout d'actif */}
        {showAssetForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Ajouter un actif">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b dark:border-gray-700">
                <h2 className="text-xl font-semibold">Nouvel actif</h2>
              </div>
              <form className="p-6" onSubmit={async (e) => {
                e.preventDefault();
                if (!newAssetName.trim()) return;
                const assets = ('assets' in portfolio && Array.isArray((portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio).assets))
                  ? [...(portfolio as import('../lib/indexedDbPortfolioService').InvestmentPortfolio).assets]
                  : [];
                const newAsset = { id: crypto.randomUUID(), name: newAssetName.trim() };
                await addOrUpdate({ assets: [...assets, newAsset] });
                setShowAssetForm(false);
                setNewAssetName('');
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Nom de l'actif</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={newAssetName}
                    onChange={e => setNewAssetName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAssetForm(false)}>Annuler</Button>
                  <Button type="submit">Ajouter</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </TabsContent>
      {/* Onglet Souscriptions (Investment Requests) */}
      <TabsContent value="subscriptions" currentValue={tab}>
        <div className="mb-4 flex justify-end">
          <Button size="sm" onClick={() => {
            setEditingRequest(null);
            setRequestForm({ companyId: '', stage: 'amorcage', amountRequested: 0, status: 'en instruction' });
            setShowRequestModal(true);
          }} aria-label="Nouvelle demande">Nouvelle demande</Button>
        </div>
        <div>
          <InvestmentRequestsTable
            requests={Array.isArray(requests) ? requests : []}
            loading={loadingRequests}
            onView={(entityId: string) => navigate(`/app/portfolio/${id}/requests/${entityId}`)}
            onDelete={async (requestId: string) => {
              setConfirmDeleteId(requestId);
            }}
            onEdit={(req) => {
              setEditingRequest(req);
              setRequestForm({
                companyId: req.companyId,
                stage: req.stage,
                amountRequested: req.amountRequested,
                status: req.status,
              });
              setShowRequestModal(true);
            }}
          />
        </div>
        {/* Modal d'ajout de demande d'investissement */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label={editingRequest ? 'Éditer une demande' : 'Nouvelle demande'}>
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b dark:border-gray-700">
                <h2 className="text-xl font-semibold">{editingRequest ? "Éditer la demande d'investissement" : "Nouvelle demande d'investissement"}</h2>
              </div>
              <form className="p-6" onSubmit={async (e) => {
                e.preventDefault();
                if (!requestForm.companyId.trim() || !requestForm.amountRequested) return;
                setSaving(true);
                if (editingRequest) {
                  await updateRequest({
                    ...editingRequest,
                    companyId: requestForm.companyId.trim(),
                    stage: requestForm.stage as import('../types/investment-portfolio').InvestmentStage,
                    amountRequested: Number(requestForm.amountRequested),
                    status: requestForm.status as import('../types/investment-portfolio').InvestmentRequestStatus,
                    updated_at: new Date().toISOString(),
                  });
                } else {
                  await addRequest({
                    id: 'INVEST-REQ-' + Date.now(),
                    portfolioId: id!,
                    companyId: requestForm.companyId.trim(),
                    stage: requestForm.stage as import('../types/investment-portfolio').InvestmentStage,
                    amountRequested: Number(requestForm.amountRequested),
                    status: requestForm.status as import('../types/investment-portfolio').InvestmentRequestStatus,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  });
                }
                setShowRequestModal(false);
                setEditingRequest(null);
                setRequestForm({ companyId: '', stage: 'amorcage', amountRequested: 0, status: 'en instruction' });
                setSaving(false);
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Entreprise</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={requestForm.companyId}
                    onChange={e => setRequestForm(r => ({ ...r, companyId: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Stade</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={requestForm.stage}
                    onChange={e => setRequestForm(r => ({ ...r, stage: e.target.value }))}
                  >
                    <option value="amorcage">Amorçage</option>
                    <option value="developpement">Développement</option>
                    <option value="transmission">Transmission</option>
                    <option value="reprise">Reprise</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Montant demandé</label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={requestForm.amountRequested}
                    onChange={e => setRequestForm(r => ({ ...r, amountRequested: Number(e.target.value) }))}
                    min={1}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Statut</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={requestForm.status}
                    onChange={e => setRequestForm(r => ({ ...r, status: e.target.value }))}
                  >
                    <option value="en instruction">En instruction</option>
                    <option value="acceptée">Acceptée</option>
                    <option value="refusée">Refusée</option>
                    <option value="abandonnée">Abandonnée</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setShowRequestModal(false); setEditingRequest(null); }} disabled={saving}>Annuler</Button>
                  <Button type="submit" disabled={saving}>{saving ? (editingRequest ? 'Enregistrement...' : 'Ajout...') : (editingRequest ? 'Enregistrer' : 'Ajouter')}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </TabsContent>
      {/* Onglet Valorisation (toujours entêtes visibles) */}
      <TabsContent value="valuations" currentValue={tab}>
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Valeur</th>
                <th className="px-4 py-2 text-left">Commentaire</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-400">Aucune valorisation à afficher</td>
              </tr>
            </tbody>
          </table>
        </div>
      </TabsContent>
      {/* Onglet Reporting (tableau des reportings) */}
      <TabsContent value="reporting" currentValue={tab}>
        <PortfolioCompanyReportsTable
          reports={reports}
          loading={loadingReports}
          onView={entityId => navigate(`/app/portfolio/${id}/company-reports/${entityId}`)}
        />
      </TabsContent>
      {/* Onglet Paramètres (toujours entêtes visibles) */}
      <TabsContent value="settings" currentValue={tab}>
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                <th className="px-4 py-2 text-left">Clé</th>
                <th className="px-4 py-2 text-left">Valeur</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={2} className="text-center py-8 text-gray-400">Aucun paramètre à afficher</td>
              </tr>
            </tbody>
          </table>
        </div>
      </TabsContent>
      </Tabs>

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

      {/* Confirm delete modal for investment request */}
      <ConfirmModal
        open={!!confirmDeleteId}
        title="Confirmation"
        message="Supprimer cette demande ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={async () => {
          if (confirmDeleteId) {
            await deleteRequest(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
