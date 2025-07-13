
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Removed unused ArrowLeft and Button imports
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Tabs, TabsContent } from '../components/ui/Tabs';
import { TabsOverflow } from '../components/ui/TabsOverflow';
import { useLeasingPortfolio } from '../hooks/useLeasingPortfolio';

import { EquipmentsTable } from '../components/portfolio/leasing/EquipmentsTable';
import { ContractsTable } from '../components/portfolio/leasing/ContractsTable';
import { IncidentsTable } from '../components/portfolio/leasing/IncidentsTable';
import { MaintenanceTable } from '../components/portfolio/leasing/MaintenanceTable';
import { PaymentsTable } from '../components/portfolio/leasing/PaymentsTable';
import { LeasingPortfolioSettingsDisplay } from '../components/portfolio/leasing/LeasingPortfolioSettingsDisplay';
import { portfolioTypeConfig } from '../config/portfolioTypes';
import type { LeasingPortfolio } from '../types/leasing';


export default function LeasingPortfolioDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const portfolioType = 'leasing';
  // Utiliser toujours le type spécifique pour ce composant
  const { portfolio, loading } = useLeasingPortfolio(id || '');
  const config = portfolioTypeConfig[portfolioType];
  const [tab, setTab] = useState(config.tabs[0]?.key || 'equipments');

  // Log pour debug
  useEffect(() => {
    if (portfolio) {
      const leasingPortfolio = portfolio as unknown as LeasingPortfolio;
      console.log(`LeasingPortfolioDetails: Portfolio ${id} loaded:`, {
        name: portfolio.name,
        type: portfolio.type,
        hasEquipments: Array.isArray(leasingPortfolio.equipment_catalog) && leasingPortfolio.equipment_catalog.length > 0,
        hasContracts: Array.isArray(leasingPortfolio.contracts) && leasingPortfolio.contracts.length > 0,
        hasIncidents: Array.isArray(leasingPortfolio.incidents) && leasingPortfolio.incidents.length > 0,
        hasMaintenances: Array.isArray(leasingPortfolio.maintenances) && leasingPortfolio.maintenances.length > 0,
      });
    }
  }, [portfolio, id]);

  // Harmonized error/loading/guard logic (like InvestmentPortfolioDetails)
  if (!id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">ID de portefeuille manquant</h2>
        <button
          className="mt-4 px-4 py-2 border rounded border-gray-300 bg-white hover:bg-gray-50"
          onClick={() => navigate(`/app/${portfolioType}`)}
        >
          Retour au dashboard
        </button>
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
    navigate(`/app/${portfolioType}`, { replace: true });
    return null;
  }

  // Guard: only show if portfolio.type === 'leasing'
  if (!portfolio || portfolio.type !== 'leasing') {
    navigate(`/app/${portfolioType}`, { replace: true });
    return null;
  }

  // Dynamic config for tabs (supprimé, déjà défini plus haut)

  // Debug log to help diagnose tab/config issues
  // (removed unused eslint-disable-next-line no-console)
  // console.log('DEBUG LeasingPortfolioDetails:', {
  //   configTabs: config.tabs,
  //   tab,
  //   portfolio,
  //   tabsKeys: config.tabs.map(t => t.key),
  // });

  // Fallback UI if no tab matches
  const validTabKeys = config.tabs.map(t => t.key);
  const isTabValid = validTabKeys.includes(tab);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: `/app/${portfolioType}` },
          { label: portfolio?.name || 'Portefeuille', href: `/app/${portfolioType}/${id}` },
        ]}
        portfolioType={portfolioType}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{portfolio.name}</h1>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsOverflow
          tabs={config.tabs.map(({ key, label }) => ({ key, label }))}
          value={tab}
          onValueChange={setTab}
        />
        {!isTabValid && (
          <div className="text-center text-red-500 py-8">
            <p>Onglet inconnu ou non configuré : <b>{tab}</b></p>
            <p>Onglets valides : {validTabKeys.join(', ')}</p>
          </div>
        )}
        {/* Tab rendering, harmonized with config */}
        <TabsContent value="equipments" currentValue={tab}>
          <EquipmentsTable
            equipments={portfolio.type === 'leasing' ? (portfolio as unknown as LeasingPortfolio).equipment_catalog : []}
            onRowClick={(equipment) => {
              navigate(`/app/${portfolioType}/equipments/${equipment.id}`);
            }}
          />
        </TabsContent>
        <TabsContent value="contracts" currentValue={tab}>
          <ContractsTable
            contracts={portfolio.type === 'leasing' ? (portfolio as unknown as LeasingPortfolio).contracts : []}
            onRowClick={(contract) => {
              navigate(`/app/${portfolioType}/contracts/${contract.id}`);
            }}
          />
        </TabsContent>
        <TabsContent value="incidents" currentValue={tab}>
          <IncidentsTable
            incidents={portfolio.type === 'leasing' ? (portfolio as unknown as LeasingPortfolio).incidents : []}
            onRowClick={(incident) => {
              navigate(`/app/${portfolioType}/incidents/${incident.id}`);
            }}
          />
        </TabsContent>
        <TabsContent value="maintenance" currentValue={tab}>
          <MaintenanceTable
            maintenances={portfolio.type === 'leasing' ? (portfolio as unknown as LeasingPortfolio).maintenances : []}
            onRowClick={(maintenance) => {
              navigate(`/app/${portfolioType}/maintenance/${maintenance.id}`);
            }}
          />
        </TabsContent>
        <TabsContent value="payments" currentValue={tab}>
          <PaymentsTable
            payments={portfolio.type === 'leasing' ? (portfolio as unknown as LeasingPortfolio).payments : []}
            onRowClick={(payment) => {
              navigate(`/app/${portfolioType}/payments/${payment.id}`);
            }}
          />
        </TabsContent>
        <TabsContent value="settings" currentValue={tab}>
          <LeasingPortfolioSettingsDisplay 
            portfolio={portfolio as unknown as LeasingPortfolio}
            onEdit={() => {
              // Implémenter la logique d'édition ici
              console.log('Édition des paramètres du portefeuille leasing');
            }}
            onDelete={() => {
              // Implémenter la logique de suppression ici
              console.log('Suppression du portefeuille leasing');
              navigate('/app/leasing');
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}