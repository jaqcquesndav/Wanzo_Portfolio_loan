
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Tabs, TabsContent } from '../components/ui/Tabs';
import { TabsOverflow } from '../components/ui/TabsOverflow';
import { useLeasingPortfolio } from '../hooks/useLeasingPortfolio';

import { EquipmentsTable } from '../components/portfolio/leasing/EquipmentsTable';
import { ContractsTable } from '../components/portfolio/leasing/ContractsTable';
import { IncidentsTable } from '../components/portfolio/leasing/IncidentsTable';
import { MaintenanceTable } from '../components/portfolio/leasing/MaintenanceTable';
import { PaymentsTable } from '../components/portfolio/leasing/PaymentsTable';
import { ReportingTable } from '../components/portfolio/leasing/ReportingTable';
import { SettingsTable } from '../components/portfolio/leasing/SettingsTable';
import type { LeasingPortfolio } from '../types/leasing';


export default function LeasingPortfolioDetails() {
  const { id, portfolioType = 'leasing' } = useParams();
  const navigate = useNavigate();
  const { portfolio, loading } = useLeasingPortfolio(id!);
  const [tab, setTab] = useState('equipments');

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
          onClick={() => navigate(`/app/${portfolioType}/portfolios/leasing`)}
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
          { label: 'Portefeuilles', href: `/app/${portfolioType}/portfolios/leasing` },
          { label: portfolio.name }
        ]}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/app/${portfolioType}/portfolios/leasing`)}
            icon={<ArrowLeft className="h-5 w-5" />} 
          >
            Retour
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{portfolio.name}</h1>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsOverflow
          tabs={[
            { key: 'equipments', label: 'Équipements' },
            { key: 'contracts', label: 'Contrats' },
            { key: 'incidents', label: 'Incidents' },
            { key: 'maintenance', label: 'Maintenance' },
            { key: 'payments', label: 'Paiements' },
            { key: 'reporting', label: 'Reporting' },
            { key: 'settings', label: 'Paramètres' },
          ]}
          value={tab}
          onValueChange={setTab}
        />
        <TabsContent value="equipments" currentValue={tab}>
          <EquipmentsTable equipments={portfolio.type === 'leasing' ? (portfolio as LeasingPortfolio).equipment_catalog : []} />
        </TabsContent>
        <TabsContent value="contracts" currentValue={tab}>
          <ContractsTable contracts={portfolio.type === 'leasing' ? (portfolio as LeasingPortfolio).contracts : []} />
        </TabsContent>
        <TabsContent value="incidents" currentValue={tab}>
          <IncidentsTable incidents={portfolio.type === 'leasing' ? (portfolio as LeasingPortfolio).incidents : []} />
        </TabsContent>
        <TabsContent value="maintenance" currentValue={tab}>
          <MaintenanceTable maintenances={portfolio.type === 'leasing' ? (portfolio as LeasingPortfolio).maintenances : []} />
        </TabsContent>
        <TabsContent value="payments" currentValue={tab}>
          <PaymentsTable payments={portfolio.type === 'leasing' ? (portfolio as LeasingPortfolio).payments : []} />
        </TabsContent>
        <TabsContent value="reporting" currentValue={tab}>
          <ReportingTable />
        </TabsContent>
        <TabsContent value="settings" currentValue={tab}>
          <SettingsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}