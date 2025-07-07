import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PortfolioMetrics } from '../components/portfolio/PortfolioMetrics';
import { useInvestmentPortfolios } from '../hooks/useInvestmentPortfolios';
import { Tabs, TabsContent } from '../components/ui/Tabs';
import { TabsOverflow } from '../components/ui/TabsOverflow';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { InvestmentRequestsTable } from '../components/portfolio/investment/InvestmentRequestsTable';
import { InvestmentTransactionsTable } from '../components/portfolio/investment/InvestmentTransactionsTable';
import { PortfolioCompanyReportsTable } from '../components/portfolio/investment/PortfolioCompanyReportsTable';
import { ExitEventsTable } from '../components/portfolio/investment/ExitEventsTable';
import { mockInvestmentRequests } from '../data/mockInvestment';
import { mockInvestmentTransactions } from '../data/mockInvestment';
import { mockPortfolioCompanyReports } from '../data/mockInvestment';
import { mockExitEvents } from '../data/mockInvestment';

export default function InvestmentPortfolioDetails() {
  const { id, portfolioType = 'investment' } = useParams();
  const navigate = useNavigate();
  const { portfolios } = useInvestmentPortfolios();
  const portfolio = portfolios.find(p => p.id === id);
  const [tab, setTab] = React.useState('requests');

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

  // Filtrage par portfolioId (pour la démo)
  const requests = mockInvestmentRequests.filter(r => r.portfolioId === id);
  const transactions = mockInvestmentTransactions.filter(t => t.portfolioId === id);
  const reports = mockPortfolioCompanyReports.filter(r => r.portfolioId === id);
  const exits = mockExitEvents.filter(e => e.portfolioId === id);

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
          { key: 'requests', label: 'Demandes' },
          { key: 'transactions', label: 'Décaissements' },
          { key: 'reporting', label: 'Reporting PME' },
          { key: 'exits', label: 'Sorties' },
          { key: 'settings', label: 'Paramètres' },
        ]}
        value={tab}
        onValueChange={setTab}
      />
        <TabsContent value="requests" currentValue={tab}>
          <InvestmentRequestsTable
            requests={requests}
            onView={entityId => navigate(`/app/portfolio/${id}/investment-requests/${entityId}`)}
          />
        </TabsContent>
        <TabsContent value="transactions" currentValue={tab}>
          <InvestmentTransactionsTable
            transactions={transactions}
            onView={entityId => navigate(`/app/portfolio/${id}/investment-transactions/${entityId}`)}
          />
        </TabsContent>
        <TabsContent value="reporting" currentValue={tab}>
          <PortfolioCompanyReportsTable
            reports={reports}
            onView={entityId => navigate(`/app/portfolio/${id}/company-reports/${entityId}`)}
          />
        </TabsContent>
        <TabsContent value="exits" currentValue={tab}>
          <ExitEventsTable
            exits={exits}
            onView={entityId => navigate(`/app/portfolio/${id}/exit-events/${entityId}`)}
          />
        </TabsContent>
        {/* TODO: autres onglets (settings) */}
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
    </div>
  );
}
